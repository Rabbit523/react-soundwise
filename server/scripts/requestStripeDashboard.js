'use strict';
var stripe_key = require('../../config').stripe_key;
var stripe = require('stripe')(stripe_key);

module.exports = (req, res) => {
  var stripe_user_id = req.body.stripe_user_id;
  stripe.accounts.createLoginLink(stripe_user_id, (err, link) => {
    if (err) {
      console.log(err);
      return res.status(err.raw.statusCode).send(err.raw.message);
    }
    console.log('link: ', link);
    res.send({ url: link.url });
  });
};
