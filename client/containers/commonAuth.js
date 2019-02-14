import firebase from 'firebase';
import Axios from 'axios';

const signInPassword = async (email, password, sucessCallback, errCallback) => {
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase
          .database()
          .ref(`users/${user.uid}`)
          .once('value')
          .then(snapshot => {
            if (snapshot.val()) {
              sucessCallback(snapshot.val());
            } else {
              errCallback('User not found');
            }
          });
      } else {
        errCallback('Failed to save login info. Please try again later.');
        // Raven.captureMessage('Failed to save login info. Please try again later.');
      }
    });
  } catch (error) {
    errCallback(error);
    console.log(`Error: signInPassword`, error.toString());
  }
};

const provider = new firebase.auth.FacebookAuthProvider();
const signInFacebook = (sucessCallback, errCallback) => {
  // firebase.auth().signInWithRedirect(provider)
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(result => {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      // The signed-in user info.
      const userId = firebase.auth().currentUser.uid;
      firebase
        .database()
        .ref(`users/${userId}`)
        .once('value')
        .then(snapshot => {
          const _user = snapshot.val();
          if (_user && _user.firstName) {
            // if user already exists
            let updates = {};
            updates['/users/' + userId + '/pic_url/'] = _user.pic_url;
            firebase
              .database()
              .ref()
              .update(updates);
            _user.pic_url = _user.photoURL;
            delete _user.photoURL;
          }
          sucessCallback(_user);
        });
    })
    .catch(error => {
      facebookErrorCallback(error, () => {
        // Facebook account successfully linked to the existing Firebase user.
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            firebase
              .database()
              .ref(`users/${user.uid}`)
              .once('value')
              .then(snapshot => sucessCallback(snapshot.val()));
          } else {
            errCallback('signInFacebook error: User saving failed. Please try again later.');
          }
        });
      });
    });
};

const facebookErrorCallback = (error, callback) => {
  // Handle Errors here.
  if (error.code === 'auth/account-exists-with-different-credential') {
    // Step 2.
    // User's email already exists.
    console.log('Error signInFacebook', error);
    // The provider account's email address.
    const email = error.email;
    // Get registered providers for this email.
    firebase
      .auth()
      .fetchProvidersForEmail(email)
      .then(providers => {
        // Step 3.
        // If the user has several providers,
        // the first provider in the list will be the "recommended" provider to use.
        if (providers && providers[0] === 'password') {
          // Asks the user his password.
          // In real scenario, you should handle this asynchronously.
          const password = prompt('Please enter your Soundwise password'); // TODO: implement promptUserForPassword.
          firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(result => {
              // Step 4a.
              // The pending Facebook credential.
              return result && result.user && result.user.linkWithCredential(error.credential);
            })
            .then(callback);
        }
      });
  }
};

const compileUser = async (_user, signinUser) => {
  if (_user.soundcasts_managed && _user.admin) {
    if (_user.publisherID) {
      const snapshot = await firebase
        .database()
        .ref(`publishers/${_user.publisherID}`)
        .once('value');
      if (snapshot.val()) {
        _user.publisher = snapshot.val();
        _user.publisher.id = _user.publisherID;
        if (_user.publisher.administrators) {
          for (const adminId in _user.publisher.administrators) {
            const snapshot = await firebase
              .database()
              .ref(`users/${adminId}`)
              .once('value');
            if (snapshot.val()) {
              _user.publisher.administrators[adminId] = snapshot.val();
            }
          }
        }
      }
    }
    for (const key in _user.soundcasts_managed) {
      const snapshot = await firebase
        .database()
        .ref(`soundcasts/${key}`)
        .once('value');
      if (snapshot.val()) {
        const _soundcast = snapshot.val();
        _user.soundcasts_managed[key] = _soundcast;
        if (_soundcast.episodes) {
          for (const epkey in _soundcast.episodes) {
            const snapshot = await firebase
              .database()
              .ref(`episodes/${epkey}`)
              .once('value');
            if (snapshot.val()) {
              _user.soundcasts_managed[key].episodes[epkey] = snapshot.val();
            }
          }
        }
      }
    }
  }
  if (_user.soundcasts) {
    for (const key in _user.soundcasts) {
      const snapshot = await firebase
        .database()
        .ref(`soundcasts/${key}`)
        .once('value');
      if (snapshot.val()) {
        const _soundcast = snapshot.val();
        _user.soundcasts[key] = _soundcast;
        if (_soundcast.episodes) {
          for (const epkey in _soundcast.episodes) {
            const snapshot = await firebase
              .database()
              .ref(`episodes/${epkey}`)
              .once('value');
            if (snapshot.val()) {
              _user.soundcasts[key].episodes[epkey] = snapshot.val();
            }
          }
        }
      }
    }
  }
  signinUser(_user);
};

const signupCommon = (_user, isAdmin, successCallback) => {
  const firstName = _user.firstName || localStorage.getItem('soundwiseSignupFName');
  const lastName = _user.lastName || localStorage.getItem('soundwiseSignupLName');
  const email = _user.email || localStorage.getItem('soundwiseSignupEmail');
  const picture =
    _user.pic_url || 'https://d1jzcuf08rvzm.cloudfront.net/user_profile_pic_placeholder.png';
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const userId = user.uid;
      const userToSave = {
        id: userId,
        firstName,
        lastName,
        email: { 0: email },
        pic_url: picture,
      };
      // add admin fields
      if (isAdmin) {
        userToSave.admin = true;
        userToSave.publisherID = isAdmin;
      }
      if (localStorage.getItem('soundwiseAffiliateId')) {
        userToSave.referredBy = localStorage.getItem('soundwiseAffiliateId');
      }
      firebase
        .database()
        .ref(`users/${userId}`)
        .once('value')
        .then(userSnapshot => {
          const currentUser = userSnapshot.val() || {};
          firebase
            .database()
            .ref(`users/${userId}`)
            .set(Object.assign({}, currentUser, userToSave));
        });
      Axios.post('/api/user', {
        userId,
        firstName,
        lastName,
        picURL: picture,
      })
        .then(res => {
          console.log('Success signupCommon user save', userToSave);
          successCallback(userToSave);
        })
        .catch(err => {
          console.log('Error signupCommon user saving failed: ', err);
          successCallback(userToSave);
        });
    }
  });
};

export { signInPassword, signInFacebook, facebookErrorCallback, compileUser, signupCommon };
