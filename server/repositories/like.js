'use strict';

const database = require('../../database');

const get = likeId =>
  database.Like.findOne({ where: { likeId } }).then(data => (data ? data.dataValues : null));

const getPrevious = where =>
  database.Like.findAll({
    where,
    limit: 1,
    order: [['timeStamp', 'DESC']],
  }).then(data => {
    if (data.length > 0) {
      return data[0].dataValues ? data[0].dataValues : null;
    } else {
      return null;
    }
  });

const create = like => database.Like.create(like).then(data => (data ? data.dataValues : null));

const update = (like, likeId) => database.Like.update(like, { where: { likeId } });

const destroy = likeId => database.Like.destroy({ where: { likeId } });

const count = where => database.Like.count({ where });

module.exports = {
  get,
  create,
  update,
  destroy,
  count,
  getPrevious,
};
