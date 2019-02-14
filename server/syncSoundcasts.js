'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../database');
const _ = require('lodash');
const htmlEntities = require('html-entities').AllHtmlEntities;
const { soundcastRepository } = require('./repositories');
const { soundcastManager } = require('./managers');
var serviceAccount = require('../serviceAccountKey');

const LOG_ERR = 'logErrsSoundcasts.txt';
const PAGE_SIZE = 100;

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${
    process.env.NODE_ENV === 'production' ? 'soundwise-a8e6f' : 'soundwise-testbase'
  }.firebaseio.com`,
});

const importedPublisherId = '000123456789p';

const syncSoundcasts = async () => {
  await fs.unlink(LOG_ERR, err => err);
  let i = 0;
  let next = true;
  await createPublisher();

  console.log('\n\nstart\n\n');

  let startId = (await firebase
    .database()
    .ref('soundcasts')
    .orderByKey()
    .limitToFirst(1)
    .once('value')).key;

  const lastId = (await firebase
    .database()
    .ref('soundcasts')
    .orderByKey()
    .limitToLast(1)
    .once('value')).key;

  while (next) {
    const soundcasts = (await firebase
      .database()
      .ref('soundcasts')
      .orderByKey()
      .startAt(startId)
      .limitToFirst(PAGE_SIZE)
      .once('value')).val();
    const keys = Object.keys(soundcasts);
    startId = keys[keys.length - 1];

    for (const key of keys) {
      next = key !== lastId;
      const fbSoundcast = soundcasts[key];
      let soundcast = getSoundcastForPsql(key, fbSoundcast);
      try {
        const isImported = await importEpisodes(key);
        if (isImported) {
          await removeSpecialChars(key, fbSoundcast);
          soundcast = Object.assign({}, soundcast, {
            publisherId: importedPublisherId,
            title: fixSpecialChars(soundcast.title),
          });
        }
      } catch (e) {
        logInFile(e);
      }
      await createOrUpdateSoundcast(key, soundcast);
    }
    i = i + PAGE_SIZE;
    console.log('\n\nstartId: ', startId + '\n');
    console.log('handled count soundcasts', i + '\n');
    logInFile('\nstartId = ' + startId + '\ncount: ' + i);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log('finish');
};

const createOrUpdateSoundcast = async (key, soundcast) => {
  const soundcastData = await soundcastRepository.get(key);
  if (soundcastData) {
    await updateSoundcast(soundcast, key);
  } else {
    await createSoundcast(soundcast);
  }
};

const importEpisodes = async key => {
  const importedSoundcast = await database.ImportedFeed.findOne({
    where: { soundcastId: key },
  });
  if (importedSoundcast) {
    const importedSoundcastId = importedSoundcast.dataValues.soundcastId;
    await soundcastManager.update(key, { verified: false });

    const episodesData = await database.Episode.findAll({
      where: { soundcastId: importedSoundcastId },
    });
    if (episodesData) {
      let updateEpisodes = {};
      for (const episodeData of episodesData) {
        const episodeId = episodeData.dataValues.episodeId;
        Object.assign(updateEpisodes, { [episodeId]: true });
      }
      try {
        await firebase
          .database()
          .ref(`soundcasts/${importedSoundcastId}/episodes`)
          .update(updateEpisodes);
        console.log('updateEpisodes: ', updateEpisodes);
      } catch (e) {
        logInFile(e);
      }
    }
    return true;
  } else {
    return false;
  }
};

const updateSoundcast = (soundcast, key) =>
  soundcastRepository
    .update(soundcast, key)
    .then(data => {
      console.log('updated soundcast with id: ', key);
      console.log('data', data);
      console.log('soundcast', soundcast, '\n');
    })
    .catch(error => {
      logInFile(`soundcastId: ${key}\nerr: ${error}\n\n`);
      console.log(error);
    });

const createSoundcast = (soundcast, key) =>
  soundcastRepository
    .create(soundcast)
    .then(data => {
      console.log('created soundcast with id: ', key);
      console.log('data', data.dataValues, '\n');
    })
    .catch(error => {
      logInFile(`soundcastId: ${key}\nerr: ${error}\n\n`);
      console.log(error);
    });

const removeSpecialChars = (key, soundcast) => {
  const { title, short_description } = soundcast;
  return firebase
    .database()
    .ref(`soundcasts/${key}`)
    .update({
      title: fixSpecialChars(title),
      short_description: fixSpecialChars(short_description),
    });
};

const createPublisher = async () => {
  const importedPublisher = {
    publisherId: importedPublisherId,
    name: 'Online Imported Podcast',
    imageUrl: 'https://d1jzcuf08rvzm.cloudfront.net/demo/1502463665971p.png',
  };

  try {
    const data = await database.Publisher.create(importedPublisher);
    await firebase
      .database()
      .ref(`publishers/${importedPublisherId}`)
      .set({
        email: 'random@mail.coi',
        imageUrl: 'https://d1jzcuf08rvzm.cloudfront.net/demo/1502463665971p.png',
        name: 'Online Imported Podcast',
        unAssigned: true,
      });
    console.log('Publisher: ', data.dataValues);
  } catch (e) {
    console.log('error with imported publisher. Error: ', e);
  }
};

const fixSpecialChars = text => {
  return new htmlEntities().decode(text);
};

const getSoundcastForPsql = (key, fbSoundcast) => {
  const {
    publisherID,
    title,
    imageURL,
    category,
    published,
    landingPage,
    last_update,
    forSale,
    rank,
  } = fbSoundcast;

  return {
    soundcastId: key,
    publisherId: publisherID ? publisherID : null,
    title: title ? fixSpecialChars(title) : null,
    imageUrl: imageURL ? imageURL : null,
    itunesId: null,
    forSale: forSale ? forSale : false,
    category: category ? category : null,
    published: published ? published : null,
    landingPage: landingPage ? landingPage : null,
    updateDate: last_update ? last_update : null,
    rank: rank ? rank : null,
  };
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncSoundcasts();
