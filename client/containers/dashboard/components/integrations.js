import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Link } from 'react-router-dom';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import YoutubeConnection from './youtube_channel_connection';
import { OrangeSubmitButton } from '../../../components/buttons/buttons';

function Modal(props) {
  let soundcast = props.userInfo.soundcasts_managed[props.currentSoundCastId];
  return (
    <div style={styles.backDrop} onClick={props.closeModal}>
      <div style={styles.modal}>
        <div
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '10px',
            paddingRight: '10px',
          }}
          onClick={props.closeModal}
        >
          <i className="fa fa-times fa-1x" />
        </div>
        <p
          style={{ textAlign: 'center', marginLeft: '30px', marginRight: '30px', fontSize: '14px' }}
        >
          You need to upload intro and/or outro to{' '}
          <strong>{props.userInfo.soundcasts_managed[props.currentSoundCastId].title}</strong> first
          to enable this option
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <OrangeSubmitButton
            label="Add intro/outro audio to soundcast"
            onClick={() =>
              props.history.push({
                pathname: '/dashboard/edit/' + props.currentSoundCastId,
                state: {
                  id: props.currentSoundCastId,
                  soundcast,
                },
              })
            }
            styles={{
              fontSize: '14px',
              letterSpacing: '1px',
              wordSpacing: '2px',
              margin: '0px auto',
              paddingRight: '10px',
              paddingLeft: '10px',
              height: '27px',
              paddingTop: '2px',
              paddingBottom: '2px',
              backgroundColor: Colors.mainOrange,
              borderWidth: '0px',
              width: 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
}

class YouTubeView extends Component {
  constructor(props) {
    super(props);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.getChannelPlaylist = this.getChannelPlaylist.bind(this);
    this.buildApiRequest = this.buildApiRequest.bind(this);
    this.executeRequest = this.executeRequest.bind(this);
    this.signOutYoutube = this.signOutYoutube.bind(this);
    this.signInYouTube = this.signInYouTube.bind(this);
    this.handleAuthClick = this.handleAuthClick.bind(this);
    this.setSigninStatus = this.setSigninStatus.bind(this);

    this.state = {
      signIn: false,
      playlist: {},
      channellist: {},
    };
  }

  componentDidMount() {
    if (this.setSigninStatus()) {
      this.getChannelPlaylist();
      this.setState({ signIn: true });
    }
  }

  setSigninStatus(isSignedIn) {
    let isAuthorized;
    if (GoogleAuth) {
      const user = GoogleAuth.currentUser.get();
      isAuthorized = user.hasGrantedScopes(SCOPE);
    }
    return !!isAuthorized; // bool
  }

  signOutYoutube() {
    if (GoogleAuth) {
      //updateSigninStatus will be invoked on sign in status change.
      this.setState({ signIn: false });
      GoogleAuth.signOut();
    }
  }

  signInYouTube(callback) {
    if (GoogleAuth) {
      GoogleAuth.isSignedIn.listen(status => this.updateSigninStatus(status, callback));
      GoogleAuth.signIn();
    } else {
      alert(`There is a problem with Google Sign In.`);
    }
  }

  handleAuthClick(callback) {
    //We setState here, so that there is a rerender on signon on change channel.
    //We check for GoogleAuth to be defined as there could be a scenario when
    //it becomes undefined after a user logs out.
    if (this.setSigninStatus()) {
      GoogleAuth.signOut().then(() => {
        this.signInYouTube(callback);
      });
    } else {
      this.signInYouTube(callback);
    }
  }

  updateSigninStatus(status, callback) {
    if (this.setSigninStatus()) {
      var user = GoogleAuth.currentUser.get();
      this.getChannelPlaylist();
      if (typeof callback == 'function') {
        callback();
      }
      this.setState({ signIn: true });
    } else {
      this.setState({ signIn: false });
    }
  }

  getChannelPlaylist() {
    gapi.client.youtube.channels
      .list({
        part: 'snippet,contentDetails,statistics',
        mine: 'true',
      })
      .then(
        function(response) {
          var channel = response.result.items[0];

          this.buildApiRequest('GET', '/youtube/v3/channels', {
            id: channel.id,
            part: 'snippet,contentDetails,statistics',
          });

          this.buildApiRequest('GET', '/youtube/v3/playlists', {
            channelId: channel.id,
            maxResults: '25',
            part: 'snippet,contentDetails',
          });
        }.bind(this)
      );
  }

  //BOLER PLATE FROM https://developers.google.com/youtube/v3/docs/channels/list
  createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
      var value = properties[p];
      if (p && p.substr(-2, 2) == '[]') {
        var adjustedName = p.replace('[]', '');
        if (value) {
          normalizedProps[adjustedName] = value.split(',');
        }
        delete normalizedProps[p];
      }
    }
    for (var p in normalizedProps) {
      // Leave properties that don't have values out of inserted resource.
      if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
        var propArray = p.split('.');
        var ref = resource;
        for (var pa = 0; pa < propArray.length; pa++) {
          var key = propArray[pa];
          if (pa == propArray.length - 1) {
            ref[key] = normalizedProps[p];
          } else {
            ref = ref[key] = ref[key] || {};
          }
        }
      }
    }
    return resource;
  }

  removeEmptyParams(params) {
    for (var p in params) {
      if (!params[p] || params[p] == 'undefined') {
        delete params[p];
      }
    }
    return params;
  }

  executeRequest(request) {
    request.execute(
      function(result) {
        if (result.kind == 'youtube#playlistListResponse') {
          this.setState({ playlist: result.items });
        }
        if (result.kind == 'youtube#channelListResponse') {
          this.setState({ channellist: result.items[0] });
        }
      }.bind(this)
    );
  }

  buildApiRequest(requestMethod, path, params, properties) {
    params = this.removeEmptyParams(params);
    var request;
    if (properties) {
      var resource = this.createResource(properties);
      request = gapi.client.request({
        body: resource,
        method: requestMethod,
        path: path,
        params: params,
      });
    } else {
      request = gapi.client.request({
        method: requestMethod,
        path: path,
        params: params,
      });
    }
    this.executeRequest(request);
  }

  render() {
    const { signIn } = this.state;
    const connected =
      this.props.userInfo.publisher &&
      (this.props.userInfo.publisher.youtubeConnect == 'REQUESTED' ||
        (this.props.userInfo.publisher.youtubeConnect == 'CONNECTED' &&
          this.props.userInfo.publisher.soundcastFromYoutube));
    let SignInbutton = (
      <OrangeSubmitButton
        label="Connect Your YouTube Channel"
        onClick={this.handleAuthClick}
        styles={{
          fontSize: '14px',
          width: '25em',
          letterSpacing: '1px',
          wordSpacing: '2px',
          margin: '7px 0 50px',
          paddingRight: '10px',
          paddingLeft: '10px',
          backgroundColor: Colors.link,
          borderWidth: '0px',
        }}
      />
    );
    return (
      <div>
        {signIn || connected ? (
          <YoutubeConnection
            userInfo={this.props.userInfo}
            playlist={this.state.playlist}
            channel={this.state.channellist}
            openModal={this.props.openModal}
            signOut={this.signOutYoutube}
            handleAuth={this.handleAuthClick}
          />
        ) : (
          SignInbutton
        )}
      </div>
    );
  }
}

const IntegrationView = props => {
  const {
    styles,
    connectionStatus,
    apiKey,
    invalidApiKey,
    onApiKeyChange,
    saveIntegration,
    existingApiKey,
    integrationSelected,
  } = props;

  if (integrationSelected === 'YouTube') {
    return (
      <div>
        <YouTubeView openModal={props.openModal} userInfo={props.userInfo} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...styles.inputTitleWrapper, display: 'flex' }}>
        <span
          style={{
            ...styles.titleText,
            padding: '10px 10px 10px 0px',
            width: '120px',
            marginRight: '16',
          }}
        >
          Status
        </span>
        <span
          style={{
            ...styles.titleText,
            padding: '10px 10px 10px 0px',
            marginRight: '16',
          }}
        >
          {connectionStatus ? (
            <span style={styles.muted}>Connected</span>
          ) : (
            <span>Not Connected</span>
          )}
        </span>
      </div>
      <div style={{ ...styles.inputTitleWrapper, display: 'flex' }}>
        <span
          style={{
            ...styles.titleText,
            padding: '10px 10px 10px 0px',
            width: '150px',
            marginRight: '16',
          }}
        >
          API Key
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <input
            type="text"
            style={{
              ...styles.inputTitle,
              flexGrow: '1',
              color: existingApiKey == apiKey ? Colors.fontGrey : Colors.fontBlack,
            }}
            value={apiKey}
            onChange={onApiKeyChange}
          />
          {invalidApiKey ? <div style={{ color: Colors.mainOrange }}> Invalid API Key </div> : null}
          <span>
            The API key for connecting with your MailChimp account.
            <a
              href="https://admin.mailchimp.com/account/api/"
              target="_blank"
              style={{
                fontWeight: 600,
                color: Colors.mainOrange,
              }}
            >
              {' '}
              Get your API key here.
            </a>
          </span>
        </div>
      </div>

      <div>
        <OrangeSubmitButton
          label="Save"
          onClick={saveIntegration}
          styles={{
            margin: '7px 0 50px',
            backgroundColor: Colors.link,
            borderWidth: '0px',
          }}
        />
      </div>
    </div>
  );
};

export default class Integrations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      integrationSelected: '',
      apiKey: '',
      connectionStatus: false,
      invalidApiKey: false,
      introOutro: false,
      currentSoundCastId: '',
    };
    this.apiKey = '';
    this.saveIntegration = this.saveIntegration.bind(this);
    this.retrieveMailChimpKey = this.retrieveMailChimpKey.bind(this);
    this.onApiKeyChange = this.onApiKeyChange.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
  }

  closeModal() {
    this.setState({ introOutro: false });
  }

  openModal(id) {
    this.setState({ introOutro: true, currentSoundCastId: id });
  }

  componentDidMount() {
    const { userInfo } = this.props;
    this.retrieveMailChimpKey(userInfo);
  }

  componentWillReceiveProps(nextProps) {
    const { userInfo } = nextProps;
    if (userInfo && userInfo.publisher) {
      if (userInfo.publisher.mailChimp != null) {
        if (
          this.props.userInfo.publisher &&
          this.props.userInfo.publisher.mailChimp &&
          userInfo.publisher.mailChimp
        ) {
          if (
            this.props.userInfo.publisher.mailChimp.apiKey != userInfo.publisher.mailChimp.apiKey
          ) {
            this.retrieveMailChimpKey(userInfo);
          }
        } else if (this.state.integrationSelected != 'YouTube' && userInfo.publisher.mailChimp) {
          this.retrieveMailChimpKey(userInfo);
        }
      }
    }
  }

  retrieveMailChimpKey(userInfo) {
    const publisherId = userInfo.publisherID;
    firebase
      .database()
      .ref(`publishers/${publisherId}/mailChimp`)
      .on('value', snapshot => {
        const mailChimp = snapshot.val();
        if (mailChimp != null) {
          this.apiKey = mailChimp.apiKey;
          this.setState({
            apiKey: mailChimp.apiKey,
            connectionStatus: true,
            integrationSelected: 'Mailchimp',
            invalidApiKey: false,
          });
        }
      });
  }

  saveIntegration() {
    if (this.state.integrationSelected != '' && this.state.apiKey === '') {
      alert('Please enter the API key');
    }

    if (this.state.integrationSelected != '' && this.state.apiKey != this.apiKey) {
      Axios.post('/api/mail_manage', {
        publisherId: this.props.userInfo.publisherID,
        integrationSelected: this.state.integrationSelected,
        apiKey: this.state.apiKey,
      })
        .then(res => {
          //As firebase sends realtime notifications, we do not really need this, but what the heck!
          this.apiKey = this.state.apiKey;
          this.setState({
            invalidApiKey: false,
            connectionStatus: true,
          });
        })
        .catch(error => {
          if (error.response.status === 404) {
            this.setState({ invalidApiKey: true });
          }
        });
    }
  }

  onApiKeyChange(e) {
    this.setState({ apiKey: e.target.value });
  }

  render() {
    const { integrationSelected } = this.state;

    const { userInfo } = this.props;
    return (
      <div className="container">
        <div className="row">
          {this.state.introOutro && (
            <Modal
              closeModal={this.closeModal}
              history={this.props.history}
              currentSoundCastId={this.state.currentSoundCastId}
              userInfo={this.props.userInfo}
            />
          )}

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12" style={{ minHeight: 700 }}>
            <div style={{ display: 'flex', marginTop: '20px', marginBottom: '20px' }}>
              <span
                style={{
                  ...styles.titleText,
                  padding: '10px 10px 10px 0px',
                  width: '120px',
                  marginRight: '16',
                  flex: '2',
                }}
              >
                Connect with
              </span>
              <div style={{ width: 'auto', flex: '4' }} className="dropdown">
                <div
                  style={{ width: '100%', padding: 0 }}
                  className="btn dropdown-toggle"
                  data-toggle="dropdown"
                >
                  <div style={styles.dropdownTitle}>
                    <span style={{ ...styles.titleText, padding: '20px' }}>
                      {integrationSelected != '' ? integrationSelected : `Choose Integration`}
                    </span>
                    <span style={{ position: 'absolute', right: 10, top: 20 }} className="caret" />
                  </div>
                </div>
                <ul
                  style={{ padding: 0 }}
                  className="dropdown-menu"
                  style={{ width: '100%', padding: 0 }}
                >
                  <li style={{ fontSize: '16px', width: '100%' }}>
                    <button
                      style={{ ...styles.categoryButton, width: '100%' }}
                      onClick={() => {
                        this.setState({ integrationSelected: 'Mailchimp' });
                      }}
                    >
                      Mailchimp
                    </button>
                  </li>
                  <li style={{ fontSize: '16px', width: '100%' }}>
                    <button
                      style={{ ...styles.categoryButton, width: '100%' }}
                      onClick={() => {
                        this.setState({ integrationSelected: 'YouTube' });
                      }}
                    >
                      YouTube
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            {integrationSelected === '' ? null : (
              <IntegrationView
                integrationSelected={integrationSelected}
                styles={styles}
                connectionStatus={this.state.connectionStatus}
                apiKey={this.state.apiKey}
                invalidApiKey={this.state.invalidApiKey}
                onApiKeyChange={this.onApiKeyChange}
                saveIntegration={this.saveIntegration}
                existingApiKey={this.apiKey}
                openModal={this.openModal}
                userInfo={this.props.userInfo}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  titleText: { ...commonStyles.titleText },
  inputTitleWrapper: { ...commonStyles.inputTitleWrapper },
  inputTitle: { ...commonStyles.inputTitle, fontSize: 16 },
  dropdownTitle: { ...commonStyles.dropdownTitle },
  categoryButton: { ...commonStyles.categoryButton },
  muted: {
    fontSize: 16,
    color: Colors.fontGrey,
    fontWeight: 'regular',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
  backDrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '0px',
    left: '0px',
    right: '0px',
    zIndex: '9998',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  titleText: { ...commonStyles.titleText },
  dropdownTitle: { ...commonStyles.dropdownTitle },
  thumbSwitched: {
    backgroundColor: Colors.link,
  },
  trackSwitched: {
    backgroundColor: Colors.link,
  },
  modal: {
    position: 'absolute',
    top: '55%',
    left: '50%',
    width: '70%',
    height: '25vh',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999',
    background: '#fff',
  },
};
