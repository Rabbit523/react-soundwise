'use strict';

const Op = require('sequelize').Op;
const moment = require('moment');

const { userManager, soundcastManager } = require('../managers');
const { eventRepository, userRepository, soundcastRepository } = require('../repositories');
const { EventTypes } = require('../scripts/utils')();
const { User, Episode, Announcement, Soundcast, Comment } = require('../../database');

const subscribersEvents = [
  EventTypes.NEW_EPISODE_PUBLISHED,
  EventTypes.NEW_MESSAGE_POSTED,
  EventTypes.MESSAGE_COMMENTED,
  EventTypes.EPISODE_COMMENTED,
  EventTypes.EPISODE_LIKED,
  EventTypes.MESSAGE_LIKED,
];

const commentAuthorEvents = [
  EventTypes.MSG_COMMENT_REPLIED,
  EventTypes.EP_COMMENT_REPLIED,
  EventTypes.MSG_COMMENT_LIKED,
  EventTypes.EP_COMMENT_LIKED,
];

const eventCreators = {};

const handleEvent = async (type, data) => {
  let event = await createEvent(type, data);
  try {
    event = await eventRepository.create(event);
    console.log(`Event ${type} created`);
  } catch (err) {
    console.log('Failed to save event to the database', err);
    return;
  }

  const eventReceivers = await fetchEventReceivers(event);
  console.log(`${eventReceivers.length} users will receive notification about this event`);
  await notify(eventReceivers);
};

const fetchEventReceivers = async event => {
  const eventReceivers = [];

  if (subscribersEvents.includes(event.type)) {
    const subscribersSnapshot = await soundcastManager.getSubscribers(event.soundcastId);

    if (!subscribersSnapshot.val()) {
      return [];
    }
    const subscribersIds = subscribersSnapshot.val();

    for (const key in subscribersIds) {
      let user = await userManager.getById(key);
      if (user) {
        user = Object.assign({}, { id: key }, user);
        eventReceivers.push(user);
      }
    }
  } else if (commentAuthorEvents.includes(event.type)) {
    let user = await userManager.getById(event.commentUserId);
    if (user) {
      user = Object.assign({}, { id: event.commentUserId }, user);
      eventReceivers.push(user);
    }
  }

  return eventReceivers;
};

const notify = async users => {
  for (const user of users) {
    await userManager.updateLastEvent(user.id);
  }
};

const createEvent = async (type, data) => {
  // Validate type
  if (!Object.values(EventTypes).includes(type)) {
    throw TypeError(`Event type ${type} is not supported by EventFactory.`);
  }

  try {
    const event = await eventCreators[type](data);
    return event;
  } catch (e) {
    console.log(`Failed to compose Event ${type}`, e);
  }
};

eventCreators[EventTypes.NEW_EPISODE_PUBLISHED] = async episode => {
  const event = {
    type: EventTypes.NEW_EPISODE_PUBLISHED,
    episodeId: episode.episodeId,
    soundcastId: episode.soundcastId,
    publisherId: episode.publisherId,
    avatarUrl: episode.imageUrl,
    story: `${episode.soundcastTitle} published ${episode.title}`,
  };
  return event;
};

eventCreators[EventTypes.NEW_MESSAGE_POSTED] = async announcement => {
  const { soundcastId, announcementId, creatorId, publisherId } = announcement;
  const hostUser = await userRepository.findById(creatorId);
  const soundcast = await soundcastRepository.findById(soundcastId);
  const event = {
    type: EventTypes.NEW_MESSAGE_POSTED,
    announcementId,
    soundcastId,
    publisherId,
    userId: announcement.creatorId,
    avatarUrl: soundcast.imageUrl,
    firstName: hostUser.firstName,
    lastName: hostUser.lastName,
    story: `${hostUser.firstName} ${hostUser.lastName} sent you a message`,
  };

  return event;
};

eventCreators[EventTypes.EPISODE_LIKED] = async episode_like => {
  const { episodeId, soundcastId, userId, likeId } = episode_like;
  const user = await userRepository.findById(userId);
  const episode = await Episode.findOne({ where: { episodeId } });

  const event = {
    type: EventTypes.EPISODE_LIKED,
    likeId,
    episodeId,
    soundcastId,
    userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} liked ${episode.title}`,
  };

  return event;
};

eventCreators[EventTypes.MESSAGE_LIKED] = async announcement_like => {
  const { announcementId, soundcastId, userId, likeId } = announcement_like;
  const user = await User.findOne({ where: { userId } });
  const announcement = await Announcement.findOne({
    where: { announcementId },
  });
  const hostUser = await User.findOne({
    where: { userId: announcement.creatorId },
  });

  const event = {
    type: EventTypes.MESSAGE_LIKED,
    likeId,
    announcementId,
    soundcastId,
    userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${hostUser.firstName} ${hostUser.lastName} liked ${hostUser.firstName} ${
      hostUser.lastName
    }'s message`,
  };

  return event;
};

eventCreators[EventTypes.EP_COMMENT_LIKED] = async ep_comment_like => {
  const { episodeId, soundcastId, userId, likeId, commentId } = ep_comment_like;

  const user = await User.findOne({ where: { userId } });
  const episode = await Episode.findOne({ where: { episodeId } });
  const comment = await Comment.findOne({ where: { commentId } });

  const commentUserId = comment.userId;

  const event = {
    type: EventTypes.EP_COMMENT_LIKED,
    likeId,
    commentId,
    episodeId,
    soundcastId,
    userId,
    commentUserId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} liked your comment on ${episode.title}`,
  };

  return event;
};

eventCreators[EventTypes.MSG_COMMENT_LIKED] = async msg_comment_like => {
  const { announcementId, soundcastId, userId, likeId, commentId } = msg_comment_like;

  const user = await User.findOne({ where: { userId } });
  const soundcast = await Soundcast.findOne({ where: { soundcastId } });
  const comment = await Comment.findOne({ where: { commentId } });

  const commentUserId = comment.userId;

  const event = {
    type: EventTypes.MSG_COMMENT_LIKED,
    likeId,
    commentId,
    announcementId,
    soundcastId,
    userId,
    commentUserId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} liked your comment on a message from ${
      soundcast.title
    }`,
  };

  return event;
};

eventCreators[EventTypes.EPISODE_COMMENTED] = async episode_comment => {
  const { soundcastId, episodeId, userId, commentId } = episode_comment;

  const user = await User.findOne({ where: { userId } });
  const episode = await Episode.findOne({ where: { episodeId } });

  const event = {
    type: EventTypes.EPISODE_COMMENTED,
    commentId,
    episodeId,
    soundcastId,
    userId,
    commentUserId: userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} commented on ${episode.title}`,
  };

  return event;
};

eventCreators[EventTypes.EP_COMMENT_REPLIED] = async ep_comment_reply => {
  const { episodeId, soundcastId, userId, commentId, parentId } = ep_comment_reply;

  const user = await User.findOne({ where: { userId } });
  const episode = await Episode.findOne({ where: { episodeId } });
  const parentComment = await Comment.findOne({
    where: { commentId: parentId },
  });

  const event = {
    type: EventTypes.EP_COMMENT_REPLIED,
    commentId,
    episodeId,
    soundcastId,
    userId,
    commentUserId: userId,
    parentUserId: parentComment.userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} replied to your comment on ${episode.title}`,
  };

  return event;
};

eventCreators[EventTypes.MESSAGE_COMMENTED] = async message_comment => {
  const { soundcastId, announcementId, userId, commentId } = message_comment;

  const user = await User.findOne({ where: { userId } });
  const soundcast = await Soundcast.findOne({ where: { soundcastId } });

  const event = {
    type: EventTypes.MESSAGE_COMMENTED,
    commentId,
    announcementId,
    soundcastId,
    userId,
    commentUserId: userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} commented on a message from ${soundcast.title}`,
  };

  return event;
};

eventCreators[EventTypes.MSG_COMMENT_REPLIED] = async msg_comment_reply => {
  const { announcementId, soundcastId, userId, commentId, parentId } = msg_comment_reply;

  const user = await User.findOne({ where: { userId } });
  const soundcast = await Soundcast.findOne({ where: { soundcastId } });
  const parentComment = await Comment.findOne({
    where: { commentId: parentId },
  });

  const event = {
    type: EventTypes.MSG_COMMENT_REPLIED,
    commentId,
    announcementId,
    soundcastId,
    userId,
    commentUserId: userId,
    parentUserId: parentComment.userId,
    parentId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} replied to your comment on a message from ${
      soundcast.title
    }`,
  };

  return event;
};

const fetchEventsForUser = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    res.status(400).send({ error_msg: 'BadRequest. userId is missing in query params.' });
  }

  const subscriptionsSnapshot = await userManager.getSubscriptions(req.query.userId);
  const whereCondition = {
    [Op.or]: [
      {
        [Op.and]: {
          commentUserId: userId,
          type: {
            [Op.in]: [EventTypes.MSG_COMMENT_LIKED, EventTypes.EP_COMMENT_LIKED],
          },
        },
      },
      {
        [Op.and]: {
          parentUserId: userId,
          type: {
            [Op.in]: [EventTypes.MSG_COMMENT_REPLIED, EventTypes.EP_COMMENT_REPLIED],
          },
        },
      },
    ],
  };

  if (req.query.fromDate) {
    const fromDate = moment(req.query.fromDate).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    whereCondition['createdAt'] = {
      [Op.gt]: fromDate,
    };
  }

  if (subscriptionsSnapshot.val()) {
    const soundcasts = Object.keys(subscriptionsSnapshot.val()).filter(
      val => !['undefined', 'null'].includes(val)
    );
    whereCondition[Op.or].push({
      [Op.and]: {
        soundcastId: {
          [Op.in]: soundcasts,
        },
        type: {
          [Op.in]: subscribersEvents,
        },
      },
    });
  }
  const statement = {
    where: whereCondition,
    order: [['createdAt', 'DESC']],
  };
  if (req.query.pageSize && req.query.page) {
    statement['limit'] = req.query.pageSize;
    statement['offset'] = req.query.page * req.query.pageSize;
  }
  const events = await eventRepository.getRecent(statement);
  res.status(200).send(events);
};

const sendError = (err, res) => {
  console.log(err);
  res.status(500).send(err);
};

module.exports = { handleEvent, fetchEventsForUser };
