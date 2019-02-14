'use strict';
var stripe_key = require('../../config').stripe_key;
var stripe = require('stripe')(stripe_key);

module.exports.updateStripeAccount = (stripe_user_id, publisherId, publisherPlan) => {
  if (!stripe_user_id) {
    console.log('stripe_user_id is null');
    return;
  }
  let payout_schedule;
  if (publisherPlan === 'pro' || publisherPlan === 'platinum') {
    payout_schedule = {
      interval: 'daily',
    };
  } else {
    payout_schedule = {
      // monthly payouts, with two week delay
      delay_days: 3,
      interval: 'monthly',
      monthly_anchor: 1,
    };
  }

  stripe.accounts.update(stripe_user_id, {
    payout_schedule,
    metadata: {
      publisherId,
    },
    payout_statement_descriptor: 'Soundwise transfer',
    debit_negative_balances: true,
  });
};
