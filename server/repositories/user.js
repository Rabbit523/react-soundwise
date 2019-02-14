'use strict';
const database = require('../../database/index');

const create = ({ userId, firstName, lastName, picUrl }) =>
  database.User.findOrCreate({
    where: {
      userId,
    },
    defaults: {
      userId,
      firstName,
      lastName,
      picURL: picUrl,
    },
  });

const update = (user, userId) => database.User.update(user, { where: { userId } });

const findById = userId => database.User.findById(userId);

module.exports = { create, update, findById };
