'use strict';

var stripeKey = require('../../config').stripe_key;

const { publisherManager, soundcastManager, userManager } = require('../managers');
const recurringPayment = require('../scripts/payment').recurringPayment;
var stripe = require('stripe')(stripeKey);

const delStripeSubscriptions = paymentID => {
  return publisherManager.getById(publisher => {
    if (paymentID.slice(0, 3) == 'sub') {
      stripe.subscriptions.del(paymentID, { stripe_account: publisher }, (err, confirmation) =>
        err ? false : confirmation
      );
    } else {
      return true;
    }
  });
};

const addStripe = (userId, soundcastId, publisherID) => {
  return userManager.getById(userId).then(user =>
    soundcastManager.getById(soundcastId).then(soundcast =>
      recurringPayment({
        currency: 'usd',
        receipt_email: user.email[0],
        customer: user.stripe_id,
        billingCycle: soundcast.billingCycle,
        planID: soundcast.planID,
        publisherID,
        description: `${soundcast.title}: ${soundcast.planID}`,
        statement_descriptor: `${soundcast.title}: ${soundcast.planID}`,
      })
    )
  );
};

module.exports = { delStripeSubscriptions, addStripe };
