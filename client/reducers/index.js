import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import * as types from '../actions/types';
import * as _ from 'lodash';

function user(
  state = {
    userInfo: {
      soundcasts_managed: {},
      soundcasts: {},
    },
    isLoggedIn: '',
    isEmailSent: false,
    content_saved: {},
    defaultSoundcastAdded: false,
  },
  action
) {
  const newState = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    case types.SIGNUP:
      let newSignupUser = action.payload;
      if (state.userInfo.id === action.payload.id) {
        newSignupUser = Object.assign({}, state.userInfo, action.payload);
      }
      return {
        ...state,
        userInfo: newSignupUser,
        isLoggedIn: true,
      };
    case types.SIGNIN:
      const newUser = Object.assign({}, state.userInfo, action.payload);
      return {
        ...state,
        userInfo: newUser,
        isLoggedIn: true,
      };
    case types.SIGNOUT:
      return {
        ...state,
        isLoggedIn: false,
      };
    case types.DEFAULT_SOUNDCAST_ADDED:
      return {
        ...state,
        defaultSoundcastAdded: true,
      };
    case types.ADD_MANAGED_SOUNDCASTS:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          soundcasts_managed: action.payload,
        },
      };
    case types.EMAIL_SENT:
      return {
        ...state,
        isEmailSent: action.payload,
      };
    case types.EDIT_MANAGED_SOUNDCAST:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          soundcasts_managed: {
            ...state.userInfo.soundcasts_managed,
            [action.payload.id]: action.payload,
          },
        },
      };
    case types.ADD_SUBSCRIPTIONS:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          subscriptions: action.payload,
        },
      };
    case types.EDIT_SUBSCRIPTION:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          subscriptions: {
            ...state.userInfo.subscriptions,
            [action.payload.id]: action.payload,
          },
        },
      };
    case types.ADD_EPISODES:
      action.payload.map(episode => {
        if (newState.userInfo.soundcasts_managed[episode.soundcastID]) {
          newState.userInfo.soundcasts_managed[episode.soundcastID].episodes[episode.id] = episode;
        }
        if (newState.userInfo.subscriptions[episode.soundcastID]) {
          newState.userInfo.subscriptions[episode.soundcastID].episodes[episode.id] = episode;
        }
      });
      return newState;
    case types.EDIT_EPISODE:
      if (newState.userInfo.soundcasts_managed[action.payload.soundcastID]) {
        newState.userInfo.soundcasts_managed[action.payload.soundcastID].episodes[
          episode.id
        ] = episode;
      }
      if (newState.userInfo.subscriptions[action.payload.soundcastID]) {
        newState.userInfo.subscriptions[action.payload.soundcastID].episodes[episode.id] = episode;
      }
      return newState;
    case types.CONTENT_SAVED:
      const content_saved = state.content_saved;
      return {
        ...state,
        content_saved: Object.assign({}, content_saved, action.payload),
      };
    default:
      return state;
  }
}

function categories(
  state = {
    categories: {},
  },
  action
) {
  switch (action.type) {
    case types.SUBSCRIBE_TO_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
      };
    default:
      return state;
  }
}

function setPlayer(
  state = {
    playerLaunched: false,
    speed: 1,
  },
  action
) {
  switch (action.type) {
    case types.PLAYER:
      return {
        ...state,
        playerLaunched: action.payload,
      };
    case types.CHANGE_SPEED:
      return {
        ...state,
        speed: action.payload,
      };
    default:
      return state;
  }
}

function setCurrentSection(
  state = {
    currentSection: {},
    playing: false,
  },
  action
) {
  switch (action.type) {
    case types.CURRENT_SECTION:
      return {
        ...state,
        currentSection: action.payload,
      };
    case types.CHANGE_PLAYSTATUS:
      const newStatus = !state.playing;
      return {
        ...state,
        playing: action.payload,
      };
    default:
      return state;
  }
}

function setCourses(
  state = {
    courses: {},
    currentCourse: {
      teachers: [],
    },
    userCourses: {},
    currentPlaylist: [],
    currentTime: 0,
    currentDuration: 1,
  },
  action
) {
  switch (action.type) {
    case types.COURSES:
      return {
        ...state,
        courses: action.payload,
      };
    case types.USER_COURSES:
      return {
        ...state,
        userCourses: action.payload,
      };
    case types.CURRENT_COURSE:
      return {
        ...state,
        currentCourse: action.payload,
      };
    case types.PLAYLIST:
      return {
        ...state,
        currentPlaylist: action.payload,
      };
    case types.CURRENT_PROGRESS:
      return {
        ...state,
        currentTime: action.payload.currentTime,
        currentDuration: action.payload.duration,
      };
    default:
      return state;
  }
}

function reviewBox(
  state = {
    reviewFormOpen: false,
  },
  action
) {
  switch (action.type) {
    case types.OPEN_REVIEWBOX:
      return {
        ...state,
        reviewFormOpen: true,
      };
    case types.CLOSE_REVIEWBOX:
      return {
        ...state,
        reviewFormOpen: false,
      };
    default:
      return state;
  }
}

function signupBox(
  state = {
    signupFormOpen: false,
    confirmationBoxOpen: false,
  },
  action
) {
  switch (action.type) {
    case types.OPEN_SIGNUPBOX:
      return {
        ...state,
        signupFormOpen: true,
      };
    case types.CLOSE_SIGNUPBOX:
      return {
        ...state,
        signupFormOpen: false,
      };
    case types.OPEN_CONFIRMATIONBOX:
      return {
        ...state,
        confirmationBoxOpen: true,
      };
    case types.CLOSE_CONFIRMATIONBOX:
      return {
        ...state,
        confirmationBoxOpen: false,
      };
    default:
      return state;
  }
}

function checkoutProcess(
  state = {
    shoppingCart: [],
  },
  action
) {
  switch (action.type) {
    case types.ADDTOCART:
      let _cart = JSON.parse(JSON.stringify(state.shoppingCart));
      const courseInCart = _.find(_cart, { id: action.payload.id });
      if (!courseInCart) {
        _cart.push(action.payload);
        let _newState = {
          ...state,
          shoppingCart: _cart,
        };
        return _newState;
      } else {
        return state;
      }
      break;
    case types.DELETE_FROM_CART:
      const newCart = JSON.parse(JSON.stringify(state.shoppingCart));
      _.remove(newCart, course => course.id === action.payload.id);
      return {
        ...state,
        shoppingCart: newCart,
      };
    case types.DELETE_ALL:
      return {
        ...state,
        shoppingCart: [],
      };
    default:
      return state;
  }
}

function setFeedVerified(
  state = {
    feedVerified: false,
  },
  action
) {
  switch (action.type) {
    case types.FEED_VERIFIED:
      return {
        ...state,
        feedVerified: action.payload,
      };
      break;
    default:
      return state;
  }
}

function setChargeState(
  state = {
    chargeState: null,
  },
  action
) {
  switch (action.type) {
    case types.CHARGE_STATE:
      return {
        ...state,
        chargeState: action.payload,
      };
      break;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  setCourses,
  setPlayer,
  setCurrentSection,
  routing,
  signupBox,
  reviewBox,
  user,
  categories,
  checkoutProcess,
  setFeedVerified,
  setChargeState,
});

export default rootReducer;
