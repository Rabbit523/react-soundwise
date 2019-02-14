import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';
import 'url-search-params-polyfill'; // URLSearchParams
if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'staging') {
  console.log(`Running "${process.env.NODE_ENV}" mode`);
  window.firebase = firebase;
}
if (!window.localStorage) {
  // localStorage polyfill
  window.localStorage = {
    _data: {},
    setItem: function(id, val) {
      return (this._data[id] = String(val));
    },
    getItem: function(id) {
      return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },
    removeItem: function(id) {
      return delete this._data[id];
    },
    clear: function() {
      return (this._data = {});
    },
  };
}
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
// import Butter from 'buttercms';
// const butter = Butter('4ac51854da790bffc513d38911d2b677c19481f8');
import injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
// injectTapEventPlugin();

import { config, awsConfig } from '../config';
import { loadCourses, subscribeToCategories, signinUser } from './actions/index';

import Page from './components/page';
import { HomePage } from './components/landingpage_main';
import { LandingPagePodcast } from './components/landingpage_podcast';
import { LandingPageSelling } from './components/landingpage_selling_audio';
import { LandingPageYoutube } from './components/landingpage_youtube';
import PageRealEstate from './components/page_realestate';
import ConversionCourse from './components/conversion_course';
import PodcastingCourse from './components/podcasting_course_landing_page';
import PageExperts from './components/page_experts';
import { PricingPage } from './containers/pricing_page';
import { SoundwiseCheckout } from './containers/soundwise_checkout';
import About from './components/about';
import Referral from './components/referral';
import TrialRequest from './components/trialrequest';
import CreatorTerms from './components/creator_terms';
import Privacy from './components/privacy';
import Publisher from './components/publisher';
import Terms from './components/terms_of_use';
import ContentDownload from './components/content_download';
import TermsFreeContent from './components/terms_free_content_May2017';
import { OrderConfirmation } from './components/order_confirmation';
import { Notice } from './components/notice';
import { AppSignup } from './containers/app_signup';
import { AppSignin } from './containers/app_signin';
import SignupOptions from './containers/signup_options';
// import {Courses} from './containers/courses';
// import {MyCourses} from './containers/mycourses';
import { MySoundcasts } from './containers/mysoundcasts';
import { SoundcastPlayingPage } from './containers/soundcast_player/soundcast_playing_page';
import { UserProfile } from './containers/user_profile';
// import { Course } from './containers/course_page';
// import { Staged_Course } from './containers/staged_course_page';
// import { Course_Purchased } from './containers/course_page_purchased';
// import { Cart } from './containers/cart/cart';
// import { Checkout } from './containers/checkout';
import { Dashboard } from './containers/dashboard/dashboard';
import { SoundcastPage } from './containers/soundcast_landing_page/soundcast_page';
import BlogList from './containers/blog/blog-list';
import HelpDocs from './containers/blog/help-docs';
import BlogPost from './containers/blog/blog-post';
import IGPList from './containers/blog/igp-list';
import IGPPost from './containers/blog/igp-post';
import { EpisodePage } from './containers/soundcast_landing_page/components/episode_page';
import { SoundcastCheckout } from './containers/soundcast_landing_page/soundcast_checkout';
import NotFound from './components/page_404';
import PassRecovery from './components/pass_recovery';
import ScrollToTop from './components/scroll_to_top';
import { WaveVideoInputs } from './containers/wave_video_inputs';
import { VideoDemo } from './containers/video_demo.js';
import { YoutubeDemo } from './containers/youtube_conversion_demo.js';

class _Routes extends Component {
  constructor(props) {
    super(props);
    this.cachedUserState = {};
    this.cachedUserStateTimeout = 0;
    props.subscribeToCategories();
    this.updateUserState = this.updateUserState.bind(this);
  }

  updateUserState(_user) {
    // debounce function
    clearTimeout(this.cachedUserStateTimeout);
    this.cachedUserState = Object.assign(this.cachedUserState, _user);
    this.cachedUserStateTimeout = setTimeout(() => {
      this.props.signinUser(JSON.parse(JSON.stringify(this.cachedUserState)));
      this.cachedUserState = {};
    }, 200);
  }

  async componentDidMount() {
    if (window.location.search.includes('?a_id=')) {
      const params = new URLSearchParams(window.location.search);
      localStorage.setItem('soundwiseAffiliateId', params.get('a_id'));
    }
    const that = this;
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        // TODO set global state LOGGED_OUT
        return;
      }

      const userId = user.uid;
      // watch user
      firebase
        .database()
        .ref(`users/${userId}`)
        .on('value', async snapshot => {
          if (!snapshot.val()) {
            // TODO set global state LOGGED_OUT
            return;
          }

          let _user = JSON.parse(JSON.stringify(snapshot.val()));
          // console.log('_user: ', _user);
          that.updateUserState({ ..._user, id: userId });

          let editSoundcastKey; // indicate empty history.state and requiring soundcast download
          if (!window.history.state && window.location.pathname.includes('/dashboard/edit/')) {
            const key = window.location.pathname
              .split('/')[3]
              .split('#')[0]
              .split('?')[0];
            if (key[key.length - 1] === 's') {
              // soundcast
              editSoundcastKey = key;
            }
          }

          if (_user.admin) {
            if (_user.publisherID) {
              firebase
                .database()
                .ref(`publishers/${_user.publisherID}`)
                .on('value', snapshot => {
                  if (snapshot.val()) {
                    _user.publisher = JSON.parse(JSON.stringify(snapshot.val()));
                    _user.publisher.id = _user.publisherID;
                    that.updateUserState(_user);
                    // console.log('compiled publisher');
                  }
                });
            }

            if (_user.soundcasts_managed) {
              for (let key in _user.soundcasts_managed) {
                // watch managed soundcasts
                firebase
                  .database()
                  .ref(`soundcasts/${key}`)
                  .off(); // to avoid error when subscribe twice
                firebase
                  .database()
                  .ref(`soundcasts/${key}`)
                  .on(
                    'value',
                    snapshot => {
                      if (snapshot.val()) {
                        const _soundcast = JSON.parse(JSON.stringify(snapshot.val()));
                        _user.soundcasts_managed[key] = _soundcast;
                        // to not watch the same soundcasts twice
                        // fixes problem with .off of managed soundcasts, that are subscribed too
                        // if (_user.soundcasts[key]) {
                        //  _user.soundcasts[key] = _soundcast;
                        // }
                        // console.log('compiled soundcast');
                        if (editSoundcastKey && editSoundcastKey === key) {
                          _user.loadEditSoundcast = {
                            id: key,
                            soundcast: _soundcast,
                          };
                        }
                        that.updateUserState(_user);
                        if (_soundcast.episodes) {
                          for (let epkey in _soundcast.episodes) {
                            // watch episodes of soundcasts
                            firebase
                              .database()
                              .ref(`episodes/${epkey}`)
                              .off(); // to avoid error when subscribe twice
                            firebase
                              .database()
                              .ref(`episodes/${epkey}`)
                              .on('value', snapshot => {
                                if (snapshot.val()) {
                                  _user.soundcasts_managed[key].episodes[epkey] = JSON.parse(
                                    JSON.stringify(snapshot.val())
                                  );
                                  // console.log('compiled episodes');
                                  that.updateUserState(_user);
                                }
                              });
                          }
                        }
                      }
                    },
                    err => {
                      console.log('ERROR on soundcast: ', err);
                    }
                  );
              }
            }
          } // if (_user.admin)

          if (_user.soundcasts) {
            for (let key in _user.soundcasts) {
              // to not watch the same soundcasts twice
              // fixes problem with .off of managed soundcasts, that are subscribed too
              if (_user.soundcasts_managed && _user.soundcasts_managed[key]) {
                _user.soundcasts[key] = _user.soundcasts_managed[key];
                that.updateUserState(_user);
              }

              if (!_user.soundcasts_managed || !_user.soundcasts_managed[key]) {
                // otherwise this soundcast is watched in soundcasts_managed
                // watch soundcasts subscriptions
                firebase
                  .database()
                  .ref(`soundcasts/${key}`)
                  .off(); // to avoid error when subscribe twice
                firebase
                  .database()
                  .ref(`soundcasts/${key}`)
                  .on(
                    'value',
                    snapshot => {
                      if (snapshot.val()) {
                        const _soundcast = JSON.parse(JSON.stringify(snapshot.val()));
                        _user.soundcasts[key] = _soundcast;
                        if (editSoundcastKey && editSoundcastKey === key) {
                          _user.loadEditSoundcast = {
                            id: key,
                            soundcast: _soundcast,
                          };
                        }
                        that.updateUserState(_user);
                        if (_soundcast.episodes) {
                          for (let epkey in _soundcast.episodes) {
                            // watch episodes of soundcasts
                            firebase
                              .database()
                              .ref(`episodes/${epkey}`)
                              .off(); // to avoid error when subscribe twice
                            firebase
                              .database()
                              .ref(`episodes/${epkey}`)
                              .on('value', snapshot => {
                                if (snapshot.val()) {
                                  _user.soundcasts[key].episodes[epkey] = JSON.parse(
                                    JSON.stringify(snapshot.val())
                                  );
                                  that.updateUserState(_user);
                                }
                              });
                          }
                        }
                      }
                    },
                    err => {
                      console.log('ERROR on soundcast: ', err);
                    }
                  );
              }
            }
          } // if (_user.soundcasts)
        });
    });

    firebase
      .database()
      .ref('courses')
      .on('value', snapshot => {
        this.props.loadCourses(snapshot.val());
      });
  } // componentDidMount

  render() {
    return (
      <Router>
        <ScrollToTop>
          <div>
            <Helmet>
              <meta property="og:type" content="website" />
              <meta property="og:url" content="https://mysoundwise.com/" />
              <meta
                property="og:title"
                content="Soundwise: #1 Mobile-Centric Platform For Selling & Delivering On-Demand Audios"
              />
              <meta property="fb:app_id" content="1726664310980105" />
              <meta
                property="og:description"
                content="Soundwise is the premium solution for entrepreneurial experts to grow an engaged podcast audience, convert listeners to customers, and sell on-demand audios."
              />
              <meta
                property="og:image"
                content="https://mysoundwise.com/images/soundwise-home.png"
              />
              <title>
                Soundwise: #1 Mobile-Centric Platform For Selling & Delivering On-Demand Audios
              </title>
              <meta
                name="description"
                content="Soundwise is the premium solution for entrepreneurial experts to grow an engaged podcast audience, convert listeners to customers, and sell on-demand audios."
              />
              <meta
                name="keywords"
                content="soundwise, podcast hosting, sell audios, on-demand audios, audio courses, podcast conversion, podcasting, audio training, online education, podcast software, soundwise, audio publishing, content management system, audio learning, online learning, online course, podcast mobile app"
              />
            </Helmet>
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route path="/about" component={About} />
              <Route exact={true} path="/blog" component={BlogList} />
              <Route path="/blog/p/:page" component={BlogList} />
              <Route exact={true} path="/blog/post/:slug" component={BlogPost} />
              <Route path="/buy" component={SoundwiseCheckout} />
              <Route path="/content_download" component={ContentDownload} />
              <Route path="/confirmation" component={OrderConfirmation} />
              <Route path="/conversion" component={PodcastingCourse} />
              <Route path="/creator_terms" component={CreatorTerms} />
              <Route exact={true} path="/dashboard/:tab" component={Dashboard} />
              <Route path="/dashboard/:tab/:id" component={Dashboard} />
              <Route path="/episodes/:id" component={EpisodePage} />
              <Route path="/experts" component={PageExperts} />
              <Route exact={true} path="/igp" component={IGPList} />
              <Route exact={true} path="/igp/:slug" component={IGPPost} />
              <Route exact={true} path="/knowledge" component={HelpDocs} />
              <Route exact path="/mysoundcasts" component={MySoundcasts} />
              <Route exact path="/mysoundcasts/:soundcastId" component={SoundcastPlayingPage} />
              <Route
                exact
                path="/mysoundcasts/:soundcastId/:episodeId"
                component={SoundcastPlayingPage}
              />
              <Route exact path="/myprofile" component={UserProfile} />
              <Route path="/notice" component={Notice} />
              <Route path="/notfound" component={NotFound} />
              <Route path="/password_reset" component={PassRecovery} />
              <Route exact path="/podcast" component={LandingPagePodcast} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/pricing" component={PricingPage} />
              <Route path="/publishers/:id" component={Publisher} />
              <Route exact path="/selling" component={LandingPageSelling} />
              <Route exact={true} path="/signup/:mode" component={AppSignup} />
              <Route path="/signup/:mode/:id" component={AppSignup} />
              <Route path="/signup_options" component={SignupOptions} />
              <Route path="/signin/:mode/:id" component={AppSignin} />
              <Route exact={true} path="/signin" component={AppSignin} />
              <Route path="/soundcasts/:id" component={SoundcastPage} />
              <Route path="/soundcast_checkout" component={SoundcastCheckout} />
              <Route path="/trial_request" component={TrialRequest} />
              <Route path="/terms" component={Terms} />
              <Route
                exact={true}
                path="/tracks/:id"
                component={props => {
                  const id = props.match.params.id;
                  window.location.replace(`https://d1jzcuf08rvzm.cloudfront.net/soundcasts/${id}`);
                }}
              />
              <Route path="/video_demo" component={VideoDemo} />
              <Route path="/wave_video" component={WaveVideoInputs} />
              <Route path="/youtube" component={LandingPageYoutube} />
              <Route path="/youtube_demo" component={YoutubeDemo} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </ScrollToTop>
      </Router>
    );
  }
}

const mapStateToProps = state => {
  return { isLoggedIn: state.user.isLoggedIn };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ loadCourses, signinUser, subscribeToCategories }, dispatch);
}

export const Routes = connect(
  mapStateToProps,
  mapDispatchToProps
)(_Routes);
