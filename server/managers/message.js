'use strict';
const firebase = require('firebase-admin');

const getMessagesBySoundcastId = soundcastId =>
  firebase
    .database()
    .ref(`soundcasts/${soundcastId}/announcements`)
    .once('value')
    .then(snapshot => snapshot.val());

module.exports = {
  getMessagesBySoundcastId,
};
