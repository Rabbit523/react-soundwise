'use strict';
var stripe_key = require('../../config').stripe_key;
var stripe = require('stripe')(stripe_key);
var request = require('request-promise');
var firebase = require('firebase-admin');
const updateStripeAccount = require('./updateStripeAccounts.js').updateStripeAccount;

module.exports.createStripeAccount = (req, res) => {
  let formData = {
    client_secret: stripe_key,
    code: req.body.code,
    grant_type: 'authorization_code',
  };
  let stripe_user_id;
  request
    .post('https://connect.stripe.com/oauth/token', { form: formData })
    .then(response => {
      stripe_user_id = JSON.parse(response).stripe_user_id;
      firebase
        .database()
        .ref(`publishers/${req.body.publisherId}/stripe_user_id`)
        .set(stripe_user_id)
        .catch(err => console.log(err));
      return JSON.parse(response);
    })
    .then(response => {
      updateStripeAccount(stripe_user_id, req.body.publisherId, req.body.publisherPlan);
      res.send(response);
    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
};
