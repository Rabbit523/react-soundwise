'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const moment = require('moment');
const database = require('../database');
var serviceAccount = require('../serviceAccountKey');
var { announcementRepository, commentRepository } = require('./repositories');

const LOG_ERR = 'logErrsMessages.txt';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${
    process.env.NODE_ENV === 'production' ? 'soundwise-a8e6f' : 'soundwise-testbase'
  }.firebaseio.com`,
});

const syncMessages = async () => {
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
  for (const id of ids) {
    const messages = (await firebase
      .database()
      .ref(`soundcasts/${id}/announcements`)
      .once('value')).val();
    if (messages) {
      const keys = Object.keys(messages);
      for (const key of keys) {
        if (messages[key]) {
          const fbMessage = messages[key];
          const message = getMessageForPsql(key, fbMessage);
          const isExist = await announcementRepository.get(key);
          if (!!isExist) {
            try {
              console.log(`update message with id: ${key}`);
              const data = await announcementRepository.update(message, key);
              console.log(data);
            } catch (e) {
              console.log(e);
              logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
            }
          } else {
            try {
              console.log(`create message with id: ${key}`);
              const data = await announcementRepository.create(message);
              console.log(data);
            } catch (e) {
              console.log(e);
              logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
            }
          }
        }
      }
    }
  }
  console.log('finish');
};

const syncCommentsCount = async () => {
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
  for (const id of ids) {
    const messages = (await firebase
      .database()
      .ref(`soundcasts/${id}/announcements`)
      .once('value')).val();
    if (messages) {
      const keys = Object.keys(messages);
      for (const key of keys) {
        const commentsCount = await commentRepository.count({
          announcementId: key,
        });
        const isExist = await announcementRepository.get(key);
        if (!!isExist) {
          try {
            console.log(`update message with id: ${key}`);
            const data = await announcementRepository.update({ commentsCount }, key);
            console.log(data);
          } catch (e) {
            console.log(e);
            logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
          }
        }
      }
    }
  }
  console.log('finish');
};

const getMessageForPsql = (key, fbMessage) => {
  const { content, creatorID, publisherID, soundcastID, isPublished, date_created } = fbMessage;
  const message = {
    announcementId: key,
    content: content,
    creatorId: creatorID,
    publisherId: publisherID,
    soundcastId: soundcastID,
    isPublished: isPublished ? isPublished : false,
    createdAt: moment.unix(date_created).format('YYYY-MM-DD HH:mm:ss Z'),
  };
  return message;
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

// syncCommentsCount()
syncMessages();
