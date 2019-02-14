import * as types from './types';
import * as firebase from 'firebase';

export function handleContentSaving(id, saved) {
  return {
    type: types.CONTENT_SAVED,
    payload: { [id]: true },
  };
}

export function addDefaultSoundcast() {
  return {
    type: types.DEFAULT_SOUNDCAST_ADDED,
    payload: true,
  };
}

export function signupUser(user) {
  return {
    type: types.SIGNUP,
    payload: user,
  };
}

export function signinUser(user) {
  return {
    type: types.SIGNIN,
    payload: user,
  };
}

export function sendEmail() {
  return {
    type: types.EMAIL_SENT,
    payload: true,
  };
}

export function signoutUser() {
  return dispatch => {
    if (GoogleAuth) {
      GoogleAuth.signOut();
    }
    //We don't have to wait for google to sign out, lets dispatch the action
    //right away.
    dispatch({
      type: types.SIGNOUT,
    });
  };
}

export function loadCourses(courses) {
  return {
    type: types.COURSES,
    payload: courses,
  };
}

export function loadUserCourses(courses) {
  return {
    type: types.USER_COURSES,
    payload: courses,
  };
}

export function launchPlayer(status) {
  return {
    type: types.PLAYER,
    payload: status,
  };
}

export function setCurrentPlaylist(playlist) {
  return {
    type: types.PLAYLIST,
    payload: playlist,
  };
}

export function setCurrentPlaySection(section) {
  return {
    type: types.CURRENT_SECTION,
    payload: section,
  };
}

export function getCurrentProgress(progress) {
  return {
    type: types.CURRENT_PROGRESS,
    payload: progress,
  };
}

export function changePlayStatus(status) {
  return {
    type: types.CHANGE_PLAYSTATUS,
    payload: status,
  };
}

export function openSignupbox(open) {
  return {
    type: (open === true && types.OPEN_SIGNUPBOX) || (open === false && types.CLOSE_SIGNUPBOX),
  };
}

export function openConfirmationbox(open) {
  return {
    type: (open && types.OPEN_CONFIRMATIONBOX) || types.CLOSE_CONFIRMATIONBOX,
  };
}

export function setCurrentCourse(course) {
  return {
    type: types.CURRENT_COURSE,
    payload: course,
  };
}

export function openReviewbox(open) {
  return { type: (open && types.OPEN_REVIEWBOX) || types.CLOSE_REVIEWBOX };
}

export function addCourseToCart(course) {
  return {
    type: types.ADDTOCART,
    payload: course,
  };
}

export function deleteCourseFromCart(course) {
  return {
    type: types.DELETE_FROM_CART,
    payload: course,
  };
}

export function deleteCart() {
  return {
    type: types.DELETE_ALL,
  };
}

export function changeSpeed(value) {
  return {
    type: types.CHANGE_SPEED,
    payload: value,
  };
}

export function setFeedVerified(value) {
  return {
    type: types.FEED_VERIFIED,
    payload: value,
  };
}

export function setChargeState(value) {
  return {
    type: types.CHARGE_STATE,
    payload: value,
  };
}

export function subscribeToCategories() {
  return dispatch => {
    firebase
      .database()
      .ref('categories')
      .on('value', snapshot => {
        let _categories = snapshot.val();
        dispatch({
          type: types.SUBSCRIBE_TO_CATEGORIES,
          payload: _categories,
        });
      });
  };
}
