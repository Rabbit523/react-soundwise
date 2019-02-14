'use strict';

var request = require('request-promise');

module.exports.handleEmailSignup = (req, res) => {
  // console.log('request.body: ', req.body)

  const options = {
    method: 'POST',
    uri: 'https://us7.api.mailchimp.com/3.0/lists/027913fec2/members',
    auth: {
      user: 'soundwise',
      pass: '8ef33347b5ca183fa94a22e6b7302842-us7',
    },
    body: {
      email_address: req.body.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: req.body.firstName,
        LNAME: req.body.lastName,
        MMERGE3: req.body.courseID,
      },
    },
    json: true,
  };

  if (req.body.firstName && req.body.lastName && req.body.courseID) {
    request(options)
      .then(function(response) {
        console.log('mailchimp success');
        res.send(response);
      })
      .catch(function(err) {
        console.log('mailchimp failed: ', err);
        res.send(err);
      });
  }
};

module.exports.handleReferral = (req, res) => {
  const friends = req.body.friends;
  const firstName_referer = req.body.firstName;
  const lastName_referer = req.body.lastName;

  Promise.all(
    friends.map(friend => {
      const options = {
        method: 'POST',
        uri: 'https://us7.api.mailchimp.com/3.0/lists/db92c03fe4/members',
        auth: {
          user: 'soundwise',
          pass: '8ef33347b5ca183fa94a22e6b7302842-us7',
        },
        body: {
          email_address: friend.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: friend.firstName,
            LNAME: friend.lastName,
            MMERGE3: firstName_referer,
            MMERGE4: lastName_referer,
          },
        },
        json: true,
      };

      return request(options);
    })
  )
    .then(function(response) {
      console.log('mailchimp success');
      res.send(response);
    })
    .catch(function(err) {
      console.log('mailchimp failed: ', err);
      res.send(err);
    });
};

module.exports.handleTrialRequest = (req, res) => {
  const options = {
    method: 'POST',
    uri: 'https://us7.api.mailchimp.com/3.0/lists/41f2751be3/members',
    auth: {
      user: 'soundwise',
      pass: '8ef33347b5ca183fa94a22e6b7302842-us7',
    },
    body: {
      email_address: req.body.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: req.body.firstName,
        LNAME: req.body.lastName,
        MMERGE3: req.body.company,
        MMERGE4: req.body.title,
        MMERGE5: req.body.phone,
      },
    },
    json: true,
  };

  if (
    req.body.firstName &&
    req.body.lastName &&
    req.body.company &&
    req.body.phone &&
    req.body.title &&
    req.body.email
  ) {
    request(options)
      .then(function(response) {
        console.log('mailchimp success');
        res.send(response);
      })
      .catch(function(err) {
        console.log('mailchimp failed: ', err);
        res.send(err);
      });
  }
};
