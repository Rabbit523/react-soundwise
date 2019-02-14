import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import moment from 'moment';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import Dots from 'react-activity/lib/Dots';
import Axios from 'axios';

import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import EditSoundcast from './edit_soundcast';
import InviteSubscribersModal from './invite_subscribers_modal';
import EpisodeStatsModal from './episode_stats_modal';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import { OrangeSubmitButton } from '../../../components/buttons/buttons';
import SoundcastsBundles from './soundcasts_bundles';
const { isFreeAccount } = require('../../../../server/scripts/utils.js')();

export default class SoundcastsManaged extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      currentSoundcastID: '',
      currentSoundcast: null,
      showStatsModal: false,
      currentEpisode: null,
      userInfo: { soundcasts_managed: {} },
      newSoundcastModal: false,
      upgradeModal: false,
      upgradeModalTitle: '',
      showFeedInputs: false,
      emailNotFoundError: false,
      feedSubmitting: false,
      podcastTitle: '',
      feedUrl: '',
      publisherEmail: '',
      imageUrl: '',
    };

    this.editSoundcast = this.editSoundcast.bind(this);
    this.handleModal = this.handleModal.bind(this);
    this.handleStatsModal = this.handleStatsModal.bind(this);
    this.deleteEpisode = this.deleteEpisode.bind(this);
    this.deleteSoundcast = this.deleteSoundcast.bind(this);
    this.closeSubmitModal = this.closeSubmitModal.bind(this);
    this.submitFeed = this.submitFeed.bind(this);
    this.submitCode = this.submitCode.bind(this);
    this.resend = this.resend.bind(this);
    this.handleSoundcastSignup = this.handleSoundcastSignup.bind(this);
    this.isShownSoundcastSignup = this.isShownSoundcastSignup.bind(this);
    this.handleAddNewSoundcast = this.handleAddNewSoundcast.bind(this);
  }

  componentDidMount() {
    if (this.props.userInfo) {
      const { userInfo } = this.props;
      this.setState({ userInfo });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userInfo) {
      const { userInfo } = nextProps;
      this.setState({ userInfo });
    }
  }

  editSoundcast(soundcastId, soundcast) {
    const { userInfo, history, id } = this.props;
    history.push({
      pathname: `/dashboard/edit/${soundcastId}`,
      state: {
        id: soundcastId,
        soundcast,
      },
    });
  }

  editEpisode(episode) {
    const { userInfo, history, id } = this.props;
    history.push({
      pathname: `/dashboard/edit_episode/${episode.id}`,
      state: {
        id: episode.id,
        episode,
      },
    });
  }

  handleSoundcastSignup(soundcast) {
    if (this.isShownSoundcastSignup(soundcast)) {
      this.props.history.push(`/signup/soundcast_user/${soundcast.id}`);
    } else {
      this.setState({
        upgradeModal: true,
        upgradeModalTitle:
          'Signup forms for paid soundcasts are only available on PLUS, PRO and PLATINUM plans.',
      });
    }
  }

  isShownSoundcastSignup(soundcast) {
    const { userInfo } = this.props;
    if (soundcast.published === true) {
      if (!soundcast.forSale) {
        return true;
      }
      if (
        soundcast.forSale === true &&
        !isFreeAccount(userInfo) &&
        ((userInfo.publisher.plan === 'plus' ||
          userInfo.publisher.plan === 'pro' ||
          userInfo.publisher.plan === 'platinum') &&
          userInfo.publisher.current_period_end > moment().format('X'))
      ) {
        return true;
      }
    }
    return false;
  }

  handleAddNewSoundcast(soundcasts_managed) {
    const { userInfo } = this.props;
    if (userInfo.publisher) {
      const { plan } = userInfo.publisher;
      const isFree = isFreeAccount(userInfo);
      const currentSoundcastCount = soundcasts_managed.length;
      let currentEpisodeCount = 0;
      soundcasts_managed.forEach(s => {
        if (s.episodes) {
          currentEpisodeCount += Object.keys(s.episodes).length;
        }
      });

      if (
        // IF not free account AND plus plan AND already have 10 soundcasts AND 500 episodes
        (!isFree && plan === 'plus' && currentSoundcastCount >= 10 && currentEpisodeCount >= 500) ||
        // OR not free account AND basic plan AND already have 1 soundcast
        (!isFree && plan === 'basic' && currentSoundcastCount >= 1) ||
        // OR free account AND already have 1 soundcast AND 1 episode
        (isFree && currentSoundcastCount >= 1 && currentEpisodeCount >= 1)
      ) {
        return this.setState({
          upgradeModal: true,
          upgradeModalTitle: 'Please upgrade to create more soundcasts',
        });
      }
      // allow
      this.setState({ newSoundcastModal: true });
    }
  }

  handleModal(soundcast) {
    // console.log('handleModal called');
    if (!this.state.showModal) {
      this.setState({
        showModal: true,
        currentSoundcastID: soundcast.id,
        currentSoundcast: soundcast,
      });
    } else {
      this.setState({
        showModal: false,
      });
    }
  }

  handleStatsModal() {
    if (!this.state.showStatsModal) {
      this.setState({
        showStatsModal: true,
      });
    } else {
      this.setState({
        showStatsModal: false,
      });
    }
  }

  setCurrentEpisode(episode) {
    this.setState({
      currentEpisode: episode,
    });
    this.handleStatsModal();
  }

  deleteEpisode(episode) {
    const title = episode.title;
    if (confirm(`Are you sure you want to delete ${title}? You won't be able to go back.`)) {
      firebase
        .database()
        .ref(`soundcasts/${episode.soundcastID}/episodes/${episode.id}`)
        .remove();
      firebase
        .database()
        .ref(`episodes/${episode.id}`)
        .remove();
      alert(`${title} has been deleted`);
      return;
    }
  }

  async deleteSoundcast(soundcastId) {
    const soundcastTitle = this.props.userInfo.soundcasts_managed[soundcastId].title;
    const confirmText = `Are you sure you want to delete ${soundcastTitle}? All information about this soundcast will be deleted, including subscribers' emails and audio files.`;
    if (confirm(confirmText)) {
      const { userInfo } = this.props;
      if (
        userInfo.publisher &&
        userInfo.publisher.soundcastFromYoutube &&
        userInfo.publisher.soundcastFromYoutube.soundcastId === soundcastId
      ) {
        // connected to youtube
        Axios.post('/api/parse_channel', {
          publisherId: userInfo.publisherID,
          creatorId: userInfo.id,
          deleteChannelSubscription: true,
        });
      }
      await firebase
        .database()
        .ref(`soundcasts/${soundcastId}`)
        .remove();
      const admins = userInfo.publisher.administrators;
      for (var key in admins) {
        await firebase
          .database()
          .ref(`users/${key}/soundcasts_managed/${soundcastId}`)
          .remove();
      }
      const publisherId = userInfo.publisherID;
      await firebase
        .database()
        .ref(`publishers/${publisherId}/soundcasts/${soundcastId}`)
        .remove();
      alert('Soundcast has been deleted.');
    }
  }

  handleFeedSubmission(type, e) {
    this.setState({
      [type]: e.target.value,
    });
  }

  closeSubmitModal() {
    this.setState({
      feedSubmitting: false,
      newSoundcastModal: false,
      upgradeModal: false,
      showFeedInputs: false,
      emailNotFoundError: false,
      podcastTitle: '',
      feedUrl: '',
      publisherEmail: '',
      imageUrl: '',
    });
  }

  submitFeed() {
    this.setState({ feedSubmitting: true });
    const that = this;
    Axios.post('/api/parse_feed', {
      feedUrl: this.state.feedUrl,
      // podcastTitle: this.state.podcastTitle, // not used currently
    })
      .then(res => {
        // setting imageUrl, publisherEmail or notClaimed
        if (res.data && res.data.imageUrl && res.data.publisherEmail) {
          that.setState({
            ...res.data,
            feedSubmitting: false,
            showFeedInputs: false,
          });
        } else {
          alert(`Error result ${JSON.stringify(res.data)}`);
        }
      })
      .catch(err => {
        const errMsg = (err && err.response && err.response.data) || err.toString();
        that.setState({ feedSubmitting: false });
        if (errMsg.slice(0, 40) === "Error: Cannot find podcast owner's email") {
          that.setState({ emailNotFoundError: true });
        } else if (
          errMsg.slice(0, 97) ===
          'Error: This feed is already on Soundwise. If you think this is a mistake, please contact support.'
        ) {
          alert(
            "Hmm...looks like this podcast has already been managed by an existing account on Soundwise. If you think you're the owner of this feed, please contact us at support@mysoundwise.com."
          );
        } else {
          alert('Hmm...there is a problem parsing the feed. Please try again later.');
        }
      });
  }

  submitCode() {
    const { codeSign1, codeSign2, codeSign3, codeSign4 } = this.refs;
    const { feedUrl, publisherEmail, notClaimed } = this.state;
    const submitCode = codeSign1.value + codeSign2.value + codeSign3.value + codeSign4.value;
    codeSign1.value = codeSign2.value = codeSign3.value = codeSign4.value = '';
    const that = this;
    this.setState({ feedSubmitting: true });
    Axios.post('/api/parse_feed', { feedUrl, submitCode, notClaimed })
      .then(res => {
        if (res.data === 'Success_code') {
          const reqObj = {
            feedUrl,
            userId: this.props.userInfo.id,
            publisherId: this.props.userInfo.publisherID,
            importFeedUrl: true, // run import or claim
          };
          Axios.post('/api/parse_feed', reqObj)
            .then(res => {
              // if (res.data === 'Success_import' || res.data === 'Success_claim') {
              that.closeSubmitModal();
              // }
            })
            .catch(err => {
              that.setState({ feedSubmitting: false });
              console.log(
                'import feed request failed',
                err,
                err && err.response && err.response.data
              );
              alert('Hmm...there is a problem importing feed. Please try again later.');
            });
        } else {
          that.setState({ feedSubmitting: false });
        }
      })
      .catch(err => {
        that.setState({ feedSubmitting: false });
        const errMsg = (err && err.response && err.response.data) || err.toString();
        if (errMsg.slice(0, 33) === 'Error: incorrect verfication code') {
          alert('Code incorrect!');
        } else {
          console.log(
            'verification code request failed',
            err,
            err && err.response && err.response.data
          );
          alert('Hmm...there is a problem sending verification code. Please try again later.');
        }
      });
  }

  onKeyDown(id, e) {
    const refs = this.refs;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      return;
    }
    if (/\d/.test(e.key)) {
      // digits only
      setTimeout(() => refs['codeSign' + id].focus(), 50);
    } else {
      e.preventDefault();
    }
  }

  resend() {
    const { feedUrl } = this.state;
    Axios.post('/api/parse_feed', { feedUrl, resend: true })
      .then(res => {
        if (res.data === 'Success_resend') {
          alert('Resend Success!');
        }
      })
      .catch(err => {
        console.log('resend code request failed', err, err && err.response && err.response.data);
        alert('Hmm...there is a problem resending code. Please try again later.');
      });
  }

  render() {
    const { userInfo } = this.state;
    const { history, id } = this.props;
    const that = this;
    const _soundcasts_managed = [];
    for (let id in userInfo.soundcasts_managed) {
      const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
      if (!_soundcast.bundle) {
        // only renders on this page if not a bundle
        if (_soundcast.title) {
          _soundcast.id = id;
          if (_soundcast.episodes) {
            _soundcast.last_update = 0;
            for (let episodeId in _soundcast.episodes) {
              if (+_soundcast.episodes[episodeId].date_created > _soundcast.last_update) {
                _soundcast.last_update = +_soundcast.episodes[episodeId].date_created;
              }
            }
          }
          _soundcasts_managed.push(_soundcast);
        }
      }
    }

    if (this.props.match.params.id == 'bundles') {
      return <SoundcastsBundles {...this.props} />;
    } else {
      return (
        <div className="padding-30px-tb " style={{ minHeight: 700 }}>
          <InviteSubscribersModal
            isShown={this.state.showModal}
            soundcast={this.state.currentSoundcast}
            onClose={this.handleModal}
            userInfo={userInfo}
          />
          <div className="padding-bottom-20px" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="title-medium ">Soundcasts</span>
          </div>
          <ul className="nav nav-pills">
            <li role="presentation" className="active">
              <Link to="/dashboard/soundcasts" style={{ backgroundColor: 'transparent' }}>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: Colors.mainOrange,
                  }}
                >
                  Individuals
                </span>
              </Link>
            </li>
            <li role="presentation">
              {isFreeAccount(userInfo) ? (
                <a
                  onClick={() =>
                    this.setState({
                      upgradeModal: true,
                      upgradeModalTitle: 'Please upgrade to create soundcast bundles',
                    })
                  }
                >
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Bundles</span>
                </a>
              ) : (
                <Link to="/dashboard/soundcasts/bundles">
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Bundles</span>
                </Link>
              )}
            </li>
          </ul>
          {_soundcasts_managed.map((soundcast, i) => {
            return (
              <div className="row" key={i} style={{ ...styles.row }}>
                <div className=" col-md-7 col-sm-12 col-xs-12" style={styles.soundcastInfo}>
                  <div className="row">
                    <div className="col-md-2 col-sm-2 col-xs-2">
                      <img src={soundcast.imageURL} style={styles.soundcastImage} />
                    </div>
                    <div
                      className="col-md-7 col-sm-6 col-xs-10"
                      style={styles.soundcastDescription}
                    >
                      <span style={styles.soundcastTitle}>{soundcast.title}</span>
                      {(soundcast.last_update && (
                        <div style={styles.soundcastUpdated}>
                          Last updated: {moment(soundcast.last_update * 1000).format('MMM DD YYYY')}
                        </div>
                      )) ||
                        null}
                    </div>
                    <div
                      className="col-md-3 col-sm-4 col-xs-12"
                      style={{ ...styles.subscribers, textAlign: 'center' }}
                    >
                      <span style={styles.soundcastUpdated}>
                        {`${(soundcast.subscribed && Object.keys(soundcast.subscribed).length) ||
                          0} subscribed`}
                      </span>
                      <span
                        datatoggle="tooltip"
                        dataplacement="top"
                        title="invite listeners"
                        onClick={() => this.handleModal(soundcast)}
                        style={styles.addLink}
                      >
                        Invite
                      </span>
                    </div>
                  </div>
                  <div className="row" style={{ marginTop: 10 }}>
                    <div className="col-md-12">
                      {(soundcast.landingPage && (
                        <div style={{ ...styles.soundcastUpdated }}>
                          <a
                            target="_blank"
                            href={`https://mysoundwise.com/soundcasts/${soundcast.id}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <span
                              datatoggle="tooltip"
                              dataplacement="top"
                              title="view soundcast landing page"
                              style={{ color: Colors.mainOrange }}
                            >
                              <strong>Landing page</strong>
                            </span>
                          </a>
                          <a
                            target="_blank"
                            style={{ paddingLeft: 15 }}
                            onClick={() => that.handleSoundcastSignup(soundcast)}
                          >
                            <span
                              datatoggle="tooltip"
                              dataplacement="top"
                              title="view soundcast signup form"
                              style={{ color: Colors.link }}
                            >
                              <strong>Signup form</strong>
                            </span>
                          </a>
                          {(soundcast.prices && soundcast.prices[0].price > 0 && (
                            <a
                              target="_blank"
                              href={`https://mysoundwise.com/soundcast_checkout?soundcast_id=${
                                soundcast.id
                              }`}
                              style={{ paddingLeft: 15 }}
                            >
                              <span
                                datatoggle="tooltip"
                                dataplacement="top"
                                title="view soundcast signup form"
                                style={{ color: Colors.mainGreen }}
                              >
                                <strong>Checkout form</strong>
                              </span>
                            </a>
                          )) ||
                            null}
                          <span
                            className="text-dark-gray"
                            onClick={() => that.deleteSoundcast(soundcast.id)}
                            style={{ paddingLeft: 15, cursor: 'pointer' }}
                          >
                            Delete
                          </span>
                        </div>
                      )) || (
                        <div style={{ ...styles.soundcastUpdated }}>
                          <span
                            className="text-dark-gray"
                            onClick={() => that.deleteSoundcast(soundcast.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            Delete
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-5 col-sm-12 col-xs-12" style={styles.soundcastInfo}>
                  <div
                    className="col-md-4 col-sm-4 col-xs-12"
                    datatoggle="tooltip"
                    dataplacement="top"
                    title="existing episodes"
                    style={{
                      ...styles.button,
                      borderColor: Colors.link,
                      color: Colors.link,
                    }}
                    onClick={() => history.push(`/dashboard/soundcast/${soundcast.id}`)}
                  >
                    <span>Episodes</span>
                  </div>
                  <div
                    className="col-md-4 col-sm-4 col-xs-12"
                    datatoggle="tooltip"
                    dataplacement="top"
                    title="show soundcast analytics"
                    onClick={() =>
                      history.push({
                        pathname: '/dashboard/analytics',
                        state: {
                          soundcastId: soundcast.id,
                        },
                      })
                    }
                    style={{
                      ...styles.button,
                      borderColor: Colors.mainOrange,
                      color: Colors.mainOrange,
                    }}
                  >
                    <span>Analytics</span>
                  </div>
                  <div
                    className="col-md-2 col-sm-2 col-xs-12"
                    style={{
                      ...styles.button,
                      borderWidth: 0,
                      color: Colors.link,
                    }}
                  >
                    <span
                      datatoggle="tooltip"
                      dataplacement="top"
                      title="edit soundcast"
                      onClick={() => this.editSoundcast(soundcast.id, soundcast)}
                    >
                      Edit
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="row" style={{ ...styles.row, backgroundColor: 'transparent' }}>
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <OrangeSubmitButton
                id="addNewSoundcastBtnTest"
                label="Add New Soundcast"
                onClick={() => this.handleAddNewSoundcast(_soundcasts_managed)}
              />
            </div>
          </div>
          <MuiThemeProvider>
            <div>
              <Dialog modal={true} open={this.state.newSoundcastModal}>
                <div
                  style={{ cursor: 'pointer', float: 'right', fontSize: 29 }}
                  onClick={() => this.closeSubmitModal()}
                >
                  &#10799; {/* Close button (X) */}
                </div>

                {(!this.state.showFeedInputs &&
                  !this.state.emailNotFoundError &&
                  (!this.state.imageUrl && !this.state.publisherEmail) && (
                    <div>
                      <div style={{ ...styles.dialogTitle }}>
                        How do you want to create this soundcast?
                      </div>
                      <OrangeSubmitButton
                        id="startNewSoundcastFromScratchBtnTest"
                        styles={{
                          borderColor: Colors.link,
                          backgroundColor: Colors.link,
                          color: '#464646',
                          width: 400,
                        }}
                        label="Start a new soundcast from scratch"
                        onClick={() => history.push('/dashboard/add_soundcast')}
                      />
                      <OrangeSubmitButton
                        styles={{
                          width: 400,
                        }}
                        label="Import from an existing podcast feed"
                        onClick={() =>
                          that.setState({
                            showFeedInputs: true,
                          })
                        }
                      />
                    </div>
                  )) ||
                  (this.state.emailNotFoundError && (
                    <div>
                      <div
                        style={{
                          ...styles.dialogTitle,
                          marginTop: 37,
                          marginBottom: 41,
                          fontSize: 23,
                        }}
                      >
                        Oops! There's a problem...
                      </div>
                      <div
                        style={{
                          ...styles.container,
                          padding: '0px 30px',
                          width: 490,
                          fontSize: 15,
                        }}
                        className="center-col text-center"
                      >
                        We cannot find the podcast owner's email address in the feed you submitted.
                        An email address is needed to confirm your ownership of the podcast. Please
                        edit your feed to include an owner's email address and re-submit.
                      </div>
                      <div
                        style={{
                          ...styles.container,
                          padding: 30,
                          width: 490,
                          fontSize: 15,
                        }}
                        className="center-col text-center"
                      >
                        If you think this is a mistake, please contact our support at <br />
                        <span style={{ color: '#f76b1c' }}>support@mysoundwise.com</span>
                      </div>
                    </div>
                  )) ||
                  (this.state.showFeedInputs && (
                    <div>
                      <div style={{ ...styles.dialogTitle }}>Import your podcast feed</div>
                      <div
                        style={styles.container}
                        className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                      >
                        <span style={styles.greyInputText}>Podcast Title</span>
                        <input
                          type="text"
                          style={styles.input}
                          onChange={this.handleFeedSubmission.bind(this, 'podcastTitle')}
                          value={this.state.podcastTitle}
                        />
                      </div>
                      <div
                        style={{ ...styles.container, paddingBottom: 20 }}
                        className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                      >
                        <span style={styles.greyInputText}>Podcast RSS Feed URL</span>
                        <input
                          type="text"
                          style={styles.input}
                          onChange={this.handleFeedSubmission.bind(this, 'feedUrl')}
                          value={this.state.feedUrl}
                        />
                      </div>
                      {(!this.state.feedSubmitting && (
                        <OrangeSubmitButton label="Submit" onClick={() => that.submitFeed()} />
                      )) || (
                        <div style={{ textAlign: 'center', marginBottom: 30 }}>
                          <Dots color={Colors.mainOrange} size={32} speed={1} />
                        </div>
                      )}
                    </div>
                  )) ||
                  (this.state.imageUrl && this.state.publisherEmail && (
                    <div
                      style={{
                        ...styles.containerWrapper,
                        padding: 20,
                        textAlign: 'center',
                      }}
                      className="container-confirmation dialog-confirmation"
                    >
                      <img className="center-col" src={this.state.imageUrl} />
                      <div
                        style={{
                          ...styles.container,
                          padding: 30,
                          width: 340,
                          fontSize: 17,
                        }}
                        className="center-col text-center"
                      >
                        Almost there... to verify your ownership of the podcast, we sent a
                        confirmation code to <br />
                        <span style={{ color: Colors.mainOrange }}>
                          {this.state.publisherEmail}
                        </span>
                      </div>
                      <div
                        style={{
                          ...styles.dialogTitle,
                          marginTop: 7,
                          marginBottom: 29,
                        }}
                      >
                        Enter the confirmation code:
                      </div>
                      <div className="rss-submit-code">
                        <input ref="codeSign1" onKeyDown={this.onKeyDown.bind(this, 2)} />
                        <input ref="codeSign2" onKeyDown={this.onKeyDown.bind(this, 3)} />
                        <input ref="codeSign3" onKeyDown={this.onKeyDown.bind(this, 4)} />
                        <input ref="codeSign4" />
                      </div>
                      {(!this.state.feedSubmitting && (
                        <OrangeSubmitButton label="Submit" onClick={() => this.submitCode()} />
                      )) || (
                        <div style={{ textAlign: 'center', marginBottom: 30 }}>
                          <Dots color={Colors.mainOrange} size={32} speed={1} />
                        </div>
                      )}
                      <a
                        style={{ color: Colors.link, marginLeft: 5 }}
                        onClick={this.resend.bind(this)}
                      >
                        Resend the confirmation code
                      </a>
                    </div>
                  ))}
              </Dialog>

              <Dialog modal={true} open={this.state.upgradeModal}>
                <div
                  style={{ cursor: 'pointer', float: 'right', fontSize: 29 }}
                  onClick={() => this.closeSubmitModal()}
                >
                  &#10799; {/* Close button (X) */}
                </div>

                <div>
                  <div style={{ ...styles.dialogTitle }}>{this.state.upgradeModalTitle}</div>
                  <OrangeSubmitButton
                    styles={{
                      borderColor: Colors.link,
                      backgroundColor: Colors.link,
                      color: '#464646',
                      width: 400,
                    }}
                    label="Change Plan"
                    onClick={() =>
                      that.props.history.push({
                        pathname: '/pricing',
                      })
                    }
                  />
                </div>
              </Dialog>
            </div>
          </MuiThemeProvider>
        </div>
      );
    }
  }
}

SoundcastsManaged.propTypes = {
  userInfo: PropTypes.object,
  history: PropTypes.object,
  id: PropTypes.string,
};

const styles = {
  input: { ...commonStyles.input },
  containerWrapper: { ...commonStyles.containerWrapper },
  dialogTitle: {
    marginTop: 47,
    marginBottom: 49,
    textAlign: 'center',
    fontSize: 22,
  },
  titleText: {
    fontSize: 12,
  },
  row: {
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 0,
    backgroundColor: Colors.mainWhite,
  },
  soundcastInfo: {
    // height: 96,
    backgroundColor: Colors.mainWhite,
    paddingTop: 15,
    paddingBottom: 15,
    // paddingLeft: 0,
    paddingRight: 0,
  },
  soundcastImage: {
    width: '100%',
    height: '100%',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    // marginRight: 30,
    // float: 'left',
  },
  soundcastDescription: {
    // height: 46,
    // float: 'left',
    // width: '65%',
    paddingRight: 0,
  },
  soundcastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // display: 'block',
  },
  soundcastUpdated: {
    fontSize: 16,
  },
  edit: {
    height: 30,
    display: 'inline-block',
    verticalAlign: 'middle',
    marginTop: 10,
    marginBottom: 10,
  },
  editLink: {
    paddingTop: 10,
    paddingLeft: 20,
    fontSize: 17,
    fontWeight: 700,
    color: Colors.link,
    float: 'right',
    cursor: 'pointer',
    // display: 'block'
  },
  subscribers: {
    paddingTop: 10,
    // float: 'right',
    fontSize: 15,
    display: 'block',
    paddingLeft: 0,
    paddingRight: 0,
  },
  addLink: {
    color: Colors.link,
    fontSize: 15,
    display: 'block',
    // height: 11,
    // lineHeight: '11px',
    position: 'relative',
    bottom: 5,
    // width: 17,
    margin: '0 auto',
    paddingTop: 6,
    cursor: 'pointer',
  },
  button: {
    height: 35,
    maxWidth: 150,
    borderRadius: 5,
    fontSize: 16,
    // letterSpacing: 1.5,
    fontWeight: 'bold',
    wordSpacing: 4,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
    paddingLeft: 10,
    borderWidth: 1.5,
    marginTop: 10,
    marginRight: 7,
    marginLeft: 7,
    borderStyle: 'solid',
    cursor: 'pointer',
    // overflow: 'auto',
  },
  itemContainer: {
    marginTop: 30,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 15,
    backgroundColor: Colors.mainWhite,
    paddingTop: 10,
    paddingRight: 0,
    paddingBottom: 10,
    paddingLeft: 0,
  },
  itemHeader: {
    // height: 22,
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 25,
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 24,
    // float: 'left',
    // height: 22,
    // lineHeight: '22px',
  },
  addEpisodeLink: {
    // float: 'left',
    fontSize: 16,
    color: Colors.mainOrange,
    // marginLeft: 20,
    // height: 22,
    // lineHeight: '22px',
    cursor: 'pointer',
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 17,
    color: Colors.fontGrey,
    height: 35,
    fontWeight: 'regular',
    verticalAlign: 'middle',
  },
  td: {
    color: Colors.fontDarkGrey,
    fontSize: 17,
    color: 'black',
    height: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  },
  itemCheckbox: {
    marginTop: 7,
  },
  itemChartIcon: {
    // fontSize: 12,
    color: Colors.fontBlack,
    cursor: 'pointer',
  },
};
