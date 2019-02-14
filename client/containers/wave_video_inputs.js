import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Axios from 'axios';
import { Helmet } from 'react-helmet';
import firebase from 'firebase';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Checkbox from 'material-ui/Checkbox';
// import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { RadioGroup, RadioButton, ReversedRadioButton } from 'react-radio-buttons';
import Dropzone from 'react-dropzone';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import Dots from 'react-activity/lib/Dots';
import Cropper from 'react-cropper';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Player, PosterImage, ControlBar, PlayToggle, BigPlayButton } from 'video-react';
import { CirclePicker, CompactPicker } from 'react-color';

import Colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';
import { emailValidator } from '../helpers/validators';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../components/buttons/buttons';
import { SoundwiseHeader } from '../components/soundwise_header';
import Footer from '../components/footer';

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
  else byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}

class _WaveVideoInputs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signedIn: false,
      playing: false,
      audioName: null,
      imageName: null,
      audioFile: null,
      imageFile: null,
      imageShape: 'square',
      wavePosition: 'bottom',
      waveColor: '#333',
      email: null,
      submitted: false,
    };
    this.cropImage = this.cropImage.bind(this);
    this.cancelCrop = this.cancelCrop.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleCroppedSaving = this.handleCroppedSaving.bind(this);
  }

  componentDidMount() {
    // subscribe state change
    this.refs.player.subscribeToStateChange(this.handleStateChange.bind(this));
    window.addEventListener(
      'dragover',
      function(e) {
        e = e || event;
        e.preventDefault();
      },
      false
    );
    window.addEventListener(
      'drop',
      function(e) {
        e = e || event;
        e.preventDefault();
      },
      false
    );
    if (this.props.isLoggedIn && this.props.userInfo && this.props.userInfo.email) {
      this.setState({ email: this.props.userInfo.email[0] });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoggedIn && nextProps.userInfo && nextProps.userInfo.email) {
      this.setState({ email: nextProps.userInfo.email[0] });
    }
  }

  handleStateChange(state, prevState) {
    // copy player state to this component's state
    this.setState({
      playing: state.hasStarted,
    });
  }

  onDrop(acceptedFiles, rejectedFiles) {
    console.log('accepted files: ', acceptedFiles);
    if (acceptedFiles[0]) {
      this.setState({
        audioFile: acceptedFiles,
        audioName: acceptedFiles[0].name,
      });
    } else {
      alert('Please upload a valid .mp3 or .m4a file!');
    }
  }

  onImageDrop(acceptedFiles, rejectedFiles) {
    console.log('image file: ', acceptedFiles);
    this.setState({
      imageFile: acceptedFiles,
      imageName: acceptedFiles[0].name,
      modalOpen: true,
    });
  }

  handleModalClose() {
    this.setState({
      modalOpen: false,
      cropped: false,
      cropResult: null,
    });
  }

  cropImage() {
    this.setState({
      cropResult: this.refs.cropper.getCroppedCanvas().toDataURL(),
      cropped: true,
    });
  }

  cancelCrop() {
    this.setState({
      cropped: false,
      cropResult: null,
    });
  }

  handleCroppedSaving() {
    const { cropResult } = this.state;
    if (cropResult) {
      const fileBlob = dataURItoBlob(this.state.cropResult);
      this.setState({
        cropped: true,
        imageFile: [fileBlob],
        modalOpen: false,
      });
    } else {
      alert('Please confirm image crop before saving.');
      return;
    }
    // console.log('fileBlob: ', fileBlob);
  }

  cropImageModal() {
    const that = this;
    const { cropResult, width, height, imageShape, imageFile } = this.state;
    const actions = [
      <FlatButton label="Save" primary={true} onClick={() => that.handleCroppedSaving()} />,
      <FlatButton label="Cancel" primary={true} onClick={() => that.handleModalClose()} />,
    ];
    return (
      <MuiThemeProvider>
        <Dialog
          title="Crop Image"
          actions={actions}
          modal={false}
          open={this.state.modalOpen}
          onRequestClose={this.handleModalClose}
          contentStyle={{ width: '80%' }}
          bodyStyle={{ minHeight: 350, overflowY: 'auto' }}
        >
          {(!this.state.cropped && (
            <div className="" style={{}}>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Cropper
                  // onImageLoaded={this.onImageLoaded}
                  // onChange={this.onChange.bind(this)}
                  // onComplete={this.setPixels}
                  style={{ height: 300, width: (width / height) * 300 }}
                  // crop={this.cropImage}
                  // ratio={1 / 1}
                  src={this.state.imageFile ? this.state.imageFile[0].preview : ''}
                  // ref={ref => this.image = ref }
                  ref="cropper"
                  aspectRatio={imageShape == 'square' ? 1 / 1 : 16 / 9}
                  guides={false}
                />
              </div>
              <div style={{ width: '100%', marginTop: 10 }}>
                <RaisedButton
                  onClick={this.cropImage}
                  backgroundColor={Colors.mainOrange}
                  label="Confirm Crop"
                  fullWidth={true}
                />
              </div>
            </div>
          )) || (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  style={{
                    height: 297,
                    width: imageShape == 'square' ? 297 : 528,
                    padding: 10,
                  }}
                  src={this.state.cropResult}
                  alt="cropped image"
                />
              </div>
              <RaisedButton onClick={this.cancelCrop} label="Cancel" fullWidth={true} />
            </div>
          )}
        </Dialog>
      </MuiThemeProvider>
    );
  }

  submit() {
    const { audioFile, imageFile, imageShape, wavePosition, waveColor, email } = this.state;
    if (!audioFile) {
      return alert('Please upload an audio clip before submitting!');
    }
    if (!imageFile) {
      return alert('Please upload an image before submitting!');
    }
    const confirmIsEmail = emailValidator(email);
    // console.log('confirmIsEmail: ', confirmIsEmail);
    if (!confirmIsEmail) {
      return alert('Please enter a valid email!');
    }
    this.setState({ submitting: true });
    let data = new FormData();
    data.append('audio', audioFile[0], audioFile[0].name);
    data.append('image', imageFile[0], imageFile[0].name);
    data.append('color', waveColor);
    data.append('position', wavePosition);
    data.append('email', email);
    Axios.post('/api/audiowave', data)
      .then(res => {
        this.setState({
          audioName: null,
          imageName: null,
          audioFile: null,
          imageFile: null,
          imageShape: 'square',
          cropped: false,
          cropResult: null,
          wavePosition: 'bottom',
          waveColor: '#333',
          email: null,
          submitting: false,
          submitted: true,
        });
      })
      .catch(err => {
        console.log('error: ', err.response.data.error);
        this.setState({
          audioName: null,
          imageName: null,
          audioFile: null,
          imageFile: null,
          cropped: false,
          cropResult: null,
          imageShape: 'square',
          wavePosition: 'bottom',
          waveColor: '#333',
          email: null,
          submitted: false,
          submitting: false,
          error: err.response.data.error,
        });
        alert(err.response.data.error);
      });
  }

  render() {
    const {
      audioName,
      imageName,
      imageShape,
      wavePosition,
      waveColor,
      email,
      submitted,
      submitting,
      error,
      cropResult,
    } = this.state;
    const { isLoggedIn } = this.props;
    const that = this;
    return (
      <div>
        <Helmet>
          <title>{`Free Soundwave Video Maker - Turning Audio Clip into Video | Soundwise`}</title>
          <meta property="og:url" content={`https://mysoundwise.com/wave_video`} />
          <meta property="fb:app_id" content="1726664310980105" />
          <meta
            property="og:title"
            content={`Free Soundwave Video Maker - Turning Audio Clip into Video | Soundwise`}
          />
          <meta
            property="og:description"
            content={`Spice up social media sharing of your audio course and podcast with a soundwave video clip generated from your audio recording.`}
          />
          <meta property="og:image" content="https://mysoundwise.com/images/vid-maker.png" />
          <meta
            name="description"
            content={`Spice up social media sharing of your audio course and podcast with a soundwave video clip generated from your audio recording.`}
          />
          <meta
            name="keywords"
            content="soundwave video, audio clip, free video maker, audio course, podcast"
          />
          <meta
            name="twitter:title"
            content={`Free Soundwave Video Maker - Turning Audio Clip into Video | Soundwise`}
          />
          <meta
            name="twitter:description"
            content={`Spice up social media sharing of your audio course and podcast with a soundwave video clip generated from your audio recording.`}
          />
          <meta name="twitter:image" content="https://mysoundwise.com/images/vid-maker.png" />
          <meta name="twitter:card" content="https://mysoundwise.com/images/vid-maker.png" />
        </Helmet>
        <SoundwiseHeader showIcon={true} />
        <section
          className="no-padding xs-padding-50px-tb position-relative cover-background tz-builder-bg-image border-none hero-style9"
          id="hero-section11"
          data-img-size="(W)1920px X (H)800px"
          style={{
            background:
              "linear-gradient(-45deg,rgba(247,107,28,0.4), rgba(97,225,251,0.8)), url('images/mic_tv.jpg')",
            height: 600,
          }}
        >
          <div className="container position-relative" style={{ height: 600 }}>
            <div className="row">
              <div className="slider-typography xs-position-static text-center xs-padding-ten">
                <div className="slider-text-middle-main">
                  <div className="slider-text-middle text-left">
                    <div className="col-md-8 col-sm-10 col-xs-12 center-col text-center">
                      <h1 className="sm-title-extra-large-5 alt-font xs-title-extra-large-3 title-extra-large-5 line-height-75 text-white font-weight-700 letter-spacing-minus-2 tz-text margin-nine-bottom sm-margin-six-bottom margin-lr-auto">
                        Free Soundwave Video Maker
                      </h1>
                      <div className="text-white title-medium  xs-text-extra-large width-80 xs-width-90 margin-lr-auto tz-text">
                        <div>
                          Spice up social media sharing of your audio course and podcast with a
                          soundwave video clip generated from your audio recording.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="bg-white builder-bg padding-60px-tb xs-padding-60px-tb"
          id="video-section4"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto">
              <div
                className="col-lg-6 col-md-6 col-sm-6 col-xs-12 display-table xs-margin-fifteen-bottom"
                style={{}}
              >
                <div className="display-table-cell-vertical-middle" style={{}}>
                  <div className="col-xs-12 col-sm-12 col-md-10" style={{ paddingTop: 0 }}>
                    <Player ref="player" poster="/images/vid-demo.png" aspectRatio="1:1">
                      <source src="https://d1jzcuf08rvzm.cloudfront.net/demo/demo-clip.mp4" />
                      {(!this.state.playing && <BigPlayButton position="center" />) || null}
                      <ControlBar autoHide={true} disableDefaultControls={true}>
                        <PlayToggle />
                      </ControlBar>
                    </Player>
                    <div className="frameCover" data-type="video" />
                  </div>
                </div>
              </div>
              <div
                className="col-lg-5 col-md-6 col-sm-6 col-xs-12  display-table"
                style={{ height: 318 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <h2 className="text-dark-gray title-extra-large alt-font font-weight-600 line-height-40 sm-title-large xs-title-large margin-seven-bottom sm-margin-ten-bottom tz-text">
                    Audio snippet + branded image = Eye catching soundwave video.
                  </h2>
                  <div className="title-small sm-title-medium xs-title-medium width-90 sm-width-100 font-weight-300 margin-fourteen-bottom sm-margin-twelve-bottom tz-text">
                    Attract more listeners with a soundwave video that shows off your branding and
                    audio content. Share it on Facebook, Twitter, Instagram, LinkedIn, etc, along
                    with your audio url link.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white builder-bg  " id="portfolios-section9">
          <div className="container">
            <div className="row">
              <div className="work-3col wide gutter">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="overflow-hidden grid-gallery">
                    <div className="tab-content">
                      <ul className="masonry-items grid">
                        <li>
                          <figure>
                            <div className="">
                              <img
                                style={{ width: 375, height: 375 }}
                                src="images/soundwave-vid-demo-1.gif"
                                id=""
                                data-img-size="(W)800px X (H)650px"
                                alt=""
                              />
                            </div>
                          </figure>
                        </li>
                        <li>
                          <figure>
                            <div className="">
                              <img
                                style={{ width: 375, height: 375 }}
                                src="images/soundwave-vid-demo-2.gif"
                                id=""
                                data-img-size="(W)800px X (H)650px"
                                alt=""
                              />
                            </div>
                          </figure>
                        </li>
                        <li>
                          <figure>
                            <div className="">
                              <img
                                style={{ width: 375, height: 375 }}
                                src="images/soundwave-vid-demo-3.gif"
                                id=""
                                data-img-size="(W)800px X (H)650px"
                                alt=""
                              />
                            </div>
                          </figure>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className=" xs-padding-60px-tb bg-white builder-bg" id="content-section36">
          <div className="container-fluid">
            <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text text-center ">
              How It Works
            </h2>
            <div className="row four-column">
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font tz-text font-weight-600"
                  style={{ color: Colors.mainOrange }}
                >
                  01.
                </div>
                <h3 className="text-dark-gray text-extra-large alt-font display-block tz-text">
                  Upload an audio snippet from your audio course section or podcast episode (under
                  60 seconds)
                </h3>
                <div
                  className="separator-line2  margin-twenty-top tz-background-color"
                  style={{ background: Colors.mainOrange }}
                />
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font tz-text font-weight-600"
                  style={{ color: Colors.mainOrange }}
                >
                  02.
                </div>
                <h3 className="text-dark-gray text-extra-large alt-font display-block tz-text">
                  Upload an image with information about your audio content (1080px by 1080 px or
                  1280px by 720px). You can create A pretty one easily using{' '}
                  <a
                    target="_blank"
                    style={{ color: Colors.mainGreen }}
                    href="https://www.canva.com/create/album-covers/"
                  >
                    Canva
                  </a>
                  .
                </h3>
                <div
                  className="separator-line2 margin-twenty-top tz-background-color"
                  style={{ background: Colors.mainOrange }}
                />
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font tz-text font-weight-600"
                  style={{ color: Colors.mainOrange }}
                >
                  03.
                </div>
                <h3 className="text-dark-gray text-extra-large alt-font display-block tz-text">
                  Pick a color and a position (top, middle, bottom) for the soundwave.
                </h3>
                <div
                  className="separator-line2 margin-twenty-top tz-background-color"
                  style={{ background: Colors.mainOrange }}
                />
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font  tz-text font-weight-600"
                  style={{ color: Colors.mainOrange }}
                >
                  04.
                </div>
                <h3 className="text-dark-gray text-extra-large alt-font display-block tz-text">
                  We'll create the video snippet, and when it's ready, email you a link to download
                  your video.
                </h3>
                <div
                  className="separator-line2 margin-twenty-top tz-background-color"
                  style={{ background: Colors.mainOrange }}
                />
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-70px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section36"
        >
          <div className="container-fluid">
            <h2 class="section-title-large sm-section-title-medium text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text text-center ">
              Create A Free Soundwave Video Clip
            </h2>
            <div className="row ">
              <div className="title-large font-weight-600 margin-three-top text-center">
                Upload audio clip (up to 1 minute)
              </div>
              {(audioName && (
                <div
                  className="text-center margin-three-bottom margin-three-top"
                  style={{ paddingTop: 50 }}
                >
                  <div
                    className="text-center"
                    style={{ fontSize: 18 }}
                  >{`${audioName} uploaded`}</div>
                  <div
                    style={{
                      fontSize: 18,
                      color: Colors.mainOrange,
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      that.setState({
                        audioName: null,
                        audioFile: null,
                      })
                    }
                  >
                    <strong>Cancel</strong>
                  </div>
                </div>
              )) || (
                <div
                  className="center-col col-xs-12 col-md-6 col-sm-10 text-center margin-three-bottom margin-three-top"
                  style={{ padding: '3em', backgroundColor: Colors.mainGreen }}
                >
                  <Dropzone
                    style={{ width: '100%', height: '100%' }}
                    accept="audio/mp3, audio/mpeg, audio/m4a, audio/x-m4a"
                    onDrop={this.onDrop.bind(this)}
                  >
                    <div>
                      <div className="text-center">
                        <i className="fas fa-5x fa-volume-up" style={{ cursor: 'pointer' }} />
                      </div>
                      <div style={{ fontSize: 18, cursor: 'pointer' }}>
                        Drag your audio clip here or click to upload. (Audio clip should be under 60
                        seconds. mp3 and m4a files accepted.)
                      </div>
                    </div>
                  </Dropzone>
                </div>
              )}
              <div className="center-col col-xs-12 col-md-6 col-sm-10 text-center margin-three-bottom margin-three-top">
                <div className="title-large font-weight-600 margin-three-bottom margin-three-top">
                  Select image shape
                </div>
                <RadioGroup
                  className="margin-three-top"
                  value={imageShape}
                  onChange={value =>
                    that.setState({
                      imageShape: value,
                    })
                  }
                >
                  <ReversedRadioButton
                    rootColor={Colors.mainGrey}
                    pointColor={Colors.mainOrange}
                    value="square"
                    iconSize={20}
                  >
                    <span style={{ fontSize: 18 }}>
                      Square (should be at least 1080px by 1080px)
                    </span>
                  </ReversedRadioButton>
                  <ReversedRadioButton
                    rootColor={Colors.mainGrey}
                    pointColor={Colors.mainOrange}
                    value="rectangle"
                    iconSize={20}
                  >
                    <span style={{ fontSize: 18 }}>
                      Rectangle (should be at least 1280px by 720px)
                    </span>
                  </ReversedRadioButton>
                </RadioGroup>
              </div>
              <div className="title-large font-weight-600 margin-three-bottom margin-three-top text-center">
                Upload image
              </div>
              {this.cropImageModal()}
              {(this.state.cropResult && (
                <div
                  className="text-center margin-three-bottom margin-three-top"
                  style={{ verticalAlign: 'center' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                      style={{
                        height: 297,
                        width: imageShape == 'square' ? 297 : 528,
                        padding: 10,
                      }}
                      src={this.state.cropResult}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      color: Colors.mainOrange,
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      that.setState({
                        imageName: null,
                        imageFile: null,
                        cropResult: null,
                        cropped: false,
                      })
                    }
                  >
                    <strong>Cancel</strong>
                  </div>
                </div>
              )) || (
                <div
                  className="center-col col-xs-12 col-md-6 col-sm-10 text-center margin-three-bottom margin-three-top"
                  style={{
                    padding: '3em',
                    backgroundColor: Colors.mainGreen,
                    height: 175,
                  }}
                >
                  <Dropzone
                    style={{ width: '100%' }}
                    accept="image/jpeg, image/png, image/jpg"
                    onDrop={this.onImageDrop.bind(this)}
                  >
                    <div>
                      <div className="text-center">
                        <i className="fas fa-5x fa-image" style={{ cursor: 'pointer' }} />
                      </div>
                      <div style={{ fontSize: 18, cursor: 'pointer' }}>
                        Drag your image here or click to upload.
                      </div>
                    </div>
                  </Dropzone>
                </div>
              )}
              <div
                className="center-col col-xs-12 col-md-6 col-sm-10 text-center margin-three-bottom margin-three-top"
                style={{ fontSize: 18 }}
              >
                <div className="title-large font-weight-600 margin-three-bottom margin-three-top">
                  Pick audio wave position
                </div>
                <RadioGroup
                  className="margin-three-top"
                  value={wavePosition}
                  onChange={value =>
                    that.setState({
                      wavePosition: value,
                    })
                  }
                  horizontal
                >
                  <ReversedRadioButton
                    rootColor={Colors.mainGrey}
                    pointColor={Colors.mainOrange}
                    value="bottom"
                    iconSize={20}
                  >
                    Bottom
                  </ReversedRadioButton>
                  <ReversedRadioButton
                    rootColor={Colors.mainGrey}
                    pointColor={Colors.mainOrange}
                    value="middle"
                    iconSize={20}
                  >
                    Middle
                  </ReversedRadioButton>
                  <ReversedRadioButton
                    rootColor={Colors.mainGrey}
                    pointColor={Colors.mainOrange}
                    value="top"
                    iconSize={20}
                  >
                    Top
                  </ReversedRadioButton>
                </RadioGroup>
              </div>
              <div className="center-col col-xs-12 col-md-6 col-sm-10 text-center margin-three-bottom margin-three-top">
                <div className="title-large margin-three-top margin-three-bottom font-weight-600">
                  Pick audio wave color
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <CompactPicker
                    color={waveColor}
                    onChangeComplete={color =>
                      that.setState({
                        waveColor: color.hex,
                      })
                    }
                  />
                </div>
              </div>
              {(!isLoggedIn && (
                <div className="center-col col-xs-12 col-md-6 col-sm-10 text-center margin-three-bottom margin-three-top">
                  <div className="title-large margin-three-top margin-three-bottom font-weight-600">
                    Your email address
                  </div>
                  <div className="text-large margin-three-top margin-three-bottom ">
                    We'll notify you by email when your video is ready for download.
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={styles.inputTitleWrapper}>
                      <input
                        type="text"
                        style={styles.inputTitle}
                        placeholder={''}
                        onChange={e => {
                          that.setState({ email: e.target.value });
                        }}
                        value={that.state.email}
                      />
                    </div>
                  </div>
                </div>
              )) ||
                null}
              <div className="center-col col-xs-12 col-md-6 col-sm-10 text-center margin-three-bottom margin-three-top">
                {(submitting && (
                  <div>
                    <div className="title-large">Submitting</div>
                    <Dots
                      style={{ marginLeft: 15 }}
                      color={Colors.mainOrange}
                      size={32}
                      speed={1}
                    />
                  </div>
                )) ||
                  (!submitting && submitted && !error && (
                    <div>
                      <div>
                        <div className="title-large">
                          <strong>
                            Your video inputs are submitted 🎉 We'll start working on it
                            immediately!{' '}
                          </strong>
                        </div>
                        <div className="title-small" style={{ marginTop: 15 }}>
                          p.s. If you don't see an email from us in half an hour, please check your
                          spam folder.
                        </div>
                      </div>
                    </div>
                  )) || <OrangeSubmitButton label="Submit" onClick={this.submit.bind(this)} />}
              </div>
            </div>
          </div>
        </section>
        <Footer showPricing={true} />
      </div>
    );
  }
}

const styles = {
  inputTitleWrapper: { ...commonStyles.inputTitleWrapper },
  inputTitle: { ...commonStyles.inputTitle },
};

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  return {
    userInfo,
    isLoggedIn,
  };
};

export const WaveVideoInputs = connect(
  mapStateToProps,
  null
)(_WaveVideoInputs);
