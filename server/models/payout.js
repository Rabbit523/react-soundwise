'use strict';

const firebase = require('firebase-admin');
const moment = require('moment');
// const sendinblue = require('sendinblue-api');
// const sendinBlueApiKey = require('../../config').sendinBlueApiKey;
const sgMail = require('@sendgrid/mail');
const sendGridApiKey = require('../../config').sendGridApiKey;
sgMail.setApiKey(sendGridApiKey);

module.exports = function(Payout) {
  Payout.handlePayoutWebhookEvents = function(data, cb) {
    console.log('handlePayoutWebhookEvents request body: ', data);
    const ref = firebase.database().ref('publishers');
    let publisherId = null;
    ref
      .orderByChild('stripe_user_id')
      .equalTo(data.account)
      .on('value', snapshot => {
        snapshot.forEach(data => {
          publisherId = data.key;
        });
        if (publisherId) {
          switch (data.type) {
            case 'payout.paid':
              // write payout date to Payout table
              if (data.data.object.id) {
                const date = moment()
                  .utc()
                  .format();
                console.log('payout object received: ', data.data.object);
                const payout = {
                  batchId: data.data.object.id,
                  amount: Math.trunc(data.data.object.amount),
                  date: date,
                  publisherId,
                  email: snapshot.val()[publisherId].email
                    ? snapshot.val()[publisherId].email
                    : snapshot.val()[publisherId].paypalEmail,
                  payoutId: data.data.object.id,
                  createdAt: date,
                  updatedAt: date,
                };
                console.log('new payout recorded: ', payout);

                Payout.create(payout)
                  .then(res => {
                    cb(null, res);
                  })
                  .catch(err => {
                    console.log(`Error: payout.js create ${err}`);
                    cb(err);
                  });
              }
              break;
            case 'payout.failed':
              // aleart administrator that payout failed
              emailAdmin(Object.assign({}, data, { publisherId }), cb);
              break;
            default:
              return cb(null, {});
          }
        }
      });
  };

  Payout.remoteMethod('handlePayoutWebhookEvents', {
    http: {
      path: '/handlePayoutWebhookEvents',
      verb: 'post',
      status: 200,
      errorStatus: 400,
    },
    description: ['handle payout webhook events from stripe'],
    notes: 'it accepts payout event data',
    accepts: {
      arg: 'data',
      type: 'object',
      http: { source: 'body' },
      required: true,
    },
    returns: { type: 'object', root: true },
  });
};

function emailAdmin(data, cb) {
  const input = {
    to: 'natasha@mysoundwise.com',
    from: 'support@mysoundwise.com',
    subject: `There is a problem with payout
    ${data.data.object.id} for ${data.publisherId}`,
    html: `<p>Webhook notice from Stripe:</p>
      <div>${JSON.stringify(data)}</div>`,
  };
  sgMail.send(input);
  return cb(null, {});
}
