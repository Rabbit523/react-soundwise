'use strict';
var Mailchimp = require('mailchimp-api-v3');
var firebase = require('firebase-admin');

module.exports.updateMailChimpSubscribers = (req, res) => {
  // Get the subscriberids for the soundcast from firebase
  // Get the subscriber information from firebase
  // Add the subscribers to mailChimp, map the fields.

  updateFirebaseSoundcastWihtListId(req, res)
    .then(() => {
      getSubscribersInfo(req, res);
    })
    .catch(function(err) {
      console.log('Failure updating the list id for soundcasts ', err);
      res.sendStatus(404);
    });
};

function getSubscribersInfo(req, res) {
  let promises = [];
  let exportFirstName = true,
    exportLastName = true;

  let firstNameTag = req.body.mergeFields.firstNameTag;
  let lastNameTag = req.body.mergeFields.lastNameTag;

  //Lets create the object for mergefields
  if (firstNameTag === 'No Export') {
    exportFirstName = false;
  }

  if (lastNameTag === 'No Export') {
    exportLastName = false;
  }

  for (let userId in req.body.subscribers) {
    promises.push(retrieveSubscriberInfo(userId));
  }

  Promise.all(promises).then(
    result => {
      //Assume we map all the fields and save to mailChimp here.
      //Next we set the list id in the Soundcasts.
      let subscribersMailChimp;
      if (result != null) {
        //Filter the subscribers who do not have an email address.
        subscribersMailChimp = result
          .map(subscriber => {
            if (subscriber != null && subscriber.email && subscriber.email.length > 0) {
              let sub = {};
              sub.email_address = subscriber.email[0];
              sub.status = 'subscribed';
              if (exportFirstName) {
                sub.merge_fields = {};
                sub.merge_fields[firstNameTag] = subscriber.firstName;
              }
              if (exportLastName) {
                if (typeof sub.merge_fields == 'undefined') {
                  sub.merge_fields = {};
                }
                sub.merge_fields[lastNameTag] = subscriber.lastName;
              }
              return sub;
            }
            return false;
          })
          .filter(subscriber => subscriber != false);

        //Lets filter this array of duplicate email addresses.
        //This can happen if their duplicate subscribers, which should not happen
        //but happens in the soundcast 'A Soundcast on Inner Mastery'
        subscribersMailChimp = subscribersMailChimp.filter(
          (subscr, index, self) =>
            index === self.findIndex(t => t.email_address === subscr.email_address)
        );

        //Now create the object needed by the mailChimp API
        //https://developer.mailchimp.com/documentation/mailchimp/reference/lists/#create-post_lists_list_id
        let mailChimpObjectWithSubscribers = {};
        mailChimpObjectWithSubscribers.members = subscribersMailChimp;
        mailChimpObjectWithSubscribers.update_existing = true;

        var mailchimp = new Mailchimp(req.body.apiKey);

        mailchimp
          .post(`/lists/${req.body.listId}`, mailChimpObjectWithSubscribers)
          .then(function(results) {
            console.log(`Success adding subscribers to ${req.body.listId} `, results);
            res.sendStatus(200);
          })
          .catch(function(err) {
            console.log(`Failure adding subscribers to ${req.body.listId} `, err);
          });
      }
    },
    err => {
      console.log('promise error: ', err);
      res.sendStatus(404);
    }
  );
}

function retrieveSubscriberInfo(userId) {
  return firebase
    .database()
    .ref('users/' + userId)
    .once('value')
    .then(snapshot => {
      return { ...JSON.parse(JSON.stringify(snapshot.val())), id: userId };
    })
    .catch(function(err) {
      //We send a 404 if the firebase request failed.
      console.log('Error retrieveSubscriberInfo', err);
      res.sendStatus(404);
    });
}

function updateFirebaseSoundcastWihtListId(req, res) {
  let mailChimp = {
    mailChimp: {
      mailChimpId: req.body.listId,
      mergeFields: req.body.mergeFields,
    },
  };
  return firebase
    .database()
    .ref(`soundcasts/${req.body.soundcastId}`)
    .update(mailChimp)
    .catch(function(err) {
      //We send a 404 if the firebase request failed.
      res.sendStatus(404);
    });
}
