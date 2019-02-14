// step 1: retrieve all transaction data for previous month from database.
// step 2: loop through transactions data, compile an object of publisher IDs with total payout amount to each publisher.
// step 3: retrieve paypal email for each publisher from firebase.
// step 4: create one batch payout for each publisher.
// step 5: set up webhook to listen to batch payout success/failure events.
// step 6: write payout data into Payouts table when a batch payout succeeds; send an email to alert administrator if a batch payout fails.

'use strict';
const schedule = require('node-schedule');
const firebase = require('firebase-admin');
const moment = require('moment');
const database = require('../../database/index');

module.exports = function(app) {
  if (process.env.NODE_ENV === 'dev') {
    return; // prevent running in dev mode
  }

  // rankSoundcasts - 01:00 each Monday
  schedule.scheduleJob('0 0 1 * * 1', async () => {
    console.log('CRON_RUN rankSoundcasts');
    const currentDate = moment().format('x');
    const soundcastsListens = [];
    const count = (await database.db.query('SELECT COUNT(*) FROM "Soundcasts"'))[0][0].count;
    const maxListnes = (await database.db.query(
      'SELECT "soundcastId", COUNT("sessionId") FROM "ListeningSessions" GROUP BY "soundcastId" ORDER BY "count" DESC;'
    ))[0][0].count;
    let i = 0;
    while (i <= count) {
      const soundcasts = (await database.db.query(
        `SELECT * FROM "Soundcasts" ORDER BY "soundcastId" OFFSET ${i} LIMIT 10000`
      ))[0];
      for (const soundcast of soundcasts) {
        const { soundcastId } = soundcast;
        const countList = await database.ListeningSession.count({ where: { soundcastId } });
        const updateDate = soundcast.updateDate || new Date(soundcast.updatedAt).getTime();
        const rank =
          (countList / maxListnes > 0.1 ? countList / maxListnes - 0.1 : 0) +
          (updateDate / currentDate) * 0.1;
        await firebase
          .database()
          .ref(`soundcasts/${soundcastId}/rank`)
          .set(rank.toFixed(5));
        await database.db.query(
          `UPDATE "Soundcasts" SET "rank"=${rank} WHERE "soundcastId"='${soundcastId}'`
        );
      }
      i += 10000;
    }
  });

  // detectSubscriptionsExpiration - 23:00 each day
  schedule.scheduleJob('0 0 23 * * *', async () => {
    console.log('CRON_RUN detectSubscriptionsExpiration');
    const currentDate = moment().format('X');
    const listeningSessions = (await database.db.query(
      // `SELECT "userId", "soundcastId" FROM "ListeningSessions" GROUP BY "soundcastId", "userId";`
      `SELECT "userId", "soundcastId" FROM "ListeningSessions" WHERE "createdAt" >= (select TIMESTAMP 'yesterday') GROUP BY "soundcastId", "userId";`
    ))[0];
    for (const session of listeningSessions) {
      const snapshot = await firebase
        .database()
        .ref(`users/${session.userId}/soundcasts/${session.soundcastId}`)
        .once('value');
      const soundcast = snapshot.val();
      if (
        soundcast.current_period_end &&
        (soundcast.billingCycle !== 'free' || soundcast.billingCycle !== 'one time')
      ) {
        if (!!soundcast && soundcast.current_period_end < currentDate) {
          await firebase
            .database()
            .ref(`users/${session.userId}/soundcasts/${session.soundcastId}/subscribed`)
            .set(false);
          await firebase
            .database()
            .ref(`soundcasts/${session.soundcastId}/subscribed/${session.userId}`)
            .remove();
        } else {
          console.log('soundcastId: ', snapshot.key);
          console.log('soundcast: ', soundcast);
        }
      }
    }
  });
};
