'use strict';
const moment = require('moment');
const firebase = require('firebase-admin');

const getById = id =>
  firebase
    .database()
    .ref(`users/${id}`)
    .once('value')
    .then(snapshot => (snapshot.exists() ? snapshot.val() : null));

const getByEmail = email => firebase.auth().getUserByEmail(email);

const create = (email, password) =>
  firebase()
    .auth()
    .createUser({
      email,
      password,
    });

const exists = id =>
  firebase
    .database()
    .ref(`users/${id}`)
    .once('value')
    .then(snapshot => snapshot.exists());

const update = (id, data) =>
  firebase
    .database()
    .ref(`users/${id}`)
    .update(data);

const updateLastEvent = id => {
  firebase
    .database()
    .ref(`users/${id}/lastEvent`)
    .set(moment().format('X'));
};

const updateSubscribe = (id, soundcastId, data) =>
  firebase
    .database()
    .ref(`users/${id}/soundcasts/${soundcastId}`)
    .update(data);

const subscribe = (userId, soundcastId) => {
  return updateSubscribe(userId, soundcastId, {
    subscribed: true,
    billingCycle: 'free',
    date_subscribed: moment().format('X'),
    current_period_end: moment()
      .add(100, 'years')
      .format('X'),
  });
};

const unsubscribe = (userId, soundcastId) => {
  return updateSubscribe(userId, soundcastId, {
    subscribed: false,
    current_period_end: moment().format('X'),
  });
};

const getSubscriptions = userId => {
  return firebase
    .database()
    .ref(`users/${userId}/soundcasts`)
    .once('value');
};

const getId = email =>
  getByEmail(email)
    .then(userRecord => userRecord.toJSON().uid)
    .catch(() => null);

module.exports = {
  getById,
  create,
  exists,
  getId,
  update,
  subscribe,
  unsubscribe,
  updateLastEvent,
  getSubscriptions,
};
