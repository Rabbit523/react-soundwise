'use strict';

// Purpose:
// automatically create and update soundcast and episodes from a podcast user hosted elsewhere. i.e. import user's podcast RSS feed and create soundcast listed on Soundwise from the feed. Also regularly check the feed to see if there're updates.

// How it works:
// 1. user creates a publisher account on Soundwise. But she already has a podcast published on other platforms. So she submits the RSS feed url on client to request backend to create a soundcast from it.
// 2. server takes the feed url, parses the content, creates a soundcast from the feed information, and also creates episodes from the feed items.
// 3. server sends email to the feed owner's email address listed in the feed with a verification code.
// 4. user gets the code, inputs it on front end to prove she's the owner.
// 5. front end assigns the newly created soundcast to the user.
// 6. server checks the feed url every hour to see if there are new episodes. If so, update the soundcast with new episodes.

const request = require('request');
const requestPromise = require('request-promise');
const fs = require('fs');
const ffmpeg = require('./ffmpeg');
const FeedParser = require('feedparser');
const firebase = require('firebase-admin');
const database = require('../../database/index');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
const nodeUrl = require('url');
const Entities = require('html-entities').AllHtmlEntities;
const jimp = require('jimp');
const S3Strategy = require('express-fileuploader-s3');
const awsConfig = require('../../config').awsConfig;
const AWS = require('aws-sdk');
AWS.config.update(awsConfig);
const s3 = new AWS.S3();
const uploader1 = require('express-fileuploader');
const fileType = require('file-type');
const entities = new Entities();
const { logErr, podcastCategories } = require('./utils')('parseFeed.js');
const categoriesNames = Object.keys(podcastCategories).map(i => podcastCategories[i].name); // main 16 categories ('Arts', 'Comedy', ...)
const categoriesIds = Object.keys(podcastCategories).map(i => podcastCategories[i]);

// // Test the getFeed function:
// setTimeout(() =>
//   const urlTestFeed = "https://mysoundwise.com/rss/1508293913676s";
//   getFeed (urlTestFeed, function (err, results) {
//     const {metadata, feedItems} = results;
//     // console.log('metadata: ', metadata);
//     console.log('email: ', metadata['itunes:owner']);
//     console.log('feedItems: ', feedItems[0]);
//   });
// , 1000);

const timeout = 20000; // timeout 20 sec
const wrapCallback = cb => (err, data) => {
  if (!cb.called) {
    // ensure callback only getting called once
    cb.called = true;
    cb(err, data);
  }
};
// function to parse a given feed url:
function getFeed(urlfeed, cb) {
  const callback = wrapCallback(cb);
  try {
    var req = request(urlfeed, { timeout });
  } catch (err) {
    return callback(err);
  }
  setTimeout(() => callback(`Error: getFeed timeout ${urlfeed}`), timeout);
  var feedparser = new FeedParser();
  var feedItems = [];
  var metadata = '';
  req.on('response', function(response) {
    var stream = this;
    if (response.statusCode == 200) {
      stream.pipe(feedparser);
    } else {
      callback('getFeed: wrong response status: ' + response.statusCode);
    }
  });
  req.on('error', err => {
    console.log('getFeed: err.message == ' + err.message);
    callback(err);
  });
  feedparser.on('meta', meta => {
    metadata = meta;
    // console.log('metadata: ', meta);
  });
  feedparser.on('readable', function() {
    try {
      var item = this.read();
      if (item !== null) {
        feedItems.push(item);
      }
    } catch (err) {
      console.log('getFeed: err.message == ' + err.message);
      callback(err);
    }
  });
  feedparser.on('end', () => callback(null, { metadata, feedItems }));
  feedparser.on('error', err => {
    console.log('getFeed: err.message == ' + err.message);
    callback(err);
  });
}

// if publisherEmail cannot be found, need to end the progress, because we won't be able to verify that the user owns the feed
const emptyEmailMsg =
  "Error: Cannot find podcast owner's email in the feed. Please update your podcast feed to include an owner email and submit again!";
function getPublisherEmail(metadata) {
  // return 'YOUR_TEST@EMAIL.COM'; // set test publisher email
  const itunesEmail =
    metadata['itunes:owner'] &&
    metadata['itunes:owner']['itunes:email'] &&
    metadata['itunes:owner']['itunes:email']['#'];
  const managingEmail = metadata['rss:managingeditor'] && metadata['rss:managingeditor']['email'];
  return itunesEmail || managingEmail || null;
}

const feedUrls = {}; // in-memory cache object for obtained (but not yet imported to db) feeds
const feedUrlsImported = {}; // not claimed imported feeds

// Steps flow:
// 1. submit feedUrl (!submitCode && !resend && !importFeedUrl)
// 2. submitCode:CODE
// 3. resend:true[optional]
// 4. importFeedUrl:true[from dashboard] - claim on imported or import new feed
// client gives a feed url. Server needs to create a new soundcast from it and populate the soundcast and its episodes with information from the feed
async function parseFeed(req, res) {
  try {
    const { feedUrl, submitCode, resend, importFeedUrl, publisherId, userId } = req.body;
    if (!feedUrl) {
      return res.status(400).send(`Error: empty feedUrl field`);
    }
    const urlParsed = nodeUrl.parse(feedUrl.trim().toLowerCase());
    const url = urlParsed.host + urlParsed.path; // use url as a key
    let verificationCode = Date.now()
      .toString()
      .slice(-4);

    // 1. Search for the podcast
    const podcasts = await database.ImportedFeed.findAll({
      where: { feedUrl: url },
    });

    if (podcasts.length) {
      // feed found in ImportedFeed (no need to run runFeedImport)
      const podcast = podcasts[0]; // take first
      if (podcast.claimed) {
        // If the feed has already been claimed, that means it's already associated with a existing active publisher on Soundwise. In that case, we need to return an error to client. The user submission process should continue only if the feed is NOT already imported, or if it's imported but not 'claimed'. That's why we need to move the checking step to before the submission of verification code.
        const errMsg =
          'Error: This feed is already on Soundwise. If you think this is a mistake, please contact support.';
        return res.status(400).send(errMsg);
      }

      const { soundcastId, originalUrl } = podcast;
      const snapshot = await firebase
        .database()
        .ref(`soundcasts/${soundcastId}`)
        .once(`value`);
      let { title, publisherEmail, last_update, hostName } = snapshot.val();
      if (!publisherEmail || publisherEmail === 'null') {
        // checking if feed was updated
        let errMsg;
        await new Promise(resolve =>
          getFeed(originalUrl, async (err, results) => {
            if (err) {
              errMsg = `Error: obtaining feed ${originalUrl} ${errMsg}`;
            } else {
              publisherEmail = getPublisherEmail(results.metadata);
              if (publisherEmail) {
                let category = null;
                try {
                  const row = await database.CategorySoundcast.findOne({
                    where: { soundcastId },
                  });
                  if (row) {
                    const categoryRow = await database.CategoryList.findOne({
                      where: { categoryId: row.categoryId },
                    });
                    if (categoryRow && categoryRow.name) {
                      category = categoryRow.name;
                    }
                  }
                } catch (err) {
                  logErr(`Category.findOne ${err}`);
                }
                await createPodcasterEmail({
                  podcastTitle: title,
                  publisherEmail,
                  last_update,
                  hostName,
                  category,
                });
                await firebase
                  .database()
                  .ref(`soundcasts/${soundcastId}/publisherEmail`)
                  .set(publisherEmail);
              }
            }
            resolve();
          })
        );
        if (errMsg) {
          return res.status(400).send(errMsg);
        }
      }

      if (!publisherEmail || publisherEmail === 'null') {
        return res.status(400).send(emptyEmailMsg);
      }

      if (!submitCode && !resend && !importFeedUrl) {
        // first step - submitting feedUrl/trying to claim
        feedUrlsImported[url] = verificationCode;
        sendVerificationMail(publisherEmail, title, verificationCode);
        return res.json({
          imageUrl: podcast.imageURL,
          publisherEmail,
          notClaimed: true, // req.body.notClaimed
        });
      }

      if (submitCode) {
        // check verification code
        if (submitCode === feedUrlsImported[url]) {
          return res.send('Success_code');
        } else {
          return res.status(400).send(`Error: incorrect verfication code`);
        }
      }

      if (resend) {
        sendVerificationMail(publisherEmail, title, feedUrlsImported[url]);
        return res.send('Success_resend');
      }

      // if the feed has already been imported but it hasn't been "claimed",
      // then we don't need to call the runFeedImport function after user signs up.
      // We just need to assign the feed's soundcast id and its publisher id to the user.
      if (importFeedUrl) {
        await firebase
          .database()
          .ref(`publishers/${publisherId}/soundcasts/${soundcastId}`)
          .set(true);
        await firebase
          .database()
          .ref(`users/${userId}/soundcasts_managed/${soundcastId}`)
          .set(true);
        await database.ImportedFeed.update(
          { claimed: true, userId, publisherId },
          { where: { soundcastId } }
        );
        await database.Soundcast.update({ publisherId }, { where: { soundcastId } });
        await firebase
          .database()
          .ref(`soundcasts/${soundcastId}/publisherID`)
          .set(publisherId);
        await firebase
          .database()
          .ref(`soundcasts/${soundcastId}/creatorID`)
          .set(userId);
        await firebase
          .database()
          .ref(`soundcasts/${soundcastId}/verified`)
          .set(true);

        const episodes = await database.Episode.findAll({ where: { soundcastId } });
        if (episodes.length) {
          await database.Episode.update({ publisherId }, { where: { soundcastId } });
          for (const episode of episodes) {
            await firebase
              .database()
              .ref(`episodes/${episode.episodeId}/publisherID`)
              .set(publisherId);
            await firebase
              .database()
              .ref(`episodes/${episode.episodeId}/creatorID`)
              .set(userId);
          }
        }
        delete feedUrlsImported[url];
        return res.send('Success_claim');
      }
    } else {
      // not found in ImportedFeed (feed wasn't imported)
      if (!submitCode && !resend && !importFeedUrl) {
        // first step - submitting feedUrl
        return getFeed(feedUrl, async (err, results) => {
          if (err) {
            return res.status(400).send(`Error: obtaining feed ${err}`);
          }
          const { metadata, feedItems } = results;
          const publisherEmail = getPublisherEmail(metadata);
          if (!publisherEmail) {
            return res.status(400).send(emptyEmailMsg);
          }
          // setting cached object
          feedUrls[url] = {
            publisherEmail,
            metadata,
            verificationCode,
            feedItems,
            originalUrl: feedUrl,
          };
          sendVerificationMail(publisherEmail, metadata.title, verificationCode);
          res.json({ imageUrl: metadata.image.url, publisherEmail });
        });
      }

      if (!feedUrls[url]) {
        return logErr(`feed wasn't found in cache object ${url}`, res);
      }

      const { publisherEmail, metadata } = feedUrls[url];

      if (submitCode) {
        // check verification code
        if (submitCode === feedUrls[url].verificationCode) {
          feedUrls[url].verified = true;
          return res.send('Success_code');
        } else {
          return res.status(400).send(`Error: incorrect verfication code`);
        }
      }

      if (resend) {
        sendVerificationMail(publisherEmail, metadata.title, feedUrls[url].verificationCode);
        return res.send('Success_resend');
      }

      if (importFeedUrl) {
        runFeedImport(req, res, url, feedUrls[url], true, true, true, () => {
          delete feedUrls[url];
          res.send('Success_import');
        });
      }
    }
  } catch (err) {
    logErr(`parseFeed catch ${err}`, res);
    console.log(err.stack);
  }
} // parseFeed

function sendVerificationMail(to, soundcastTitle, verificationCode) {
  if (process.env.NODE_ENV === 'dev') {
    return console.log('parseFeed sendVerificationMail', to, verificationCode);
  }
  sgMail.send({
    to,
    from: 'support@mysoundwise.com',
    subject: 'Your confirmation code for Soundwise',
    html: `<p>Hello,</p><p>Here's your code to verify that you are the publisher of ${soundcastTitle}:</p><p style="font-size:24px; letter-spacing: 2px;"><strong>${verificationCode}</strong></p><p>Folks at Soundwise</p>`,
  });
}

const createPodcasterEmail = async row =>
  new Promise(async resolve => {
    // store the publisher's email address in a separate table in the database,
    // for podcasts that are "active", i.e. has been updated in the last year
    const yearAgo = moment()
      .subtract(1, 'years')
      .unix();
    if (row.publisherEmail && Number(row.last_update) > yearAgo) {
      // has publisherEmail and was updated in last year
      try {
        await database.PodcasterEmail.create(row);
      } catch (err) {
        logErr(`PodcasterEmail create ${err} ${row}`);
      }
    }
    resolve();
  });

async function runFeedImport(
  req,
  res,
  url,
  feedObj,
  isPublished,
  isVerified,
  isClaimed,
  callback,
  itunesId,
  soundcastId
) {
  try {
    const { metadata, publisherEmail, verified, originalUrl } = feedObj;
    const { publisherId, userId } = req.body;

    if (!verified) {
      // verificationCode checked
      return res.status(400).send('Error: not verified');
    }

    let publisherName = req.body.publisherName;
    if (!publisherName) {
      // trying to obtain publisherName from firebase
      const snapshot = await firebase
        .database()
        .ref(`publishers/${publisherId}/name`)
        .once('value');
      publisherName = snapshot.val();
    }

    let feedItems = (feedObj.feedItems || []).filter(i => {
      // If enclosures is empty, we shouldn't import the item.
      // We should only import items that have an audio file in enclosures.
      return (
        i.enclosures &&
        i.enclosures.length &&
        i.enclosures[0] &&
        i.enclosures[0].type &&
        i.enclosures[0].type.includes('audio')
      );
    });

    if (!feedItems.length) {
      console.log(`INFO: runFeedImport empty feedItems array ${itunesId} ${originalUrl}, skipping`);
      return callback && callback();
    }

    feedItems.sort((a, b) => {
      // sort feedItems by date or pubdate or pubDate
      return (a.date || a.pubdate || a.pubDate) - (b.date || b.pubdate || b.pubDate);
    });

    if (feedItems.length > 100) {
      // if a feed has more than 100 items, let's only import the most recent 100 episodes
      feedItems = feedItems.slice(-100);
    }

    let last_update = metadata.date || metadata.pubdate || metadata.pubDate;
    if (!last_update) {
      // take first episode's date
      const newestEpisode = feedItems[feedItems.length - 1]; // last in array
      last_update = newestEpisode.date || newestEpisode.pubdate || newestEpisode.pubDate;
    }
    if (!last_update || moment(last_update).format('X') === 'Invalid date') {
      // If all three properties are missing, the program should flag an error and it should not be imported. And we need to check the feed manually to see what's happening.
      console.log(`WARN: ${itunesId} can't obtain last_update ${originalUrl}, skipping`);
      return callback();
    }
    last_update = moment(last_update).format('X');

    if (!soundcastId) {
      soundcastId = `${moment().format('x')}s`;
    }

    // 1. create a new soundcast from the feed
    const { description, author, image } = metadata;
    let blurredImageURL = '';
    if (!image.url) {
      image.url = '';
    } else {
      try {
        console.log(`INFO: ${itunesId} creating blurredImage ${originalUrl}`);
        await new Promise((resolve, reject) => {
          requestPromise
            .get({ url: image.url, encoding: null })
            .then(async body => {
              if (!body) {
                return reject(`empty body`);
              }
              const bodyType = fileType(body);
              if (!bodyType || !bodyType.ext) {
                return reject(`unable to obtain body type`);
              }
              const imagePath = `/tmp/${soundcastId}_original.${bodyType.ext}`;
              const updatedImagePath = `/tmp/${soundcastId}_updated.${bodyType.ext}`;
              await new Promise(resolve2 => {
                fs.writeFile(imagePath, body, err => {
                  if (err) {
                    return reject(`fs_writeFile imagePath ${imagePath} ${err}`);
                  }
                  new ffmpeg(imagePath).then(imageFile => {
                    imageFile.addCommand('-vf', `scale=600:-1`);
                    imageFile.save(updatedImagePath, err => {
                      if (err) {
                        return reject(`cannot save updated image ${updatedImagePath} ${err}`);
                      }
                      fs.unlink(imagePath, err => 0); // remove original image file
                      resolve2();
                    });
                  });
                });
              });
              jimp
                .read(updatedImagePath)
                .then(f => {
                  f.blur(30)
                    .brightness(0.6)
                    .getBuffer(jimp.AUTO, (err, buffer) => {
                      if (err) {
                        return reject(`jimp_error ${err}`);
                      }
                      const filePath = `/tmp/${soundcastId}_blurred.${bodyType.ext}`;
                      fs.writeFile(filePath, buffer, err => {
                        fs.unlink(updatedImagePath, err => 0); // remove updated image file
                        if (err) {
                          return reject(`jimp_fs_writeFile ${filePath} ${err}`);
                        }
                        uploader1.use(
                          new S3Strategy({
                            uploadPath: `soundcasts/`,
                            headers: { 'x-amz-acl': 'public-read' },
                            options: {
                              key: awsConfig.accessKeyId,
                              secret: awsConfig.secretAccessKey,
                              bucket: 'soundwiseinc',
                            },
                          })
                        );
                        const uploaderOptions = {
                          path: filePath,
                          name: `blurred-${soundcastId}.${bodyType.ext}`,
                        };
                        uploader1.upload('s3', uploaderOptions, (err, files) => {
                          fs.unlink(filePath, err => 0);
                          if (err) {
                            return reject(`uploading ${image.url} ${filePath} to S3 ${err}`);
                          }
                          if (files.length && files[0].url) {
                            blurredImageURL = files[0].url.replace(
                              `s3.amazonaws.com/soundwiseinc`,
                              `d1jzcuf08rvzm.cloudfront.net`
                            );
                          }
                          resolve();
                        });
                      });
                    });
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
      } catch (err) {
        logErr(`Blurred image create ${image.url} ${err} ${err && err.stack}`);
      }
    }
    const title = entities.decode(metadata.title);
    const hostName = entities.decode(
      (metadata['itunes:author'] && metadata['itunes:author']['#']) || author
    );
    const soundcast = {
      title,
      publisherEmail,
      creatorID: userId,
      publisherID: publisherId,
      publisherName,
      short_description: entities.decode(description),
      imageURL: image.url,
      blurredImageURL,
      hostName,
      last_update,
      fromParsedFeed: true, // this soundcast is imported from a RSS feed
      forSale: false,
      landingPage: true,
      prices: [{ billingCycle: 'free', price: 'free' }],
      published: isPublished, // set this to true from client after ownership is verified
      verified: isVerified, // ownership verification, set to true from client after ownership is verified
      showSubscriberCount: false,
      showTimeStamps: true,
      hostImageURL: 'https://d1jzcuf08rvzm.cloudfront.net/user_profile_pic_placeholder.png',
      episodes: {},
    };

    // save the podcast's iTunes category under the importedFeeds node and under the soundcast node
    // This should be similar to the upload setup on the /dashboard/add_episode page
    let categories = metadata['itunes:category'];
    let category = null;
    if (categories) {
      if (!categories.length) {
        // single category
        categories = [metadata['itunes:category']];
      }
      for (const category of categories) {
        let name;
        if (category && category['@'] && category['@'].text) {
          if (categoriesNames.indexOf(category['@'].text) !== -1) {
            name = category['@'].text;
          }
          const subcategory = category['itunes:category'];
          if (subcategory && subcategory['@'] && subcategory['@'].text) {
            // have subcategory
            if (categoriesNames.indexOf(subcategory['@'].text) !== -1) {
              name = subcategory['@'].text;
            }
          }
        }
        if (name) {
          if (!category) {
            category = name;
          }
          try {
            await database.CategorySoundcast.create({
              categoryId: categoriesIds.find(i => i.name === name).id,
              soundcastId,
            });
          } catch (err) {
            logErr(`CategorySoundcast create ${err}`);
          }
        }
      }
    }

    await createPodcasterEmail({
      podcastTitle: title,
      publisherEmail,
      last_update,
      hostName,
      category,
    });

    // 2-a. add to publisher node in firebase
    await firebase
      .database()
      .ref(`publishers/${publisherId}/soundcasts/${soundcastId}`)
      .set(true);

    // 2-b. add to importedFeeds node in firebase
    const importedFeedObj = {
      soundcastId,
      published: isPublished,
      title: title.length > 255 ? title.slice(0, 255) : title,
      feedUrl: url.length > 255 ? url.slice(0, 255) : url,
      originalUrl: originalUrl.length > 255 ? originalUrl.slice(0, 255) : originalUrl,
      imageURL: image.url.length > 255 ? image.url.slice(0, 255) : image.url,
      updated: Number(moment().unix()),
      publisherId,
      userId,
      claimed: isClaimed, // when 'claimed == true', this imported soundcast is managed by the RSS feed owner
    };
    const postgresSoundcast = {
      soundcastId,
      publisherId,
      title: title.length > 255 ? title.slice(0, 255) : title,
    };
    if (itunesId) {
      importedFeedObj.itunesId = itunesId; // store the iTunesID under the importedFeed node
      postgresSoundcast.itunesId = itunesId;
    }

    // 2-c. add to postgres
    await database.ImportedFeed.create(importedFeedObj);
    await database.Soundcast.findOrCreate({ where: { soundcastId }, defaults: postgresSoundcast });

    // 3. create new episodes from feedItems and add episodes to firebase and postgreSQL
    console.log(`INFO: ${itunesId} ${originalUrl} adding new episodes ${feedItems.length}`);
    let episodeIndex = 0;
    for (const item of feedItems) {
      const episodeId = await addFeedEpisode(
        item,
        userId,
        publisherId,
        soundcastId,
        soundcast,
        metadata,
        episodeIndex
      );
      soundcast.episodes[episodeId] = true;
      episodeIndex++;
    }
    await firebase
      .database()
      .ref(`soundcasts/${soundcastId}`)
      .set(soundcast);
    await firebase
      .database()
      .ref(`users/${userId}/soundcasts_managed/${soundcastId}`)
      .set(true);
    await firebase
      .database()
      .ref(`publishers/${publisherId}/administrators/${userId}`)
      .set(true);
    callback && callback();
  } catch (err) {
    logErr(`runFeedImport catch ${err} ${err && err.stack}`, res, callback);
  }
} // runFeedImport

async function addFeedEpisode(
  item,
  userId,
  publisherId,
  soundcastId,
  soundcast,
  metadata,
  episodeIndex,
  episodeId // optional
) {
  try {
    const { title, description, summary, date, image, enclosures } = item;
    let duration = null;
    if (item['itunes:duration'] && item['itunes:duration']['#']) {
      // duration not empty
      duration = item['itunes:duration']['#'].toString(); // '323' (seconds) or '14:23'
      if (duration.includes(':')) {
        if (duration.split(':').length === 2) {
          duration = '0:' + duration; // '14:23' > '0:14:23'
        }
        duration = moment.duration(duration).asSeconds(); // '0:14:23' > 863 (number)
      } else {
        duration = Number(duration);
      }
    }

    /* // obtain duration by loading original file with ffmpeg - skip by now
    await new Promise(resolve => {
      const url = enclosures[0].url;
      requestPromise.get({ encoding: null, url }).then(async body => {
        const filePath = `/tmp/parse_feed_${Math.random().toString().slice(2)}.${fileType(body).ext}`;
        fs.writeFile(filePath, body, err => {
          if (err) {
            return logErr(`Error: cannot write tmp audio file ${url} ${filePath}`, null, resolve);
          }
          (new ffmpeg(filePath)).then(file => { // resize itunes image
            if (file && file.metadata && file.metadata.duration) {
              duration = file.metadata.duration.seconds;
            } else {
              logErr(`empty file.metadata ${url}`);
            }
            fs.unlink(filePath, err => 0); // remove file
            resolve();
          }, err => logErr(`ffmpeg unable to parse file ${url} ${filePath} ${err}`, null, resolve));
        });
      }).catch(err => logErr(`unable to obtain image ${err}`, null, resolve));
    });
    */

    const date_created = moment(date || metadata.date).format('X');
    const episode = {
      title: entities.decode(title),
      coverArtUrl: image.url || soundcast.imageURL || '',
      creatorID: userId,
      date_created:
        date_created === 'Invalid date' ? Math.floor(Date.now() / 1000) : Number(date_created),
      description: (description && entities.decode(description)) || entities.decode(summary || ''),
      id3Tagged: true,
      index: episodeIndex + 1,
      isPublished: true,
      publicEpisode: true,
      publisherID: publisherId,
      soundcastID: soundcastId,
      url: enclosures[0].url,
    };
    if (typeof duration !== 'number' || isNaN(duration)) {
      const errMsg = `WARN: incorrect duration ${duration}`;
      console.log(`${errMsg} ${userId} ${publisherId} ${soundcastId} ${episode.url}`);
    } else {
      episode.duration = duration;
    }

    if (!episodeId) {
      episodeId = `${moment().format('x')}e`;
    }

    // add to episodes node in firebase
    await firebase
      .database()
      .ref(`episodes/${episodeId}`)
      .set(episode);
    // add to the soundcast
    await firebase
      .database()
      .ref(`soundcasts/${soundcastId}/episodes/${episodeId}`)
      .set(true);
    // add to postgres
    await database.Episode.findOrCreate({
      where: { episodeId },
      defaults: {
        episodeId,
        soundcastId,
        publisherId,
        title: episode.title.length > 255 ? episode.title.slice(0, 255) : episode.title,
        soundcastTitle:
          soundcast.title.length > 255 ? soundcast.title.slice(0, 255) : soundcast.title,
      },
    });
    return episodeId;
  } catch (err) {
    logErr(`addFeedEpisode catch ${err} ${err.stack}`);
  }
}

// Update all the published soundcasts from imported feeds
async function feedUpdateInterval() {
  try {
    // 1. go through every row under 'ImportedFeed' table
    const imported_f_count = await database.ImportedFeed.count();
    const limit = 5000; // step size
    let offset = 0;
    while (offset <= imported_f_count) {
      console.log(`feedUpdateInterval findAll ${offset}`);
      const podcasts = await database.ImportedFeed.findAll({
        // where: { soundcastId: `1530249458660s` }, // test one
        order: [['soundcastId', 'ASC']],
        offset,
        limit,
      });
      for (const item of podcasts) {
        await new Promise(resolve => {
          // 2. for each item, if it's published, parse the feedUrl again,
          //    and find feed items that are created after the last time feed was parsed
          getFeed(item.originalUrl, async (err, results) => {
            if (err) {
              logErr(`feedUpdateInterval getFeed ${item.soundcastId} ${err}`);
              return resolve();
            }
            const soundcastObj = await firebase
              .database()
              .ref(`soundcasts/${item.soundcastId}`)
              .once('value');
            const soundcastVal = soundcastObj.val();
            if (!soundcastVal) {
              return logErr(`empty soundcastVal ${item.soundcastId}`, null, resolve);
            }
            let episodeIndex = Object.keys(soundcastVal.episodes || {}).length; // episodes count
            const { metadata } = results;

            results.feedItems.sort((a, b) => {
              // sort feedItems by date or pubdate or pubDate (oldest first)
              return (a.date || a.pubdate || a.pubDate) - (b.date || b.pubdate || b.pubDate);
            });

            for (const feed of results.feedItems) {
              const pub_date = Number(moment(feed.pubdate || feed.pubDate).format('X'));
              const hasEnclosures =
                feed.enclosures && feed.enclosures.length && feed.enclosures[0].url;
              if (hasEnclosures && pub_date && pub_date > item.updated) {
                // 3. create new episodes from the new feed items, and add them to their respective soundcast
                //    *episode.index for the new episodes should be the number of existing episodes
                //     in the  soundcast + 1
                const soundcast = {};
                soundcast.imageURL = metadata && metadata.image && metadata.image.url;
                soundcast.title = metadata && metadata.title;
                await addFeedEpisode(
                  feed,
                  item.userId,
                  item.publisherId,
                  item.soundcastId,
                  soundcast,
                  metadata,
                  episodeIndex
                );
                episodeIndex++;
                item.updated = pub_date;
                await item.save();
              }
            }
            resolve();
          });
        });
      }
      offset += limit; // step
    }
    // 4. repeat the update checking every day (what's the best way to do this?
    // Assuming the number of feeds that need to be updated will eventually get
    // to around 500,000. Will it be a problem for the server?)
    // - see /server/boot/cron-jobs-v2.js
  } catch (err) {
    logErr(`feedUpdateInterval catch ${err} ${err && err.stack}`);
  }
}

module.exports = { getFeed, parseFeed, runFeedImport, feedUpdateInterval, addFeedEpisode };
