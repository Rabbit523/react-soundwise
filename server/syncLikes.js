'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const Op = require('sequelize').Op;
const _ = require('lodash');
const moment = require('moment');
const database = require('../database');
const { soundcastManager, messageManager, likeManager } = require('./managers');
const { likeRepository } = require('./repositories');
var serviceAccount = require('../serviceAccountKey');

const LOG_ERR = 'logErrsLikes.txt';

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${
    process.env.NODE_ENV === 'production' ? 'soundwise-a8e6f' : 'soundwise-testbase'
  }.firebaseio.com`,
});

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

const soundcastsIds = [
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

const syncEpisodesLikes = async () => {
  console.log('start sync episodes likes');
  for (let soundcastId of soundcastsIds) {
    console.log(`process ${soundcastId} soundcast`);
    const soundcast = await soundcastManager.getById(soundcastId);
    if (soundcast && soundcast.episodes) {
      const episodesIds = _.keys(soundcast.episodes);
      console.log(`process ${episodesIds} episodes`);
      for (let episodeId of episodesIds) {
        const likes = await likeManager.getEpisodeLikes(episodeId);
        if (likes) {
          const usersIds = _.keys(likes);
          for (let userId of usersIds) {
            const likeId = `${userId}-${episodeId}`;
            const newTimestamp = getTimestamp(likes[userId]);
            const createdAt = moment.unix(newTimestamp).format('YYYY-MM-DD HH:mm:ss Z');
            const like = {
              likeId,
              episodeId,
              userId,
              soundcastId,
              timeStamp: newTimestamp,
              createdAt,
              updatedAt: createdAt,
            };
            await createOrUpdate(likeId, like);
          }
          const likeObject = await likeRepository.getPrevious({
            episodeId,
            likeId: { [Op.regexp]: '^(?!web-).*' },
          });
          const lastLiked = likeObject
            ? await likeManager.getFullNameByUid(likeObject.userId)
            : 'Guest';
          await likeManager.updateLikeInEpisode(episodeId, usersIds.length, lastLiked);
        }
      }
    }
  }
  console.log('finish sync episodes likes');
};

const syncMessagesLikes = async () => {
  console.log('start sync messages likes');
  for (let soundcastId of soundcastsIds) {
    console.log(`process ${soundcastId} soundcast`);
    const messagesBySoundcast = await messageManager.getMessagesBySoundcastId(soundcastId);
    if (messagesBySoundcast) {
      const messagesIds = _.keys(messagesBySoundcast);
      console.log(`process ${messagesIds} messages`);
      for (let messageId of messagesIds) {
        const likes = await likeManager.getMessageLikes(soundcastId, messageId);
        if (likes) {
          const usersIds = _.keys(likes);
          for (let userId of usersIds) {
            const likeId = `${userId}-${messageId}`;
            const newTimestamp = getTimestamp(likes[userId]);
            const createdAt = moment.unix(newTimestamp).format('YYYY-MM-DD HH:mm:ss Z');
            const like = {
              likeId,
              announcementId: messageId,
              userId,
              soundcastId,
              timeStamp: newTimestamp,
              createdAt,
              updatedAt: createdAt,
            };
            await createOrUpdate(likeId, like);
          }
          try {
            const likeObject = await likeRepository.getPrevious({
              announcementId: messageId,
              likeId: { [Op.regexp]: '^(?!web-).*' },
            });
            const lastLiked = likeObject
              ? await likeManager.getFullNameByUid(likeObject.userId)
              : 'Guest';

            await database.Announcement.update(
              {
                likesCount: usersIds.length,
                lastLiked,
              },
              { announcementId: messageId }
            );
          } catch (e) {
            logInFile(`MessageId: ${messageId}\nERROR: ${e}\n\n`);
          }
        }
      }
    }
  }
  console.log('finish sync messages likes');
};

const createOrUpdate = async (likeId, like) => {
  const isExist = await likeRepository.get(likeId);
  if (!!isExist) {
    database.Like.update(like, { where: { likeId } })
      .then(data => console.log(data))
      .catch(e => logInFile(`ID: ${likeId}\nERROR: ${e}\n\n`));
  } else {
    database.Like.create(like)
      .then(data => console.log(data.dataValues))
      .catch(e => logInFile(`ID: ${likeId}\nERROR: ${e}\n\n`));
  }
};

syncEpisodesLikes();
syncMessagesLikes();
