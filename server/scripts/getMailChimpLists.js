'use strict';
var Mailchimp = require('mailchimp-api-v3');
var firebase = require('firebase-admin');

module.exports.getMailChimpLists = (req, res) => {
  if (req.body.apiKey != '') {
    var mailchimp = new Mailchimp(req.body.apiKey);
    mailchimp
      .get('/lists')
      .then(function(results) {
        let promiseArray = results.lists.map(list => {
          //We want to queue a bunch of promises here, and when all of them
          //are resolved we would save the result in firebase
          return promiseGetMergeFields(mailchimp, list);
        });

        //TODO: Why is this being called multiple times on a page refresh?
        Promise.all(promiseArray).then(result => {
          //The promises in the array are resolved, so we now would create Json object
          //to send to firebase.

          //We then update firebase with the information, which
          //in turns keeps the app updated.

          var mailChimp = {
            apiKey: req.body.apiKey,
            list: result,
          };

          firebase
            .database()
            .ref(`publishers/${req.body.publisherId}`)
            .update({ mailChimp: mailChimp })
            .then(() => {
              res.sendStatus(200);
            });
        });
      })
      .catch(function(err) {
        console.log('Failure getting the mailchimp lists ', err);
        res.sendStatus(404);
      });
  }
};

const promiseGetMergeFields = (mailchimp, list) => {
  return mailchimp
    .get(`/lists/${list.id}/merge-fields`)
    .then(function(result) {
      console.log(`Retrieved merge fields for listId: ${list.id} `);
      let tags = result.merge_fields.map(mfield => {
        return {
          tags: mfield.tag,
        };
      });
      return {
        id: list.id,
        name: list.name,
        merge_fields: tags,
      };
    })
    .catch(function(err) {
      console.log(`Failure in getting merge fields for ${list.id}, ${err}`);
      return null;
    });
};
