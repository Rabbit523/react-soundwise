'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const moment = require('moment');
const _ = require('lodash');
const serviceAccount = require('../serviceAccountKey');
const { commentRepository } = require('./repositories');
const { commentManager, soundcastManager, messageManager } = require('./managers');

const LOG_ERR = 'logErrsComments.txt';

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

const getTimestamp = timestamp => {
  let newTimestamp = timestamp;
  if (_.isBoolean(timestamp)) {
    newTimestamp = moment().unix();
  } else if (_.isString(timestamp)) {
    newTimestamp = +timestamp;
    if (_.isNaN(timestamp)) {
      newTimestamp = moment().unix();
    }
  }
  return newTimestamp;
};

const syncEpisodesCommets = async () => {
  console.log('start');
  for (let id of ids) {
    console.log(`process ${id} soundcast`);
    const soundcast = await soundcastManager.getById(id);
    if (soundcast && soundcast.episodes) {
      const episodesIds = _.keys(soundcast.episodes);
      console.log(`process ${episodesIds} episodes`);
      for (let episodeId of episodesIds) {
        const comments = await commentManager.getEpisodeComments(episodeId);
        if (comments) {
          const commentsIds = _.keys(comments);
          for (let commentId of commentsIds) {
            const fbComment = await commentManager.getById(commentId);
            if (fbComment) {
              const comment = getCommentForPsql(commentId, fbComment);
              await createOrUpdate(comment, commentId);
            } else {
              logInFile(`episodeId: ${episodeId}\ndelete comment: ${commentId}\n`);
              firebase
                .database()
                .ref(`episodes/${episodeId}/comments/${commentId}`)
                .remove();
            }
          }
        }
      }
    }
  }
  console.log('finish');
};

const syncAnnouncementsCommets = async () => {
  console.log('start');
  for (let id of ids) {
    const soundcast = await soundcastManager.getById(id);
    if (soundcast && soundcast.announcements) {
      const announcementsIds = _.keys(soundcast.announcements);
      for (let announcementsId of announcementsIds) {
        const comments = soundcast.announcements[announcementsId].comments;
        if (comments) {
          const commentsIds = _.keys(comments);
          for (let commentId of commentsIds) {
            const fbComment = await commentManager.getById(commentId);
            if (fbComment) {
              const comment = getCommentForPsql(commentId, fbComment);
              await createOrUpdate(comment, commentId);
            } else {
              logInFile(`episodeId: ${announcementsId}\ndelete comment: ${commentId}\n`);
              firebase
                .database()
                .ref(`soundcasts/${id}/${announcementsId}/comments/${commentId}`)
                .remove();
            }
          }
        }
      }
    }
  }
  console.log('finish');
};

const createOrUpdate = async (comment, key) => {
  const isExist = await commentRepository.get(comment.commentId);
  console.log('isExist:', !!isExist);
  if (!!isExist) {
    console.log('update comment', comment);
    try {
      const data = await commentRepository.update(comment, key);
      console.log('data', data + '\n');
    } catch (e) {
      console.log('ERROR' + e + '\n\n');
      logInFile(`ID: ${key}\nERROR: ${e}\n`);
    }
  } else {
    if (comment) {
      console.log('create comment', comment);
      try {
        const data = await commentRepository.create(comment);
        console.log('data', data + '\n');
      } catch (e) {
        console.log('ERROR' + e + '\n\n');
        logInFile(`ID: ${key}\nERROR: ${e}\n`);
      }
    }
  }
};

const getCommentForPsql = (key, fbComment) => {
  const createdAt = moment.unix(getTimestamp(fbComment.timestamp)).format('YYYY-MM-DD HH:mm:ss Z');
  const parentId = key.split('-');
  parentId.shift();
  const comment = {
    commentId: key,
    userId: fbComment.userID || fbComment.userId || null,
    content: fbComment.content,
    parentId: parentId.length >= 2 ? parentId.join('-') : null,
    episodeId: fbComment.episodeID || null,
    soundcastId: fbComment.soundcastId || fbComment.soundcastID || null,
    announcementId: fbComment.announcementId || fbComment.announcementID || null,
    timeStamp: fbComment.timestamp || fbComment.timeStamp || null,
    createdAt,
    updatedAt: createdAt,
  };
  return comment;
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncEpisodesCommets();
syncAnnouncementsCommets();
