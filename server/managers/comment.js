'use strict';
const moment = require('moment');
const firebase = require('firebase-admin');
const userManager = require('./user');

const getById = id =>
  firebase
    .database()
    .ref(`comments/${id}`)
    .once('value')
    .then(snapshot => (snapshot.exists() ? snapshot.val() : null));

const addCommentToEpisode = (id, episodeID) =>
  firebase
    .database()
    .ref(`episodes/${episodeID}/comments/${id}`)
    .set(moment().format('X'));

const removeCommentToEpisode = (id, episodeId) =>
  firebase
    .database()
    .ref(`episodes/${episodeId}/comments/${id}`)
    .remove();

const getUserParentComment = id =>
  firebase
    .database()
    .ref(`comments/${id}/userID`)
    .once('value')
    .then(snap => userManager.getById(snap.val()));

const getEpisodeComments = episodeId =>
  firebase
    .database()
    .ref(`episodes/${episodeId}/comments`)
    .once('value')
    .then(snapshot => (snapshot.exists() ? snapshot.val() : null));

module.exports = {
  getById,
  addCommentToEpisode,
  removeCommentToEpisode,
  getUserParentComment,
  getEpisodeComments,
};
