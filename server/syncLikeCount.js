'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const moment = require('moment');
const database = require('../database');
var serviceAccount = require('../serviceAccountKey');
var { announcementRepository, likeRepository } = require('./repositories');

const LOG_ERR = 'logErrsMessages.txt';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${
    process.env.NODE_ENV === 'production' ? 'soundwise-a8e6f' : 'soundwise-testbase'
  }.firebaseio.com`,
});

const ids = [
  '1503691618714s',
  '1509475284817s',
  '1507828113963s',
  '1508785327382s',
  '1510935330009s',
  '1513445399143s',
  '1508293913676s',
  '1512247726161s',
  '1526158128140s',
  '1505855025645s',
  '1531419211997s',
  '1531441638240s',
  '1531459034687s',
  '1531496828981s',
  '1531502612113s',
  '1531504770898s',
  '1531844035660s',
];

const syncLikesCountMessages = async () => {
  for (const id of ids) {
    const messages = (await firebase
      .database()
      .ref(`soundcasts/${id}/announcements`)
      .once('value')).val();
    if (messages) {
      const keys = Object.keys(messages);
      for (const key of keys) {
        const likesCount = await likeRepository.count({ announcementId: key });
        try {
          const data = await announcementRepository.update({ likesCount }, key);
          console.log(data, `\nid:${key} likesCount: ${likesCount}`);
        } catch (e) {
          logInFile(e);
        }
      }
    }
  }
  console.log('finish');
};

const syncLikesCountEpisodes = async () => {
  for (const id of ids) {
    const episodes = (await firebase
      .database()
      .ref(`soundcasts/${id}/episodes`)
      .once('value')).val();
    if (episodes) {
      const keys = Object.keys(episodes);
      for (const key of keys) {
        const likesCount = await likeRepository.count({ episodeId: key });
        try {
          const data = await firebase
            .database()
            .ref(`episodes/${key}`)
            .update({ likesCount });
          console.log(`\nid:${key} likesCount: ${likesCount}`);
        } catch (e) {
          logInFile(e);
        }
      }
    }
  }
  console.log('finish');
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncLikesCountMessages();
syncLikesCountEpisodes();
