// **** create video from audio wave and picture ***
'use strict';
const path = require('path');
const S3Strategy = require('express-fileuploader-s3');
const awsConfig = require('../../config').awsConfig;
const AWS = require('aws-sdk');
AWS.config.update(awsConfig);
const s3 = new AWS.S3();
const uploader1 = require('express-fileuploader');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
const sendGridApiKey = require('../../config').sendGridApiKey;
sgMail.setApiKey(sendGridApiKey);
const client = require('@sendgrid/client');
client.setApiKey(sendGridApiKey);
const fs = require('fs');
const ffmpeg = require('./ffmpeg');
const sizeOf = require('image-size');
const sendError = (res, err) => {
  console.log(`Error: soundwaveVideo ${err}`);
  res.status(500).send({ error: err });
};

// **** The task: generate video combing audio wave and picture with audio file and picture uploaded from front end
// example output: https://twitter.com/RealNatashaChe/status/957752354841022464
module.exports.createAudioWaveVid = async (req, res) => {
  if (!req.files.audio || !req.files.image) {
    return sendError(res, `image and audio file must be provided`);
  }
  const audioPath = req.files.audio.path;
  const imagePath = req.files.image.path;
  console.log(`INFO soundwaveVideo.js exec ${audioPath} ${imagePath}`);
  const { color, position, email } = req.body; // image and audio are image and audio files. Color (string) is color code for the audio wave. Position (string) is the position of the audio wave. It can be "top", "middle", "bottom". Email (string) is the user's email address.
  fs.readFile(imagePath, (err, imageBuffer) => {
    try {
      const { height, width } = sizeOf(imageBuffer); // {height: 200, width: 300, type: "jpg"}
      // console.log(`height: ${height}, width: ${width}`);
      new ffmpeg(audioPath).then(
        audioFile => {
          // loading audio file
          const doResize = [];
          new Promise((resolve, reject) => {
            // **** step 1b: check image size: If it's a square image, dimensions need to be at least 1080px x 1080px. If it's a rectangular image, dimensions need to be at least 1280 px x 720 px. If image is smaller than required size, return error to front end saying "image is too small."
            const errSizeMsg = `Error: image is too small! Square image should be at least 1080px by 1080px. Rectangular image should be at least 1280px by 720px.`;
            if (height === width) {
              // square
              if (height < 1080) {
                return reject(errSizeMsg);
              } else if (height > 1080) {
                doResize.push(1080, 1080); // if image is larger than the required size, it needs to be scaled back to either 1080x1080 or 1280x720.
              }
            } else {
              // rectangular
              if (width < 1280 || height < 720) {
                return reject(errSizeMsg);
              } else if (width > 1280 || height > 720) {
                doResize.push(1280, 720);
              }
            }
            // **** step 1a: trim audio file silence and cut to 60 seconds.
            // https://stackoverflow.com/a/29411973/2154075
            audioFile.addCommand('-af', 'silenceremove=1:0:-50dB');
            audioFile.addCommand('-t', '60'); // cut
            const audioTrimmedPath = audioPath.slice(0, -4) + '_trimmed.mp3';
            audioFile.save(audioTrimmedPath, err => {
              fs.unlink(audioPath, err => 0); // remove original
              if (err) {
                fs.unlink(audioTrimmedPath, err => 0); // remove original
                return console.log(`Error: trimmed audio saving fails ${audioTrimmedPath} ${err}`);
              }
              new ffmpeg(audioTrimmedPath, { timeout: 10 * 60 * 1000 }).then(audioTrimmedFile => {
                if (doResize.length) {
                  // resizing
                  new ffmpeg(imagePath).then(imageFile => {
                    const updatedImagePath = `${imagePath.slice(0, -4)}_updated.png`;
                    // ffmpeg -i ep-18-square.png -vf scale=1080:1080 out.png
                    imageFile.addCommand('-vf', `scale=${doResize[0]}:${doResize[1]}`);
                    imageFile.save(updatedImagePath, err => {
                      if (err) {
                        return sendError(res, `cannot save updated image ${imagePath} ${err}`);
                      }
                      fs.unlink(imagePath, err => 0); // removing original image file
                      resolve([updatedImagePath, audioTrimmedPath, audioTrimmedFile]);
                    });
                  });
                } else {
                  resolve([imagePath, audioTrimmedPath, audioTrimmedFile]);
                }
              });
            });
          })
            .then(([imagePath, audioTrimmedPath, audioFile]) => {
              // resized image and audio
              // **** step 1c: If audio and image are good, store image and audio in temp file and return 200 ok to front end.
              res.end('OK');

              // **** step 2: create audio waveform from the audio file and combine it with the image file to create a .mp4 video, using the color and waveform position settings from the request body.
              // example commandline command for image size == 1080x1080, color == 'orange', and position == 'bottom':
              // ffmpeg -i audioFile.mp3 -loop 1 -i image.png -filter_complex "[0:a]showwaves=s=1080x150:colors=orange:mode=cline[sw];[1:v]scale=1080:-1,crop=iw:1080[bg];[bg][sw]overlay=0:780:shortest=1:format=auto,format=yuv420p[vid]" -map "[vid]" -map 0:a -codec:v libx264 -crf 18 -preset fast -codec:a aac -strict -2 -b:a 192k video.mp4
              const scale = doResize[0] || width;
              const crop = doResize[1] || height;
              const isSquare = crop !== 720;
              const marginLeft = isSquare ? 0 : 100;
              let marginTop;
              if (position === 'top') {
                marginTop = isSquare ? 150 : 100;
              } else if (position === 'middle') {
                marginTop = crop / 2 - 75; // 75 - half of wavesHeight (150)
              } else {
                // default bottom
                marginTop = crop - ((isSquare ? 150 : 100) + 150); // + 150 - wavesHeight
              }
              const filter_complex =
                `"[0:a]showwaves=s=1080x150:colors=${color}:scale=cbrt:mode=cline[sw];` +
                `[1:v]scale=${scale}:-1,crop=iw:${crop}[bg];[bg][sw]overlay=` +
                `${marginLeft}:${marginTop}:shortest=1:format=auto,format=yuv420p[vid]"`;
              audioFile.addCommand('-loop', '1');
              audioFile.addCommand('-i', imagePath);
              audioFile.addCommand('-filter_complex', filter_complex);
              audioFile.addCommand('-map', '"[vid]"');
              audioFile.addCommand('-map', '0:a');
              audioFile.addCommand('-codec:v', 'libx264');
              audioFile.addCommand('-crf', '18');
              audioFile.addCommand('-preset', 'fast');
              audioFile.addCommand('-codec:a', 'aac');
              audioFile.addCommand('-strict', '2');
              audioFile.addCommand('-b:a', '192k');
              const videoPath = `${audioPath.slice(0, -4)}.mp4`; // path without '_trimmed' postfix
              audioFile.save(videoPath, err => {
                fs.unlink(audioTrimmedPath, err => 0);
                fs.unlink(imagePath, err => 0);
                if (err) {
                  if (err.killed === true && err.signal === 'SIGTERM') {
                    // killed by timeout
                    // if the process is dropped, need to send user an email letting them know they need to try uploading again later.
                    sgMail.send({
                      // send email
                      to: email,
                      from: 'support@mysoundwise.com',
                      subject: "There's a problem with your soundwave video!",
                      bcc: 'natasha@mysoundwise.com',
                      html: `<p>Hi!</p><p>There was a glitch in creating your soundwave video.</p><p>Please try uploading the audio clip and image again later.</p><p>Folks at Soundwise</p>`,
                    });
                    return console.log(`Error: video saving timeout ${videoPath} ${err}`);
                  } else {
                    return console.log(`Error: video saving fails ${videoPath} ${err}`);
                  }
                }
                // console.log(`Video file ${videoPath} successfully saved`);
                // **** step 3: upload the video created to AWS s3
                uploader1.use(
                  new S3Strategy({
                    uploadPath: `wavevideo`,
                    headers: {
                      'x-amz-acl': 'public-read',
                      'Content-Disposition': 'attachment',
                    },
                    options: {
                      key: awsConfig.accessKeyId,
                      secret: awsConfig.secretAccessKey,
                      bucket: 'soundwiseinc',
                    },
                  })
                );
                uploader1.upload(
                  's3',
                  {
                    path: videoPath,
                    name: `${videoPath.replace('/tmp/', '')}`,
                  },
                  (err, files) => {
                    fs.unlink(videoPath, err => 0);
                    if (err) {
                      return console.log(`Error: uploading wavevideo ${videoPath} to S3 ${err}`);
                    }
                    const videoUrl = files[0].url
                      .replace('http://', 'https://')
                      .replace(`s3.amazonaws.com/soundwiseinc`, `d1jzcuf08rvzm.cloudfront.net`);
                    console.log(`Wavevideo ${videoPath} uploaded to: ${videoUrl}`);
                    // **** step 4: email the user the download link of the video file. If there is a processing error, notify user by email that there is an error.
                    sgMail.send({
                      // send email
                      to: email,
                      from: 'support@mysoundwise.com',
                      subject: 'Your soundwave video is ready for download!',
                      html: `<p>Hi!</p><p>Your soundwave video is ready! To download, click <a href=${videoUrl}>here</a>.</p><p>Please note: your download link will expire in 24 hours.</p><p>Folks at Soundwise</p><p>p.s. Do you know that Soundwise is the easiest way to sell and deliver on-demand audio programs?</p> <p>Soundwise helps you boost your audio product sales by at least 15%, and build a loyal following for your podcast.</p><p><a href="https://mysoundwise.com">Sign up today</a> and get 15 days free with the promo code FREE15 at checkout.</p>`,
                    });

                    // **** step 5: save user email in our email contact database
                    client
                      .request({
                        method: 'POST',
                        url: '/v3/contactdb/recipients',
                        body: [{ email }],
                      })
                      .then(([response, body]) =>
                        client.request({
                          method: 'POST',
                          url: `/v3/contactdb/lists/2910467/recipients`,
                          body: body.persisted_recipients, // array of recipient IDs
                        })
                      )
                      .then(([response, body]) => {
                        // console.log(`Sendgrid Success: ${body}`);
                      })
                      .catch(err => {
                        const errMsg = 'Error: soundwaveVideo sendgrid recipients request: ';
                        console.log(errMsg, err, err && err.message);
                        res.status(400).send(err.message);
                      });
                  }
                );
              });
            })
            .catch(err => {
              fs.unlink(audioPath, err => 0);
              fs.unlink(imagePath, err => 0);
              sendError(res, `${err}`);
            });
        },
        err => sendError(res, `unable to parse file with ffmpeg ${err}`)
      );
    } catch (e) {
      fs.unlink(audioPath, err => 0);
      fs.unlink(imagePath, err => 0);
      sendError(res, `ffmpeg catch ${e.body || e.stack}`);
    }
  });
};

// **** step 7: Delete the video file from AWS s3 in 24 hours.
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property
setInterval(
  f =>
    s3.listObjectsV2({ Bucket: 'soundwiseinc', Prefix: 'wavevideo' }, (err, data) => {
      if (err) {
        return console.log(`Error: soundwaveVideo cannot access s3 bucket ${err}`);
      }
      data.Contents.forEach(el => {
        if (moment().diff(el.LastModified, 'minutes') > 1440) {
          // 24 hours
          s3.deleteObject({ Bucket: 'soundwiseinc', Key: el.Key }, (err, data) => {
            if (err) {
              return console.log(`Error: soundwaveVideo cannot delete object ${el.Key} ${err}`);
            }
            console.log(`SoundwaveVideo Successfully deleted ${el.Key}`);
          });
        }
      });
    }),
  60 * 60 * 1000
); // check every hour
