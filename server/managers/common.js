'use strict';
const firebase = require('firebase-admin');

const update = itemsToUpdate =>
  firebase
    .database()
    .ref()
    .update(itemsToUpdate);

module.exports = {
  update,
};
