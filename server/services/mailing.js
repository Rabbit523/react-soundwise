'use strict';
const { mailingManager, soundcastManager } = require('../managers');
const { emailTemplate } = require('../scripts/helpers/emailTemplate');
const Raven = require('raven');

const addToMailingList = async (soundcastId, recipients, listName, mailingListId) => {
  const persistedRecipients = await mailingManager.addRecipients(recipients);

  if (mailingListId) {
    await mailingManager.addRecipientsToMailingList(mailingListId, persistedRecipients);
  } else {
    try {
      const listId = await mailingManager.createMailingList(soundcastId, listName);

      await mailingManager.addRecipientsToMailingList(listId, persistedRecipients);

      await soundcastManager.setMailingListName(soundcastId, listName, mailingListId);
    } catch (err) {
      let message;

      try {
        message = err.response.body.errors[0].message;
      } finally {
        if (message === 'This list name is already in use. Please choose a new, unique name.') {
          const [, body] = await mailingManager.getMailingLists();

          const list = body.lists.find(i => i.name === `${soundcastId}-${listName}`);

          if (list) {
            await mailingManager.addRecipientsToMailingList(list.id, persistedRecipients);

            await soundcastManager.setMailingListName(soundcastId, listName, mailingListId);
          }
        }
      }
    }
  }
};

const deleteFromMailingList = (emails, mailingListId) =>
  Promise.all(
    emails.map(email =>
      mailingManager
        .getRecipient(email)
        .then(({ id }) => mailingManager.deleteRecipient(id, mailingListId))
    )
  );

const sendTransactionalEmails = (
  invitees,
  subject,
  content,
  publisherName = 'Soundwise',
  publisherEmail = 'support@mysoundwise.com',
  publisherImage,
  plainEmail,
  bcc
) =>
  Promise.all(
    invitees.map(invitee => {
      return mailingManager
        .sendEmail({
          to: invitee,
          from: {
            email: publisherEmail,
            name: publisherName,
          },
          subject,
          html: plainEmail ? content : emailTemplate(publisherName, publisherImage, content),
          bcc,
        })
        .catch(err => {
          Raven.captureException(err.toString());
          throw err;
        });
    })
  );

module.exports = {
  addToMailingList,
  deleteFromMailingList,
  sendTransactionalEmails,
};
