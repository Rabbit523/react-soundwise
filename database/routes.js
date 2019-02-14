'use strict';

const database = require('./index');
const {
  commentService,
  likeService,
  soundcastService,
  userService,
  eventService,
} = require('../server/services');

const { handleEvent } = require('../server/services/event');
const { EventTypes } = require('../server/scripts/utils')();

module.exports = app => {
  app.post('/api/user', (req, res) => {
    database.User.findOrCreate({
      where: {
        userId: req.body.userId,
      },
      defaults: req.body,
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.post('/api/coupon', (req, res) => {
    database.Coupon.create(req.body)
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/coupon', (req, res) => {
    const publisherId = JSON.parse(req.query.filter).publisherId;
    database.Coupon.findAll({
      where: { publisherId: publisherId },
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/announcements', (req, res) => {
    const query = JSON.parse(req.query.filter);
    database.Announcement.findAll({
      where: query.where,
      order: [['createdAt', 'DESC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/announcements/:id', (req, res) => {
    const id = req.params.id;
    database.Announcement.findById(id)
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.post('/api/episode', (req, res) => {
    database.Episode.findOrCreate({
      where: { episodeId: req.body.episodeId },
      defaults: req.body,
    })
      .then(data => {
        handleEvent(EventTypes.NEW_EPISODE_PUBLISHED, data[0])
          .then(res => console.log('Event created'))
          .catch(err => console.log('Failed to create event', err));
        res.send(data);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(err);
      });
  });

  app.post('/api/soundcast', (req, res) => {
    soundcastService
      .createOrUpdate(req.body)
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.post('/api/announcements', (req, res) => {
    database.Announcement.create(req.body)
      .then(data => {
        handleEvent(EventTypes.NEW_MESSAGE_POSTED, data)
          .then(res => console.log('Event created'))
          .catch(err => console.log('Failed to create event', err));
        res.send(data);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  app.post('/api/listening_session', (req, res) => {
    const data = Object.assign({}, req.body, { date: new Date(req.body.date) });
    database.ListeningSession.create(req.body)
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/stats_by_user', (req, res) => {
    database.ListeningSession.findAll({
      where: {
        userId: req.query.userId,
        date: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      },
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/stats_by_user_publisher', (req, res) => {
    database.ListeningSession.findAll({
      where: {
        userId: req.query.userId,
        publisherId: req.query.publisherId,
        date: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      },
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/stats_by_episode', (req, res) => {
    database.ListeningSession.findAll({
      where: {
        episodeId: req.query.episodeId,
        date: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      },
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/stats_by_soundcast', (req, res) => {
    database.ListeningSession.findAll({
      where: {
        soundcastId: req.query.soundcastId,
        date: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      },
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/stats_by_user_episode', (req, res) => {
    database.ListeningSession.findAll({
      where: {
        userId: req.query.userId,
        episodeId: req.query.episodeId,
        date: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      },
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/soundcasts/recommendations', soundcastService.getRecommendations);

  app.get(
    '/api/soundcasts/recommendations/:categoryId',
    soundcastService.getSoundcastsFromCategory
  );

  app.post('/api/comments', commentService.addComment);

  app.delete('/api/comments/:id', commentService.deleteComment);

  app.put('/api/comments/:id', commentService.editComment);

  app.patch('/api/comments/:id', commentService.editComment);

  app.post('/api/likes', likeService.addLike);

  app.delete('/api/likes/:id', likeService.deleteLike);

  app.patch('/api/listeners/:id', userService.editUserInfo);

  app.get('/api/events', eventService.fetchEventsForUser);
};
