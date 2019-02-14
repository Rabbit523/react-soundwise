'use strict';

const announcementRepository = require('./announcement');
const soundcastRepository = require('./soundcast');
const commentRepository = require('./comment');
const likeRepository = require('./like');
const userRepository = require('./user');
const eventRepository = require('./event');

module.exports = {
  announcementRepository,
  soundcastRepository,
  commentRepository,
  likeRepository,
  userRepository,
  eventRepository,
};
