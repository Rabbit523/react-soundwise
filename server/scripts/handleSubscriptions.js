'use strict';
const moment = require('moment');
const { publisherManager, soundcastManager, userManager } = require('../managers');
const { mailingService, subscriptionService } = require('../services');

const unsubscribe = (req, res) => {
  const { paymentId, userId, soundcastId, publisherId } = req.body;

  userManager
    .getById(userId)
    .then(user =>
      soundcastManager
        .getById(soundcastId)
        .then(soundcast =>
          mailingService.deleteFromMailingList(user.email, soundcast.subscriberEmailList)
        )
    );

  soundcastManager
    .removeSubscribedUser(soundcastId, userId)
    .then(() =>
      userManager
        .unsubscribe(userId, soundcastId)
        .then(() =>
          paymentId
            ? subscriptionService
                .delStripeSubscriptions(paymentId)
                .then(response =>
                  response
                    ? res.status(200).send(response)
                    : res.status(500).send({ error: response })
                )
            : publisherManager
                .removeFreeSubscriberCount(publisherId, userId, soundcastId)
                .then(() =>
                  publisherManager
                    .decrementFreeSubscriberCount(publisherId)
                    .then(() => res.send({ response: 'OK' }))
                )
        )
    )
    .catch(error => res.status(500).send({ message: 'Failed free unsubscription', error }));
};

const subscribe = (req, res) => {
  const { soundcastId, userId } = req.body;

  addSoundcastToUser(userId, soundcastId)
    .then(() => res.send({ response: 'OK' }))
    .catch(error => res.status(500).send(error));
};

const subscribeUserToSoundcast = (id, userId, publisherId) =>
  soundcastManager
    .addSubscribedUser(id, userId)
    .then(() => userManager.subscribe(userId, id))
    .then(() => publisherManager.incrementFreeSubscriberCount(publisherId));

const addSoundcastToUser = (userId, soundcastId) =>
  soundcastManager.getById(soundcastId).then(soundcast => {
    if (soundcast) {
      if (soundcast.bundle) {
        return Promise.all(
          soundcast.soundcastsIncluded.map(id =>
            subscribeUserToSoundcast(id, userId, soundcast.publisherId)
          )
        );
      }

      return subscribeUserToSoundcast(soundcastId, userId, soundcast.publisherId);
    }
  });

module.exports = { subscribe, unsubscribe };
