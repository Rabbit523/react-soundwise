import React, { Component } from 'react';
import Axios from 'axios';
import * as firebase from 'firebase';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import Toggle from 'material-ui/Toggle';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { OrangeSubmitButton } from '../../../components/buttons/buttons';
import Spinner from 'react-activity/lib/Spinner';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { itunesCategories } from '../../../helpers/itunes_categories';
import * as _ from 'lodash';
import moment from 'moment';

function SaveConvertButton(props) {
  const { label, writeData } = props;
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <OrangeSubmitButton
        label={label}
        onClick={writeData}
        styles={{
          fontSize: '13px',
          letterSpacing: '1px',
          wordSpacing: '2px',
          margin: '35px 0 50px',
          paddingRight: '10px',
          paddingLeft: '10px',
          height: '27px',
          paddingTop: '2px',
          backgroundColor: Colors.link,
          borderWidth: '0px',
        }}
      />
    </div>
  );
}

export default class YoutubeConnection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requested: false,
      channelName: '',
      playlistName: '',
      connected: false,
      soundcast_Id: '',
      introOutro: false,
      optimiseVolume: false,
      trimSilence: false,
      convertingVideo: false,
      itunesExplicit: true,
      submitFeed: true,
      createPodcastFeed: false,
      overlayDuration: '',
      itune1: '',
      itune2: '',
      itune3: '',
      fileUploaded: false,
      playlistId: '',
      changeChannel: false,
    };

    this.soundcasts_managed = [];
    this.blockButton = false;
    this.soundcastData = {};
    this.optionsUpdated = false;
    this.currentImageRef = null;
    this.fileInputRef = null;
    this.ituneImage = '';

    this.onSelectIntroOutro = this.onSelectIntroOutro.bind(this);
    this.onSelectOptimisevolume = this.onSelectOptimisevolume.bind(this);
    this.onSelectTrimSilence = this.onSelectTrimSilence.bind(this);
    this.onMountOrReceiveProps = this.onMountOrReceiveProps.bind(this);
    this.changePlaylistId = this.changePlaylistId.bind(this);
    this.changeItune1 = this.changeItune1.bind(this);
    this.changeItune2 = this.changeItune2.bind(this);
    this.changeItune3 = this.changeItune3.bind(this);
    this.writeData = this.writeData.bind(this);
    this.areOptionsUpdated = this.areOptionsUpdated.bind(this);
    this.saveInFirebase = this.saveInFirebase.bind(this);
    this.sendAxiosRequest = this.sendAxiosRequest.bind(this);
    this.displayToggleOrUrl = this.displayToggleOrUrl.bind(this);
    this.displayFeedOptions = this.displayFeedOptions.bind(this);
    this.displayConnectVideos = this.displayConnectVideos.bind(this);
    this.setFileName = this.setFileName.bind(this);
    this.displayItunesImage = this.displayItunesImage.bind(this);
    this.saveItunesImage = this.saveItunesImage.bind(this);
    this.isRequestValid = this.isRequestValid.bind(this);
    this.changeChannel = this.changeChannel.bind(this);
    this.disconnectYoutube = this.disconnectYoutube.bind(this);
    this.disconnectFirebase = this.disconnectFirebase.bind(this);
    this.sendAxiosDisconnect = this.sendAxiosDisconnect.bind(this);
    this.updateStateOnChannelChange = this.updateStateOnChannelChange.bind(this);
    this.renderProgressBarOrLabel = this.renderProgressBarOrLabel.bind(this);
    this.displayAudioProcessing = this.displayAudioProcessing.bind(this);
    this.addIntroOutro = this.addIntroOutro.bind(this);
    this.displayChangeDisconnectButtons = this.displayChangeDisconnectButtons.bind(this);
    this.setConnectInFirebase = this.setConnectInFirebase.bind(this);
  }

  componentDidMount() {
    this.onMountOrReceiveProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.onMountOrReceiveProps(nextProps);
  }

  onMountOrReceiveProps(props) {
    const { userInfo } = props;
    if (userInfo.soundcasts_managed && userInfo.publisher) {
      if (typeof Object.values(userInfo.soundcasts_managed)[0] == 'object') {
        const _soundcasts_managed = [];

        for (let id in userInfo.soundcasts_managed) {
          const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
          if (_soundcast.title) {
            _soundcast.id = id;
            _soundcasts_managed.push(_soundcast);
          }
        }
        this.soundcasts_managed = _soundcasts_managed;
      } else {
        // There are no managed soundcasts, so set the soundcast id to the 'create new' option
        this.setState({
          soundcast_Id: 'CREATE_NEW',
        });
      }
    }

    if (
      userInfo.publisher &&
      userInfo.publisher.youtubeConnect == 'REQUESTED' &&
      userInfo.publisher.soundcastFromYoutube
    ) {
      this.setConnectInFirebase();
    }

    let connectstatus = 'NEVERCONNECTED';
    if (userInfo.publisher) {
      if (
        userInfo.publisher.youtubeConnect == null ||
        userInfo.publisher.youtubeConnect != 'REQUESTED' ||
        this.state.changeChannel
      ) {
        connectstatus = 'NEVERCONNECTED';
      } else {
        connectstatus =
          userInfo.publisher.youtubeConnect == 'REQUESTED' ? 'REQUESTED' : 'DISCONNECTED';
      }
    }

    if (userInfo.publisher && userInfo.publisher.soundcastFromYoutube) {
      let connected = connectstatus != 'DISCONNECTED' && !this.state.changeChannel ? true : false;

      if (connected) {
        // Get the soundcast information from the soundcast
        const { soundcastFromYoutube } = userInfo.publisher;
        const soundcast_Id = soundcastFromYoutube.soundcastId;
        const { audioProcessingOptions } = soundcastFromYoutube;
        const connectedSoundcast = userInfo.soundcasts_managed[soundcast_Id];

        //Get information from publishers - soundcastFromYoutube
        const playlistName = soundcastFromYoutube.playlistName
          ? soundcastFromYoutube.playlistName
          : '';
        const playlistId = soundcastFromYoutube.playlistId ? soundcastFromYoutube.playlistId : '';
        const channelName = soundcastFromYoutube.channelName
          ? soundcastFromYoutube.channelName
          : '';

        //Get the itunesCategory
        const ituneCat1 =
          connectedSoundcast &&
          connectedSoundcast.itunesCategory &&
          connectedSoundcast.itunesCategory.length > 0;
        const ituneCat2 =
          connectedSoundcast &&
          connectedSoundcast.itunesCategory &&
          connectedSoundcast.itunesCategory.length > 1;
        const ituneCat3 =
          connectedSoundcast &&
          connectedSoundcast.itunesCategory &&
          connectedSoundcast.itunesCategory.length > 2;

        //Get if the material contains explicit language. We aren't using this from soundcast,
        //instead we pick up the value set by the server in audioProcessingOptions.
        // const explicit = connectedSoundcast && connectedSoundcast.itunesExplicit;

        soundcast_Id && this.displayItunesImage(connectedSoundcast);

        this.setState({
          connected: connected,
          playlistName: playlistName,
          channelName: channelName,
          soundcast_Id: soundcast_Id,
          itunesExplicit: audioProcessingOptions.itunesExplicit,
          itune1: ituneCat1 ? connectedSoundcast.itunesCategory[0] : '',
          itune2: ituneCat2 ? connectedSoundcast.itunesCategory[1] : '',
          itune3: ituneCat3 ? connectedSoundcast.itunesCategory[2] : '',
          optimiseVolume: audioProcessingOptions.setVolume,
          trimSilence: audioProcessingOptions.trim,
          introOutro: audioProcessingOptions.intro || audioProcessingOptions.outro,
          overlayDuration: audioProcessingOptions.overlayDuration,
          createPodcastFeed: audioProcessingOptions.createChannelFeed
            ? audioProcessingOptions.createChannelFeed
            : false,
          playlistId,
        });
      }
    }

    this.setState({ requested: connectstatus });
  }

  //Todo: options from props should come from publisher.
  areOptionsUpdated() {
    const optionFromProps = this.props.userInfo.soundcastFromYoutube;

    const optionsFromstate = {
      itunesExplicit: this.state.itunesExplicit,
      itune1: this.state.itune1,
      itune2: this.state.itune2,
      itune3: this.state.itune3,
      optimiseVolume: this.state.optimiseVolume,
      trimSilence: this.state.trimSilence,
      introOutro: this.state.introOutro,
      overlayDuration: this.state.overlayDuration,
    };

    if (!_.isEqual(optionFromProps, optionsFromstate)) {
      this.optionsUpdated = true;
    }
    if (optionFromProps == null) {
      this.optionsUpdated = true;
    }
  }

  isRequestValid() {
    let validRequest = false;

    const { userInfo } = this.props;
    validRequest = this.checkIfUserIsPublisher(userInfo);
    validRequest = validRequest ? this.checkIfSelectedVideo() : false;
    validRequest = validRequest ? this.checkIfSelectedSoundCast() : false;

    return validRequest;
  }

  async writeData(e, options) {
    e.preventDefault();
    const { soundcast_Id } = this.state;

    let alertMsg = 'Conversion request registered.';
    if (options.skipChannelConversion == true) {
      alertMsg = 'Settings are saved.';
    }

    if (!this.blockButton) {
      let axiosRequest = null;
      let validRequest = this.isRequestValid();

      if (validRequest) {
        this.blockButton = true;
        const { userInfo } = this.props;

        this.setState({ convertingVideo: true });

        const itunesCategory = [this.state.itune1];
        this.state.itune2 && itunesCategory.push(this.state.itune2);
        this.state.itune3 && itunesCategory.push(this.state.itune3);

        //Check if there already exists a podcast feed URL.
        //If an URL exists from before, we would need to set the createChannelFeed to true.
        const { soundcasts_managed } = userInfo;
        let UrlExists =
          typeof (soundcasts_managed[soundcast_Id] || {}).podcastFeedVersion === 'undefined'
            ? false
            : true;

        //upload new image to S3/Firebase
        let itunesImage;
        const soundcastId = soundcast_Id === 'CREATE_NEW' ? `${Date.now()}s` : soundcast_Id;
        if (this.currentImageRef) {
          itunesImage = await this.saveItunesImage(soundcastId);
        }

        const soundcastData = {
          newSoundcast: soundcast_Id === 'CREATE_NEW',
          soundcastId,
          publisherId: userInfo.publisherID,
          creatorId: userInfo.id,
          channelId: this.props.channel.id,
          playlistId: this.state.playlistId,
          itunesCategory,
          itunesImage,
          autoSubmitPodcast: !this.state.submitFeed,
          audioProcessingOptions: {
            trim: this.state.trimSilence,
            overlayDuration: this.state.introOutro ? this.state.overlayDuration : null,
            intro: this.state.introOutro ? userInfo.soundcasts_managed[soundcast_Id].intro : null,
            outro: this.state.introOutro ? userInfo.soundcasts_managed[soundcast_Id].outro : null,
            setVolume: this.state.optimiseVolume,
            tagging: true,
            createChannelFeed: this.state.createPodcastFeed || UrlExists,
            itunesExplicit: this.state.itunesExplicit,
          },
          ...(options.skipChannelConversion == true ? { skipChannelConversion: true } : {}),
        };

        axiosRequest = this.sendAxiosRequest(soundcastData);

        //const firebasePromise = this.saveInFirebase();
        Promise.all([axiosRequest, this.saveInFirebase()]).then(
          function(res) {
            this.blockButton = false;
            setTimeout(function() {
              alert(alertMsg);
            }, 300);
          }.bind(this),
          function(err) {
            this.blockButton = false;
            console.log('promise error: ', err);
            setTimeout(function() {
              alert('There was an error sending your conversion request.');
            }, 300);
          }.bind(this)
        );
      }
    }
  }

  async saveItunesImage(soundcastId) {
    // TODO check for currentImageRef to be non null
    let data = new FormData();
    const splittedFileName = this.currentImageRef.type.split('/');
    const ext = splittedFileName[splittedFileName.length - 1];
    let fileName = `${soundcastId}-${moment().format('x')}.${ext}`;
    data.append('file', this.currentImageRef, fileName);
    return new Promise(resolve => {
      Axios.post('/api/upload', data)
        .then(res => {
          // POST succeeded...
          //replace 'http' with 'https'
          let url = res.data[0].url;
          if (url.slice(0, 5) !== 'https') {
            url = url.replace(/http/i, 'https');
          }
          this.currentImageRef = null;
          this.ituneImage = url;
          this.setState({ fileUploaded: false });
          resolve(url);
        })
        .catch(err => {
          // POST failed...
          console.log('ERROR upload to aws s3: ', err);
          resolve('');
        });
    });
  }

  saveInFirebase() {
    const { userInfo } = this.props;
    return firebase
      .database()
      .ref(`publishers/${userInfo.publisherID}/youtubeConnect`)
      .set('REQUESTED');
  }

  setConnectInFirebase() {
    const { userInfo } = this.props;
    return firebase
      .database()
      .ref(`publishers/${userInfo.publisherID}/youtubeConnect`)
      .set('CONNECTED');
  }

  disconnectFirebase() {
    const { userInfo } = this.props;
    return firebase
      .database()
      .ref(`publishers/${userInfo.publisherID}/youtubeConnect`)
      .remove();
  }

  changeChannel() {
    this.props.handleAuth(this.updateStateOnChannelChange);
  }

  updateStateOnChannelChange() {
    this.setState({ connected: false, changeChannel: true, requested: 'NEVERCONNECTED' });
  }

  disconnectYoutube() {
    const { userInfo } = this.props;

    this.props.signOut();

    if (this.state.connected) {
      const soundcastData = {
        publisherId: userInfo.publisherID,
        creatorId: userInfo.id,
        deleteChannelSubscription: true,
        skipChannelConversion: true,
      };
      this.sendAxiosDisconnect(soundcastData);
    }
  }

  onSelectIntroOutro() {
    //UI will not respond if nothing selected.
    const { soundcast_Id } = this.state;
    if (soundcast_Id) {
      if (this.props.userInfo.soundcasts_managed[soundcast_Id].intro) {
        this.setState({ introOutro: !this.state.introOutro });
      } else {
        this.props.openModal(soundcast_Id);
      }
    }
  }

  onSelectOptimisevolume() {
    this.setState({ optimiseVolume: !this.state.optimiseVolume });
  }

  onSelectTrimSilence() {
    this.setState({ trimSilence: !this.state.trimSilence });
  }

  checkIfUserIsPublisher(userInfo) {
    if (userInfo.publisherID != null) {
      return true;
    }
    alert('Only for soundcast publishers.');
  }

  checkIfSelectedVideo() {
    if (!this.state.playlistId) {
      alert('Please select a video or the entire channel');
    }
    return true;
  }

  checkIfSelectedSoundCast() {
    if (this.state.soundcast_Id != '') {
      return true;
    }
    alert('Please select a soundcast');
    return false;
  }

  changeSoundcastId(e) {
    //When soundcast changed, get the information from publishers/soundcastFromYoutube and soundcasts
    // update states related to soundcast, do not update playlistName, playlistId and ChannelName as
    // those are not related to a particular soundcast.

    let soundcast_Id = e.target.value;
    const { userInfo } = this.props;
    let selectedSoundcast =
      soundcast_Id != 'CREATE_NEW' ? userInfo.soundcasts_managed[soundcast_Id] : null;

    //Message for basic plan users to upgrade on selecting new soundcast.
    let nowTime = Math.floor(new Date().getTime() / 1000);
    if (
      soundcast_Id == 'CREATE_NEW' &&
      userInfo.publisher.plan == 'basic' &&
      userInfo.publisher.current_period_end < nowTime
    ) {
      alert(
        'You’ve already filled the soundcast quota of your current plan. Please upgrade to add new soundcasts.'
      );
      return;
    }

    //Get the itunesCategory
    const ituneCat1 =
      selectedSoundcast &&
      selectedSoundcast.itunesCategory &&
      selectedSoundcast.itunesCategory.length > 0;
    const ituneCat2 =
      selectedSoundcast &&
      selectedSoundcast.itunesCategory &&
      selectedSoundcast.itunesCategory.length > 1;
    const ituneCat3 =
      selectedSoundcast &&
      selectedSoundcast.itunesCategory &&
      selectedSoundcast.itunesCategory.length > 2;

    //Get information from publishers - soundcastFromYoutube
    //Get the current playlistName and options saved.
    const { soundcastFromYoutube } = userInfo.publisher;
    let audioProcessingOptions = {};
    let optionsPresent = false;

    if (soundcastFromYoutube && soundcastFromYoutube.audioProcessingOptions) {
      optionsPresent = true;
      audioProcessingOptions = soundcastFromYoutube.audioProcessingOptions;
    }

    //Get if the material contains explicit language. We aren't using this from soundcast,
    //instead we pick up the value set by the server in audioProcessingOptions. So below code is commented.
    // const explicit = connectedSoundcast.itunesExplicit;

    const itunesExplicit =
      optionsPresent && audioProcessingOptions.itunesExplicit
        ? audioProcessingOptions.itunesExplicit
        : true;
    const optimiseVolume = audioProcessingOptions.optimiseVolume;
    const trimSilence = audioProcessingOptions.trim;
    const introOutro = audioProcessingOptions.intro || audioProcessingOptions.outro;
    const overlayDuration = audioProcessingOptions.overlayDuration
      ? audioProcessingOptions.overlayDuration
      : '';
    const createPodcastFeed = false;

    this.setState({
      soundcast_Id,
      itunesExplicit,
      itune1: ituneCat1 ? selectedSoundcast.itunesCategory[0] : '',
      itune2: ituneCat2 ? selectedSoundcast.itunesCategory[1] : '',
      itune3: ituneCat3 ? selectedSoundcast.itunesCategory[2] : '',
      optimiseVolume,
      trimSilence,
      introOutro,
      overlayDuration,
      createPodcastFeed,
    });

    // Handle the image
    this.currentImageRef = null;
    selectedSoundcast && this.displayItunesImage(selectedSoundcast);
  }

  changePlaylistId(e) {
    this.setState({ playlistId: e.target.value });
  }

  changeItune1(e) {
    this.setState({ itune1: e.target.value });
  }

  changeItune2(e) {
    this.setState({ itune2: e.target.value });
  }

  changeItune3(e) {
    this.setState({ itune3: e.target.value });
  }

  sendAxiosRequest(soundcastData) {
    const { userInfo } = this.props;
    return new Promise(
      function(resolve, reject) {
        Axios.post('/api/parse_channel', soundcastData)
          .then(
            function(result) {
              this.setState({ convertingVideo: false, changeChannel: false }, () => {
                console.log('Submitted request');
              });
              resolve();
            }.bind(this)
          )
          .catch(
            function(err) {
              this.setState({ convertingVideo: false }, () => {
                //We need a 300ms delay, so the dom re-renders before alert is shown.
              });
              reject(err);
            }.bind(this)
          );
      }.bind(this)
    );
  }

  sendAxiosDisconnect(soundcastData) {
    return new Promise(
      function(resolve, reject) {
        Axios.post('/api/parse_channel', soundcastData)
          .then(
            function(result) {
              this.disconnectFirebase().then(() => {
                resolve();
              });
            }.bind(this)
          )
          .catch(
            function(err) {
              reject(err);
            }.bind(this)
          );
      }.bind(this)
    );
  }

  renderProgressBarOrLabel(label) {
    if (this.state.convertingVideo) {
      return <Spinner size={16} speed={1} />;
    } else {
      return <span> {label} </span>;
    }
  }

  showOptions() {
    return (
      <div style={{ fontSize: '16px' }}>
        <div style={{ display: 'inline-flex' }}>
          <input
            style={{ width: '16px', height: '16px', margin: '8px' }}
            type="checkbox"
            checked={!this.state.submitFeed}
            onChange={() =>
              this.setState(currentState => {
                return { submitFeed: !currentState.submitFeed };
              })
            }
          />
          <span style={{ margin: '8px 8px 8px 0px', fontSize: '16px', whiteSpace: 'nowrap' }}>
            {' '}
            Submit the feed for me to Apple Podcasts, Google Podcasts, and Spotify
          </span>
        </div>
        <div>
          <input
            style={{ width: '16px', height: '16px', margin: '8px' }}
            type="checkbox"
            checked={this.state.submitFeed}
            onChange={() =>
              this.setState(currentState => {
                return { submitFeed: !currentState.submitFeed };
              })
            }
          />
          <span style={{ margin: '8px 8px 8px 0px', fontSize: '16px' }}>
            I will submit the feed myself
          </span>
        </div>
      </div>
    );
  }

  displayItunesImage(soundcast) {
    this.setState({ fileUploaded: false });

    //let soundcast = this.props.userInfo.soundcasts_managed[soundcast_Id];
    let img = new Image();
    img.onload = function() {
      let height = img.naturalHeight || img.height;
      let width = img.naturalWidth || img.width;
      if (height >= 1400 && height <= 3000 && width >= 1400 && width <= 3000) {
        // the size is good.
      } else {
        // the size isn't good so blank it out.
        this.ituneImage = '';
      }
    }.bind(this);

    if (soundcast && soundcast.itunesImage) {
      this.ituneImage = soundcast.itunesImage;
    } else {
      //If no itunesImage, try the imageURL
      if (soundcast && soundcast.imageURL) {
        this.ituneImage = soundcast.imageURL;
      }
    }

    img.src = this.ituneImage;
  }

  displayFeedOptions() {
    const categoryObj = itunesCategories;
    const itunesArr = [];
    for (let key in categoryObj) {
      if (categoryObj[key].sub) {
        categoryObj[key].sub.forEach(sub => {
          itunesArr.push(`${categoryObj[key].name} - ${sub}`);
        });
      } else {
        itunesArr.push(categoryObj[key].name);
      }
    }
    itunesArr.unshift('');
    return (
      <div style={{ padding: '10px 10px 10px 0px' }}>
        <div style={{ ...styles.titleText, paddingBottom: 15 }}>
          The material contains explicit language
        </div>

        <RadioButtonGroup
          name="Contains explicit language"
          defaultSelected={this.state.itunesExplicit}
          onChange={(e, value) => this.setState({ itunesExplicit: value })}
        >
          <RadioButton
            value={true}
            label="Yes"
            labelStyle={styles.titleText}
            style={styles.radioButton}
          />
          <RadioButton
            value={false}
            label="No"
            labelStyle={styles.titleText}
            style={styles.radioButton}
          />
        </RadioButtonGroup>

        <div style={{ marginTop: 20, height: 150 }}>
          <div style={styles.image}>
            <img src={this.ituneImage} />
          </div>
          <div style={styles.loaderWrapper}>
            <div style={{ ...styles.titleText, marginLeft: 10 }}>Podcast cover art</div>
            <div style={{ ...styles.fileTypesLabel, marginLeft: 10 }}>
              At least 1400 x 1400 pixels in .jpg or .png format. Must not exceed 3000 x 3000 pixels
            </div>
            <div style={{ ...styles.inputFileWrapper, marginTop: 0 }}>
              <input
                type="file"
                name="upload"
                id="upload_hidden_cover"
                accept="image/*"
                onChange={this.setFileName}
                style={styles.inputFileHidden}
                ref={input => (this.fileInputRef = input)}
              />
              {(this.state.fileUploaded && this.fileInputRef && (
                <div>
                  <span>{this.fileInputRef.files[0] && this.fileInputRef.files[0].name}</span>
                  <span
                    style={styles.cancelImg}
                    onClick={() => {
                      this.setState({ fileUploaded: false });
                      this.ituneImage = '';
                      this.fileInputRef.value = null;
                    }}
                  >
                    Cancel
                  </span>
                </div>
              )) ||
                (!this.state.fileUploaded && (
                  <div>
                    <button
                      onClick={() => this.fileInputRef.click()}
                      style={{ ...styles.uploadButton, backgroundColor: Colors.link }}
                    >
                      Upload
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div style={{ width: 'auto', marginBottom: '10px' }} className="dropdown">
          <div
            style={{ width: '100%', padding: 0 }}
            className="btn dropdown-toggle"
            data-toggle="dropdown"
          >
            <div style={{ ...styles.dropdownTitle }}>
              <div style={{ display: 'flex' }}>
                <span>iTunes Category 1 (required)</span>
                <span style={{ color: 'red', textAlign: 'left' }}>*</span>
              </div>

              <select
                style={{
                  ...styles.dropdownTitle,
                  borderColor: '#e6e6e6',
                  color: '#a6a6a6',
                  marginBottom: '0px',
                }}
                onChange={e => this.changeItune1(e)}
                value={this.state.itune1}
              >
                {itunesArr.map((itune, i) => {
                  return (
                    <option style={styles.option} value={itune} key={i}>
                      {itune}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div style={{ width: 'auto', marginBottom: '10px' }} className="dropdown">
          <div
            style={{ width: '100%', padding: 0 }}
            className="btn dropdown-toggle"
            data-toggle="dropdown"
          >
            <div style={{ ...styles.dropdownTitle }}>
              <div style={{ display: 'flex' }}>
                <span>iTunes Category 2</span>
              </div>

              <select
                style={{
                  ...styles.dropdownTitle,
                  borderColor: '#e6e6e6',
                  color: '#a6a6a6',
                  marginBottom: '0px',
                }}
                onChange={e => this.changeItune2(e)}
                value={this.state.itune2}
              >
                {itunesArr.map((itune, i) => {
                  return (
                    <option style={styles.option} value={itune} key={i}>
                      {itune}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div style={{ width: 'auto' }} className="dropdown">
          <div
            style={{ width: '100%', padding: 0 }}
            className="btn dropdown-toggle"
            data-toggle="dropdown"
          >
            <div style={{ ...styles.dropdownTitle }}>
              <div style={{ display: 'flex' }}>
                <span>iTunes Category 3 </span>
              </div>
              <select
                style={{
                  ...styles.dropdownTitle,
                  borderColor: '#e6e6e6',
                  color: '#a6a6a6',
                  marginBottom: '0px',
                }}
                onChange={e => this.changeItune3(e)}
                value={this.state.itune3}
              >
                {itunesArr.map((itune, i) => {
                  return (
                    <option style={styles.option} value={itune} key={i}>
                      {itune}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        {this.showOptions()}
      </div>
    );
  }

  addIntroOutro() {
    let id = this.state.soundcast_Id;
    let newSoundcast = id == 'CREATE_NEW' ? true : false;
    if (!newSoundcast) {
      return (
        <div>
          <div style={{ display: 'flex' }}>
            <Toggle
              label=""
              toggled={this.state.introOutro}
              onClick={this.onSelectIntroOutro}
              thumbSwitchedStyle={styles.thumbSwitched}
              trackSwitchedStyle={styles.trackSwitched}
              style={{ fontSize: 20, width: '11%' }}
            />
            <span style={{ fontWeight: 'bold' }}>Attach intro/outro</span>
          </div>

          {this.state.introOutro ? (
            <div style={{ display: 'flex', marginLeft: '63px', marginTop: '10px' }}>
              <p style={{ fontSize: '14px' }}>Overlap with main audio:</p>
              <div style={{ marginLeft: '10px', marginRight: '10px', width: '14%' }}>
                <input
                  type="text"
                  style={{ ...styles.inputTitle, height: '30px', fontSize: '14px' }}
                  onChange={e => this.setState({ overlayDuration: e.target.value })}
                  value={this.state.overlayDuration}
                />
              </div>
              <p style={{ fontSize: '14px' }}>second(s)</p>
            </div>
          ) : null}
        </div>
      );
    } else {
      return null;
    }
  }

  displayAudioProcessing() {
    return (
      <div>
        <p
          style={{
            padding: '10px 0px 0px 0px',
            fontWeight: 'bold',
            marginBottom: '8px',
            fontSize: '16px',
          }}
        >
          Audio Processing Options
        </p>
        <div style={{ fontSize: '16px' }}>
          <div style={{ display: 'flex' }}>
            <Toggle
              label=""
              toggled={this.state.optimiseVolume}
              onClick={this.onSelectOptimisevolume}
              thumbSwitchedStyle={styles.thumbSwitched}
              trackSwitchedStyle={styles.trackSwitched}
              style={{ fontSize: 20, width: '11%' }}
            />
            <span style={{ fontWeight: 'bold' }}>Optimize volume</span>
          </div>

          <div style={{ display: 'flex' }}>
            <Toggle
              label=""
              toggled={this.state.trimSilence}
              onClick={this.onSelectTrimSilence}
              thumbSwitchedStyle={styles.thumbSwitched}
              trackSwitchedStyle={styles.trackSwitched}
              style={{ fontSize: 20, width: '11%' }}
            />
            <span style={{ fontWeight: 'bold' }}>Trim silence at beginning and end</span>
          </div>
          {this.addIntroOutro()}
        </div>
      </div>
    );
  }

  displayToggleOrUrl() {
    const { userInfo } = this.props;
    let id = this.state.soundcast_Id;
    const { connected } = this.state;
    const { soundcasts_managed } = userInfo;

    //show toggle is soundcast is not for sale
    let feedAllowed = id && soundcasts_managed[id] && !soundcasts_managed[id].forSale;
    //show toggle if the page isn't private
    feedAllowed =
      feedAllowed &&
      (soundcasts_managed[id].landingPage && soundcasts_managed[id].landingPage == true);
    //show toggle if there is no URL already
    let NoUrlExists = feedAllowed && !soundcasts_managed[id].podcastFeedVersion;
    //show toggle if it is a new soundcast
    let newSoundcast = id == 'CREATE_NEW' ? true : false;

    if ((feedAllowed && NoUrlExists) || newSoundcast) {
      return (
        <div>
          <div style={{ display: 'flex' }}>
            <Toggle
              label=""
              toggled={this.state.createPodcastFeed}
              onClick={() => {
                this.setState(currentState => {
                  return { createPodcastFeed: !currentState.createPodcastFeed };
                });
              }}
              thumbSwitchedStyle={styles.thumbSwitched}
              trackSwitchedStyle={styles.trackSwitched}
              style={{ fontSize: 20, width: '11%' }}
            />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              Create a podcast feed for the soundcast
            </span>
          </div>
          {this.state.createPodcastFeed && this.displayFeedOptions()}
        </div>
      );
    }

    if (feedAllowed && !NoUrlExists && !newSoundcast) {
      return (
        <div>
          <p style={{ fontSize: '16px' }}>
            <strong>Your podcast feed URL is:</strong>
            <a
              href={`https://mysoundwise.com/rss/${this.state.soundcast_Id}`}
              style={{ color: Colors.mainOrange }}
            >
              {' '}
              https:/soundwise.com/rss/{this.state.soundcast_Id}
            </a>
          </p>
          {this.displayFeedOptions()}
        </div>
      );
    }
  }

  displayConnectVideos(soundcasts) {
    const { requested } = this.state;
    return (
      <div>
        {this.props.channel.snippet && requested == 'NEVERCONNECTED' && (
          <p style={{ fontSize: '16px' }}>
            Your channel <strong>{this.props.channel.snippet.title}</strong> is{' '}
            <span style={{ color: Colors.mainOrange, fontSize: '14px' }}>connected</span>
          </p>
        )}
        {this.displayChangeDisconnectButtons()}
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
            Connect videos from
          </span>
          <div style={{ width: 'auto', flex: '4' }} className="dropdown">
            <div
              style={{ width: '100%', padding: 0 }}
              className="btn dropdown-toggle"
              data-toggle="dropdown"
            >
              <select
                style={{ ...styles.dropdownTitle, borderColor: 'white' }}
                onChange={e => this.changePlaylistId(e)}
                value={this.state.playlistId}
              >
                <option style={{ ...styles.titleText, padding: '20px' }} value={''}>
                  Entire Channel
                </option>
                {Array.isArray(this.props.playlist) &&
                  this.props.playlist.map((playList, i) => {
                    return (
                      <option style={styles.option} value={playList.id} key={i}>
                        {playList.snippet.title}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: '20px' }}>
          <span
            style={{
              ...styles.titleText,
              padding: '10px 10px 10px 0px',
              width: '120px',
              marginRight: '16',
              flex: '2',
            }}
          >
            to episodes in
          </span>
          <div style={{ width: 'auto', flex: '4' }} className="dropdown">
            <div
              style={{ width: '100%', padding: 0 }}
              className="btn dropdown-toggle"
              data-toggle="dropdown"
            >
              <select
                style={{ ...styles.dropdownTitle, borderColor: 'white' }}
                onChange={e => this.changeSoundcastId(e)}
                value={this.state.soundcast_Id}
              >
                <option style={styles.option} value={''} key={'select'}>
                  Select Soundcast
                </option>

                {soundcasts.map((souncast, i) => {
                  return (
                    <option style={styles.option} value={souncast.id} key={i}>
                      {souncast.title}
                    </option>
                  );
                })}
                <option style={styles.option} value={'CREATE_NEW'}>
                  A new soundcast
                </option>
              </select>
            </div>
          </div>
        </div>
        <p style={{ fontSize: '14px' }}>(50 videos max)</p>
      </div>
    );
  }

  displayChangeDisconnectButtons() {
    return (
      <div
        style={{
          display: 'flex',
        }}
      >
        <OrangeSubmitButton
          label="Change Channel"
          onClick={this.changeChannel}
          styles={{
            fontSize: '13px',
            letterSpacing: '1px',
            wordSpacing: '2px',
            margin: '0px 35px 35px 0px',
            padding: '0px 10px',
            height: '27px',
            backgroundColor: Colors.mainWhite,
            color: Colors.link,
            borderColor: Colors.link,
            borderWidth: '2px',
          }}
        />
        <OrangeSubmitButton
          label="Disconnect"
          onClick={this.disconnectYoutube}
          styles={{
            fontSize: '13px',
            letterSpacing: '1px',
            wordSpacing: '2px',
            margin: '0px 0 35px',
            padding: '0px 10px',
            height: '27px',
            backgroundColor: Colors.mainWhite,
            color: Colors.mainOrange,
            borderColor: Colors.mainOrange,
            borderWidth: '2px',
          }}
        />
      </div>
    );
  }

  displayConnectedStatus() {
    const { soundcasts_managed } = this.props.userInfo;
    const { connected, channelName, playlistName } = this.state;
    const showPlaylistName = playlistName != '' ? `(${playlistName})` : '';
    const soundcastTitle = connected ? soundcasts_managed[this.state.soundcast_Id].title : '';
    return (
      <div>
        {`The ${channelName}'s channel ${showPlaylistName} is 
          being converted to episodes in ${soundcastTitle}`}
        <div style={{ marginBottom: '35px' }} />
        {this.displayChangeDisconnectButtons()}
      </div>
    );
  }

  setFileName() {
    var img, allowedFileTypes;
    var _URL = window.URL || window.webkitURL;
    if (this.fileInputRef.files[0]) {
      img = new Image();
      img.onload = function() {
        var width = img.naturalWidth || img.width;
        var height = img.naturalHeight || img.height;
        if (height < 1400 || height > 3000 || width < 1400 || width > 3000) {
          this.ituneImage = '';
          alert(
            'iTunes image size must be between 1400 x 1400 px and 3000 x 3000 px. Please upload a new image.'
          );
          return;
        } else {
          this.setState({
            fileUploaded: true,
            imageType: 'cover',
          });

          this.currentImageRef = this.fileInputRef.files[0];
          allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
          if (allowedFileTypes.indexOf(this.currentImageRef.type) < 0) {
            alert('Only .png or .jpeg files are accepted. Please upload a new file.');
            return;
          }
        }
      }.bind(this);
      this.ituneImage = _URL.createObjectURL(this.fileInputRef.files[0]);
      img.src = this.ituneImage;
    }
  }

  render() {
    let soundcasts = Object.values(this.soundcasts_managed);
    const { soundcasts_managed } = this.props.userInfo;
    const { requested, connected } = this.state;
    return (
      <MuiThemeProvider>
        <div style={{ width: '100%' }}>
          {requested === 'REQUESTED' && !connected && (
            <div
              style={{
                fontWeight: 'bold',
              }}
            >
              {"Channel conversion is in progress. We'll email you when conversion is done."}
            </div>
          )}
          {connected && this.displayConnectedStatus()}

          {!connected && !(requested == 'REQUESTED') && this.displayConnectVideos(soundcasts)}

          {(requested === 'NEVERCONNECTED' || requested === 'DISCONNECTED' || connected) && (
            <div style={{ marginBottom: '10px' }}>
              {this.displayToggleOrUrl()}
              {this.displayAudioProcessing()}
              {connected && (
                <SaveConvertButton
                  label={this.renderProgressBarOrLabel('Save Settings')}
                  writeData={e => this.writeData(e, { skipChannelConversion: true })}
                />
              )}
            </div>
          )}

          {!connected && !(requested == 'REQUESTED') && (
            <SaveConvertButton
              label={this.renderProgressBarOrLabel('Convert')}
              writeData={e => this.writeData(e, { skipChannelConversion: false })}
            />
          )}
        </div>
      </MuiThemeProvider>
    );
  }
}
const styles = {
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
  image: { ...commonStyles.image, float: 'left', background: Colors.blankPicGrey },
  titleText: { ...commonStyles.titleText },
  dropdownTitle: { ...commonStyles.dropdownTitle },
  thumbSwitched: {
    backgroundColor: Colors.link,
  },
  trackSwitched: {
    backgroundColor: Colors.link,
  },
  cancelImg: { ...commonStyles.cancelImg },
  loaderWrapper: {
    ...commonStyles.loaderWrapper,
    width: 'calc(100% - 133px)',
    float: 'left',
    paddingTop: 13,
  },
  inputFileHidden: { ...commonStyles.inputFileHidden },
  uploadButton: {
    backgroundColor: Colors.link,
    width: 80,
    height: 30,
    color: Colors.mainWhite,
    fontSize: 14,
    border: 0,
    marginTop: 5,
    marginLeft: 10,
  },
  fileTypesLabel: {
    fontSize: 14,
    marginLeft: 0,
    display: 'block',
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
  radioButton: {
    marginBottom: 16,
  },
};
