import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';
import moment from 'moment';
import Axios from 'axios';
import Dots from 'react-activity/lib/Dots';

import Footer from '../components/footer';
import { SoundwiseHeader } from '../components/soundwise_header';
import Colors from '../styles/colors';

class _MySoundcasts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userSoundcasts: [],
      userId: '',
      currentSoundcast: '',
    };

    this.handleSubscription = this.handleSubscription.bind(this);
    this.retrieveSoundcasts = this.retrieveSoundcasts.bind(this);
  }

  componentDidMount() {
    const that = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        if (that.props.userInfo.soundcasts) {
          const userId = user.uid;
          that.retrieveSoundcasts(userId);
        }
      } else {
        that.props.history.push('/signin');
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const that = this;
    let userSoundcasts = [];
    if (nextProps.userInfo.soundcasts) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          const userId = user.uid;
          that.retrieveSoundcasts(userId);
        }
      });
    }
  }

  retrieveSoundcasts(userId) {
    let userSoundcasts = [];
    const that = this;
    firebase
      .database()
      .ref('users/' + userId + '/soundcasts')
      .once('value')
      .then(snapshot => {
        if (snapshot.val()) {
          const soundcastIDs = Object.keys(snapshot.val());
          const soundcasts = snapshot.val();
          const promises = soundcastIDs.map((id, i) => {
            return firebase
              .database()
              .ref('soundcasts/' + id)
              .once('value')
              .then(snapshot => {
                userSoundcasts[i] = {
                  soundcastId: id,
                  title: snapshot.val().title,
                  hostName: snapshot.val().hostName,
                  imageURL: snapshot.val().imageURL,
                  subscribed: soundcasts[id].subscribed,
                  paymentID: soundcasts[id].paymentID,
                  publisherID: snapshot.val().publisherID,
                  current_period_end: soundcasts[id].current_period_end,
                  planID: soundcasts[id].planID,
                  billingCycle: soundcasts[id].billingCycle,
                  subscriberEmailList: snapshot.val().subscriberEmailList,
                };
                if (
                  soundcasts[id].subscribed &&
                  soundcasts[id].current_period_end < moment().format('X')
                ) {
                  userSoundcasts[i].subscribed = false;
                  firebase
                    .database()
                    .ref(`users/${userId}/soundcasts/${id}/subscribed`)
                    .set(false);
                  firebase
                    .database()
                    .ref(`soundcasts/${id}/subscribed/${userId}`)
                    .remove();
                  firebase
                    .database()
                    .ref(`publishers/${snapshot.val().publisherID}/freeSubscribers/${userId}/${id}`)
                    .remove();
                }
              })
              .then(() => {
                firebase
                  .database()
                  .ref(`publishers/${snapshot.val().publisherID}/freeSubscribers/${userId}`)
                  .once('value')
                  .then(freeSubsObj => {
                    if (!freeSubsObj.val()) {
                      firebase
                        .database()
                        .ref(`publishers/${snapshot.val().publisherID}/freeSubscriberCount`)
                        .once('value')
                        .then(subsCountObj => {
                          if (subsCountObj.val()) {
                            const count = subsCountObj.val();
                            firebase
                              .database()
                              .ref(`publishers/${snapshot.val().publisherID}/freeSubscriberCount`)
                              .set(count - 1);
                          }
                        });
                    }
                  });
              })
              .then(res => res, err => console.log(err));
          });

          Promise.all(promises).then(
            res => that.setState({ userSoundcasts, userId }),
            err => console.log('promise error: ', err)
          );
        }
      });
  }

  handleSubscription(soundcast) {
    const that = this;
    const { userId } = this.state;
    const { soundcastId, paymentID, subscribed, publisherID } = soundcast;

    this.setState({ currentSoundcast: soundcastId });

    // unsubscribe
    const confirmUnsubscribe = confirm('Are you sure you want to unsubscribe this soundcast?');
    if (confirmUnsubscribe) {
      firebase
        .database()
        .ref(`users/${userId}/soundcasts/${soundcastId}/subscribed`)
        .set(false);
      firebase
        .database()
        .ref(`users/${userId}/soundcasts/${soundcastId}/current_period_end`)
        .set(moment().format('X'));
      firebase
        .database()
        .ref(`soundcasts/${soundcastId}/subscribed/${userId}`)
        .remove();

      Axios.post('/api/delete_emails', {
        emails: [that.props.userInfo.email[0]],
        emailListId: soundcast.subscriberEmailList,
      }).then(() => {
        if (paymentID) {
          firebase
            .database()
            .ref(`publishers/${publisherID}`)
            .once('value', snapshot => {
              Axios.post('/api/unsubscribe', {
                paymentID,
                publisher: snapshot.val().stripe_user_id,
              })
                .then(response => {
                  that.retrieveSoundcasts(userId);
                  alert('You have been successfully unsubscribed.');
                })
                .catch(error => {
                  console.log(error);
                });
            });
        } else {
          // if it's a free soundcast, end the current subscription period immediately
          firebase
            .database()
            .ref(`users/${userId}/soundcasts/${soundcastId}/current_period_end`)
            .set(moment().format('X'));

          firebase
            .database()
            .ref(`publishers/${publisherID}/freeSubscribers/${userId}/${soundcastId}`)
            .remove();

          firebase
            .database()
            .ref(`publishers/${publisherID}/freeSubscribers/${userId}`)
            .once('value')
            .then(snapshot => {
              if (!snapshot.val()) {
                firebase
                  .database()
                  .ref(`publishers/${publisherID}/freeSubscriberCount`)
                  .once('value')
                  .then(snapshot => {
                    if (snapshot.val()) {
                      const count = snapshot.val();
                      // console.log('free subscriber count: ', count);
                      firebase
                        .database()
                        .ref(`publishers/${publisherID}/freeSubscriberCount`)
                        .set(count - 1);
                    }
                  });
              }
              that.retrieveSoundcasts(userId);
            });
        }
      });
    }
  }

  render() {
    const userSoundcasts = this.state.userSoundcasts;
    const isLoggedIn = this.props.isLoggedIn;

    if (isLoggedIn === false) {
      return (
        <div>
          <SoundwiseHeader />
          <section
            className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb"
            id="feature-section14"
          >
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                  <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                    PLEASE LOG IN FIRST
                  </h2>
                </div>
              </div>
            </div>
          </section>
          <div style={styles.footer}>
            <Footer />
          </div>
        </div>
      );
    }

    return (
      <div>
        <SoundwiseHeader />
        <section
          className="padding-90px-tb bg-white builder-bg xs-padding-60px-tb"
          id="feature-section14"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                  {(this.state.userSoundcasts.length && 'MY SOUNDCASTS') ||
                    `YOU HAVEN'T SUBSCRIBED TO ANY SOUNDCASTS YET`}
                </h2>
              </div>
              <div>
                {this.state.userSoundcasts.map((soundcast, i) => (
                  <div className="row" key={i} style={styles.row}>
                    <Link
                      to={
                        soundcast.subscribed
                          ? `/mysoundcasts/${soundcast.soundcastId}`
                          : `soundcasts/${soundcast.soundcastId}`
                      }
                    >
                      <div
                        className="col-lg-7 col-md-7 col-sm-7 col-xs-12"
                        style={styles.soundcastInfo}
                      >
                        <img src={soundcast.imageURL} style={styles.soundcastImage} />
                        <div style={styles.soundcastDescription}>
                          <label style={styles.soundcastTitle}>{soundcast.title}</label>
                          <label>
                            {(soundcast.subscribed &&
                              Number(soundcast.current_period_end) == 4638902400 &&
                              'Current access is valid') ||
                              (soundcast.subscribed &&
                                Number(soundcast.current_period_end) < 4638902400 &&
                                `Current access is valid till ${moment
                                  .unix(soundcast.current_period_end)
                                  .format('MM/DD/YYYY')}`) ||
                              `Access expired on ${moment
                                .unix(soundcast.current_period_end)
                                .format('MM/DD/YYYY')}`}
                          </label>
                        </div>
                      </div>
                    </Link>
                    <div
                      className="col-lg-2 col-md-2 col-sm-2 col-xs-12"
                      style={styles.soundcastInfo}
                    >
                      {(soundcast.subscribed && (
                        <span style={{ ...styles.statusText }}>Active</span>
                      )) || <span style={{ ...styles.statusText, color: 'red' }}>Inactive</span>}
                    </div>
                    <div
                      className="col-lg-3 col-md-3 col-sm-3 col-xs-12"
                      style={{
                        ...styles.soundcastInfo,
                        justifyContent: 'flex-start',
                      }}
                    >
                      {(soundcast.subscribed && (
                        <div
                          style={{
                            ...styles.button,
                            borderColor: Colors.link,
                            display: 'block',
                          }}
                          onClick={() => this.handleSubscription(soundcast)}
                        >
                          Unsubscribe
                        </div>
                      )) || (
                        <Link to={`soundcasts/${soundcast.soundcastId}`}>
                          <div
                            style={{
                              ...styles.button,
                              borderColor: Colors.link,
                              display: 'block',
                            }}
                          >
                            Get Access
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div style={styles.footer}>
          <Footer showPricing={false} />
        </div>
      </div>
    );
  }
}

const styles = {
  titleText: {
    fontSize: 12,
  },
  row: {
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 0,
  },
  soundcastInfo: {
    height: 100,
    backgroundColor: Colors.mainWhite,
    paddingTop: 15,
    paddingBottom: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
  },
  soundcastImage: {
    width: 75,
    height: 75,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    marginRight: 30,
    float: 'left',
  },
  soundcastDescription: {
    height: 46,
    float: 'left',
    width: '80%',
  },
  soundcastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    display: 'block',
  },
  soundcastUpdated: {
    fontSize: 16,
  },
  edit: {
    height: 30,
    display: 'inline-block',
  },
  editLink: {
    paddingTop: 15,
    paddingLeft: 20,
    fontSize: 16,
    color: Colors.link,
    float: 'right',
    cursor: 'pointer',
    // display: 'block'
  },
  subscribers: {
    paddingTop: 10,
    float: 'right',
    fontSize: 14,
  },
  addLink: {
    color: Colors.link,
    fontSize: 14,
    display: 'block',
    float: 'none',
    height: 11,
    lineHeight: '11px',
    position: 'relative',
    bottom: 5,
    width: 16,
    margin: '0 auto',
    paddingTop: 6,
    cursor: 'pointer',
  },
  button: {
    height: 30,
    borderRadius: 14,
    fontSize: 12,
    letterSpacing: 2,
    wordSpacing: 4,
    display: 'inline-block',
    paddintTop: 5,
    paddingRight: 15,
    paddingBottom: 5,
    paddingLeft: 15,
    borderWidth: 3,
    marginTop: 10,
    marginRight: 15,
    borderStyle: 'solid',
    cursor: 'pointer',
  },
  footer: {
    // position: 'fixed',
    bottom: 0,
    width: '100%',
  },
};

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  return { userInfo, isLoggedIn };
};

export const MySoundcasts = connect(
  mapStateToProps,
  null
)(_MySoundcasts);
