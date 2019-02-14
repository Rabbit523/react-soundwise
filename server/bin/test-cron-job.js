'use strict';

var app = require('../server');
var moment = require('moment');
// var firebase = require('firebase');
var paypal = require('paypal-rest-sdk');
var firebase = require('firebase-admin');
const sendinblue = require('sendinblue-api');
const sendinBlueApiKey = require('../../config').sendinBlueApiKey;

const parameters = { apiKey: sendinBlueApiKey, timeout: 5000 };
const sendinObj = new sendinblue(parameters);
var paypalConfig = require('../../config').paypalConfig;

var stripeFeeFixed = 0.3;
var stripeFeePercent = 0.029;
var soundwiseFeePercent = 0;

paypal.configure(paypalConfig);

const periodBegin = moment()
  .startOf('month')
  .subtract(2, 'months')
  .add(15, 'days')
  .format('YYYY-MM-DD');
const periodEnd = moment()
  .startOf('month')
  .subtract(1, 'months')
  .add(14, 'days')
  .format('YYYY-MM-DD');
const Transaction = app.models.Transaction;
// ************** step 1
const publishersObj = {};
Transaction.find({
  where: {
    date: {
      between: [
        // be sure it runs at the START of the month
        periodBegin,
        periodEnd,
      ],
    },
  },
}).then(transactions => {
  if (transactions.length > 0) {
    // ************** step 2
    transactions.map(transaction => {
      const fees = transaction.amount * (stripeFeePercent + soundwiseFeePercent) + stripeFeeFixed;
      if (!publishersObj[transaction.publisherId]) {
        publishersObj[transaction.publisherId] = {
          payoutAmount:
            transaction.type == 'charge'
              ? +transaction.amount - fees
              : -(+transaction.amount - fees),
        };
      } else {
        publishersObj[transaction.publisherId].payoutAmount +=
          transaction.type == 'charge' ? +transaction.amount - fees : -(+transaction.amount - fees);
      }
    });

    const publishersArr = [];
    let publisherObj;
    for (let publisherId in publishersObj) {
      if (publishersObj[publisherId].payoutAmount > 0) {
        publisherObj = publishersObj[publisherId];
        publisherObj.id = publisherId;
        publishersArr.push(publisherObj);
      }
    }

    // if there's nothing to payout, return and call it a day
    if (publishersArr.length == 0) {
      const input = {
        to: { ['natasha@mysoundwise.com']: 'Natasha Che' },
        from: ['support@mysoundwise.com', 'Soundwise'],
        subject: 'There is no payouts this month',
        html: '<p>Yippee!</p>',
      };
      sendinObj.send_email(input, function(err, response) {
        return;
      });
      return;
    }

    // ************** step 3
    const getPaypalEmailPromises = publishersArr.map((publisher, i) => {
      return firebase
        .database()
        .ref(`publishers/${publisher.id}`)
        .once('value')
        .then(paypalEmailSnapshot => {
          if (paypalEmailSnapshot.val()) {
            publisher.paypalEmail = paypalEmailSnapshot.val().paypalEmail;
          }
        })
        .then(res => res, err => console.log(err));
    });

    Promise.all(getPaypalEmailPromises)
      .then(res => {
        // publisherObj = {id, paypalEmail, payoutAmount}
        // ************** step 4
        const payoutItemsArr = [];
        publishersArr.forEach(publisherObj => {
          payoutItemsArr.push({
            recipient_type: 'EMAIL',
            amount: {
              value: publisherObj.payoutAmount.toFixed(2),
              currency: 'USD',
            },
            receiver: publisherObj.paypalEmail,
            note: `Payout from Soundiwse for ${periodBegin} to ${periodEnd}`,
            sender_item_id: publisherObj.id, //publisherID
          });
        });

        // create payout
        const senderBatchId = Math.random()
          .toString(36)
          .substring(9);
        const payoutObj = {
          sender_batch_header: {
            sender_batch_id: senderBatchId,
            email_subject: `You received a payment from Soundiwse for ${periodBegin} to ${periodEnd}`,
          },
          items: payoutItemsArr,
        };
        paypal.payout.create(payoutObj, function(error, payout) {
          if (error) {
            console.log('paypal payout creation error: ', error.response);
            const errorEmail = {
              to: { ['natasha@mysoundwise.com']: 'Natasha Che' },
              from: ['support@mysoundwise.com', 'Soundwise'],
              subject: "There is a problem with this month's payout!",
              html: `<p>Check server logs.</p>
              <div>${JSON.stringify(error)}</div>`,
            };
            sendinObj.send_email(errorEmail, function(err, response) {
              return;
            });
          } else {
            console.log('payout response: ', payout);
            const successEmail = {
              to: { ['natasha@mysoundwise.com']: 'Natasha Che' },
              from: ['support@mysoundwise.com', 'Soundwise'],
              subject: "This month's payout is successfully generated!",
              html: '<p>Yippee!</p>',
            };
            sendinObj.send_email(successEmail, function(err, response) {
              return;
            });
          }
        });
      })
      .catch(err => console.log('paypal email retrieval error: ', err));
  }
});
