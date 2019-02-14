'use strict';
var Mailchimp = require('mailchimp-api-v3');
var firebase = require('firebase-admin');

module.exports.addSubscriberMailChimp = (req, res) => {
  // Just in case the client does not send the first or last names
  // As the endpoint could be called from mobile too.

  let firstName = req.body.user.firstName ? req.body.user.firstName : '';
  let lastName = req.body.user.lastName ? req.body.user.lastName : '';
  let email = req.body.user.email;

  let listId = req.body.mailChimpInfo.mailChimpId;
  let exportFirstName = true,
    exportLastName = true;
  let firstNameTag = req.body.mailChimpInfo.mergeFields.firstNameTag;
  let lastNameTag = req.body.mailChimpInfo.mergeFields.lastNameTag;

  //Lets create the object for mergefields
  if (firstNameTag === 'No Export') {
    exportFirstName = false;
  }

  if (lastNameTag === 'No Export') {
    exportLastName = false;
  }

  let merge_fields = {};

  if (exportFirstName) {
    merge_fields[firstNameTag] = firstName;
  }
  if (exportLastName) {
    merge_fields[lastNameTag] = lastName;
  }

  //Lets get the mailChimp API key using the publisherID from firebase.
  firebase
    .database()
    .ref('publishers/' + req.body.publisherId + '/mailChimp')
    .once('value')
    .then(snapshot => {
      let mailChimpKey = snapshot.val();
      if (mailChimpKey == null) {
        //No API ket, just return quietly
        console.log('Not adding subscriber as publisher has no mailchimp key');
        res.sendStatus(200);
      } else {
        let apiKey = mailChimpKey.apiKey;
        if (apiKey != '') {
          var mailchimp = new Mailchimp(apiKey);
          mailchimp
            .post(`/lists/${listId}/members`, {
              email_address: email,
              status: 'subscribed',
              merge_fields: merge_fields,
            })
            .then(function(results) {
              console.log('Mailchimp returned Success adding user to list - ', results);
              res.sendStatus(200);
            })
            .catch(function(err) {
              //We send a 200 if the user is already in the list, nothing to be alarmed of.
              console.log('Error adding user: ', err);
              res.sendStatus(200);
            });
        } else {
          //We send a 404 if the apiKey is not found.
          console.log('Api key not found. ');
          res.sendStatus(404);
        }
      }
    })
    .catch(function(err) {
      //We send a 404 if the firebase request failed.
      console.log('Firebase request failed. ');
      res.sendStatus(404);
    });
};
