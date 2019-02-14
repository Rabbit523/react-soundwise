'use strict';
const moment = require('moment');
const firebase = require('firebase-admin');

const getById = id =>
  firebase
    .database()
    .ref(`soundcasts/${id}`)
    .once('value')
    .then(snapshot => snapshot.val());

const update = (id, update) =>
  firebase
    .database()
    .ref(`soundcasts/${id}`)
    .update(update);

const setMailingListName = (id, mailingListName, mailingListId) =>
  firebase
    .database()
    .ref(`soundcasts/${id}/${mailingListName}`)
    .set(mailingListId);

const addSubscribedUser = (id, userId) =>
  firebase
    .database()
    .ref(`soundcasts/${id}/subscribed/${userId}`)
    .set(moment().format('X'));

const removeSubscribedUser = (id, userId) =>
  firebase
    .database()
    .ref(`soundcasts/${id}/subscribed/${userId}`)
    .remove();

const getSubscribers = id =>
  firebase
    .database()
    .ref(`soundcasts/${id}/subscribed`)
    .once('value');

module.exports = {
  getById,
  update,
  setMailingListName,
  addSubscribedUser,
  removeSubscribedUser,
  getSubscribers,
};
