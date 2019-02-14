'use strict';

const database = require('../../database');

const get = announcementId =>
  database.Announcement.findOne({ where: { announcementId } }).then(data =>
    data ? data.dataValues : null
  );

const create = announcement =>
  database.Announcement.create(announcement).then(data => (data ? data.dataValues : null));

const update = (announcement, id) =>
  database.Announcement.update(announcement, { where: { announcementId: id } });

const count = where => database.Announcement.count({ where });

module.exports = {
  get,
  create,
  update,
  count,
};
