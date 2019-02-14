// Run options:
// $ SET_TEST_FEED=delete NODE_ENV=dev node iTunesUrls-local-sql.js
// $ SET_TEST_FEED=reset  NODE_ENV=dev node iTunesUrls-local-sql.js

const firebase = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey');
const database = require('../../database/index');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-a8e6f.firebaseio.com',
});
// const { getFeed } = require('./parseFeed.js');

const setTestFeed = async () => {
  // return getFeed('http://download.omroep.nl/avro/podcast/klassiek/zoc/rssZOC.xml', async (err, results) => {
  //   debugger;
  // });
  const feedUrl = 'download.omroep.nl/avro/podcast/klassiek/zoc/rsszoc.xml'; // parsed
  const podcastTitle = 'Het Zondagochtend Concert';
  const podcasts = await database.ImportedFeed.findAll({ where: { feedUrl } });
  if (!podcasts.length) {
    console.log(`Error: test podcast wasn't obtained`);
    return process.exit();
  }
  const soundcastId = podcasts[0].soundcastId;
  const episodes = await database.Episode.findAll({
    where: { soundcastId },
  });
  if (!episodes.length) {
    console.log(`Error: test podcast episodes weren't obtained`);
    return process.exit();
  }

  if (process.env.SET_TEST_FEED === 'delete') {
    console.log(`Deleting test feed ${soundcastId}`);

    await database.PodcasterEmail.destroy({ where: { podcastTitle } });
    await firebase
      .database()
      .ref(`soundcasts/${soundcastId}`)
      .remove();
    await database.ImportedFeed.destroy({ where: { soundcastId } });
    for (const episode of episodes) {
      await firebase
        .database()
        .ref(`episodes/${episode.episodeId}`)
        .remove();
    }
    await database.Episode.destroy({ where: { soundcastId } });
    await database.CategorySoundcast.destroy({ where: { soundcastId } });
    await database.Soundcast.destroy({ where: { soundcastId } });
  }

  if (process.env.SET_TEST_FEED === 'reset') {
    console.log(`Resetting test feed ${soundcastId}`);

    const publisherEmail = 'null'; // set test email
    const userId = 'Soundcast_userId_iTunesUrls';
    const publisherId = '1500000000000p'; // unused test publisherId

    await database.PodcasterEmail.update({ publisherEmail }, { where: { podcastTitle } });
    await firebase
      .database()
      .ref(`soundcasts/${soundcastId}/publisherEmail`)
      .set(publisherEmail);
    await database.ImportedFeed.update(
      { claimed: false, userId, publisherId },
      { where: { soundcastId } }
    );
    for (const episode of episodes) {
      await firebase
        .database()
        .ref(`episodes/${episode.episodeId}/publisherID`)
        .set(publisherId);
      await firebase
        .database()
        .ref(`episodes/${episode.episodeId}/creatorID`)
        .set(userId);
    }
    await database.Episode.update({ publisherId }, { where: { soundcastId } });
    await database.Soundcast.update({ publisherId }, { where: { soundcastId } });
  }

  process.exit();
};
if (process.env.SET_TEST_FEED) {
  return setTestFeed();
}
