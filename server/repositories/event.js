'use strict';

const database = require('../../database');

const get = eventId =>
  database.Event.findOne({ where: { eventId } }).then(data => (data ? data.dataValues : null));

const create = event => database.Event.create(event).then(data => (data ? data.dataValues : null));

const update = (event, eventId) => database.Event.update(event, { where: { eventId } });

const destroy = eventId => database.Event.destroy({ where: { eventId } });

const count = where => database.Event.count({ where });

const getRecent = statement => {
  return database.Event.all(statement);
};

module.exports = {
  get,
  create,
  update,
  destroy,
  count,
  getRecent,
};
