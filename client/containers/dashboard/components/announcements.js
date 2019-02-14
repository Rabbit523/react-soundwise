import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import Toggle from 'react-toggle';

import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import { sendNotifications } from '../../../helpers/send_notifications';
import Colors from '../../../styles/colors';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';
import { inviteListeners } from '../../../helpers/invite_listeners';
import { sendMarketingEmails } from '../../../helpers/sendMarketingEmails';

export default class Announcements extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSoundcastID: null,
      currentSoundcast: null,
      soundcasts_managed: [],
      message: '',
      announcementsArr: [],
      sendEmails: false,
      modalOpen: false,
    };

    this.firebaseListener = null;
    this.handlePublish = this.handlePublish.bind(this);
    this.sortAnnouncements = this.sortAnnouncements.bind(this);
    this.loadUser = this.loadUser.bind(this);
    this.emailListeners = this.emailListeners.bind(this);
  }

  componentDidMount() {
    const { userInfo } = this.props;
    if (userInfo.publisher) {
      if (
        (!userInfo.publisher.plan && !userInfo.publisher.beta) ||
        (userInfo.publisher.plan && userInfo.publisher.current_period_end < moment().format('X'))
      ) {
        this.setState({
          modalOpen: true,
        });
      }
    }
    if (this.props.userInfo.soundcasts_managed) {
      const { userInfo } = this.props;
      // console.log('userInfo: ', userInfo);
      this.loadUser(userInfo);
    }
  }

  componentWillReceiveProps(nextProps) {
    const that = this;
    const { userInfo } = nextProps;
    if (userInfo.publisher) {
      if (
        (!userInfo.publisher.plan && !userInfo.publisher.beta) ||
        (userInfo.publisher.plan && userInfo.publisher.current_period_end < moment().format('X'))
      ) {
        this.setState({
          modalOpen: true,
        });
      }
    }
    if (nextProps.userInfo.soundcasts_managed) {
      if (typeof Object.values(nextProps.userInfo.soundcasts_managed)[0] == 'object') {
        const { userInfo } = nextProps;
        this.loadUser(userInfo, this.state.currentSoundcast, this.state.currentSoundcastID);
      }
    }
  }

  loadUser(userInfo, currentSoundcast, currentSoundcastID) {
    const _subscribers = [];
    const _soundcasts_managed = [];

    for (let id in userInfo.soundcasts_managed) {
      const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
      if (_soundcast.title) {
        _soundcast.id = id;
        _soundcasts_managed.push(_soundcast);
      }
    }

    if (!currentSoundcast) {
      this.setState({
        soundcasts_managed: _soundcasts_managed,
        currentSoundcastID: _soundcasts_managed[0].id,
        currentSoundcast: _soundcasts_managed[0],
      });

      this.sortAnnouncements(_soundcasts_managed[0].id);
    } else {
      this.setState({
        soundcasts_managed: _soundcasts_managed,
        currentSoundcastID,
        currentSoundcast,
      });

      this.sortAnnouncements(currentSoundcastID);
    }
  }

  sortAnnouncements(id) {
    Axios.get('/api/announcements', {
      params: { filter: { where: { soundcastId: id } } },
    }).then(res => {
      const announcementsArr = res.data;
      this.setState({
        announcementsArr: announcementsArr ? announcementsArr : [],
      });
    });
  }

  changeSoundcastId(e) {
    this.setState({
      currentSoundcastID: e.target.value,
    });

    const { soundcasts_managed, currentSoundcastID } = this.state;
    let currentSoundcast;

    soundcasts_managed.forEach(soundcast => {
      if (soundcast.id == e.target.value) {
        currentSoundcast = soundcast;
      }
    });
    this.setState({ currentSoundcast });
    this.sortAnnouncements(e.target.value);
  }

  handlePublish() {
    const that = this;
    const { currentSoundcastID, message, currentSoundcast } = this.state;
    const { userInfo } = this.props;
    const announcementID = `${moment().format('x')}a`;

    this.firebaseListener = firebase.auth().onAuthStateChanged(function(user) {
      if (user && that.firebaseListener && !!message) {
        const creatorID = user.uid;
        const newAnnouncement = {
          content: message,
          date_created: moment().format('X'),
          creatorId: creatorID,
          publisherId: that.props.userInfo.publisherID,
          soundcastId: currentSoundcastID,
          isPublished: true,
          announcementId: announcementID,
        };

        Axios.post('/api/announcements', newAnnouncement).then(
          data => {
            that.setState({
              message: '',
            });
            firebase
              .database()
              .ref(`soundcasts/${currentSoundcastID}/subscribed`)
              .once('value', snapshot => {
                if (snapshot.val()) {
                  let registrationTokens = [];
                  const subscribers = snapshot.val();
                  // get an array of device tokens
                  Object.keys(subscribers).forEach(user => {
                    if (typeof subscribers[user] == 'object') {
                      if (typeof subscribers[user][0] == 'string') {
                        registrationTokens.push(subscribers[user][0]);
                      } else if (typeof subscribers[user][0][0] == 'string') {
                        registrationTokens.push(subscribers[user][0][0]);
                      }
                    }
                  });
                  const payload = {
                    data: {
                      type: 'NEW_MESSAGE',
                      announcementId: announcementID,
                      soundcastId: currentSoundcastID,
                    },
                    notification: {
                      // title: `${userInfo.firstName} ${userInfo.lastName} sent you a message`,
                      title: `${currentSoundcast.title} sent you a message`,
                      body: message,
                    },
                  };
                  sendNotifications(registrationTokens, payload); //sent push notificaiton
                  if (that.state.sendEmails) {
                    that.emailListeners(currentSoundcast, message);
                  }
                  that.sortAnnouncements(currentSoundcastID);
                  alert('Announcement sent!');
                  that.firebaseListener = null;
                }
              });
          },
          err => {
            console.log('ERROR adding announcement: ', err);
          }
        );
      } else {
        alert('Announcement not sent!');
      }
    });

    this.firebaseListener && this.firebaseListener();
  }

  componentWillUnmount() {
    this.firebaseListener = null;
  }

  emailListeners(soundcast, message) {
    let subscribers = [];
    const that = this;
    const { userInfo } = this.props;
    const subject = `${soundcast.title} sent you a message on Soundwise`;
    if (soundcast.subscribed) {
      // send notification email to subscribers
      const content = `<p>Hi <span>[%first_name | Default Value%]</span>!</p><p></p><p>${
        soundcast.title
      } just sent you a message on Soundwise:</p><p></p><div style=\"padding: 15px; white-space: pre-wrap; background: #FFF8E1;\"><strong>${message}</strong></div>`;
      sendMarketingEmails(
        [soundcast.subscriberEmailList],
        subject,
        content,
        userInfo.publisher.name,
        userInfo.publisher.imageUrl,
        userInfo.publisher.email,
        4385
      );
    }

    // send notification email to invitees
    if (soundcast.invited) {
      const content = `<p>Hi there!</p><p></p><p>${
        soundcast.title
      } just sent you a message on Soundwise:</p><p></p><div style=\"padding: 15px; white-space: pre-wrap; background: #FFF8E1;\"><strong>${message}</strong></div>`;
      sendMarketingEmails(
        [soundcast.inviteeEmailList],
        subject,
        content,
        userInfo.publisher.name,
        userInfo.publisher.imageUrl,
        userInfo.publisher.email,
        4385
      );
    }
  }

  render() {
    const { soundcasts_managed, announcementsArr, modalOpen } = this.state;
    const that = this;
    return (
      <div className="padding-30px-tb">
        <div
          style={{
            display: modalOpen ? '' : 'none',
            background: 'rgba(0, 0, 0, 0.7)',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            position: 'absolute',
            zIndex: 100,
          }}
        >
          <div
            style={{
              transform: 'translate(-50%)',
              backgroundColor: 'white',
              top: 150,
              left: '50%',
              position: 'absolute',
              width: '70%',
              zIndex: 103,
            }}
          >
            <div className="title-medium" style={{ margin: 25, fontWeight: 800 }}>
              Upgrade to send messages
            </div>
            <div className="title-small" style={{ margin: 25 }}>
              Message sending to subscribers is available on PLUS and PRO plans. Please upgrade to
              access the feature.
            </div>
            <div className="center-col">
              <OrangeSubmitButton
                label="Upgrade"
                onClick={() => that.props.history.push({ pathname: '/pricing' })}
                styles={{ width: '60%' }}
              />
            </div>
          </div>
        </div>
        <div className="padding-bottom-20px">
          <span className="title-medium ">Messages</span>
          <div style={styles.soundcastSelectWrapper}>
            <select
              style={styles.soundcastSelect}
              value={this.state.currentSoundcastID}
              onChange={e => {
                this.changeSoundcastId(e);
              }}
            >
              {soundcasts_managed.map((souncast, i) => {
                return (
                  <option style={styles.option} value={souncast.id} key={i}>
                    {souncast.title}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div style={styles.announcementWrap}>
          <textarea
            style={styles.inputAnnouncement}
            placeholder={'Make a new announcement'}
            onChange={e => {
              this.setState({ message: e.target.value });
            }}
            value={this.state.message}
          />
          <div style={{ marginTop: 0, marginBottom: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Toggle
                id="share-status"
                aria-labelledby="share-label"
                // label="Charge subscribers for this soundcast?"
                checked={this.state.sendEmails}
                onChange={() => {
                  const sendEmails = !that.state.sendEmails;
                  that.setState({ sendEmails });
                }}
              />
              <span id="share-label" style={{ fontSize: 20, fontWeight: 800, marginLeft: '0.5em' }}>
                Email the message to subscribers and invitees
              </span>
            </div>
          </div>
          <div style={styles.publishButtonWrap}>
            <div style={{ ...styles.button }} onClick={this.handlePublish}>
              Publish
            </div>
          </div>
        </div>
        <div style={styles.announcementsWrap}>
          <div className="title-small" style={styles.publishedTitles}>
            Published messages
          </div>
          <div>
            {announcementsArr.map((announcement, i) => {
              const likes = announcement.likesCount;
              const comments = announcement.commentsCount;
              return (
                <div style={styles.existingAnnouncement} key={i}>
                  <div style={styles.announcementContainer}>
                    <div style={styles.date}>
                      {moment(announcement.updatedAt).format('dddd, MMMM Do YYYY, h:mm a')}
                    </div>
                    <div
                      style={{ ...styles.content, whiteSpace: 'pre-wrap' }}
                      className="text-large"
                    >
                      {announcement.content}
                    </div>
                    <div style={styles.likes}>{`${likes} ${
                      likes > 1 ? 'likes' : 'like'
                    }  ${comments} ${comments > 1 ? 'comments' : 'comment'}`}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  soundcastSelectWrapper: {
    height: 40,
    width: 300,
    marginTop: 0,
    marginLeft: 30,
    marginRight: 30,
    display: 'inline-block',
  },
  soundcastSelect: {
    backgroundColor: Colors.mainWhite,
    width: 'calc(100% - 20px)',
    height: 40,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 0,
    fontSize: 16,
  },
  option: {
    fontSize: 16,
  },
  announcementWrap: {
    marginLeft: 10,
    width: '95%',
  },
  inputAnnouncement: {
    height: 120,
    fontSize: 16,
    borderRadius: 4,
    marginTop: 0,
    marginBottom: 10,
    resize: 'vertical',
  },
  publishButtonWrap: {
    marginTop: 10,
    marginBottom: 10,
    height: 40,
  },
  publisheTitleWrap: {
    marginLeft: 10,
    marginBottom: 20,
  },
  button: {
    height: 35,
    // display: 'inline-block',
    float: 'right',
    borderRadius: 23,
    overflow: 'hidden',
    // margin: '40px auto',
    fontSize: 14,
    letterSpacing: 2.5,
    wordSpacing: 5,
    marginRight: 0,
    paddingTop: 6,
    paddingRight: 20,
    paddingBottom: 4,
    paddingLeft: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    backgroundColor: Colors.mainOrange,
    color: Colors.mainWhite,
    borderColor: Colors.mainOrange,
  },
  announcementsWrap: {
    marginTop: 15,
    marginBottom: 10,
  },
  existingAnnouncement: {
    marginLeft: 10,
    width: '95%',
    backgroundColor: Colors.mainWhite,
    marginBottom: 10,
  },
  publishedTitles: {
    marginBottom: 15,
    marginLeft: 10,
  },
  announcementContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  date: {
    // color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {},
  likes: {
    fontSize: 14,
    textAlign: 'right',
  },
};
