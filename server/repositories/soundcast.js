'use strict';

const database = require('../../database');

const get = id =>
  database.Soundcast.findOne({
    where: { soundcastId: id },
  });

const create = soundcast => database.Soundcast.create(soundcast);

const update = (soundcast, soundcastId) =>
  database.Soundcast.update(soundcast, { where: { soundcastId } });

const findById = id => database.Soundcast.findById(id);

module.exports = {
  get,
  create,
  update,
  findById,
};
