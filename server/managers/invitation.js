'use strict';
const _ = require('lodash');
const firebase = require('firebase-admin');

const getUserInvitations = email =>
  firebase
    .database()
    .ref(`invitations/${email}`)
    .orderByValue()
    .equalTo(true)
    .once('value')
    .then(snapshot =>
      snapshot.exists()
        ? _.chain(snapshot.val())
            .map((value, key) => key)
            .value()
        : []
    );

module.exports = {
  getUserInvitations,
};
