var stripe_key = require('../config').stripe_key;
var stripe = require('stripe')(stripe_key);
var firebase = require('firebase-admin');
const moment = require('moment');
const request = require('request-promise');
var serviceAccount = require('../serviceAccountKey.json');
const util = require('util');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-a8e6f.firebaseio.com',
});

var options, publisherId, name, paypalEmail;
var date = moment().format();
const ids = ['1503002103690p'];
var processPublishers = async () => {
  for (const id of ids) {
    const process = await firebase
      .database()
      .ref(`publishers/${id}`)
      .once('value')
      .then(snapshot => {
        const publisher = snapshot.val();
        publisherId = id;
        name = snapshot.val().name;
        paypalEmail = snapshot.val().email;
        request(`https://mysoundwise.com/api/publishers/${publisherId}/exists`).then(res => {
          options = {
            uri: 'https://mysoundwise.com/api/publishers/replaceOrCreate',
            body: {
              publisherId,
              name,
              paypalEmail,
              updatedAt: date,
              createdAt: date,
            },
            json: true,
          };
          console.log(JSON.parse(res));
          if (JSON.parse(res).exists) {
            options.method = 'PUT';
            request(options)
              .then(res => {})
              .catch(err => {
                console.log(`error posting ${publisherId}`);
                // console.log(err);
              });
          } else {
            options.method = 'POST';
            request(options)
              .then(res => {})
              .catch(err => {
                console.log(`error posting ${publisherId}`);
                // console.log(err);
              });
          }
        });
      })
      .catch(err => console.log(err));
  }
};
// set likes
var id = 1535352228402;
var list = Array.from(Array(611).keys());

list.forEach(async i => {
  await firebase
    .database()
    .ref(`episodes/1535753699165e/likes/web-${id + i}`)
    .set(Number(moment().format('X')) + i + 100);
});

processPublishers();
// reset user password
firebase
  .auth()
  .updateUser('kmGFGvpJqgaYYPMfNdrfywMIgxi2', {
    email: 'ameenaramjohn@hotmail.com',
    password: '111111',
  })
  .then(userRecord => {
    console.log(userRecord.toJSON());
  })
  .catch(err => {
    console.log(err);
  });

// edit publisher
// var options, publisherId, name, paypalEmail;
// var date = moment().format();
// const ids = ['1503002103690p'];
// var processPublishers = async () => {
//   for (const id of ids) {
//     const process = await firebase
//       .database()
//       .ref(`publishers/${id}`)
//       .once('value')
//       .then(snapshot => {
//         const publisher = snapshot.val();
//         publisherId = id;
//         name = snapshot.val().name;
//         paypalEmail = snapshot.val().email;
//         request(
//           `https://mysoundwise.com/api/publishers/${publisherId}/exists`
//         ).then(res => {
//           options = {
//             uri: 'https://mysoundwise.com/api/publishers/replaceOrCreate',
//             body: {
//               publisherId,
//               name,
//               paypalEmail,
//               updatedAt: date,
//               createdAt: date,
//             },
//             json: true,
//           };
//           console.log(JSON.parse(res));
//           if (JSON.parse(res).exists) {
//             options.method = 'PUT';
//             request(options)
//               .then(res => {})
//               .catch(err => {
//                 console.log(`error posting ${publisherId}`);
//                 // console.log(err);
//               });
//           } else {
//             options.method = 'POST';
//             request(options)
//               .then(res => {})
//               .catch(err => {
//                 console.log(`error posting ${publisherId}`);
//                 // console.log(err);
//               });
//           }
//         });
//       })
//       .catch(err => console.log(err));
//   }
// };

// processPublishers();

// retrieve stripe product
// stripe.products.retrieve(
//   "prod_D3nYV0LbBizW8s",{stripe_account: 'acct_1Bdla1BEkT8zqJaI'}, function(err, product) {
//     if(err) console.log(err);
//     console.log(product);
//   }
// );

// Add subscribed soundcasts to user
// var userId = 'KAyqJEcOfwhculAwxIHPoQLtbIi2';
// var soundcastsIncluded = [
//   '1531419211997s',
//   '1531441638240s',
//   '1531459034687s',
//   '1531496828981s',
//   '1531502612113s'];
// var subscribedObj = {
//   billingCycle: 'one time',
//   subscribed: true,
//   date_subscribed: 1531755224,
//   current_period_end: 4638902400
// };

// soundcastsIncluded.forEach(soundcastId => {
//   firebase.database().ref(`users/${userId}/soundcasts/${soundcastId}`)
//   .set(subscribedObj);
//   firebase.database().ref(`soundcasts/${soundcastId}/subscribed/${userId}`)
//   .set('1531755224');
// });
// firebase.database().ref(`soundcasts/1531504770898s/subscribed/${userId}`)
// .set('1531755224');

// Compile iTunes category ID list
// const util = require('util')
// const categories = {
//     "1301": {
//         "name": "Arts",
//         "id": "1301",
//         "url": "https://itunes.apple.com/us/genre/podcasts-arts/id1301?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1301/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1301/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1301/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1301/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1301/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1301/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1301&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1301&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1301&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1301&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1301&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1301&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1306": {
//                 "name": "Food",
//                 "id": "1306",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-arts-food/id1306?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1306/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1306/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1306/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1306/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1306/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1306/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1306&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1306&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1306&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1306&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1306&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1306&name=VideoPodcasts"
//                 }
//             },
//             "1401": {
//                 "name": "Literature",
//                 "id": "1401",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-arts-literature/id1401?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1401/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1401/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1401/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1401/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1401/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1401/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1401&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1401&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1401&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1401&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1401&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1401&name=VideoPodcasts"
//                 }
//             },
//             "1402": {
//                 "name": "Design",
//                 "id": "1402",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-arts-design/id1402?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1402/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1402/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1402/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1402/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1402/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1402/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1402&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1402&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1402&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1402&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1402&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1402&name=VideoPodcasts"
//                 }
//             },
//             "1405": {
//                 "name": "Performing Arts",
//                 "id": "1405",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-arts-performing-arts/id1405?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1405/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1405/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1405/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1405/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1405/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1405/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1405&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1405&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1405&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1405&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1405&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1405&name=VideoPodcasts"
//                 }
//             },
//             "1406": {
//                 "name": "Visual Arts",
//                 "id": "1406",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-arts-visual-arts/id1406?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1406/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1406/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1406/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1406/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1406/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1406/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1406&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1406&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1406&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1406&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1406&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1406&name=VideoPodcasts"
//                 }
//             },
//             "1459": {
//                 "name": "Fashion & Beauty",
//                 "id": "1459",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-arts-fashion-beauty/id1459?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1459/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1459/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1459/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1459/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1459/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1459/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1459&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1459&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1459&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1459&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1459&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1459&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1303": {
//         "name": "Comedy",
//         "id": "1303",
//         "url": "https://itunes.apple.com/us/genre/podcasts-comedy/id1303?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1303/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1303/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1303/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1303/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1303/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1303/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1303&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1303&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1303&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1303&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1303&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1303&name=VideoPodcasts"
//         }
//     },
//     "1304": {
//         "name": "Education",
//         "id": "1304",
//         "url": "https://itunes.apple.com/us/genre/podcasts-education/id1304?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1304/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1304/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1304/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1304/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1304/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1304/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1304&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1304&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1304&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1304&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1304&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1304&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1415": {
//                 "name": "K-12",
//                 "id": "1415",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-education-k-12/id1415?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1415/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1415/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1415/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1415/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1415/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1415/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1415&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1415&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1415&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1415&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1415&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1415&name=VideoPodcasts"
//                 }
//             },
//             "1416": {
//                 "name": "Higher Education",
//                 "id": "1416",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-education-higher-education/id1416?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1416/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1416/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1416/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1416/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1416/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1416/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1416&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1416&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1416&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1416&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1416&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1416&name=VideoPodcasts"
//                 }
//             },
//             "1468": {
//                 "name": "Educational Technology",
//                 "id": "1468",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-education-educational-technology/id1468?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1468/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1468/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1468/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1468/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1468/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1468/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1468&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1468&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1468&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1468&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1468&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1468&name=VideoPodcasts"
//                 }
//             },
//             "1469": {
//                 "name": "Language Courses",
//                 "id": "1469",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-education-language-courses/id1469?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1469/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1469/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1469/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1469/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1469/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1469/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1469&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1469&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1469&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1469&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1469&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1469&name=VideoPodcasts"
//                 }
//             },
//             "1470": {
//                 "name": "Training",
//                 "id": "1470",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-education-training/id1470?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1470/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1470/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1470/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1470/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1470/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1470/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1470&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1470&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1470&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1470&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1470&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1470&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1305": {
//         "name": "Kids & Family",
//         "id": "1305",
//         "url": "https://itunes.apple.com/us/genre/podcasts-kids-family/id1305?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1305/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1305/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1305/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1305/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1305/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1305/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1305&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1305&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1305&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1305&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1305&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1305&name=VideoPodcasts"
//         }
//     },
//     "1307": {
//         "name": "Health",
//         "id": "1307",
//         "url": "https://itunes.apple.com/us/genre/podcasts-health/id1307?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1307/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1307/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1307/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1307/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1307/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1307/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1307&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1307&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1307&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1307&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1307&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1307&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1417": {
//                 "name": "Fitness & Nutrition",
//                 "id": "1417",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-health-fitness-nutrition/id1417?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1417/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1417/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1417/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1417/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1417/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1417/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1417&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1417&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1417&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1417&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1417&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1417&name=VideoPodcasts"
//                 }
//             },
//             "1420": {
//                 "name": "Self-Help",
//                 "id": "1420",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-health-self-help/id1420?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1420/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1420/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1420/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1420/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1420/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1420/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1420&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1420&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1420&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1420&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1420&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1420&name=VideoPodcasts"
//                 }
//             },
//             "1421": {
//                 "name": "Sexuality",
//                 "id": "1421",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-health-sexuality/id1421?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1421/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1421/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1421/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1421/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1421/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1421/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1421&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1421&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1421&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1421&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1421&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1421&name=VideoPodcasts"
//                 }
//             },
//             "1481": {
//                 "name": "Alternative Health",
//                 "id": "1481",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-health-alternative-health/id1481?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1481/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1481/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1481/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1481/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1481/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1481/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1481&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1481&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1481&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1481&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1481&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1481&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1309": {
//         "name": "TV & Film",
//         "id": "1309",
//         "url": "https://itunes.apple.com/us/genre/podcasts-tv-film/id1309?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1309/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1309/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1309/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1309/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1309/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1309/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1309&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1309&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1309&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1309&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1309&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1309&name=VideoPodcasts"
//         }
//     },
//     "1310": {
//         "name": "Music",
//         "id": "1310",
//         "url": "https://itunes.apple.com/us/genre/podcasts-music/id1310?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1310/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1310/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1310/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1310/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1310/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1310/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1310&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1310&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1310&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1310&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1310&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1310&name=VideoPodcasts"
//         }
//     },
//     "1311": {
//         "name": "News & Politics",
//         "id": "1311",
//         "url": "https://itunes.apple.com/us/genre/podcasts-news-politics/id1311?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1311/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1311/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1311/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1311/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1311/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1311/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1311&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1311&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1311&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1311&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1311&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1311&name=VideoPodcasts"
//         }
//     },
//     "1314": {
//         "name": "Religion & Spirituality",
//         "id": "1314",
//         "url": "https://itunes.apple.com/us/genre/podcasts-religion-spirituality/id1314?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1314/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1314/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1314/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1314/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1314/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1314/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1314&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1314&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1314&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1314&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1314&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1314&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1438": {
//                 "name": "Buddhism",
//                 "id": "1438",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-religion-spirituality-buddhism/id1438?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1438/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1438/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1438/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1438/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1438/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1438/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1438&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1438&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1438&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1438&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1438&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1438&name=VideoPodcasts"
//                 }
//             },
//             "1439": {
//                 "name": "Christianity",
//                 "id": "1439",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-religion-spirituality-christianity/id1439?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1439/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1439/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1439/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1439/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1439/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1439/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1439&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1439&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1439&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1439&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1439&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1439&name=VideoPodcasts"
//                 }
//             },
//             "1440": {
//                 "name": "Islam",
//                 "id": "1440",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-religion-spirituality-islam/id1440?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1440/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1440/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1440/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1440/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1440/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1440/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1440&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1440&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1440&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1440&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1440&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1440&name=VideoPodcasts"
//                 }
//             },
//             "1441": {
//                 "name": "Judaism",
//                 "id": "1441",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-religion-spirituality-judaism/id1441?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1441/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1441/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1441/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1441/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1441/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1441/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1441&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1441&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1441&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1441&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1441&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1441&name=VideoPodcasts"
//                 }
//             },
//             "1444": {
//                 "name": "Spirituality",
//                 "id": "1444",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-religion-spirituality-spirituality/id1444?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1444/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1444/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1444/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1444/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1444/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1444/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1444&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1444&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1444&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1444&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1444&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1444&name=VideoPodcasts"
//                 }
//             },
//             "1463": {
//                 "name": "Hinduism",
//                 "id": "1463",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-religion-spirituality-hinduism/id1463?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1463/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1463/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1463/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1463/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1463/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1463/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1463&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1463&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1463&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1463&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1463&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1463&name=VideoPodcasts"
//                 }
//             },
//             "1464": {
//                 "name": "Other",
//                 "id": "1464",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-religion-spirituality-other/id1464?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1464/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1464/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1464/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1464/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1464/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1464/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1464&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1464&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1464&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1464&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1464&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1464&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1315": {
//         "name": "Science & Medicine",
//         "id": "1315",
//         "url": "https://itunes.apple.com/us/genre/podcasts-science-medicine/id1315?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1315/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1315/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1315/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1315/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1315/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1315/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1315&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1315&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1315&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1315&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1315&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1315&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1477": {
//                 "name": "Natural Sciences",
//                 "id": "1477",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-science-medicine-natural-sciences/id1477?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1477/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1477/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1477/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1477/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1477/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1477/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1477&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1477&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1477&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1477&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1477&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1477&name=VideoPodcasts"
//                 }
//             },
//             "1478": {
//                 "name": "Medicine",
//                 "id": "1478",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-science-medicine-medicine/id1478?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1478/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1478/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1478/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1478/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1478/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1478/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1478&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1478&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1478&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1478&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1478&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1478&name=VideoPodcasts"
//                 }
//             },
//             "1479": {
//                 "name": "Social Sciences",
//                 "id": "1479",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-science-medicine-social-sciences/id1479?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1479/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1479/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1479/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1479/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1479/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1479/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1479&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1479&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1479&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1479&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1479&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1479&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1316": {
//         "name": "Sports & Recreation",
//         "id": "1316",
//         "url": "https://itunes.apple.com/us/genre/podcasts-sports-recreation/id1316?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1316/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1316/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1316/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1316/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1316/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1316/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1316&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1316&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1316&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1316&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1316&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1316&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1456": {
//                 "name": "Outdoor",
//                 "id": "1456",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-sports-recreation-outdoor/id1456?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1456/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1456/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1456/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1456/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1456/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1456/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1456&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1456&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1456&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1456&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1456&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1456&name=VideoPodcasts"
//                 }
//             },
//             "1465": {
//                 "name": "Professional",
//                 "id": "1465",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-sports-recreation-professional/id1465?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1465/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1465/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1465/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1465/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1465/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1465/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1465&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1465&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1465&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1465&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1465&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1465&name=VideoPodcasts"
//                 }
//             },
//             "1466": {
//                 "name": "College & High School",
//                 "id": "1466",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-sports-recreation-college-high-school/id1466?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1466/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1466/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1466/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1466/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1466/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1466/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1466&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1466&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1466&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1466&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1466&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1466&name=VideoPodcasts"
//                 }
//             },
//             "1467": {
//                 "name": "Amateur",
//                 "id": "1467",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-sports-recreation-amateur/id1467?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1467/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1467/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1467/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1467/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1467/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1467/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1467&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1467&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1467&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1467&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1467&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1467&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1318": {
//         "name": "Technology",
//         "id": "1318",
//         "url": "https://itunes.apple.com/us/genre/podcasts-technology/id1318?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1318/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1318/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1318/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1318/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1318/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1318/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1318&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1318&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1318&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1318&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1318&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1318&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1446": {
//                 "name": "Gadgets",
//                 "id": "1446",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-technology-gadgets/id1446?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1446/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1446/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1446/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1446/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1446/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1446/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1446&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1446&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1446&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1446&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1446&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1446&name=VideoPodcasts"
//                 }
//             },
//             "1448": {
//                 "name": "Tech News",
//                 "id": "1448",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-technology-tech-news/id1448?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1448/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1448/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1448/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1448/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1448/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1448/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1448&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1448&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1448&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1448&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1448&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1448&name=VideoPodcasts"
//                 }
//             },
//             "1450": {
//                 "name": "Podcasting",
//                 "id": "1450",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-technology-podcasting/id1450?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1450/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1450/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1450/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1450/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1450/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1450/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1450&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1450&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1450&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1450&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1450&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1450&name=VideoPodcasts"
//                 }
//             },
//             "1480": {
//                 "name": "Software How-To",
//                 "id": "1480",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-technology-software-how-to/id1480?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1480/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1480/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1480/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1480/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1480/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1480/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1480&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1480&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1480&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1480&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1480&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1480&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1321": {
//         "name": "Business",
//         "id": "1321",
//         "url": "https://itunes.apple.com/us/genre/podcasts-business/id1321?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1321/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1321/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1321/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1321/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1321/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1321/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1321&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1321&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1321&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1321&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1321&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1321&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1410": {
//                 "name": "Careers",
//                 "id": "1410",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-business-careers/id1410?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1410/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1410/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1410/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1410/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1410/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1410/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1410&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1410&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1410&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1410&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1410&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1410&name=VideoPodcasts"
//                 }
//             },
//             "1412": {
//                 "name": "Investing",
//                 "id": "1412",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-business-investing/id1412?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1412/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1412/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1412/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1412/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1412/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1412/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1412&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1412&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1412&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1412&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1412&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1412&name=VideoPodcasts"
//                 }
//             },
//             "1413": {
//                 "name": "Management & Marketing",
//                 "id": "1413",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-business-management-marketing/id1413?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1413/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1413/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1413/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1413/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1413/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1413/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1413&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1413&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1413&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1413&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1413&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1413&name=VideoPodcasts"
//                 }
//             },
//             "1471": {
//                 "name": "Business News",
//                 "id": "1471",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-business-business-news/id1471?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1471/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1471/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1471/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1471/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1471/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1471/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1471&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1471&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1471&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1471&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1471&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1471&name=VideoPodcasts"
//                 }
//             },
//             "1472": {
//                 "name": "Shopping",
//                 "id": "1472",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-business-shopping/id1472?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1472/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1472/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1472/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1472/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1472/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1472/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1472&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1472&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1472&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1472&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1472&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1472&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1323": {
//         "name": "Games & Hobbies",
//         "id": "1323",
//         "url": "https://itunes.apple.com/us/genre/podcasts-games-hobbies/id1323?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1323/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1323/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1323/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1323/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1323/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1323/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1323&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1323&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1323&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1323&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1323&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1323&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1404": {
//                 "name": "Video Games",
//                 "id": "1404",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-games-hobbies-video-games/id1404?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1404/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1404/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1404/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1404/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1404/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1404/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1404&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1404&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1404&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1404&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1404&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1404&name=VideoPodcasts"
//                 }
//             },
//             "1454": {
//                 "name": "Automotive",
//                 "id": "1454",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-games-hobbies-automotive/id1454?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1454/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1454/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1454/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1454/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1454/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1454/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1454&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1454&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1454&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1454&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1454&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1454&name=VideoPodcasts"
//                 }
//             },
//             "1455": {
//                 "name": "Aviation",
//                 "id": "1455",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-games-hobbies-aviation/id1455?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1455/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1455/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1455/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1455/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1455/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1455/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1455&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1455&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1455&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1455&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1455&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1455&name=VideoPodcasts"
//                 }
//             },
//             "1460": {
//                 "name": "Hobbies",
//                 "id": "1460",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-games-hobbies-hobbies/id1460?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1460/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1460/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1460/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1460/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1460/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1460/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1460&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1460&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1460&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1460&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1460&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1460&name=VideoPodcasts"
//                 }
//             },
//             "1461": {
//                 "name": "Other Games",
//                 "id": "1461",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-games-hobbies-other-games/id1461?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1461/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1461/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1461/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1461/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1461/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1461/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1461&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1461&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1461&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1461&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1461&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1461&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1324": {
//         "name": "Society & Culture",
//         "id": "1324",
//         "url": "https://itunes.apple.com/us/genre/podcasts-society-culture/id1324?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1324/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1324/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1324/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1324/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1324/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1324/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1324&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1324&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1324&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1324&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1324&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1324&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1302": {
//                 "name": "Personal Journals",
//                 "id": "1302",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-society-culture-personal-journals/id1302?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1302/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1302/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1302/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1302/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1302/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1302/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1302&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1302&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1302&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1302&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1302&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1302&name=VideoPodcasts"
//                 }
//             },
//             "1320": {
//                 "name": "Places & Travel",
//                 "id": "1320",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-society-culture-places-travel/id1320?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1320/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1320/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1320/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1320/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1320/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1320/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1320&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1320&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1320&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1320&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1320&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1320&name=VideoPodcasts"
//                 }
//             },
//             "1443": {
//                 "name": "Philosophy",
//                 "id": "1443",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-society-culture-philosophy/id1443?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1443/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1443/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1443/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1443/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1443/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1443/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1443&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1443&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1443&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1443&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1443&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1443&name=VideoPodcasts"
//                 }
//             },
//             "1462": {
//                 "name": "History",
//                 "id": "1462",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1462/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1462/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1462/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1462/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1462/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1462/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1462&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1462&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1462&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1462&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1462&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1462&name=VideoPodcasts"
//                 }
//             }
//         }
//     },
//     "1325": {
//         "name": "Government & Organizations",
//         "id": "1325",
//         "url": "https://itunes.apple.com/us/genre/podcasts-government-organizations/id1325?mt=2",
//         "rssUrls": {
//             "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1325/json",
//             "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1325/json",
//             "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1325/json",
//             "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1325/json",
//             "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1325/json",
//             "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1325/json"
//         },
//         "chartUrls": {
//             "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1325&name=VideoPodcastEpisodes",
//             "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1325&name=Podcasts",
//             "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1325&name=AudioPodcastEpisodes",
//             "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1325&name=AudioPodcasts",
//             "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1325&name=PodcastEpisodes",
//             "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1325&name=VideoPodcasts"
//         },
//         "subgenres": {
//             "1473": {
//                 "name": "National",
//                 "id": "1473",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-national/id1473?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1473/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1473/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1473/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1473/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1473/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1473/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1473&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1473&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1473&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1473&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1473&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1473&name=VideoPodcasts"
//                 }
//             },
//             "1474": {
//                 "name": "Regional",
//                 "id": "1474",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-regional/id1474?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1474/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1474/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1474/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1474/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1474/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1474/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1474&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1474&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1474&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1474&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1474&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1474&name=VideoPodcasts"
//                 }
//             },
//             "1475": {
//                 "name": "Local",
//                 "id": "1475",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-local/id1475?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1475/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1475/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1475/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1475/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1475/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1475/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1475&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1475&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1475&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1475&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1475&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1475&name=VideoPodcasts"
//                 }
//             },
//             "1476": {
//                 "name": "Non-Profit",
//                 "id": "1476",
//                 "url": "https://itunes.apple.com/us/genre/podcasts-non-profit/id1476?mt=2",
//                 "rssUrls": {
//                     "topVideoPodcastEpisodes": "https://itunes.apple.com/us/rss/topvideopodcastepisodes/genre=1476/json",
//                     "topAudioPodcasts": "https://itunes.apple.com/us/rss/topaudiopodcasts/genre=1476/json",
//                     "topVideoPodcasts": "https://itunes.apple.com/us/rss/topvideopodcasts/genre=1476/json",
//                     "topPodcasts": "https://itunes.apple.com/us/rss/toppodcasts/genre=1476/json",
//                     "topAudioPodcastEpisodes": "https://itunes.apple.com/us/rss/topaudiopodcastepisodes/genre=1476/json",
//                     "topPodcastEpisodes": "https://itunes.apple.com/us/rss/toppodcastepisodes/genre=1476/json"
//                 },
//                 "chartUrls": {
//                     "videoPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1476&name=VideoPodcastEpisodes",
//                     "podcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1476&name=Podcasts",
//                     "audioPodcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1476&name=AudioPodcastEpisodes",
//                     "audioPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1476&name=AudioPodcasts",
//                     "podcastEpisodes": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1476&name=PodcastEpisodes",
//                     "videoPodcasts": "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/charts?cc=us&g=1476&name=VideoPodcasts"
//                 }
//             }
//         }
//     }
// };

// const categories_converted = {};
// let subCategories = {};
// for(var key in categories) {
//   subCategories = {};
//   for(var subKey in categories[key].subgenres) {
//     subCategories[subKey] = {
//       name: categories[key].subgenres[subKey].name,
//       id: subKey
//     }
//   }
//   categories_converted[key] = {
//     name: categories[key].name,
//     subCategories,
//     id: key
//   }
// }
// console.log(util.inspect(categories_converted, false, null))

// *** adding parentId to child comments in firebase
// const commentsRef = firebase.database().ref('/comments');

// commentsRef.on('child_added', comment => {
//   const commentObj = comment.val();
//   const commentId = comment.key;
//   const parsedIDs = commentId.split('-');
//   let parentId;
//   if(parsedIDs.length == 3) {
//     parentId = parsedIDs[1];
//   }
//   if(parentId) {
//     firebase.database().ref(`/comments/${commentId}/parentId`).set(parentId);
//   }
// });

// *** Move messages from under soundcasts to messages node in firebase
// const soundcastsRef = firebase.database().ref('/soundcasts');
// const messagesRef = firebase.database().ref('/messages');
// var newMessageId;
// soundcastsRef.on('child_added', soundcast => {
//   const soundcastObj = soundcast.val();
//   const soundcastId = soundcast.key;
//   if(soundcastObj.announcements) {
//     // console.log(Object.keys(soundcastObj.announcements));
//     for(var key in soundcastObj.announcements) {
//       const {content, creatorID, date_created, id, isPublished, publisherID, soundcastID} = soundcastObj.announcements[key];
//       // firebase.database().ref(`/messages/${key}`).once('value', snapshot => {
//       //   if(!snapshot.val()) { // if data doesn't already exist

//           firebase.database().ref(`/messages/${key}`).set({content, creatorID, date_created, id, isPublished, publisherID, soundcastID});
//       //   }
//       // })
//     }
//   }
// });

// *** fixing listeningSession date format
// const options = {
//   method: 'GET',
//   uri: 'https://mysoundwise.com/api/listeningSessions'
// };
// let newSession, newOption;

// request(options)
// .then(data => {
//   // console.log(data);
//   JSON.parse(data).forEach(session => {
//     if(session.date.length > 10) {
//       newSession = Object.assign({}, session, {date: session.date.slice(0, 10)});
//       newOption = {
//         method: 'PUT',
//         uri: `https://mysoundwise.com/api/listeningSessions/${session.sessionId}`,
//         json: newSession
//       };
//       request(newOption).
//       then(data => {console.log('session changed')})
//       .catch(err => console.log(err));
//     }
//   });
// });

// *** create new email list in sendgrid
// var sgMail = require('@sendgrid/mail');
// var sendGridApiKey = require('../config').sendGridApiKey;
// sgMail.setApiKey(sendGridApiKey);
// var client = require('@sendgrid/client');
// client.setApiKey(sendGridApiKey);

// let listId;
// const data1 = {
//   method: 'POST',
//   url: '/v3/contactdb/lists',
//   body: {'name': `podcast-conversion-course`},
// };
// client.request(data1)
// .then(([response, body]) => {
//   listId = body.id;
//   console.log(listId); // 3921133
// });

// *** save soundcast and episodes in database ***

// const soundcastId = '1514433422681s';
// firebase.database().ref(`soundcasts/${soundcastId}`)
// .once('value')
// .then(snapshot => {
//   const soundcast = {
//     soundcastId,
//     publisherId: snapshot.val().publisherID,
//     title: snapshot.val().title,
//   };
//   request.post('https://mysoundwise.com/api/soundcast', {form: soundcast}, (err, response, body) => {
//     console.log('response: ', response.statusCode);
//     if (response.statusCode == 200) {
//       const episodes = Object.keys(snapshot.val().episodes);
//       const promises = episodes.map(episodeID => {
//         return firebase.database().ref(`episodes/${episodeID}`)
//         .once('value')
//         .then(episodeSnapshot => {
//           const episodeObj = {
//             episodeId: episodeID,
//             soundcastId,
//             publisherId: soundcast.publisherId,
//             title: episodeSnapshot.val().title,
//             soundcastTitle: soundcast.title,
//           };
//           request.post('https://mysoundwise.com/api/episode', {form: episodeObj}, (err, response, body) => {
//             if (err) {
//               console.log(err);
//             }
//             console.log(`${episodeID} posted`);
//           });
//         });
//       });
//       Promise.all(promises)
//       .then(() => console.log('episodes posted'))
//       .catch(err => console.log(err));
//     }
//   });
// });

// *** move courses to soundcasts ***

// let id = Number(moment().format('x'));
// firebase.database().ref('courses/125')
// .once('value').then(snapshot => {
//   const sections = snapshot.val().sections;
//   const promises = sections.map((section, i) => {
//     const sectionParts = section.run_time.split(':');
//     const episodeObj = {
//       title: section.title,
//       date_created: moment().format('X'),
//       creatorID: 'uiG3uVUIdfZrDq4FLYs9YO40A0D2',
//       publisherID: '1503002103690p',
//       url: section.section_url,
//       duration: Number(sectionParts[0]) * 60 + Number(sectionParts[1]),  // duration is in seconds
//       publicEpisode: false,
//       soundcastID: '1514430398074s',
//       isPublished: true,
//       index: sections.length - i,
//     };
//     firebase.database().ref(`episodes/${id}e`)
//     .set(episodeObj);

//     firebase.database().ref(`soundcasts/1514430398074s/episodes/${id}e`)
//     .set(true);
//     console.log(`${id}e saved`);
//     id += 5;
//   });
// });

// *** update stripe connected account ***

// var stripe_key =  require('../config').stripe_key;
// var stripe = require('stripe')(stripe_key);

// stripe.accounts.update('acct_1Bdla1BEkT8zqJaI', {
//   'metadata': {
//     'publisherId': '1506441305461p',
//   },
//   'payout_statement_descriptor': 'Soundwise transfer',
// });
