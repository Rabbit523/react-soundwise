'use strict';
const path = require('path');
const S3Strategy = require('express-fileuploader-s3');
const awsConfig = require('../../config').awsConfig;
const AWS = require('aws-sdk');
AWS.config.update(awsConfig);
const s3 = new AWS.S3();
const { uploader, logErr, setAudioTags, parseSilenceDetect } = require('./utils')(
  'audioProcessing'
);
const firebase = require('firebase-admin');
const request = require('request-promise');
const database = require('../../database/index');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(require('../../config').sendGridApiKey);
const fs = require('fs');
const ffmpeg = require('./ffmpeg');
const sizeOf = require('image-size');
const { sendMarketingEmails } = require('./sendEmails');
const { createFeed } = require('./feed');
const moment = require('moment');
const fileType = require('file-type');

const audioProcessingCommon = async (filePath, options = {}, setTags, reject) => {
  try {
    const { trim, removeSilence, overlayDuration, intro, outro, setVolume } = options;
    let overreadDetected = false;

    // detect overread error, pre-convert to mp3; see issues/177
    await new Promise(resolve => {
      new ffmpeg(filePath).then(
        file => {
          file.addCommand('-af', `silencedetect=n=-60dB:d=1`);
          file.addCommand('-f', `null`);
          file.save('-', (err, fileName, stdout, stderr) => {
            if (err) {
              return logErr(`overread silencedetect ${filePath} ${err}`, null, null, reject);
            }
            const ouput = stdout + '\n' + stderr;
            overreadDetected = ouput.includes(' overread, skip ') && ouput.includes(' enddists: ');
            if (overreadDetected) {
              const setMP3Callback = mp3FilePath => {
                filePath = mp3FilePath; // new converted mp3 file
                resolve();
              };
              setMP3Codec(filePath, setMP3Callback, true); // force to-mp3 conversion
            }
          });
        },
        err => logErr(`overread detect unable to run silencedetect ${err}`, null, null, reject)
      );
    });

    if (trim) {
      new ffmpeg(filePath).then(
        file => {
          file.addCommand(
            '-af',
            overreadDetected
              ? `silencedetect=n=-50dB:d=1` // use -50dB if overreadDetected === true
              : `silencedetect=n=-60dB:d=1`
          );
          file.addCommand('-f', `null`);
          file.save('-', (err, fileName, stdout, stderr) => {
            if (err) {
              return logErr(`trim running silencedetect ${filePath} ${err}`, null, null, reject);
            }
            const output = parseSilenceDetect(stdout + '\n' + stderr);

            let start = 0;
            if (output[0][0] === 'silence_start') {
              const silenceStart = Number(output[0][1]);
              if (silenceStart > -0.2 && silenceStart < 0.2) {
                // +/- 0.2 second
                start = Number(output[1][1]).toFixed(3);
              }
            }

            let end = file.metadata.duration.seconds + 1;
            if (output[output.length - 1][0] === 'silence_start') {
              end = Number(output[output.length - 1][1]).toFixed(3);
            } else if (
              output.length >= 3 &&
              output[output.length - 3][0] === 'silence_start' &&
              output[output.length - 2][0] === 'silence_end' &&
              output[output.length - 1][0] === 'silence_duration'
            ) {
              const rawDuration = moment.duration(file.metadata.duration.raw).asSeconds();
              const silenceEnd = Number(output[output.length - 2][1]);
              if (rawDuration - silenceEnd < 0.2) {
                // gap between file duration end silence_end smaller than 0.2 second
                end = Number(output[output.length - 3][1]).toFixed(3);
              }
            }

            new ffmpeg(filePath).then(
              file => {
                file.addCommand('-af', `atrim=${start}:${end}`);
                file.addCommand('-q:a', '3');
                const trimmedPath = `${filePath.slice(0, -4)}_trimmed${path.extname(filePath)}`;
                file.save(trimmedPath, err => {
                  if (err) {
                    return logErr(`trimming fails ${filePath} ${err}`, null, null, reject);
                  }
                  fs.unlink(filePath, err => 0); // remove original
                  removeSilenceProcessing(trimmedPath);
                });
              },
              err => logErr(`trim unable to parse file ${err}`, null, null, reject)
            );
          });
        },
        err => logErr(`trim unable to run silencedetect ${err}`, null, null, reject)
      );
    } else {
      removeSilenceProcessing(filePath);
    }
    function removeSilenceProcessing(filePath) {
      if (removeSilence) {
        new ffmpeg(filePath).then(
          file => {
            file.addCommand('-af', `silencedetect=n=-60dB:d=${removeSilence}`);
            file.addCommand('-f', `null`);
            file.save('-', (err, fileName, stdout, stderr) => {
              if (err) {
                return logErr(`removeSilence silencedetect ${filePath} ${err}`, null, null, reject);
              }
              const output = parseSilenceDetect(stdout + '\n' + stderr);
              new ffmpeg(filePath).then(
                file => {
                  let chunksCount = 0;
                  let filterComplex = '"';
                  let filterComplexEnd = '';
                  let atrim_start = 0;
                  let atrim_end = 0;
                  if (output[0][0] === 'silence_start') {
                    // not starting with silence (trimmed)
                    chunksCount++;
                    filterComplex += `[0]atrim=start=0`;
                  }
                  output.forEach(i => {
                    if (i[0] === 'silence_end') {
                      // not empty block
                      chunksCount++;
                      atrim_start = Number(i[1]).toFixed(3);
                      filterComplex += `[0]atrim=start=${atrim_start}`;
                    }
                    if (i[0] === 'silence_start') {
                      atrim_end = Number(i[1]).toFixed(3);
                      if (atrim_start >= atrim_end) {
                        atrim_end = atrim_start + 0.001; // add microsecond
                      }
                      filterComplex += `:end=${atrim_end}[a${chunksCount}];`;
                      filterComplexEnd += `[a${chunksCount}]`;
                    }
                  });
                  if (chunksCount === 0) {
                    // skip in no silenced chunks were found
                    return introProcessing(filePath);
                  }
                  if (output[output.length - 1][0] === 'silence_duration') {
                    // not ending with silence
                    filterComplex += `:end=${file.metadata.duration.seconds + 1}[a${chunksCount}];`;
                    filterComplexEnd += `[a${chunksCount}]`;
                  }
                  filterComplex += `${filterComplexEnd}concat=n=${chunksCount}:v=0:a=1"`;
                  file.addCommand('-filter_complex', filterComplex);
                  // *command example: ffmpeg -i audio_processing_out.mp3 -filter_complex "[0]atrim=start=5.088:end=10.041[a1];[0]atrim=start=15.553:end=17.481[a2];[a1][a2]concat=n=2:v=0:a=1" out.mp3
                  file.addCommand('-q:a', '3');
                  const sliced = filePath.slice(0, -4);
                  const silenceRemovedPath = `${sliced}_silence_removed${path.extname(filePath)}`;
                  file.save(silenceRemovedPath, err => {
                    if (err) {
                      const errMsg = `removing silence fails ${filePath} ${err}`;
                      return logErr(errMsg, null, null, reject);
                    }
                    fs.unlink(filePath, err => 0); // remove original
                    introProcessing(silenceRemovedPath);
                  });
                },
                err => logErr(`removeSilence unable to parse file ${err}`, null, null, reject)
              );
            });
          },
          err => logErr(`removeSilence unable to run silencedetect ${err}`, null, null, reject)
        );
      } else {
        introProcessing(filePath);
      }
    }
    // *** Add intro and outro ***
    // Intro needs to be faded out at the end. And outro needs to be faded in.
    function introProcessing(filePath) {
      if (intro) {
        request
          .get({ url: intro, encoding: null })
          .then(body => {
            const introPath = `${filePath.slice(0, -4)}_intro.${fileType(body).ext}`;
            fs.writeFile(introPath, body, err => {
              if (err) {
                return logErr(`intro write file ${introPath}`, null, null, reject);
              }
              new ffmpeg(introPath).then(
                file => {
                  const milliseconds = file.metadata.duration.raw.split('.')[1] || 0;
                  const introDuration = Number(file.metadata.duration.seconds + '.' + milliseconds);
                  const originalIntroPath = intro === outro ? introPath : '';
                  if (overlayDuration) {
                    // make fading
                    // a. fade out an intro
                    // ffmpeg -i intro.mp3 -af 'afade=t=out:st=885:d=5' intro-fadeout.mp3
                    // One thing to note is that if overlayDuration > 0, the intro fade out duration should be overlayDuration x 2
                    const fadeDuration = overlayDuration * 2;
                    const fadeStartPosition = introDuration - fadeDuration;
                    file.addCommand('-af', `afade=t=out:st=${fadeStartPosition}:d=${fadeDuration}`);
                    file.addCommand('-q:a', '3');
                    const introFadePath = `${introPath.slice(0, -4)}_fadeintro${path.extname(
                      introPath
                    )}`;
                    file.save(introFadePath, err => {
                      if (err) {
                        return logErr(`intro fade fails ${introPath} ${err}`, null, null, reject);
                      }
                      if (intro !== outro) {
                        // outro intro urls differ
                        fs.unlink(introPath, err => 0); // remove original intro
                      }
                      outroProcessing(filePath, introFadePath, introDuration, originalIntroPath);
                    });
                  } else {
                    outroProcessing(filePath, introPath, introDuration, originalIntroPath);
                  }
                },
                err => logErr(`ffmpeg intro ${introPath} ${err}`, null, null, reject)
              );
            });
          })
          .catch(err => logErr(`intro request ${err}`, null, null, reject));
      } else {
        outroProcessing(filePath); // no intro
      }
    }
    function outroProcessing(filePath, introPath, introDuration, originalIntroPath) {
      if (outro) {
        if (!originalIntroPath) {
          request
            .get({ url: outro, encoding: null })
            .then(body => {
              const outroPath = `${filePath.slice(0, -4)}_outro.${fileType(body).ext}`;
              fs.writeFile(outroPath, body, err => {
                if (err) {
                  return logErr(`outro write file ${filePath}`, null, null, reject);
                }
                fadeOutro(outroPath);
              });
            })
            .catch(err => logErr(`outro request ${err}`, null, null, reject));
        } else {
          fadeOutro(originalIntroPath); // use already obtained intro file
        }
        function fadeOutro(outroPath) {
          new ffmpeg(outroPath).then(
            file => {
              if (overlayDuration) {
                // make fading
                // a. fade in an outro clip
                // ffmpeg -i outro.mp3 -af 'afade=t=in:ss=0:d=5,afade=out:st=885:d=5' outro-fadein.mp3
                const fadein = `afade=t=in:st=0:d=${overlayDuration * 2}`;
                const milliseconds = file.metadata.duration.raw.split('.')[1] || 0;
                const outroDuration = Number(file.metadata.duration.seconds + '.' + milliseconds);
                const fadeDuration = overlayDuration * 2;
                const fadeStartPosition = outroDuration - fadeDuration;
                const fadeout = `afade=t=out:st=${fadeStartPosition}:d=${fadeDuration}`;
                file.addCommand('-af', `${fadein},${fadeout}`);
                file.addCommand('-q:a', '3');
                const outroFadePath = `${outroPath.slice(0, -4)}_fadeoutro${path.extname(
                  outroPath
                )}`;
                file.save(outroFadePath, err => {
                  if (err) {
                    return logErr(`outro fade fails ${outroFadePath} ${err}`, null, null, reject);
                  }
                  fs.unlink(outroPath, err => 0); // remove original outro
                  concat(filePath, introPath, introDuration, outroFadePath);
                });
              } else {
                concat(filePath, introPath, introDuration, outroPath);
              }
            },
            err => logErr(`ffmpeg outro ${outroPath} ${err}`, null, null, reject)
          );
        }
      } else {
        concat(filePath, introPath, introDuration); // no outro
      }
    }
    function concat(filePath, introPath, introDuration, outroPath) {
      if (introPath || outroPath) {
        new ffmpeg(filePath).then(
          file => {
            const milliseconds = file.metadata.duration.raw.split('.')[1] || 0;
            const mainFileDuration = Number(file.metadata.duration.seconds + '.' + milliseconds);
            let adelay1, adelay2;
            if (introPath) {
              let introDelay = introDuration;
              if (overlayDuration) {
                // have fading
                introDelay = introDuration - overlayDuration;
              }
              introDelay = Math.floor(introDelay * 1000); // converting to milliseconds
              adelay1 = introDelay;
              // *because adelay can't accept all= option to delay all channels in -filter_complex
              // we use approach from https://trac.ffmpeg.org/ticket/5855#comment:4 ("4000|4000|4000|...")
              // ffmpeg -i main.mp3 -i intro.mp3 -i outro.mp3 -filter_complex "[0]adelay=4000|4000|4000|4000[a];[2]adelay=7000|7000|7000|7000[b];[1][a][b]amix=3" out_test.mp3
              for (var i = 0; i < 8; i++) {
                // 8 audio channels
                adelay1 += '|' + introDelay;
              }
              file.addCommand('-i', `${introPath}`);
            }
            if (outroPath) {
              file.addCommand('-i', `${outroPath}`);
            }
            let filterComplex = '';
            if (introPath && outroPath) {
              let outroDelay = introDuration + mainFileDuration; // includes intro duration
              if (overlayDuration) {
                // have fading
                outroDelay = introDuration + mainFileDuration - 2 * overlayDuration;
              }
              outroDelay = Math.floor(outroDelay * 1000);
              adelay2 = outroDelay;
              for (var i = 0; i < 8; i++) {
                adelay2 += '|' + outroDelay;
              }
              filterComplex = `"[0]adelay=${adelay1}[a];[2]adelay=${adelay2}[b];[1][a][b]amix=3"`;
            } else if (introPath && !outroPath) {
              // only intro
              filterComplex = `"[0]adelay=${adelay1}[a];[1][a]amix=2"`;
            } else if (!introPath && outroPath) {
              // only outro
              let outroDelay = mainFileDuration;
              if (overlayDuration) {
                // have fading
                outroDelay = mainFileDuration - overlayDuration;
              }
              outroDelay = Math.floor(outroDelay * 1000);
              adelay2 = outroDelay;
              for (var i = 0; i < 8; i++) {
                adelay2 += '|' + outroDelay;
              }
              filterComplex = `"[1]adelay=${adelay2}[a];[0][a]amix=2"`;
            }
            file.addCommand('-filter_complex', `${filterComplex}`);
            file.addCommand('-q:a', '3');
            const concatPath = `${filePath.slice(0, -4)}_concat${path.extname(filePath)}`;
            file.save(concatPath, err => {
              if (err) {
                return logErr(`concat save fails ${concatPath} ${err}`, null, null, reject);
              }
              fs.unlink(filePath, err => 0); // remove main
              introPath && fs.unlink(introPath, err => 0); // remove intro
              outroPath && fs.unlink(outroPath, err => 0); // remove outro
              volumeProccessing(concatPath);
            });
          },
          err => logErr(`ffmpeg main file ${filePath} ${err}`, null, null, reject)
        );
      } else {
        volumeProccessing(filePath);
      }
    }
    function volumeProccessing(filePath) {
      if (setVolume) {
        new ffmpeg(filePath).then(
          file => {
            // *** Set volume target and harmonize loudness level ***
            // set Integrated loudness to -14: I=-14
            // set True peak value to -3: TP=-2
            // set Loudness range to 11: LRA=11
            // ffmpeg -i audio.mp3 -af loudnorm=I=-14:TP=-2:LRA=11:measured_I=-19.5:measured_LRA=5.7:measured_TP=-0.1:measured_thresh=-30.20::linear=true:print_format=summary -ar 44.1k audio-normalized.mp3
            file.addCommand(
              '-af',
              `loudnorm=I=-14:TP=-2:LRA=11:measured_I=-19.5:measured_LRA=5.7:measured_TP=-0.1:measured_thresh=-30.20:linear=true:print_format=summary`
            );
            file.addCommand('-ar', `44.1k`);
            file.addCommand('-q:a', '3');
            const setVolumePath = `${filePath.slice(0, -4)}_set_volume${path.extname(filePath)}`;
            file.save(setVolumePath, err => {
              if (err) {
                const errMsg = `volumeProccessing save fails ${setVolumePath} ${err}`;
                return logErr(errMsg, null, null, reject);
              }
              fs.unlink(filePath, err => 0); // remove original
              setMP3Codec(setVolumePath, setTags); // setTags from arguments
            });
          },
          err =>
            logErr(`volumeProccessing unable to parse file with ffmpeg ${err}`, null, null, reject)
        );
      } else {
        setMP3Codec(filePath, setTags); // setTags from arguments
      }
    }
    function setMP3Codec(filePath, callback, forceMP3Conversion) {
      new ffmpeg(filePath).then(
        file => {
          if (forceMP3Conversion || file.metadata.audio.codec !== 'mp3') {
            file.setAudioCodec('mp3').setAudioBitRate(64); // convert to mp3
            file.addCommand('-q:a', '3');
            const mp3codecPath = `${filePath.slice(0, -4)}_mp3codec.mp3`;
            file.save(mp3codecPath, err => {
              if (err) {
                return logErr(`setMP3Codec save fails ${mp3codecPath} ${err}`, null, null, reject);
              }
              fs.unlink(filePath, err => 0); // remove original
              callback(mp3codecPath);
            });
          } else {
            callback(filePath);
          }
        },
        err => logErr(`setMP3Codec unable to parse file with ffmpeg ${err}`, null, null, reject)
      );
    }
  } catch (err) {
    logErr(`audioProcessingCommon ${err} ${err && err.stack}`, null, null, reject);
  }
};

const audioProcessing = async (req, res) => {
  // 1. Client make post request to /api/audio_processing, with episode ID and processing options
  // request example: {
  // episodeId: '1519588329916e', // need to retrieve episode info from firebase for tagging
  // soundcastId: '1508293913676s', // need to retrieve soundcast info from firebase for tagging
  // publisherEmail: 'john@awesomepublisher.com',
  // publisherName: 'John',
  // tagging: true,
  // intro: 'https://mysoundwise.com/tracks/intro12345s.mp3',
  // outro: 'https://mysoundwise.com/tracks/outro12345s.mp3',
  // overlayDuration: 2, // how many seconds intro/outro should overlay the main audio,
  // setVolume: true,
  // trim: true,
  // removeSilence: 0.7, // the number is the silence remove threshold. e.g. remove silence longer than 0.7 second
  // autoPublish: false, // if true, automatically publish the episode after processing, otherwise, save the episode as draft and notify user by email
  // emailListeners: false }
  const { soundcastId, publisherEmail, publisherName, publisherFirstName } = req.body;
  const { tagging, autoPublish, emailListeners, publisherImageUrl } = req.body;
  const episodeId = (req.body.episodeId || '').replace(/[^0-9e]/gi, ''); // allow only digits + "e"

  console.log('INFO audio processing req.body: ' + JSON.stringify(req.body));
  if (
    !(
      episodeId &&
      soundcastId &&
      typeof req.body.tagging === 'boolean' &&
      typeof req.body.overlayDuration === 'number' &&
      typeof req.body.setVolume === 'boolean' &&
      typeof req.body.trim === 'boolean' &&
      typeof req.body.removeSilence === 'number' &&
      typeof req.body.autoPublish === 'boolean'
    )
  ) {
    return logErr('undefined parameters', res);
  }

  // 2. return 200 ok to client if request body includes all necessary information
  res.end('ok');
  await firebase
    .database()
    .ref(`episodes/${episodeId}/audioProcessing`)
    .set(true);

  // 3. Get the episode url from firebase 'episodes/[episode id]/url', fetch the audio file
  const episodeObj = await firebase
    .database()
    .ref(`episodes/${episodeId}`)
    .once('value');
  const episode = episodeObj.val();
  let filePath;
  await new Promise(resolve => {
    request
      .get({
        url: episode.url,
        encoding: null, // return body as a Buffer
      })
      .then(body => {
        const savePath = `/tmp/audio_processing_${episodeId}.${fileType(body).ext}`;
        fs.writeFile(savePath, body, err => {
          if (err) {
            return logErr(`cannot write tmp audio file ${savePath}`, null, resolve);
          }
          filePath = savePath;
          resolve(); // success
        });
      })
      .catch(err => logErr(`unable to get episode ${episode.url} ${err}`, null, resolve));
  });
  if (!filePath) {
    return logErr(`empty filePath variable`);
  }

  // 4. Run some or all of the following processing options, depending on what options are requested from the client:
  //    A: [tagging] add metadata tags to the episode audio file
  //    B: [trim] trim off silence at beginning and end of audio file
  //    C: [intro, outro] attach intro/outro clips to audio file
  //    D: [setVolume] harmonize volume and set loudness to desired level
  //    E: [removeSilence] remove excessively long silence throughout the audio file (e.g. any silence longer than 0.7 second)
  try {
    audioProcessingCommon(filePath, req.body, setTags);
    function setTags(filePath) {
      new ffmpeg(filePath).then(
        async file => {
          const soundcastObj = await firebase
            .database()
            .ref(`soundcasts/${soundcastId}`)
            .once('value');
          const soundcast = soundcastObj.val();
          if (tagging) {
            // to add cover art to audio file:
            // 1) check if episode.coverArtUrl exsits, if so, use that as the cover art
            // 2) if it doesn't exist, get the soundcast cover art from firebase and use that:
            //    and use soundcast.imageURL as the cover art
            const url = episode.coverArtUrl || soundcast.imageURL;
            request
              .get({ url, encoding: null })
              .then(body => {
                const { height, width } = sizeOf(body); // {height: 200, width: 300, type: "jpg"}
                const coverPath = `/tmp/audio_processing_${episodeId}_cover.${fileType(body).ext}`;
                fs.writeFile(coverPath, body, err => {
                  // save cover image file
                  if (err) {
                    return logErr(`cannot save cover image file ${coverPath}`);
                  }
                  if (height > 300 || width > 300) {
                    // resizing
                    new ffmpeg(coverPath).then(
                      imageFile => {
                        const resizedPath = `${coverPath.slice(0, -4)}_resized.png`;
                        // ffmpeg -i img.png -vf scale=300:300 img_updated.png
                        imageFile.addCommand('-vf', `scale=300:300`);
                        imageFile.save(resizedPath, err => {
                          if (err) {
                            return logErr(`cannot save updated image ${coverPath} ${err}`);
                          }
                          fs.unlink(coverPath, err => 0); // removing original image file
                          setAudioTags(
                            file,
                            resizedPath,
                            episode.title,
                            episode.index,
                            soundcast.hostName
                          );
                          nextProcessing(filePath, soundcast, file, resizedPath);
                        });
                      },
                      err => logErr(`setTags unable to parse file with ffmpeg ${err}`)
                    );
                  } else {
                    setAudioTags(file, coverPath, episode.title, episode.index, soundcast.hostName);
                    nextProcessing(filePath, soundcast, file, coverPath);
                  }
                });
              })
              .catch(err => logErr(`unable to obtain cover ${err}`));
          } else {
            nextProcessing(filePath, soundcast, file);
          }
        },
        err => logErr(`setTags unable to parse file with ffmpeg ${err}`)
      );
    }
    function nextProcessing(filePath, soundcast, file, coverPath) {
      // final stage
      const outputPath = `${filePath.slice(0, -4)}_output.mp3`;
      file.save(outputPath, err => {
        // ffmpeg save
        if (err) {
          return logErr(`output save fails ${outputPath} ${err}`);
        }
        fs.unlink(filePath, err => 0); // remove original file
        coverPath && fs.unlink(coverPath, err => 0); // remove cover
        uploader.use(
          new S3Strategy({
            uploadPath: 'soundcasts',
            headers: { 'x-amz-acl': 'public-read' },
            options: {
              key: awsConfig.accessKeyId,
              secret: awsConfig.secretAccessKey,
              bucket: 'soundwiseinc',
            },
          })
        );
        console.log('CHECK: audio processing ', outputPath, episodeId);
        uploader.upload(
          's3', // saving to S3 db
          // 5a. If 'autoPublish == true', save processed audio file to AWS S3
          //         to replace the original file
          //     If 'autoPublish == false', save processed audio file to AWS S3 under
          //         'https://d1jzcuf08rvzm.cloudfront.net/soundcasts/[episodeId-edited].mp3'
          {
            path: outputPath,
            name: `${episodeId + (autoPublish ? '' : '-edited')}.mp3`,
          }, // file
          async (err, files) => {
            if (err) {
              return logErr(`Error: uploading ${episodeId}.mp3 to S3 ${err}`);
            }
            if (!autoPublish) {
              const url = `https://d1jzcuf08rvzm.cloudfront.net/soundcasts/${episodeId}-edited.mp3`;
              await firebase
                .database()
                .ref(`episodes/${episodeId}/editedUrl`)
                .set(url);
            } else {
              // 5b. If 'autoPublish == true', publish the episode:
              //     step 1: save episode metadata in our sql database
              //             and then save data. The equivalent from front end:
              database.Episode.findOrCreate({
                where: { episodeId },
                defaults: {
                  episodeId,
                  soundcastId,
                  publisherId: soundcast.publisherID,
                  title: episode.title,
                  soundcastTitle: soundcast.title,
                },
              })
                .then(data => console.log('audio response DB response: ', data))
                .catch(err => console.log('error: ', err));
              //     step 2: notify subscribed listeners by text and email
              //       text notification:
              const registrationTokens = [];
              if (soundcast.subscribed) {
                Object.keys(soundcast.subscribed).forEach(user => {
                  if (typeof soundcast.subscribed[user] === 'object') {
                    registrationTokens.push(soundcast.subscribed[user][0]); // basic version: only allow one device per user
                  }
                });
                const payload = {
                  notification: {
                    title: `${soundcast.title} just published:`,
                    body: `${episode.title}`,
                    sound: 'default',
                    badge: '1',
                  },
                };
                const options = { priority: 'high' };
                // send push notificaiton
                firebase
                  .messaging()
                  .sendToDevice(registrationTokens, payload, options)
                  .then(response => {
                    console.log('audio processing sendToDevice Response');
                    //...
                  })
                  .catch(err => logErr(`sendToDevice ${err}`));
              }

              //   send email notification:
              if (emailListeners) {
                const responseObject = {
                  status: status => ({
                    send: msg =>
                      console.log(`audio processing sendMarketingEmails ${status} ${msg}`),
                  }),
                };
                // let subscribers = [];
                const subject = `${episode.title} was just published on ${soundcast.title}`;
                if (soundcast.subscribed) {
                  // send notification email to subscribers
                  const content = `<p>Hi <span>[%first_name | Default Value%]</span>!</p><p></p><p>${publisherName} just published <strong>${
                    episode.title
                  }</strong> in <a href="${
                    soundcast.landingPage ? 'https://mysoundwise.com/soundcasts/' + soundcastId : ''
                  }" target="_blank">${
                    soundcast.title
                  }</a>. </p><p></p><p>Go check it out on the Soundwise app!</p>`;
                  sendMarketingEmails(
                    {
                      body: {
                        // req.body
                        listIds: [soundcast.subscriberEmailList],
                        subject,
                        content,
                        publisherName,
                        publisherImage: publisherImageUrl,
                        publisherEmail,
                        unsubscribeGroup: 4383,
                      },
                    },
                    responseObject
                  ); // this should be similar to the sendMarketingEmails function under ./sendEmails.js
                }

                // send notification email to invitees
                if (soundcast.invited) {
                  const content = `<p>Hi there!</p><p></p><p>${publisherName} just published <strong>${
                    episode.title
                  }</strong> in <a href="${
                    soundcast.landingPage ? 'https://mysoundwise.com/soundcasts/' + soundcastId : ''
                  }" target="_blank">${
                    soundcast.title
                  }</a>. </p><p></p><p>To listen to the episode, simply accept your invitation to subscribe to <i>${
                    soundcast.title
                  }</i> on the Soundwise app!</p>`;
                  sendMarketingEmails(
                    {
                      body: {
                        // req.body
                        listIds: [soundcast.inviteeEmailList],
                        subject,
                        content,
                        publisherName,
                        publisherImage: publisherImageUrl,
                        publisherEmail,
                        unsubscribeGroup: 4383,
                      },
                    },
                    responseObject
                  );
                }
              } // if emailListeners

              //     step 3: update firebase
              await firebase
                .database()
                .ref(`episodes/${episodeId}/isPublished`)
                .set(true);
              await firebase
                .database()
                .ref(`episodes/${episodeId}/audioProcessing`)
                .set(false);
              await firebase
                .database()
                .ref(`episodes/${episodeId}/id3Tagged`)
                .set(true);

              // If autoPublish == true and if soundcast.podcastFeedVersion, then we need to update the podcast feed after the episode is processed and ready to be published
              if (soundcast.podcastFeedVersion) {
                createFeed(
                  {
                    body: {
                      // req.body
                      soundcastId,
                      soundcastTitle: soundcast.title,
                      itunesExplicit: soundcast.itunesExplicit,
                      itunesImage: soundcast.itunesImage,
                      itunesCategory: soundcast.itunesCategory,
                      autoSubmitPodcast: false,
                      email: publisherEmail,
                      firstName: publisherName,
                    },
                  },
                  {
                    // res mocking object
                    error: logErr,
                    status: status => ({ send: () => 0 }),
                  }
                );
              }
            } // if autoPublish
            // 6. Notify the publisher by email.
            sgMail.send({
              to: publisherEmail,
              from: 'support@mysoundwise.com',
              subject: 'Your episode has been processed!',
              html: `<p>Hello ${publisherName},</p><p>${episode.title} has been processed${
                autoPublish ? ' and published' : ''
              }.</p><p>${
                !autoPublish
                  ? 'You can now review and publish the processed episode from your dashboard.'
                  : ''
              }</p><p>Folks at Soundwise</p>`,
            });
          }
        ); // uploader.upload s3
      }); // file.save outputPath
    } // nextProcessing
  } catch (e) {
    logErr(`ffmpeg catch ${e.body || e.stack}`);
  }
}; // audioProcessing

const audioProcessingReplace = async (req, res) => {
  const { episodeId, soundcastId } = req.body;
  const episodeObj = await firebase
    .database()
    .ref(`episodes/${episodeId}`)
    .once('value');
  const episode = episodeObj.val();
  if (!episode.editedUrl) {
    return logErr('editedUrl empty', res);
  }
  res.send('OK');
  request
    .get({ url: episode.editedUrl, encoding: null })
    .then(body => {
      const outputPath = `/tmp/audio_processing_replace_${episodeId}.${fileType(body).ext}`;
      fs.writeFile(outputPath, body, err => {
        if (err) {
          return logErr(`cannot write tmp audio file ${outputPath}`);
        }
        uploader.use(
          new S3Strategy({
            uploadPath: 'soundcasts',
            headers: { 'x-amz-acl': 'public-read' },
            options: {
              key: awsConfig.accessKeyId,
              secret: awsConfig.secretAccessKey,
              bucket: 'soundwiseinc',
            },
          })
        );
        console.log('CHECK: audio processing replace ', outputPath, episodeId);
        uploader.upload(
          's3', // saving to S3 db
          { path: outputPath, name: `${episodeId}.mp3` }, // replace original file
          async (err, files) => {
            if (err) {
              return logErr(`Error: uploading ${episodeId}.mp3 to S3 ${err}`);
            }
            await firebase
              .database()
              .ref(`episodes/${episodeId}/editedUrl`)
              .remove();
            s3.deleteObject(
              {
                Bucket: 'soundwiseinc',
                Key: `soundcasts/${episodeId}-edited.mp3`,
              },
              (err, data) => {
                if (err) {
                  return logErr(
                    `Error: Audio processing replace cannot delete object ${Key} ${err}`
                  );
                }
                // console.log(`Audio processing replace: Successfully deleted ${Key}`);
              }
            );
            const soundcastObj = await firebase
              .database()
              .ref(`soundcasts/${soundcastId}`)
              .once('value');
            const soundcast = soundcastObj.val();
            database.Episode.findOrCreate({
              where: { episodeId },
              defaults: {
                episodeId,
                soundcastId,
                publisherId: soundcast.publisherID,
                title: episode.title,
                soundcastTitle: soundcast.title,
              },
            })
              .then(data => console.log('audio response DB response: ', data))
              .catch(err => console.log('error: ', err));
            //     step 2: notify subscribed listeners by text and email
            //       text notification:
            const registrationTokens = [];
            if (soundcast.subscribed) {
              Object.keys(soundcast.subscribed).forEach(user => {
                if (typeof soundcast.subscribed[user] === 'object') {
                  registrationTokens.push(soundcast.subscribed[user][0]); // basic version: only allow one device per user
                }
              });
              const payload = {
                notification: {
                  title: `${soundcast.title} just published:`,
                  body: `${episode.title}`,
                  sound: 'default',
                  badge: '1',
                },
              };
              const options = { priority: 'high' };
              // send push notificaiton
              firebase
                .messaging()
                .sendToDevice(registrationTokens, payload, options)
                .then(response => {
                  console.log('audio processing sendToDevice Response');
                  //...
                })
                .catch(err => logErr(`sendToDevice ${err}`));
            }
            await firebase
              .database()
              .ref(`episodes/${episodeId}/isPublished`)
              .set(true);
            await firebase
              .database()
              .ref(`episodes/${episodeId}/audioProcessing`)
              .set(false);
            await firebase
              .database()
              .ref(`episodes/${episodeId}/id3Tagged`)
              .set(true);
          }
        ); // uploader.upload s3
      });
    })
    .catch(err => logErr(`unable to get episode ${episode.editedUrl} ${err}`));
};

module.exports = { audioProcessing, audioProcessingReplace, audioProcessingCommon };
