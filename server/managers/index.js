'use strict';

const commonManager = require('./common');
const commentManager = require('./comment');
const likeManager = require('./like');
const invitationManager = require('./invitation');
const mailingManager = require('./mailing');
const publisherManager = require('./publisher');
const soundcastManager = require('./soundcast');
const userManager = require('./user');
const messageManager = require('./message');

module.exports = {
  commonManager,
  commentManager,
  likeManager,
  invitationManager,
  mailingManager,
  publisherManager,
  soundcastManager,
  userManager,
  messageManager,
};
