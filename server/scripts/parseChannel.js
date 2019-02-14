'use strict';
const firebase = require('firebase-admin');
const request = require('request-promise');
const sizeOf = require('image-size');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
const pubSubHubbub = require('pubsubhubbub');
const pubSubSubscriber = pubSubHubbub.createServer();
const database = require('../../database/index');
const { logErr, getRandomColor } = require('./utils')('parseChannel.js');
const {
  listChannel,
  listPlaylist,
  getChannelInfo,
  importChannelVideos,
} = require('./importChannelVideos');
const { soundcastService } = require('../services');

pubSubSubscriber.on('denied', data => logErr(`pubSubSubscriber denied ${JSON.stringify(data)}`));
pubSubSubscriber.on('error', err => logErr(`pubSubSubscriber error: ${err} ${err && err.stack}`));

// // Test single request (node parseChannel.js)
// const serviceAccount = require('../../serviceAccountKey');
// firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
//   databaseURL: 'https://soundwise-a8e6f.firebaseio.com',
// });
// setTimeout(() => {
//   parseChannel(
//     {
//       body: {
//         audioProcessingOptions: {
//           trim: true,
//           overlayDuration: 3,
//           intro: `https://mysoundwise.com/tracks/1539120101625e.mp3`,
//           outro: `https://mysoundwise.com/tracks/1539120101625e.mp3`,
//           setVolume: true,
//           tagging: true,
//         },
//       },
//     },
//     { end: () => 0 }
//   );
// }, 3000);

const isDev = process.env.NODE_ENV === 'dev';
const workerHost = isDev ? `http://162.243.0.226:1338/` : `http://162.243.0.226:1337/`;
const hubEncoded = encodeURIComponent(`http://pubsubhubbub.appspot.com/`);

async function parseChannel(req, res) {
  // // Test body
  // req.body.creatorId = 'f4jRbA5SldPPRGX3TmbgTm7lvI72';
  // req.body.publisherId = '1544545707058p';
  // req.body.channelId = 'UCfMphWEGRDz9HAyPAbqnslQ'; // ivanm test channel
  // req.body.channelId = 'UCMFjpvxChzHGC4ejPkhgN2w'; // Soundwise test channel
  // req.body.channelId = 'UCBnyC5I55W__RBj1PMybF5g'; // Angie Atkinson channel
  // req.body.playlistId = 'PL4TinHBfD1AXAM4gbtmYJNDeCELH__G44'; // ivanm test playlist
  // req.body.playlistId = 'PLKJkV-gn8oaZe90Z5YCJRb8gB5BcahaUj'; // Angie Atkinson playlist
  // req.body.soundcastId = '1538496552266s';
  // req.body.newSoundcast = true;
  // req.body.deleteChannelSubscription = true;

  const publisherId = req.body && req.body.publisherId;
  let publisherEmail;
  try {
    const {
      newSoundcast,
      soundcastId,
      creatorId,
      playlistId,
      itunesCategory,
      itunesImage,
      deleteChannelSubscription,
      skipChannelConversion,
      autoSubmitPodcast,
    } = req.body;
    const audioProcessingOptions = req.body.audioProcessingOptions || {};
    let channelId = req.body.channelId;

    const userSnapshot = await firebase
      .database()
      .ref(`users/${creatorId}`)
      .once(`value`);
    const user = userSnapshot.val();
    if (!user) {
      return logErr(`empty user ${creatorId}`, res);
    }
    if (user.publisherID !== publisherId) {
      return logErr(`incorrect creatorId or publisherId ${creatorId} ${publisherId}`, res);
    }

    // Delete old subsciption data, clear soundcastFromYoutube object
    const subscription = await database.ChannelSubscription.findOne({ where: { publisherId } });
    if (subscription) {
      channelId = subscription.channelId;
      const topic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
      const subUrl = `${workerHost}?topic=${encodeURIComponent(topic)}&hub=${hubEncoded}`;
      pubSubSubscriber.unsubscribe(topic, `http://pubsubhubbub.appspot.com/`, subUrl, err => {
        return err && logErr(`pubSubSubscriber unsubscribe failed ${err} ${err && err.stack}`);
      });
      await database.ChannelSubscription.destroy({ where: { publisherId } });
    }
    await firebase
      .database()
      .ref(`publishers/${publisherId}/soundcastFromYoutube`)
      .remove();

    if (deleteChannelSubscription) {
      return res.end('Success Unsubscribe');
    }

    if (!channelId) {
      return logErr(`empty channelId value`, res);
    }

    // check audioProcessingOptions conformity
    const { overlayDuration, removeSilence } = audioProcessingOptions;
    if ((overlayDuration && isNaN(overlayDuration)) || (removeSilence && isNaN(removeSilence))) {
      return logErr('incorrect overlayDuration/removeSilence value', res);
    }

    const publisherSnapshot = await firebase
      .database()
      .ref(`publishers/${publisherId}`)
      .once('value');
    const publisher = publisherSnapshot.val();
    if (!publisher) {
      return logErr(`empty publisher ${publisherId}`, res);
    }
    publisherEmail = publisher.email;
    audioProcessingOptions.publisherEmail = publisher.email;
    audioProcessingOptions.publisherName = publisher.name;

    // // Test pubsub
    // const topic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
    // const subUrl = `${workerHost}?topic=${encodeURIComponent(topic)}&hub=${hubEncoded}`;
    // pubSubSubscriber.subscribe(topic, `http://pubsubhubbub.appspot.com/`, subUrl, err => {
    //   return err && logErr(`pubSubSubscriber subscribe failed ${err} ${err && err.stack}`);
    // });
    // await database.ChannelSubscription.create({
    //   soundcastId,
    //   publisherId,
    //   channelId,
    //   leaseDate: Math.floor(Date.now() / 1000) + 5 * 24 * 3600, // 5 days (default)
    //   playlistId,
    // });

    // 2. the audio processing options need to be stored in firebase
    // (because future processing of new episodes need to use the same options),
    // and we need to flag the soundcast as imported from Youtube,
    // including youtube channel ID (and playlist ID) in the soundcast object
    const { snippet } = await getChannelInfo(channelId);
    const soundcastFromYoutube = {
      soundcastId,
      channelId,
      channelName: snippet.title,
      audioProcessingOptions,
    };

    // 3. fetch video content
    // if 'playList' id is present in the request, fetch only the videos belong to the playlist
    // if no playList id specified, fetch all the videos from the channel
    const videoItems = await (playlistId ? listPlaylist(playlistId) : listChannel(channelId));
    if (playlistId) {
      if (!videoItems) {
        // imply playlist is private
        return logErr(`private playlist ${playlistId}`, res);
      }
      soundcastFromYoutube.playlistId = playlistId;
      soundcastFromYoutube.playlistName = videoItems.playlistName;
    }
    const soundcastTitle = soundcastFromYoutube.playlistName || soundcastFromYoutube.channelName;
    videoItems.metadataTitle = soundcastTitle;
    videoItems.metadataAuthor = publisher.name;

    let soundcast;
    if (newSoundcast) {
      // Set `title` = `snippet.title`, `short_description` = `snippet.description`
      // `hostImageURL == snippet.thumbnails.high.url`, `hostName == true`
      // `published == true`, `landingPage == true`, `showSubscriberCount == false`,
      // `showTimeStamps == true`, `forSale == false`, `prices == [{billingCycle: 'free', price: 'free'}]`
      const dummyImage = `https://dummyimage.com/300.png/${getRandomColor()}/ffffff&text=${encodeURIComponent(
        soundcastTitle
      )}`;
      soundcast = {
        title: soundcastTitle,
        imageURL: itunesImage || dummyImage,
        creatorID: creatorId,
        date_created: moment().format('X'),
        publisherID: publisherId,
        landingPage: true,
        features: [''],
        category: itunesCategory[0].split(' - ')[0],
        hostName: publisher.name,
        hostImageURL: snippet.thumbnails.high.url,
        forSale: false,
        prices: [{ billingCycle: 'free', price: 'free' }],
        last_update: Number(moment().format('X')),
        published: true,
        showSubscriberCount: false,
        showTimeStamps: true,
        short_description: snippet.description || soundcastTitle,
        autoSubmitPodcast,
      };
      await soundcastService.createOrUpdate({
        soundcastId,
        title: soundcastTitle,
        publisherId,
        imageUrl: soundcast.imageURL,
        category: soundcast.category,
        published: true,
        landingPage: true,
        forSale: false,
        updateDate: soundcast.last_update,
      });
      await firebase
        .database()
        .ref(`publishers/${publisherId}/soundcasts/${soundcastId}`)
        .set(true);
      await firebase
        .database()
        .ref(`users/${creatorId}/soundcasts_managed/${soundcastId}`)
        .set(true);
      //add soundcast to admins
      const adminIds = Object.keys(publisher.administrators || {});
      for (const adminId of adminIds) {
        await firebase
          .database()
          .ref(`users/${adminId}/soundcasts_managed/${soundcastId}`)
          .set(true);
      }
    } else {
      const soundcastSnapshot = await firebase
        .database()
        .ref(`soundcasts/${soundcastId}`)
        .once(`value`);
      soundcast = soundcastSnapshot.val();
    }
    if (!soundcast) {
      return logErr(`empty soundcast ${soundcastId}`, res);
    }
    res.end('Success');

    // When user chooses to create podcast feed from their converted youtube channel, we need to add
    // these iTunes related variables in the soundcast node in firebase: `itunesCategory`, `itunesHost`, `itunesTitle`
    if (audioProcessingOptions.createChannelFeed) {
      soundcast.itunesCategory = itunesCategory;
      soundcast.itunesImage = itunesImage || soundcast.imageURL;
      soundcast.itunesHost = publisher.name;
      soundcast.itunesExplicit = audioProcessingOptions.itunesExplicit;
      soundcast.itunesTitle = soundcastTitle;
      soundcast.autoSubmitPodcast = autoSubmitPodcast;
    }

    if (itunesImage && soundcast.imageURL && soundcast.imageURL.includes(`//dummyimage.com/`)) {
      // replace 'dummyimage.com/*/*' with itunesImage
      soundcast.imageURL = itunesImage;
    }

    // TODO review side-effects (*use ref().set() on each field above instead ?)
    await firebase
      .database()
      .ref(`soundcasts/${soundcastId}`)
      .set(soundcast);

    // Notify publisher conversion has started
    !skipChannelConversion &&
      sgMail.send({
        to: publisherEmail,
        from: 'support@mysoundwise.com',
        subject: 'Your Youtube channel conversion has started',
        html: `<p>Hello ${
          publisher.name
        }:</p><p></p><p>We have started working on converting your channel. The initial conversion may take anywhere from a few minutes to a few hours, depending on how many videos you have in your channel and their length.</p><p></p><p>If you do not hear from us about the result of your channel conversion in 24 hours, please contact us at this email address.</p><p></p><p>Thanks and talk again soon!</p><p></p><p>Folks at Soundwise</p>`,
      });

    await importChannelVideos(
      videoItems,
      audioProcessingOptions,
      soundcast,
      soundcastId,
      publisherId,
      creatorId,
      itunesCategory,
      skipChannelConversion
    );

    // - In order for the client to properly identify whether conversion has been finished,
    // the channel related variables (`channelId`, `playlistId`) should be added into firebase
    // ONLY AFTER the initial conversion is done
    await firebase
      .database()
      .ref(`publishers/${publisherId}/soundcastFromYoutube`)
      .set(soundcastFromYoutube);

    // Step 5: Continued update
    await database.ChannelSubscription.create({
      soundcastId,
      publisherId,
      channelId,
      leaseDate: Math.floor(Date.now() / 1000) + 5 * 24 * 3600, // 5 days (default)
      playlistId,
    });
    const topic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
    const subUrl = `${workerHost}?topic=${encodeURIComponent(topic)}&hub=${hubEncoded}`;
    pubSubSubscriber.subscribe(topic, `http://pubsubhubbub.appspot.com/`, subUrl, err => {
      err && logErr(`pubSubSubscriber subscribe failed ${err} ${err && err.stack}`);
    }); // this should trigger pubSubSubscriber's "subscribe" event on workerHost server

    // Notify publisher when the conversion is all done
    !skipChannelConversion &&
      sgMail.send({
        to: publisherEmail,
        from: 'support@mysoundwise.com',
        subject: 'Good news! Your Youtube channel is converted!',
        html:
          `<p>Hello ${publisher.name}:</p><p></p><p>We have converted your Youtube channel ` +
          `(${soundcastFromYoutube.channelName}) into a soundcast (${soundcast.title}). ` +
          `You can check it out by logging into your <a target="_blank" href="https://mysoundwise.com/dashboard/soundcasts">Soundwise dashboard</a>.</p><p></p><p>Folks at Soundwise</p>`,
      });
  } catch (err) {
    logErr(`parseChannel catch ${publisherId} ${err} ${err && err.stack}`, res);
    await firebase
      .database()
      .ref(`publishers/${publisherId}/youtubeConnect`)
      .set(`ERROR: ${err}`);
    // Send error email
    publisherEmail &&
      sgMail.send({
        to: publisherEmail,
        from: 'support@mysoundwise.com',
        subject: `There's a glitch with your YouTube channel conversion`,
        html: `<p>Hi!</p><p></p><p>We're sorry to tell you that there has been a problem in converting your YouTube channel. Please try again from your Soundwise dashboard, or contact our support at support@mysoundwise.com. </p><p></p><p>Thanks!</p><p></p><p>Folks at Soundwise</p>`,
      });
  }
}

async function checkImageDimension(req, res) {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).send(`Error: empty imageUrl`);
    }
    const imageBody = await request.get({ encoding: null, url: imageUrl });
    const { height, width } = sizeOf(imageBody); // { height: 1400, width: 1400, type: "jpg" }
    if (!(height >= 1400 && width >= 1400 && height <= 3000 && width <= 3000)) {
      return res
        .status(400)
        .send(`Error: image size must be between 1400x1400 px and 3000x3000 px`);
    }
    res.end('Success');
  } catch (err) {
    logErr(`checkImageDimension catch ${err} ${err && err.stack}`, res);
  }
}

module.exports = { parseChannel, checkImageDimension };
