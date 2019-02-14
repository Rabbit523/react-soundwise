'use strict';

// **** import firebase data into algolia ****

var firebase = require('firebase-admin');
var algoliaConfig = require('../../config').algoliaConfig;
var algoliasearch = require('algoliasearch');
var database = firebase.database();

// configure algolia
const algolia = algoliasearch(algoliaConfig.ALGOLIA_APP_ID, algoliaConfig.ALGOLIA_API_KEY);
const index = algolia.initIndex(algoliaConfig.ALGOLIA_INDEX_NAME);
index.setSettings(
  {
    searchableAttributes: ['title', 'hostName', 'publisherName', 'short_description'],
  },
  function(err, content) {}
);

module.exports.algoliaIndex = () => {
  const soundcastsRef = database.ref('/soundcasts');
  soundcastsRef.on('child_added', addOrUpdateIndexRecord);
  soundcastsRef.on('child_changed', addOrUpdateIndexRecord);
  soundcastsRef.on('child_removed', deleteIndexRecord);
};

function addOrUpdateIndexRecord(soundcast) {
  // Get Firebase object
  if (soundcast.val().published && soundcast.val().landingPage) {
    // Specify Algolia's objectID using the Firebase object key
    const { title, hostName, publisherName, short_description, imageURL } = soundcast.val();
    const record = {
      title,
      short_description,
      hostName: hostName ? hostName : '',
      publisherName: publisherName ? publisherName : '',
      imageURL,
    };
    record.objectID = soundcast.key;
    // Add or update object
    index
      .saveObject(record)
      .then(() => {
        // console.log('Firebase object indexed in Algolia', record.objectID);
      })
      .catch(error => {
        console.error('Error when indexing soundcast into Algolia', error);
        process.exit(1);
      });
  } else if (soundcast.val().published == false) {
    deleteIndexRecord(soundcast);
  }
}

function deleteIndexRecord(soundcast) {
  // Get Algolia's objectID from the Firebase object key
  const objectID = soundcast.key;
  // Remove the object from Algolia
  index
    .deleteObject(objectID)
    .then(() => {
      // console.log('Firebase object deleted from Algolia', objectID);
    })
    .catch(error => {
      console.error('Error when deleting soundcast from Algolia', error);
      process.exit(1);
    });
}
