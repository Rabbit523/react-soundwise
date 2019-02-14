'use strict';

const invititaionService = require('./invitation');
const mailingService = require('./mailing');
const subscriptionService = require('./subscription');
const commentService = require('./comment');
const likeService = require('./like');
const soundcastService = require('./soundcast');
const userService = require('./user');
const eventService = require('./event');

module.exports = {
  invititaionService,
  subscriptionService,
  commentService,
  likeService,
  mailingService,
  soundcastService,
  userService,
  eventService,
};
