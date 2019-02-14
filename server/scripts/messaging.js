'use strict';
var admin = require('firebase-admin');

const sendNotification = (token, payload) => {
  var options = { priority: 'high' };
  return admin.messaging().sendToDevice(token, payload, options);
};

const pushNotification = (req, res) => {
  const { registrationTokens, payload } = req.body;
  sendNotification(registrationTokens, payload)
    .then(response => res.send(response))
    .catch(error => res.status(500).send(error));
};

module.exports = {
  pushNotification,
  sendNotification,
};
