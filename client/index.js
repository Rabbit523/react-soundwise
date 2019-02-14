import React, { Component } from 'react';
import { render } from 'react-dom';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk'; //check out https://github.com/gaearon/redux-thunk for how to use this
import { applyMiddleware, createStore, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import localForage from 'localforage';
// import { offline } from 'redux-offline';
// import offlineConfig from 'redux-offline/lib/defaults';
import { Provider } from 'react-redux';
import * as firebase from 'firebase';
import Raven from 'raven-js';

import { config } from '../config';
import { Routes } from './routes';

import rootReducer from './reducers';

Raven.config('https://3fbd789e281e40f4bb05c2374e87b9e2@sentry.io/256844').install();

// let createStoreWithMiddleware = applyMiddleware(thunkMiddleware)(createStore)
// let store = createStoreWithMiddleware(rootReducer)
const store = createStore(
  rootReducer,
  {},
  compose(
    applyMiddleware(thunkMiddleware)
    // offline(offlineConfig)
    // autoRehydrate()
  )
);

// const persistor = persistStore(store, {storage: localForage, blacklist: ['setPlayer', 'setCurrentSection']})
// persistor.purge()
// const history = syncHistoryWithStore(browserHistory, store)
// const expiration = new Date(2099, 7, 31);
// const admin = {
//   firstName: 'Denis',
//   lastName: 'Yakovenko',
//   admin: true,
//   publisherID: 'smoeist9oveshvi',
//   soundcasts_managed: {
//     '5a83201c-76bd-11e7-b5a5-be2e44b06b34': true,
//     '35546702-76cb-11e7-b5a5-be2e44b06b34': true,
//   },
//   email: ['denis@me.come'],
//   subscriptions: {
//     '5a83201c-76bd-11e7-b5a5-be2e44b06b34': true,
//     '35546702-76cb-11e7-b5a5-be2e44b06b34': true,
//   },
// };

firebase.initializeApp(config);

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      rehydrated: false,
    };
  }

  componentDidMount() {
    // const reactVersion = React.version;
    // console.log('react: ', reactVersion);
    // console.log(process.env.NODE_ENV);
  }

  render() {
    // if(!this.state.rehydrated) {
    //   return <div>Loading...</div>
    // }
    return (
      <Provider store={store}>
        <Routes />
      </Provider>
    );
  }
}

render(<App />, document.getElementById('root'));
