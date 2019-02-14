'use strict';

const moment = require('moment');
const firebase = require('firebase-admin');
const { userManager } = require('../managers');

const sendInvite = async (req, res) => {
  const { inviteeArr, soundcastId } = req.body;
  inviteeArr.map(async email => {
    let _email = email
      .replace(/\./g, '(dot)')
      .trim()
      .toLowerCase();
    if (_email) {
      await firebase
        .database()
        .ref(`soundcasts/${soundcastId}/invited/${_email}`)
        .set(moment().format('X')) //invited listeners are different from subscribers. Subscribers are invited listeners who've accepted the invitation and signed up via mobile app
        .then(() => {
          firebase
            .auth()
            .getUserByEmail(email)
            .then(u => subscibeUser(u.uid, soundcastId, res))
            .catch(e => addInvitations(soundcastId, _email, res));
        });
    }
  });
};

const addInvitations = (soundcastId, email, res) => {
  firebase
    .database()
    .ref(`invitations/${email}`)
    .once('value')
    .then(snapshot => {
      if (snapshot.val()) {
        const update = Object.assign({}, { [soundcastId]: true }, snapshot.val());
        firebase
          .database()
          .ref(`invitations/${email}`)
          .update(update)
          .then(() => res.send({ response: 'update invintation' }));
      } else {
        firebase
          .database()
          .ref(`invitations/${email}/${soundcastId}`)
          .set(true)
          .then(() => res.send({ response: 'create invintation' }));
      }
    });
};

const subscibeUser = (userId, soundcastId, res) => {
  userManager.getById(userId).then(user => {
    firebase
      .database()
      .ref(`soundcasts/${soundcastId}/subscribed/${userId}`)
      .set(user.token || true);
    firebase
      .database()
      .ref(`users/${userId}/soundcasts/${soundcastId}`)
      .set({
        billingCycle: 'one time',
        current_period_end: '4687857936',
        date_subscribed: moment().format('X'),
        subscribed: true,
      })
      .then(() => res.send({ response: 'subscibe user' }));
  });
};

module.exports = { sendInvite };
