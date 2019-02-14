'use strict';

// handle payments, renewal and cancellation for pro and plus plans on Soundwise

var stripe_key = require('../../config').stripe_key;
var stripe = require('stripe')(stripe_key);
const firebase = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const sendGridApiKey = require('../../config').sendGridApiKey;
sgMail.setApiKey(sendGridApiKey);
const database = require('../../database/index');
const updateStripeAccount = require('./updateStripeAccounts.js').updateStripeAccount;

module.exports.createSubscription = async (req, res) => {
  const options = {
    items: [{ plan: req.body.plan }],
    metadata: {
      publisherID: req.body.publisherID,
    },
  };
  if (req.body.coupon) {
    options.coupon = req.body.coupon;
  }
  if (!req.body.subscriptionID) {
    // if subscription doesn't exist, create subscription
    if (req.body.metadata) {
      options.metadata.promoCode = req.body.metadata.promoCode;
    }
    if (req.body.trialPeriod) {
      options.trial_period_days = req.body.trialPeriod;
    }
    if (req.body.referredBy) {
      options.metadata.referredBy = req.body.referredBy; // stripe user id
    }
    if (!req.body.customer) {
      // create customer first
      stripe.customers
        .create({
          email: req.body.receipt_email,
          source: req.body.source,
        })
        .then(customer => {
          options.customer = customer.id;
          stripe.subscriptions
            .create(options)
            .then(subscription => {
              console.log('1, subscription = ', subscription);
              res.send(subscription);
            })
            .catch(err => {
              console.log('createSubscription error creating subscription', err);
              res.status(500).send(err);
            });
        })
        .catch(err => {
          console.log('createSubscription error creating customer', err);
          res.status(500).send(err);
        });
    } else {
      // if customer already exists
      options.customer = req.body.customer; // 'cus_B2k4GMj8KtSkGs',
      stripe.subscriptions
        .create(options)
        .then(subscription => {
          console.log('2, subscription = ', subscription);
          res.send(subscription);
        })
        .catch(err => {
          console.log('createSubscription error creating subscription with customer', err);
          res.status(500).send(err);
        });
    }
  } else {
    // if subscription exists
    const publisherId = req.body.publisherID;

    // update publisher's payout interval to daily when plan is 'pro' or 'platinum'
    const stripe_user_id = (await firebase
      .database()
      .ref(`publishers/${publisherId}/stripe_user_id`)
      .once('value')).val();
    updateStripeAccount(stripe_user_id, publisherId, req.body.publisherPlan);

    // update existing subscription
    const subscription = await stripe.subscriptions.retrieve(req.body.subscriptionID);
    console.log('publisherId = ', publisherId);
    console.log('3, subscription = ', subscription);
    options.items[0].id = subscription.items.data[0].id;
    stripe.subscriptions
      .update(req.body.subscriptionID, options)
      .then(subscription => {
        console.log('4, subscription = ', subscription);
        res.send(subscription);
      })
      .catch(err => {
        console.log('error updating subscription', err);
        res.status(500).send(err);
      });
  }
};

module.exports.renewSubscription = (req, res) => {
  if (req.body.type == 'invoice.payment_succeeded') {
    const data = req.body.data.object.lines.data[0];
    const current_period_end = data.period.end;
    const publisherId = data.metadata.publisherID;
    if (current_period_end) {
      firebase
        .database()
        .ref(`publishers/${publisherId}/current_period_end`)
        .set(current_period_end);
      res.send({});
    }

    const chargeAmount = data.amount; // in cents, example 3600
    if (!chargeAmount) {
      return; // skip if no charge amount
    }

    let subscriptionPlanName;
    if (data.plan.product === 'prod_CIfFqhoS2m4xaN') {
      subscriptionPlanName = 'Soundwise Plus Annual Subscription';
    } else if (data.plan.product === 'prod_CIfGFWSDY3ktD8') {
      subscriptionPlanName = 'Soundwise Pro Monthly Subscription';
    } else if (data.plan.product === 'prod_CIfDGkLuKCaFs5') {
      subscriptionPlanName = 'Soundwise Plus Monthly Subscription';
    } else if (data.plan.product === 'prod_CIfHWeFWKcVKyh') {
      subscriptionPlanName = 'Soundwise Pro Annual Subscription';
    } else {
      console.log(`Error: renewSubscription unknown plan product ${data.plan.product}`);
    }

    // check if there is referredBy property in the subscription's metadata
    if (data.metadata.referredBy) {
      const [affiliateId, affiliateStripeAccountId] = data.metadata.referredBy.split('-');
      const transferAmount = Math.floor(
        (chargeAmount * 0.971 - 30) / 2 // half of (chargeAmount minus stripe fee: - 2.9% - $0.3)
      );
      if (transferAmount <= 0) {
        console.log(
          `Error: renewSubscription wrong transferAmount ${JSON.stringify(req.body.data)}`
        );
      } else {
        stripe.transfers.create(
          {
            amount: transferAmount,
            currency: 'usd',
            destination: affiliateStripeAccountId,
            transfer_group: 'affiliateGroup', // optional
          },
          (err, transfer) => {
            if (err) {
              return console.log(`Error: renewSubscription stripe.transfers.create ${err}`);
            }
            database.Transfers.create({
              affiliateId,
              affiliateStripeAccountId,
              subscriptionId: req.body.data.object.subscription,
              chargeId: req.body.data.object.charge,
              chargeAmount,
              transferAmount,
            });
          }
        );
      }
    }

    database.PlatformCharges.create({
      publisherId,
      stripeCustomerId: req.body.data.object.customer,
      subscriptionPlanName,
      subscriptionPlanId: data.plan.product,
      subscriptionId: req.body.data.object.subscription,
      chargeId: req.body.data.object.charge,
      chargeAmount,
      coupon: data.metadata.coupon || null,
      referredBy: data.metadata.referredBy || null,
    });
  } else if (req.body.type == 'invoice.payment_failed') {
    const input = {
      to: 'natasha@mysoundwise.com',
      from: 'support@mysoundwise.com',
      subject: `Payment failed for invoice #${req.body.data.object.id}`,
      html: `<p>Webhook notice from Stripe:</p>
        <div>${JSON.stringify(req.body)}</div>`,
    };
    sgMail.send(input);
    res.send({});
  }
};

module.exports.cancelSubscription = (req, res) => {
  const { subscriptionID } = req.body;
  stripe.subscriptions
    .del(subscriptionID)
    .then(response => {
      res.send(response);
    })
    .catch(err => {
      console.log('error: ', err);
      res.status(500).send(err);
    });
};

module.exports.updateSubscription = async (req, res) => {
  try {
    const { publisherID } = req.body;
    const snapshot = await firebase
      .database()
      .ref(`publishers/${publisherID}/subscriptionID`)
      .once('value');
    const subscriptionID = snapshot.val();
    if (!subscriptionID) {
      console.log(`Error: updateSubscription empty subscriptionID ${publisherID}`);
      res.status(500).send(`Error: updateSubscription empty subscriptionID ${publisherID}`);
    } else {
      const subscription = await stripe.subscriptions.retrieve(subscriptionID);
      if (subscription.metadata.publisherID) {
        const errMsg = `Error: updateSubscription subscription publisherID already has been set ${publisherID}`;
        console.log(errMsg);
        return res.status(500).send(errMsg);
      }
      subscription.metadata.publisherID = publisherID; // save publisherID
      const response = await stripe.subscriptions.update(subscriptionID, {
        metadata: subscription.metadata,
      });
      res.send(response);
    }
  } catch (err) {
    console.log(`Error: updateSubscription catch ${err}`);
    res.status(500).send(`Error: updateSubscription catch ${err}`);
  }
};
