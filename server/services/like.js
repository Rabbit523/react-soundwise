'use strict';

const sendNotification = require('../scripts/messaging').sendNotification;
const { userManager, likeManager } = require('../managers');
const Op = require('sequelize').Op;
const { likeRepository, commentRepository, announcementRepository } = require('../repositories');
const { handleEvent } = require('./event');
const { EventTypes } = require('../scripts/utils')();

// ADD_LIKE
const addLike = (req, res) => {
  console.log('Like add');
  console.log(req.body);
  const like = req.body;
  const lastLiked = like.fullName;
  if (!like.fullName) {
    res.status(400).send({ error: 'fullName can not be null' });
    return;
  }
  likeRepository
    .create(like)
    .then(like => {
      const { episodeId, announcementId, commentId } = like;
      if (commentId) {
        const eventType = like.episodeId
          ? EventTypes.EP_COMMENT_LIKED
          : EventTypes.MSG_COMMENT_LIKED;
        handleEvent(eventType, like)
          .then(() => console.log(`${eventType} event recorded`))
          .catch(err => console.log(`Failed to record ${eventType} event`, err));
        // LIKE COMMENT
        likeRepository
          .count({ commentId })
          .then(likesCount =>
            commentRepository
              .update({ likesCount }, commentId)
              .then(() =>
                commentRepository
                  .get(commentId)
                  .then(comment => {
                    sendPush(comment);
                    res.send(like);
                  })
                  .catch(error => sendError(error, res))
              )
              .catch(error => sendError(error, res))
          )
          .catch(error => sendError(error, res));
      } else if (episodeId) {
        handleEvent(EventTypes.EPISODE_LIKED, like)
          .then(() => console.log(`${EventTypes.EPISODE_LIKED} event recorded`))
          .catch(err => console.log(`Failed to record ${EventTypes.EPISODE_LIKED} event`, err));
        // LIKE EPISODE
        likeRepository.count({ episodeId }).then(count =>
          likeManager
            .updateLikeInEpisode(episodeId, count, lastLiked)
            .then(() => res.send(like))
            .catch(error => sendError(error, res))
        );
      } else if (announcementId) {
        // LIKE MESSAGE
        likeRepository
          .count({ announcementId })
          .then(likesCount => {
            handleEvent(EventTypes.MESSAGE_LIKED, like)
              .then(() => console.log(`${EventTypes.MESSAGE_LIKED} Message liked event recorded`))
              .catch(err => console.log(`Failed to record ${EventTypes.MESSAGE_LIKED} event`, err));
            announcementRepository
              .update({ lastLiked, likesCount }, announcementId)
              .then(() => res.send(like))
              .catch(error => sendError(error, res));
          })
          .catch(error => sendError(error, res));
      }
    })
    .catch(error => sendError(error, res));
};

const deleteLike = (req, res) => {
  const likeId = req.params.id;
  likeRepository
    .get(likeId)
    .then(like => {
      if (!like) {
        sendError(`Not found this likeId ${likeId}`, res);
        return;
      }
      likeRepository
        .destroy(likeId)
        .then(() => {
          const { episodeId, announcementId, commentId } = like;
          if (announcementId) {
            // UNLIKE MESSAGE
            getNamePreviousLiker({
              announcementId,
              likeId: { [Op.regexp]: '^(?!web-).*' },
            })
              .then(lastLiked =>
                likeRepository
                  .count({ announcementId })
                  .then(likesCount =>
                    announcementRepository
                      .update({ likesCount, lastLiked }, announcementId)
                      .then(() => res.send({ lastLiked }))
                      .catch(error => sendError(error, res))
                  )
                  .catch(error => sendError(error, res))
              )
              .catch(error => sendError(error, res));
          } else if (commentId) {
            // UNLIKE COMMENT
            getNamePreviousLiker({
              commentId,
              likeId: { [Op.regexp]: '^(?!web-).*' },
            })
              .then(lastLiked =>
                likeRepository
                  .count({ commentId })
                  .then(likesCount =>
                    commentRepository
                      .update({ likesCount }, commentId)
                      .then(() => res.send({ lastLiked }))
                      .catch(error => sendError(error, res))
                  )
                  .catch(error => sendError(error, res))
              )
              .catch(error => sendError(error, res));
          } else if (episodeId) {
            // UNLIKE EPISODE
            getNamePreviousLiker({
              episodeId,
              likeId: { [Op.regexp]: '^(?!web-).*' },
            })
              .then(lastLiked =>
                likeRepository
                  .count({ episodeId })
                  .then(likesCount =>
                    likeManager
                      .updateLikeInEpisode(episodeId, likesCount, lastLiked)
                      .then(() => res.send({ lastLiked }))
                      .catch(error => sendError(error, res))
                  )
                  .catch(error => sendError(error, res))
              )
              .catch(error => sendError(error, res));
          }
        })
        .catch(error => sendError(error, res));
    })
    .catch(error => sendError(error, res));
};

const getNamePreviousLiker = where =>
  likeRepository
    .getPrevious(where)
    .then(like => (like ? likeManager.getFullNameByUid(like.userId) : 'Guest'));

const sendPush = comment => {
  userManager.getById(comment.userId).then(user => {
    if (user && user.token) {
      sendNotification(user.token, {
        data: {
          type: 'LIKE_COMMENT',
          commentId: comment.commentId,
          soundcastId: comment.soundcastId,
        },
        notification: {
          title: 'New like',
          body: 'To your comment liked',
        },
      });
    }
  });
};

const sendError = (err, res) => {
  console.log(err);
  res.status(500).send(err);
};

module.exports = { addLike, deleteLike };
