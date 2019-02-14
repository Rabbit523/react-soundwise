import * as firebase from 'firebase';

export default function unsubscribeUser(userID, soundcastID) {
  firebase
    .database()
    .ref(`users/${userID}/soundcasts/${soundcastID}`)
    .remove();
  firebase
    .database()
    .ref(`soundcasts/${soundcastID}/subscribed/${userID}`)
    .remove();
}
