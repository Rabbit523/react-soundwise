'use strict';
const firebase = require('firebase-admin');

const getById = publisherID =>
  firebase
    .database()
    .ref(`publishers/${publisherID}`)
    .once('value')
    .then(snapshot => (snapshot.val() ? snapshot.val() : null));

const incrementFreeSubscriberCount = publisherID =>
  firebase
    .database()
    .ref(`publishers/${publisherID}/freeSubscriberCount`)
    .transaction(count => count + 1);

const decrementFreeSubscriberCount = publisherID =>
  firebase
    .database()
    .ref(`publishers/${publisherID}/freeSubscriberCount`)
    .transaction(count => count + 1);

const removeFreeSubscriberCount = (publisherID, userId, soundcastId) =>
  firebase
    .database()
    .ref(`publishers/${publisherID}/freeSubscribers/${userId}/${soundcastId}`)
    .remove();

module.exports = {
  getById,
  incrementFreeSubscriberCount,
  decrementFreeSubscriberCount,
  removeFreeSubscriberCount,
};
