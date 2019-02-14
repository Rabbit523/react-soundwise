'use strict';
var Raven = require('raven');
// var sendinblue = require('sendinblue-api');
// var sendinBlueApiKey = require('../../config').sendinBlueApiKey;
const _ = require('lodash');
var firebase = require('firebase-admin');
var moment = require('moment');

// var parameters = {'apiKey': sendinBlueApiKey, 'timeout': 5000};
// var sendinObj = new sendinblue(parameters);
var emailTemplate = require('./helpers/emailTemplate').emailTemplate;
var marketingEmailTemplate = require('./helpers/marketingEmailTemplate').marketingEmailTemplate;

var sgMail = require('@sendgrid/mail');
var sendGridApiKey = require('../../config').sendGridApiKey;
sgMail.setApiKey(sendGridApiKey);
var client = require('@sendgrid/client');
client.setApiKey(sendGridApiKey);

const sendTransactionalEmails = (req, res) => {
  var content = req.body.plainEmail
    ? req.body.content
    : emailTemplate(req.body.publisherName, req.body.publisherImage, req.body.content);
  var email = req.body.publisherEmail ? req.body.publisherEmail : 'support@mysoundwise.com';
  var name = req.body.publisherName ? req.body.publisherName : 'Soundwise';
  // console.log('req.body.content: ', req.body.content);
  // console.log('compiled content: ', content);
  var _promises = req.body.invitees.map(invitee => {
    let msg = {
      to: invitee,
      from: { email, name },
      subject: req.body.subject,
      html: content,
    };
    if (req.body.bcc) {
      msg = Object.assign({}, msg, { bcc: req.body.bcc });
    }
    return sgMail
      .send(msg)
      .then(response => {
        return response;
      })
      .catch(err => {
        console.log(err.toString());
        Promise.reject(err);
        Raven.captureException(err.toString());
      });
  });

  Promise.all(_promises).then(
    response => {
      console.log('completed email invitations.');
      res.send(response);
    },
    err => {
      console.log('failed to complete sending email invitations');
      res.status(400).send(err.message);
    }
  );
};

const sendCommentNotification = async (req, res) => {
  sendMail(req.body.comment).then(() => res.status(200).send({}));
};

const sendMail = async comment => {
  let fbComment = {
    userID: comment.userId,
    episodeID: comment.episodeId,
    soundcastID: comment.soundcastId,
    announcementID: comment.announcementId,
    timestamp: comment.timeStamp,
  };
  fbComment = _.pickBy(fbComment, _.identity);
  const { userID, soundcastID, announcementID, episodeID, timestamp } = fbComment;
  const publisherID = await firebase
    .database()
    .ref(`soundcasts/${soundcastID}/publisherID`)
    .once('value');
  const admins = await firebase
    .database()
    .ref(`publishers/${publisherID.val()}/administrators`)
    .once('value');
  const adminsArr = Object.keys(admins.val());
  if (adminsArr.indexOf(userID) < 0) {
    // send notification only if commentor is not one of the admins
    const commentor = await firebase
      .database()
      .ref(`users/${userID}`)
      .once('value');
    const commentorName = `${commentor.val().firstName} ${commentor.val().lastName}`;
    let adminsEmails = [];
    for (var i = 0; i < adminsArr.length; i++) {
      const email = await firebase
        .database()
        .ref(`users/${adminsArr[i]}/email`)
        .once('value');
      email.val() && adminsEmails.push(email.val()[0]);
    }

    let episodeTitle = '';
    let announcementDate = '';

    if (episodeID) {
      episodeTitle = (await firebase
        .database()
        .ref(`episodes/${episodeID}/title`)
        .once('value')).val();
    }
    if (announcementID) {
      announcementDate = moment.unix(timestamp).format('MMM DD YYYY');
    }
    const subject = episodeTitle ? episodeTitle : `your announcement made on ${announcementDate}`;
    const msg = {
      to: adminsEmails,
      from: 'support@mysoundwise.com',
      subject: `There's a new comment posted for ${subject}`,
      html: `<p>Hi!</p><p></p><p>${commentorName} just made a new comment on ${subject}.</p><p></p><p>Check it out and reply on the Soundwise app.</p><p></p><p>Folks at Soundwise</p>`,
    };
    return sgMail.send(msg);
  }
};

const addToEmailList = (req, res) => {
  // req.body: {soundcastId: [string], emailListId: [number], emailAddressArr: [array]}
  const { soundcastId, emailAddressArr, listName, emailListId } = req.body;
  const emails = emailAddressArr.map(email => {
    if (typeof email == 'string') {
      return {
        email,
      };
    } else if (typeof email == 'object') {
      return {
        first_name: email.firstName,
        last_name: email.lastName,
        email: email.email,
      };
    }
  });
  const options = {
    method: 'POST',
    url: '/v3/contactdb/recipients',
    body: emails,
  };
  client
    .request(options)
    .then(([response, body]) => {
      const recipients = body.persisted_recipients; // array of recipient IDs
      if (emailListId) {
        // if list already exists, add recipients to list
        const data = {
          method: 'POST',
          url: `/v3/contactdb/lists/${emailListId}/recipients`,
          body: recipients,
        };
        client
          .request(data)
          .then(([response, body]) => {
            res.status(200).send({ emailListId });
          })
          .catch(err => {
            console.log('error: ', err.message);
            res.status(400).send(err.message);
          });
      } else {
        // if list doesn't exist, create list and then add recipients
        const data1 = {
          method: 'POST',
          url: '/v3/contactdb/lists',
          body: { name: `${soundcastId}-${listName}` },
        };
        // console.log('data1: ', data1);
        client
          .request(data1)
          .then(([response, body]) => body.id)
          .then(listId => addRecipients(listId))
          .catch(err => {
            let message;
            try {
              message = err.response.body.errors[0].message;
            } catch (err) {}
            if (message === 'This list name is already in use. Please choose a new, unique name.') {
              client
                .request({ method: 'GET', url: '/v3/contactdb/lists' })
                .then(([response, body]) => {
                  const list = body.lists.find(i => i.name === `${soundcastId}-${listName}`);
                  if (list) {
                    addRecipients(list.id);
                  } else {
                    console.log('error list not found');
                    res.status(400).send('error list not found');
                  }
                })
                .catch(err => {
                  console.log('error getting lists: ', err.message);
                  res.status(400).send(err.message);
                });
            } else {
              console.log('error creating list: ', err.message, message);
              res.status(400).send(err.message + ' ' + message);
            }
          });
      }

      const addRecipients = listId => {
        const data2 = {
          method: 'POST',
          url: `/v3/contactdb/lists/${listId}/recipients`,
          body: recipients,
        };
        client
          .request(data2)
          .then(([response, body]) => {
            // save listId in firebase
            firebase
              .database()
              .ref(`soundcasts/${soundcastId}/${listName}`)
              .set(listId);
          })
          .then(() => {
            res.status(200).send({ emailListId: listId });
          })
          .catch(err => {
            console.log('error adding recipients: ', err.message);
            res.status(400).send(err.message);
          });
      };
    })
    .catch(err => {
      console.log('error sendEmails recipients request: ', err, err.message);
      res.status(400).send(err.message);
    });
};

const deleteFromEmailList = (req, res) => {
  // req.body: {emails: [array], emailListId: [string]}
  const promises = req.body.emails.map(email => {
    const request = {};
    const queryParams = {
      email: email,
    };
    request.qs = queryParams;
    request.method = 'GET';
    request.url = '/v3/contactdb/recipients/search';
    return client
      .request(request)
      .then(([response, body]) => {
        const id = body.recipients[0].id;
        client.request({
          method: 'DELETE',
          url: `/v3/contactdb/lists/${req.body.emailListId}/recipients/${id}`,
        });
      })
      .catch(err => {
        console.log('error: ', err.body);
        Promise.reject(err);
      });
  });
  Promise.all(promises)
    .then(() => {
      res.status(200).send({});
    })
    .catch(err => {
      console.log('error: ', err.message);
      res.status(400).send(err.message);
    });
};

const sendMarketingEmails = (req, res) => {
  // req.body: {publisherName: [string], publisherImage: [string], content: [string], publisherEmail: [string], subject: [string], listIds: [array of strings], unsubscribeGroup: [number]}
  // console.log('req.body: ', req.body);
  const {
    publisherName,
    publisherImage,
    publisherEmail,
    subject,
    listIds,
    content,
    unsubscribeGroup,
  } = req.body;
  const email = publisherEmail ? publisherEmail : 'support@mysoundwise.com';
  const html_content = marketingEmailTemplate(publisherName, publisherImage, content);

  const requestBody = {
    title: subject.slice(0, 100),
    subject,
    list_ids: listIds, // array
    html_content,
    suppression_group_id: unsubscribeGroup,
    status: 'Draft',
    sender_id: 204129,
    reply_to: { email: publisherEmail, name: publisherName },
  };
  const options = {
    method: 'POST',
    url: '/v3/campaigns',
    body: requestBody,
  };
  client
    .request(options)
    .then(([response, body]) => {
      const campaignId = body.id;
      // console.log('response body: ', body);
      client
        .request({
          method: 'POST',
          url: `/v3/campaigns/${campaignId}/schedules/now`,
        })
        .then(([response, body]) => {
          res.status(200).send({ campaignId });
        })
        .catch(err => {
          console.log('error sending campaign: ', err.message);
          res.status(400).send(err.message);
        });
    })
    .catch(err => {
      console.log('error creating campaign: ', err.message);
      res.status(400).send(err.message);
    });
};

module.exports = {
  sendMail,
  sendTransactionalEmails,
  addToEmailList,
  deleteFromEmailList,
  sendMarketingEmails,
  sendCommentNotification,
};
