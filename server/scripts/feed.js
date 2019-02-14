'use strict';
const fileType = require('file-type');
const S3Strategy = require('express-fileuploader-s3');
const awsConfig = require('../../config').awsConfig;
const { uploader, logErr, setAudioTags } = require('./utils')('feed.js');
const firebase = require('firebase-admin');
const request = require('request-promise');
const Podcast = require('podcast');
const sizeOf = require('image-size');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(require('../../config').sendGridApiKey);
const fs = require('fs');
const ffmpeg = require('./ffmpeg');

module.exports.createFeed = async (req, res) => {
  const { soundcastId, soundcastTitle, itunesExplicit, itunesImage, email, firstName } = req.body;
  const categories = [];
  const soundcast = await firebase
    .database()
    .ref(`soundcasts/${soundcastId}`)
    .once('value');
  const soundcastVal = soundcast.val();
  const { title, itunesTitle, itunesHost, short_description, hostName } = soundcastVal;
  const autoSubmitPodcast =
    typeof req.body.autoSubmitPodcast !== 'undefined' // exact test for 'undefined' required
      ? req.body.autoSubmitPodcast
      : soundcastVal.autoSubmitPodcast;
  const episodes = Object.keys(soundcastVal.episodes || {});
  const itunesCategory = req.body.itunesCategory.map(i => {
    // ['Main Cat - Sub Cat', ..]
    const [main, sub] = i.split(' - ');
    categories.push(sub || main); // sub-categories from itunesCategory
    return { text: main, subcats: [{ text: sub || main }] };
  });
  let imageBody;
  await new Promise(resolve => {
    request
      .get({
        encoding: null, // return body as a Buffer
        url: itunesImage,
      })
      .then(async body => {
        const { height, width } = sizeOf(body); // { height: 1400, width: 1400, type: "jpg" }
        if (!(height >= 1400 && width >= 1400 && height <= 3000 && width <= 3000)) {
          // check image size
          res.error(`Error: image size must be between 1400x1400 px and 3000x3000 px`);
        }
        imageBody = body;
        resolve();
      })
      .catch(err => logErr(`unable to obtain image ${err}`, res, resolve));
  });
  if (!imageBody) {
    return logErr('required imageBody variable not set', res);
  }

  // creating feed xml
  const itunesSummary =
    short_description.length >= 4000 ? short_description.slice(0, 3997) + '..' : short_description;
  const itunesOwner = autoSubmitPodcast
    ? { name: 'Soundwise', email: 'support@mysoundwise.com' }
    : { name: hostName, email };
  const googleplayEmail = autoSubmitPodcast ? 'support@mysoundwise.com' : email;
  const podcastObj = {
    title: itunesTitle ? itunesTitle : title,
    description: short_description,
    generator: 'https://mysoundwise.com',
    feedUrl: `https://mysoundwise.com/rss/${soundcastId}`, // '1508293913676s' is the soundcast id
    siteUrl: `https://mysoundwise.com/soundcasts/${soundcastId}`,
    imageUrl: itunesImage,
    author: itunesHost ? itunesHost : hostName,
    copyright: `${new Date().getFullYear()} ${itunesHost}`,
    language: 'en',
    categories,
    pubDate: moment().toDate(),
    itunesAuthor: itunesHost,
    itunesSubtitle: itunesTitle ? itunesTitle : title,
    itunesSummary, // need to be < 4000 characters
    itunesOwner,
    itunesExplicit,
    itunesCategory,
    itunesImage, // need to be between 1400x1400 px and 3000x3000 px
    customNamespaces: {
      googleplay: 'http://www.google.com/schemas/play-podcasts/1.0/play-podcasts.xsd',
    },
    customElements: [
      { 'googleplay:email': googleplayEmail },
      { 'googleplay:description': itunesSummary }, // need to be < 4000 characters
      { 'googleplay:category': [{ _attr: { text: itunesCategory[0].text } }] },
      { 'googleplay:author': itunesHost },
      { 'googleplay:explicit': itunesExplicit },
      { 'googleplay:image': [{ _attr: { href: itunesImage } }] }, // need to be between 1400x1400 px and 3000x3000 px
    ],
  };
  const feed = new Podcast(podcastObj);

  const episodesArr = [];
  if (episodes.length) {
    await Promise.all(
      episodes.map(
        id =>
          new Promise(async resolve => {
            const episode = await firebase
              .database()
              .ref(`episodes/${id}`)
              .once('value');
            const val = episode.val();
            val.isPublished &&
              val.publicEpisode &&
              episodesArr.push(Object.assign({}, val, { id }));
            resolve();
          })
      )
    );
  }
  if (episodesArr.length === 0) {
    return res.error(
      `RSS feed can only be created when there are published episodes in this soundcast.`
    );
  }
  res.status(200).send({});

  const episodesToRequest = [];
  episodesArr.forEach(i => !i.id3Tagged && episodesToRequest.push(i)); // not tagged, unique items
  // console.log('episodesToRequest: ', episodesToRequest);

  const episodesArrSorted = episodesArr.slice(); // make copy, STEP 3a
  // loop over the episodes, episodes with a lower index number needs to be added first
  episodesArrSorted.sort((a, b) => b.index - a.index); // sort in reverse(!) order
  if (episodesArrSorted.length > 50) {
    episodesArrSorted.length = 50; // only take the most recent 50 episodes
  }
  episodesArrSorted.sort((a, b) => a.index - b.index); // older episodes need to go into the feed first
  episodesArrSorted.forEach(i => {
    if (!i.duration) {
      // have no duration field
      if (!episodesToRequest.some(j => j.id === i.id)) {
        // and not in episodesToRequest
        episodesToRequest.push(i);
      }
    }
  });

  let itunesImagePath;
  const untagged = episodesToRequest.filter(i => !i.id3Tagged); // array
  if (untagged.some(i => !i.coverArtUrl)) {
    // if have untagged episodes with empty coverArtUrl
    await new Promise(resolve => {
      const uid = Math.random()
        .toString()
        .slice(2); // unique id
      itunesImagePath = `/tmp/${soundcastId + uid}.${fileType(imageBody).ext}`;
      fs.writeFile(itunesImagePath, imageBody, err => {
        // save itunes image
        if (err) {
          return logErr(`unable to save itunesImage ${err}`, res, resolve);
        }
        new ffmpeg(itunesImagePath).then(
          file => {
            // resize itunes image
            const resizedPath = `${itunesImagePath.slice(0, -4)}_resized.png`;
            file.addCommand('-vf', `scale=300:300`);
            file.save(resizedPath, err => {
              fs.unlink(itunesImagePath, err => 0); // remove original file
              if (err) {
                logErr(`ffmpeg cannot save updated image ${itunesImagePath} ${err}`, res);
              } else {
                itunesImagePath = resizedPath;
              }
              resolve();
            });
          },
          err => logErr(`itunesImage unable to parse file with ffmpeg ${err}`, res, resolve)
        );
      });
    });
  }

  // console.log('episodesToRequest: ', episodesToRequest);
  Promise.all(
    episodesToRequest.map(
      episode =>
        new Promise((resolve, reject) => {
          request
            .get({ encoding: null, url: episode.url })
            .then(body => {
              const id = episode.id;
              const filePath = `/tmp/${id}.${fileType(body).ext}`;
              fs.writeFile(filePath, body, async err => {
                if (err) {
                  return reject(`Error: cannot write tmp audio file ${filePath}`);
                }
                try {
                  let mp3codecPath;
                  await new Promise(resolve => {
                    // check audio codec
                    new ffmpeg(filePath).then(
                      file => {
                        if (file.metadata.audio.codec === 'mp3') {
                          return resolve();
                        }
                        file.setAudioCodec('mp3').setAudioBitRate(64); // convert to mp3
                        mp3codecPath = `${filePath.slice(0, -4)}_mp3codec.mp3}`;
                        file.save(mp3codecPath, err => {
                          fs.unlink(filePath, err => 0); // remove original
                          if (err) {
                            return reject(`feed.js setMP3Codec save fails ${mp3codecPath} ${err}`);
                          }
                          resolve();
                        });
                      },
                      err => reject(`feed.js setMP3Codec unable to parse file with ffmpeg ${err}`)
                    );
                  });

                  let coverPath;
                  if (!episode.id3Tagged && episode.coverArtUrl) {
                    await new Promise(resolve => {
                      // download coverArtUrl image
                      request
                        .get({ url: episode.coverArtUrl, encoding: null })
                        .then(body => {
                          const { height, width } = sizeOf(body);
                          coverPath = `/tmp/${id}_cover.${fileType(body).ext}`;
                          fs.writeFile(coverPath, body, err => {
                            if (err) {
                              reject(`Error: feed.js unable to save coverArtUrl ${err}`);
                              return resolve();
                            }
                            if (height > 300 || width > 300) {
                              new ffmpeg(coverPath).then(
                                imageFile => {
                                  const resizedPath = `${coverPath.slice(0, -4)}_resized.png`;
                                  imageFile.addCommand('-vf', `scale=300:300`);
                                  imageFile.save(resizedPath, err => {
                                    if (err) {
                                      reject(
                                        `cannot save resized episode image ${coverPath} ${err}`
                                      );
                                    } else {
                                      fs.unlink(coverPath, err => 0); // removing original image file
                                      coverPath = resizedPath;
                                    }
                                    resolve();
                                  });
                                },
                                err => {
                                  reject(`unable to parse file with ffmpeg ${err}`);
                                  resolve();
                                }
                              );
                            }
                          });
                        })
                        .catch(err => {
                          reject(`unable to obtain coverArtUrl ${err}`);
                          resolve();
                        });
                    });
                  }

                  new ffmpeg(mp3codecPath || filePath).then(
                    file => {
                      if (episode.id3Tagged) {
                        // tagged
                        resolve({
                          id,
                          fileDuration:
                            Math.round(episode.duration) || file.metadata.duration.seconds,
                        });
                      } else {
                        // not tagged, setting up ID3
                        const imgPath = coverPath || itunesImagePath;
                        setAudioTags(file, imgPath, episode.title, episode.index, hostName);
                        console.log(`Episode: ${id} tagged, path ${filePath}`);
                        const updatedPath = `${filePath.slice(0, -4)}_updated.mp3`;
                        file.save(updatedPath, err => {
                          if (err) {
                            return reject(`Error: saving fails ${filePath} ${err}`);
                          }
                          console.log(`File ${filePath} successfully saved`);
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
                          console.log('CHECK: ', updatedPath, id);
                          uploader.upload(
                            's3', // saving to S3 db
                            { path: updatedPath, name: `${id}.mp3` }, // file
                            (err, files) => {
                              fs.unlink(filePath, err => 0); // remove original file
                              coverPath && fs.unlink(coverPath, err => 0); // remove cover image
                              if (err) {
                                return reject(`Error: uploading ${id}.mp3 to S3 ${err}`);
                              }
                              // after upload success, change episode tagged record in firebase:
                              console.log(
                                id,
                                ' uploaded to: ',
                                files[0].url.replace('http', 'https')
                              );
                              firebase
                                .database()
                                .ref(`episodes/${id}/id3Tagged`)
                                .set(true);
                              firebase
                                .database()
                                .ref(`episodes/${id}/url`)
                                .set(`https://mysoundwise.com/tracks/${id}.mp3`); // use the proxy
                              resolve({
                                id,
                                fileDuration: file.metadata.duration.seconds,
                              });
                            }
                          );
                        });
                      }
                    },
                    err => reject(`Error: unable to parse file with ffmpeg ${err}`)
                  );
                } catch (e) {
                  reject(`Error: ffmpeg catch ${e.body || e.stack}`);
                }
              }); // fs.writeFile
            })
            .catch(err => reject(`Error: unable to obtain episode ${episode.url}`));
        })
    )
  )
    .then(results => {
      // Promise.all then
      itunesImagePath && fs.unlink(itunesImagePath, err => 0); // remove itunes image
      console.log('files processed.');
      episodesArrSorted.forEach(episode => {
        const description = `${episode.description ||
          ''}<br /><p>Subscribe to ${title} on <a href="https://mysoundwise.com/soundcasts/${soundcastId}">Soundwise</a></p>`;
        // const itunesSummary = description.length >= 3988 ?
        // description.slice(0, 3985) + '..' : description;
        const itunesSummary = `${episode.description ||
          ''}<p></p><p>Subscribe to <a href="https://mysoundwise.com/soundcasts/${soundcastId}">${title}</a> on <a href="https://mysoundwise.com/soundcasts/${soundcastId}">Soundwise</a></p>`; // let itunes truncate it if it's longer than 4000
        const episodeObj = {
          title: episode.title,
          description, // may contain html
          url: `https://mysoundwise.com/episodes/${episode.id}`, // '1509908899352e' is the unique episode id
          categories, // use the soundcast categories
          itunesTitle: episode.title,
          itunesImage: episode.coverArtUrl || itunesImage, // check if episode.coverArtUrl exists, if so, use that, if not, use the soundcast cover art
          author: hostName,
          date: moment(episode.date_created * 1000).toDate(),
          pubDate: moment(episode.date_created * 1000).toDate(),
          enclosure: { url: episode.url }, // link to audio file
          itunesAuthor: hostName,
          itunesSubtitle:
            episode.title.length >= 255 ? episode.title.slice(0, 252) + '..' : episode.title, // need to be < 255 characters
          // todo: check whether CDATA tag is actually needed
          itunesSummary,
          // itunesSummary: `<![CDATA[${itunesSummary}]]>`, // may contain html, need to be wrapped within <![CDATA[ ... ]]> tag, and need to be < 4000 characters
          itunesExplicit,
          itunesDuration:
            Math.round(episode.duration) || results.find(i => i.id === episode.id).fileDuration, // check if episode.duration exists, if so, use that, if not, need to get the duration of the audio file in seconds
          customElements: [{ 'content:encoded': { _cdata: itunesSummary } }],
        };
        // check if episode.keywords exists, if so, use that, if not, don't add it
        if (episode.keywords && episode.keywords.length) {
          episodeObj.itunesKeywords = episode.keywords;
        }
        // console.log('episodeObj: ', episodeObj);
        feed.addItem(episodeObj);
      });
      const xml = feed.buildXml('  ');
      // store the cached xml somewhere in our database (firebase or postgres)
      console.log(`feed.js xml file generated for ${soundcastId}`);
      firebase
        .database()
        .ref(`soundcastsFeedXml/${soundcastId}`)
        .set(xml);
      firebase
        .database()
        .ref(`soundcasts/${soundcastId}/podcastFeedVersion`)
        .once('value')
        .then(version => {
          if (!version.val()) {
            firebase
              .database()
              .ref(`soundcasts/${soundcastId}/podcastFeedVersion`)
              .set(1);
            sgMail.send({
              // send email
              to: 'support@mysoundwise.com',
              from: 'natasha@mysoundwise.com',
              subject: 'New podcast creation request!',
              html: `<p>A new podcast feed has been created for ${soundcastId}.</p><p>${(autoSubmitPodcast &&
                'Please submit the feed to iTunes & google play') ||
                ''}</p>`,
            });
            sgMail.send({
              to: email,
              from: 'support@mysoundwise.com',
              subject: 'Your podcast feed has been created!',
              html: `<p>Hello ${firstName},</p><p>We have created a podcast feed for ${soundcastTitle}. The feed url link is <a href=${`https://mysoundwise.com/rss/${soundcastId}`}>${`https://mysoundwise.com/rss/${soundcastId}`}</a>.</p><p>If you've opted to have us submit your podcast to iTunes, Spotify and Google Podcasts for you, we'll let you know when that's done. If you've opted for self submission, please go ahead and submit your feed url to any podcast aggregators you like.</p><p>Folks at Soundwise</p>`,
            });
          } else {
            firebase
              .database()
              .ref(`soundcasts/${soundcastId}/podcastFeedVersion`)
              .set(version.val() + 1);
          }
        });
      // res.end(xml);
    })
    .catch(err => logErr(`Promise.all failed: ${err}`)); // Promise.all catch
};

module.exports.requestFeed = async (req, res) => {
  if (req.params && req.params.id) {
    const xml = await firebase
      .database()
      .ref(`soundcastsFeedXml/${req.params.id}`)
      .once('value');
    res.end(xml.val());
  } else {
    res.error('Error: soundcast id must be provided');
  }
};
