'use strict';

const database = require('../../database');

const get = commentId =>
  database.Comment.findOne({ where: { commentId } }).then(data => (data ? data.dataValues : null));

const create = comment =>
  database.Comment.create(comment).then(data => (data ? data.dataValues : null));

const update = (comment, id) => database.Comment.update(comment, { where: { commentId: id } });

const destroy = commentId => database.Comment.destroy({ where: { commentId } });

const count = where => database.Comment.count({ where });

module.exports = {
  get,
  create,
  update,
  destroy,
  count,
};
