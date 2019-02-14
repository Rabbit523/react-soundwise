'use strict';
const sendGridApiKey = require('../../config').sendGridApiKey;
const client = require('@sendgrid/client');
client.setApiKey(sendGridApiKey);

const emailFromDemoRequest = async (req, res) => {
  const { email, first_name, source } = req.body;
  client
    .request({
      method: 'POST',
      url: '/v3/contactdb/recipients',
      body: [{ email, first_name, source }],
    })
    .then(([response, body]) => {
      client
        .request({
          method: 'POST',
          url: `/v3/contactdb/lists/2910467/recipients`,
          body: body.persisted_recipients, // array of recipient IDs
        })
        .then(([response, body]) => {
          res.sendStatus(200);
        });
    })
    .catch(err => {
      console.log('Error: Add email from demo to sendgrid ', err, err.message);
      res.status(400).send(err.message);
    });
};

module.exports = { emailFromDemoRequest };
