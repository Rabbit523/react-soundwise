'use strict';
const sgMail = require('@sendgrid/mail');
const { sendGridApiKey } = require('../../config');
const client = require('@sendgrid/client');

sgMail.setApiKey(sendGridApiKey);
client.setApiKey(sendGridApiKey);

const createMailingList = (soundcastId, listName) =>
  client
    .request({
      method: 'POST',
      url: '/v3/contactdb/lists',
      body: { name: `${soundcastId}-${listName}` },
    })
    .then(([, { id }]) => id);

const addRecipients = recipients =>
  client
    .request({
      method: 'POST',
      url: '/v3/contactdb/recipients',
      body: recipients.map(recipient =>
        typeof recipient === 'string'
          ? {
              email: recipient,
            }
          : {
              first_name: recipient.firstName,
              last_name: recipient.lastName,
              email: recipient.email,
            }
      ),
    })
    .then(([, { persisted_recipients: persistedRecipients }]) => persistedRecipients);

const addRecipientsToMailingList = (mailingListId, recipients) =>
  client.request({
    method: 'POST',
    url: `/v3/contactdb/lists/${mailingListId}/recipients`,
    body: recipients,
  });

const getRecipient = email =>
  client
    .request({
      url: '/v3/contactdb/recipients/search',
      method: 'GET',
      qs: {
        email,
      },
    })
    .then(([, { recipients }]) => recipients[0]);

const deleteRecipient = (recipientId, mailingListId) =>
  client.request({
    method: 'DELETE',
    url: `/v3/contactdb/lists/${mailingListId}/recipients/${recipientId}`,
  });

const getMailingLists = () => client.request({ method: 'GET', url: '/v3/contactdb/lists' });

const sendEmail = message => sgMail.send(message);

module.exports = {
  addRecipients,
  addRecipientsToMailingList,
  createMailingList,
  deleteRecipient,
  getMailingLists,
  getRecipient,
  sendEmail,
};
