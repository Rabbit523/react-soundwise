import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import jimp from 'jimp';
import toBuffer from 'blob-to-buffer';
import firebase from 'firebase';
import { Editor } from 'react-draft-wysiwyg';
import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  convertFromHTML,
  createFromBlockArray,
  ContentState,
} from 'draft-js';
// import Toggle from 'material-ui/Toggle';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import Dots from 'react-activity/lib/Dots';

import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import S3FileUploader from '../../../components/s3_file_uploader';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCaretRight from '@fortawesome/fontawesome-free-solid/faCaretRight';
import faCaretDown from '@fortawesome/fontawesome-free-solid/faCaretDown';
import ImageCropModal from './image_crop_modal';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import { itunesCategories } from '../../../helpers/itunes_categories';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';
import Coupons from './coupons';
const { podcastCategories, isFreeAccount } = require('../../../../server/scripts/utils.js')();

const subscriptionConfirmEmailHtml = `<div style="font-size:18px;"><p>Hi [subscriber first name],</p>
<p></p>
<p>Thanks for signing up to [soundcast title]. If you don't have the Soundwise mobile app installed on your phone, please access your soundcast by downloading the app first--</p>
<p><strong>
<span>iPhone user: Download the app </span>
<a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8"><span style="border-bottom: 2px solid currentColor;">here</span></a>.
</strong></p>
<p><strong>
<span>Android user: Download the app <span>
<a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android"><span style="border-bottom: 2px solid currentColor;" >here</span></a>.
</strong></p><p></p>
<p>...and then sign in to the app with the same credential you used to subscribe to this soundcast.</p><p></p><p>If you've already installed the app, your new soundcast should be loaded automatically.</p>
</div>`;
const subscriptionConfirmationEmail = convertFromHTML(subscriptionConfirmEmailHtml);
const confirmationEmail = ContentState.createFromBlockArray(
  subscriptionConfirmationEmail.contentBlocks,
  subscriptionConfirmationEmail.entityMap
);

export default class EditSoundcast extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      imageURL: '',
      blurredImageURL: null,
      short_description: '',
      long_description: EditorState.createEmpty(),
      subscribed: {},
      fileUploaded: false,
      landingPage: false,
      features: [''],

      hostName: '',
      hostBio: '',
      hostImageURL: '',
      hostImg: false,
      hostImgUploaded: '',
      hostName2: '',
      hostBio2: '',
      hostImageURL2: '',
      hostImg2: false,
      hostImgUploaded2: '',

      forSale: false,
      prices: [],
      showTimeStamps: false,
      showSubscriberCount: false,
      modalOpen: false,
      upgradeModal: false,
      upgradeModalTitle: '',
      confirmationEmail: EditorState.createWithContent(confirmationEmail),
      isPodcast: false,
      createPodcast: false,
      editPodcast: false,
      podcastError: '',
      categories: Object.keys(podcastCategories).map(i => {
        return { name: podcastCategories[i].name };
      }), // main 16 categories ('Arts', 'Comedy', ...)
      selectedCategory: null,
      doneProcessingPodcast: false,
      startProcessingPodcast: false,
      podcastFeedVersion: null,
      showIntroOutro: false,
      autoSubmitPodcast: false,
    };

    this.fileInputRef = null;
    this.hostImgInputRef = null;
    this.hostImgInputRef2 = null;
    this.currentImageRef = null;
    this.firebaseListener = null;
    this.addFeature = this.addFeature.bind(this);
    this.submit = this.submit.bind(this);
    this.onEditorStateChange = this.onEditorStateChange.bind(this);
    this.showIntroOutro = this.showIntroOutro.bind(this);
    this.handleSoundcastSignup = this.handleSoundcastSignup.bind(this);
    this.isShownSoundcastSignup = this.isShownSoundcastSignup.bind(this);
    this.isAvailableCoupon100PercentOff = this.isAvailableCoupon100PercentOff.bind(this);
    this.closeUpgradeModal = this.closeUpgradeModal.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { userInfo, history } = nextProps;
    if (!this.state.proUser && userInfo.publisher) {
      this.checkUserStatus(userInfo);
    }
    const _state = history.location.state;
    const publisherName = userInfo.publisher && userInfo.publisher.name;
    if (publisherName) {
      const itunesHost = _state && _state.soundcast.itunesHost;
      this.setState({ itunesHost: itunesHost || publisherName });
    }
    if (!_state && userInfo.loadEditSoundcast) {
      history.replace(history.location.pathname, userInfo.loadEditSoundcast);
      this.setSoundcastState(userInfo.loadEditSoundcast.soundcast);
    }
  }

  componentDidMount() {
    const { history } = this.props;
    const soundcast = history.location.state && history.location.state.soundcast;
    if (soundcast) {
      this.setSoundcastState(soundcast);
    }
  }

  setSoundcastState(soundcast) {
    const { userInfo } = this.props;
    const {
      title,
      subscribed,
      imageURL,
      blurredImageURL,
      short_description,
      long_description,
      landingPage,
      features,
      hostName,
      hostBio,
      hostImageURL,
      hostName2,
      hostBio2,
      hostImageURL2,
      forSale,
      prices,
      category,
      confirmationEmail,
      showSubscriberCount,
      showTimeStamps,
      isPodcast,
      episodes,
      itunesTitle,
      itunesHost,
      itunesExplicit,
      itunesCategory,
      itunesImage,
      podcastFeedVersion,
      autoSubmitPodcast,
      published,
    } = soundcast;
    // const {title0, subscribed0, imageURL0, short_description0,
    //        long_description0, landingPage0,
    //        features0, hostName0, hostBio0, hostImageURL0,
    //        forSale0, prices0, } = this.state;

    let editorState, confirmEmailEditorState;
    if (long_description) {
      let contentState = convertFromRaw(JSON.parse(long_description));
      editorState = EditorState.createWithContent(contentState);
    } else {
      editorState = EditorState.createEmpty();
    }

    if (confirmationEmail) {
      let confirmEmailText = convertFromRaw(
        JSON.parse(confirmationEmail.replace('[soundcast title]', title))
      );
      confirmEmailEditorState = EditorState.createWithContent(confirmEmailText);
    } else {
      confirmEmailEditorState = this.state.confirmationEmail;
    }

    this.setState({
      title,
      imageURL: imageURL ? imageURL : null,
      blurredImageURL: blurredImageURL || null,
      short_description,
      landingPage,
      hostName: hostName ? hostName : null,
      hostBio: hostBio ? hostBio : null,
      hostImageURL: hostImageURL ? hostImageURL : null,
      hostName2: hostName2 ? hostName2 : null,
      hostBio2: hostBio2 ? hostBio2 : null,
      hostImageURL2: hostImageURL2 ? hostImageURL2 : null,
      forSale: forSale ? forSale : false,
      long_description: editorState,
      confirmationEmail: confirmEmailEditorState,
      showTimeStamps: showTimeStamps ? showTimeStamps : false,
      showSubscriberCount: showSubscriberCount ? showSubscriberCount : false,
      isPodcast: isPodcast ? isPodcast : false,
      episodes: episodes ? episodes : null,
      selectedCategory: { name: category },
      itunesTitle: itunesTitle ? itunesTitle : title,
      itunesHost: itunesHost ? itunesHost : this.props.userInfo.publisher.name,
      itunesCategory: itunesCategory ? itunesCategory : null,
      itunesExplicit: itunesExplicit ? itunesExplicit : false,
      itunesImage: itunesImage ? itunesImage : null,
      podcastFeedVersion: podcastFeedVersion ? podcastFeedVersion : null,
      autoSubmitPodcast: autoSubmitPodcast ? autoSubmitPodcast : false,
      subscribed: subscribed || this.state.subscribed,
      features: features || this.state.features,
      prices: prices || this.state.prices,
      published,
    });
    userInfo.publisher && this.checkUserStatus(userInfo);
  }

  handleSoundcastSignup() {
    if (this.isShownSoundcastSignup()) {
      this.props.history.push(`/signup/soundcast_user/${this.props.id}`);
    } else {
      this.setState({
        upgradeModal: true,
        upgradeModalTitle:
          'Signup forms for paid soundcasts are only available on PLUS, PRO and PLATINUM plans.',
      });
    }
  }

  isShownSoundcastSignup() {
    const { userInfo } = this.props;
    if (this.state.published === true) {
      if (!this.state.forSale) {
        return true;
      }
      if (
        this.state.forSale === true &&
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

  isAvailableCoupon100PercentOff(prices) {
    if (!prices) {
      return true;
    }
    const { userInfo } = this.props;
    for (let i = 0; i < prices.length; i += 1) {
      if (prices[i].coupons) {
        for (let j = 0; j < prices[i].coupons.length; j += 1) {
          if (prices[i].coupons[j].percentOff === '100') {
            if (isFreeAccount(userInfo) || userInfo.publisher.plan === 'plus') {
              console.log("this account is free or plus, so you can't set coupon 100%");
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  closeUpgradeModal() {
    this.setState({ upgradeModal: false });
  }

  checkUserStatus(userInfo) {
    if (
      (userInfo.publisher.plan && userInfo.publisher.current_period_end > moment().format('X')) ||
      userInfo.publisher.beta
    ) {
      this.setState({ proUser: true });
    }
  }

  _uploadToAws(file, imageType) {
    const _self = this;
    const { id } = this.props;
    let data = new FormData();
    const splittedFileName = file.type.split('/');
    const ext = splittedFileName[splittedFileName.length - 1];
    let fileName = '';
    if (imageType == 'host') {
      fileName = `${id}-host-image-${moment().format('x')}.${ext}`;
    } else if (imageType == 'host2') {
      fileName = `${id}-host2-image-${moment().format('x')}.${ext}`;
    } else if (imageType == 'itunes') {
      fileName = `${id}-itunes-${moment().format('x')}.${ext}`;
    } else {
      fileName = `${id}-${moment().format('x')}.${ext}`;
    }

    data.append('file', file, fileName);
    // axios.post('http://localhost:3000/upload/images', data) // - alternative address (need to uncomment on backend)
    Axios.post('/api/upload', data)
      .then(function(res) {
        // POST succeeded...
        console.log('success upload to aws s3: ', res);

        //replace 'http' with 'https'
        let url = res.data[0].url;
        if (url.slice(0, 5) !== 'https') {
          url = url.replace(/http/i, 'https');
        }
        // TODO: CHECK BLURR
        if (imageType == 'host') {
          _self.setState({ hostImageURL: url });
        } else if (imageType == 'host2') {
          _self.setState({ hostImageURL2: url });
        } else if (imageType == 'itunes') {
          _self.setState({ itunesImage: url });
        } else {
          _self.setState({ imageURL: url });

          let blurredData = new FormData();

          toBuffer(file, (err, buffer) => {
            if (err) throw err;

            jimp.read(buffer).then(f =>
              f
                .resize(600, jimp.AUTO)
                .blur(30)
                .brightness(0.6)
                .getBuffer(jimp.AUTO, (err, buffer) => {
                  if (!err) {
                    blurredData.append('file', new Blob([buffer]), `blurred-${fileName}`);

                    Axios.post('/api/upload', blurredData)
                      .then(res => {
                        // POST succeeded...
                        console.log('success upload to aws s3: ', res);
                        let url = res.data[0].url;
                        if (url.slice(0, 5) !== 'https') {
                          // replace 'http' with 'https'
                          url = url.replace(/http/i, 'https');
                        }
                        _self.setState({ blurredImageURL: url });
                        firebase
                          .database()
                          .ref(`soundcasts/${history.location.state.id}/blurredImageURL`)
                          .set(url);
                      })
                      .catch(function(err) {
                        // POST failed...
                        console.log('ERROR upload to aws s3: ', err);
                      });
                  }
                })
            );
          });
        }
      })
      .catch(function(err) {
        // POST failed...
        console.log('ERROR upload to aws s3: ', err);
      });
  }

  setFileName(imageType, e) {
    // console.log('this.fileInputRef.files: ', this.fileInputRef.files);
    const that = this;
    var file, img, allowedFileTypes;
    var _URL = window.URL || window.webkitURL;
    if (imageType == 'host' || imageType == 'host2') {
      if (this.hostImgInputRef.files[0]) {
        if (imageType == 'host2') {
          this.setState({ hostImgUploaded2: true, hostImg2: true, imageType: 'host2' });
        } else {
          this.setState({ hostImgUploaded: true, hostImg: true, imageType: 'host' });
        }
        allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        this.currentImageRef = this.hostImgInputRef.files[0];
        if (allowedFileTypes.indexOf(this.currentImageRef.type) < 0) {
          return alert('Only .png or .jpeg files are accepted. Please upload a new file.');
        }
        that.handleModalOpen();
      }
    } else if (imageType == 'itunes') {
      if (this.itunesInputRef.files[0]) {
        img = new Image();
        img.onload = function() {
          var width = img.naturalWidth || img.width;
          var height = img.naturalHeight || img.height;
          if (width < 1400 || width > 3000) {
            return alert(
              'iTunes/Google Play cover size must be between 1400 x 1400 px and 3000 x 3000 px. Please upload a new image.'
            );
          } else {
            that.setState({ itunesImgUploaded: true, imageType: 'itunes' });
            allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
            that.currentImageRef = that.itunesInputRef.files[0];
            if (allowedFileTypes.indexOf(that.currentImageRef.type) < 0) {
              return alert('Only .png or .jpeg files are accepted. Please upload a new file.');
            }
            that.handleModalOpen();
          }
        };
        img.src = _URL.createObjectURL(this.itunesInputRef.files[0]);
      }
    } else {
      // this._uploadToAws(this.fileInputRef.files[0], null)
      if (this.fileInputRef.files[0]) {
        img = new Image();
        img.onload = function() {
          var width = img.naturalWidth || img.width;
          var height = img.naturalHeight || img.height;
          if (width < 1400 || width > 3000) {
            return alert(
              'Soundcast cover size must be between 1400 x 1400 px and 3000 x 3000 px. Please upload a new image.'
            );
          } else {
            that.setState({ fileUploaded: true, imageType: 'cover' });
            that.currentImageRef = that.fileInputRef.files[0];
            allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
            if (allowedFileTypes.indexOf(that.currentImageRef.type) < 0) {
              return alert('Only .png or .jpeg files are accepted. Please upload a new file.');
            }
            that.handleModalOpen();
          }
        };
        img.src = _URL.createObjectURL(this.fileInputRef.files[0]);
      }
    }
  }

  submit(publish, noAlert) {
    const {
      title,
      imageURL,
      blurredImageURL,
      subscribed,
      short_description,
      long_description,
      landingPage,
      features,
      hostName,
      hostBio,
      hostImageURL,
      hostName2,
      hostBio2,
      selectedCategory,
      hostImageURL2,
      forSale,
      prices,
      confirmationEmail,
      showSubscriberCount,
      showTimeStamps,
      itunesTitle,
      itunesHost,
      itunesImage,
      itunesExplicit,
      itunesCategory,
      autoSubmitPodcast,
    } = this.state;
    const { userInfo, history } = this.props;
    const that = this;

    if (!this.isAvailableCoupon100PercentOff(prices)) {
      return this.setState({
        upgradeModal: true,
        upgradeModalTitle: 'Please upgrade to create 100% off discounts',
      });
    }

    this.firebaseListener = firebase.auth().onAuthStateChanged(function(user) {
      if (user && that.firebaseListener) {
        const creatorID = user.uid;
        const last_update = Number(moment().format('X'));
        const editedSoundcast = {
          title,
          short_description,
          long_description: JSON.stringify(convertToRaw(long_description.getCurrentContent())),
          confirmationEmail: JSON.stringify(convertToRaw(confirmationEmail.getCurrentContent())),
          imageURL,
          blurredImageURL,
          creatorID,
          publisherID: userInfo.publisherID,
          subscribed,
          landingPage,
          features,
          hostName,
          hostBio,
          hostImageURL,
          hostName2,
          hostBio2,
          hostImageURL2,
          forSale,
          prices,
          category: selectedCategory.name,
          last_update,
          showTimeStamps,
          showSubscriberCount,
          published: publish,
          itunesTitle,
          itunesHost,
          itunesImage,
          itunesExplicit,
          itunesCategory,
          autoSubmitPodcast,
        };

        // edit soundcast in database
        firebase
          .database()
          .ref(`soundcasts/${history.location.state.id}`)
          .once('value')
          .then(snapshot => {
            const couponsToRemove = [];
            (snapshot.val().prices || []).forEach(price => {
              (price.coupons || []).forEach(coupon => couponsToRemove.push(coupon.code));
            });
            const changedSoundcast = Object.assign({}, snapshot.val(), editedSoundcast);
            firebase
              .database()
              .ref(`soundcasts/${history.location.state.id}`)
              .set(changedSoundcast)
              .then(
                res => {
                  Axios.post('/api/soundcast', {
                    title,
                    soundcastId: history.location.state.id,
                    imageURL,
                    forSale,
                    landingPage,
                    published: publish,
                    updateDate: last_update,
                    category: selectedCategory.name,
                    publisherId: userInfo.publisherID,
                  }).then(() => {
                    if (userInfo.publisher && userInfo.publisher.stripe_user_id) {
                      Axios.post('/api/createUpdatePlans', {
                        soundcastID: history.location.state.id,
                        publisherID: userInfo.publisherID,
                        stripe_account: userInfo.publisher.stripe_user_id,
                        title,
                        prices: landingPage && forSale ? prices : [],
                        couponsToRemove, // old coupons removal
                      }).catch(err => alert(`Error creating plans ${err}`));
                    }
                    if (!noAlert) {
                      alert('Soundcast changes are saved.');
                    }
                    // history.goBack();
                    that.firebaseListener = null;
                  });
                  // using window.history object instead of this.props.history
                  // to prevent rerendering (on state update)
                  const newState = window.history.state;
                  newState.state.soundcast = changedSoundcast;
                  window.history.replaceState(newState, null); // update state
                },
                err => {
                  console.log('ERROR add soundcast: ', err);
                }
              );
          });
      } else {
        // alert('Soundcast saving failed. Please try again later.');
        // Raven.captureMessage('Soundcast saving failed!')
      }
    });
    this.firebaseListener && this.firebaseListener();
  }

  componentWillUnmount() {
    this.firebaseListener = null;
  }

  handleCheck() {
    this.setState({ landingPage: !this.state.landingPage });
  }

  setFeatures(i, event) {
    const features = [...this.state.features];
    features[i] = event.target.value;
    this.setState({ features });
  }

  deleteFeature(i, event) {
    const features = [...this.state.features];
    if (features.length >= 2) {
      features.splice(i, 1);
    } else {
      features[0] = '';
    }
    this.setState({ features });
  }

  addFeature() {
    const features = [...this.state.features];
    features.push('');
    this.setState({ features });
  }

  handleChargeOption() {
    const { forSale } = this.state;
    const { userInfo } = this.props;
    if (!forSale) {
      if (!userInfo.publisher.stripe_user_id) {
        this.submit.bind(this, false);
        this.setState({ paypalModalOpen: true });
      } else {
        this.setState({
          forSale: !forSale,
          prices: [{ paymentPlan: '', billingCycle: 'one time', price: '0' }],
        });
      }
    } else {
      this.setState({ forSale: !forSale, prices: [] });
    }
  }

  onEditorStateChange(editorState) {
    this.setState({ long_description: editorState });
  }

  onConfirmationStateChange(editorState) {
    this.setState({ confirmationEmail: editorState });
  }

  handlePaypalModalClose() {
    if (this.state.paypalModalOpen) {
      this.setState({ paypalModalOpen: false });
    }
  }

  showIntroOutro() {
    const { showIntroOutro, proUser } = this.state;
    if (proUser) {
      this.setState({ showIntroOutro: !showIntroOutro });
    } else {
      this.setState({
        showPricingModal: [
          'Upgrade to add intro and outro',
          'Automatic insertion of intro and outro is available on PLUS and PRO plans. Please upgrade to access this feature.',
        ],
      });
    }
  }

  updateSoundcast(path, ext) {
    const { soundcast, id } = window.history.state.state;
    if (ext) {
      soundcast[path] = `https://mysoundwise.com/tracks/${id}_${path}.${ext}`;
      firebase
        .database()
        .ref(`soundcasts/${id}/${path}`)
        .set(soundcast[path]);
    } else {
      delete soundcast[path];
      firebase
        .database()
        .ref(`soundcasts/${id}/${path}`)
        .remove();
    }
    // using window.history object instead of this.props.history
    // to prevent rerendering (on state update)
    window.history.replaceState(window.history.state, null); // update state
  }

  renderAdditionalInputs() {
    const featureNum = this.state.features.length;
    const {
      long_description,
      hostImageURL,
      hostImgUploaded,
      landingPage,
      forSale,
      prices,
      instructor2Input,
      hostName2,
      showIntroOutro,
      proUser,
    } = this.state;
    const that = this;
    const { userInfo, history } = this.props;
    const soundcast = history.location.state && history.location.state.soundcast;
    const id = window.history.state.state.id;
    const isProOrPlus = ['pro', 'plus'].includes(userInfo.publisher && userInfo.publisher.plan);
    const actions = [
      <FlatButton
        label="OK"
        labelStyle={{ color: Colors.mainOrange, fontSize: 17 }}
        onClick={this.handlePaypalModalClose.bind(this)}
      />,
    ];
    return (
      <div style={{ marginTop: 25, marginBottom: 25 }}>
        <span style={{ ...styles.titleText, marginBottom: 5 }}>What Listeners Will Get</span>
        <span>
          <i>{` (list the main benefits and features of this soundcast)`}</i>
        </span>
        <div style={{ width: '100%', marginBottom: 30 }}>
          {this.state.features.map((feature, i) => {
            return (
              <div key={i} style={styles.inputTitleWrapper}>
                <span style={styles.titleText}>{`${i + 1}. `}</span>
                <input
                  type="text"
                  style={{ ...styles.inputTitle, width: '85%' }}
                  placeholder={'e.g. Learn how to analyze financial statement with ease'}
                  onChange={this.setFeatures.bind(this, i)}
                  value={this.state.features[i]}
                />
                <span
                  style={{ marginLeft: 5, cursor: 'pointer' }}
                  onClick={this.deleteFeature.bind(this, i)}
                >
                  <i className="fa fa-times " aria-hidden="true" />
                </span>
              </div>
            );
          })}
          <div>
            <span style={styles.addFeature} onClick={this.addFeature}>
              Add
            </span>
          </div>
        </div>
        <span style={{ ...styles.titleText, marginBottom: 5 }}>Long Description</span>
        <div>
          <Editor
            editorState={long_description}
            editorStyle={styles.editorStyle}
            wrapperStyle={styles.wrapperStyle}
            onEditorStateChange={this.onEditorStateChange}
          />
        </div>
        <div>
          <span style={styles.titleText}>Host/Instructor Name</span>
          <div style={{ ...styles.inputTitleWrapper, width: '35%' }}>
            <input
              type="text"
              style={styles.inputTitle}
              placeholder={''}
              onChange={e => this.setState({ hostName: e.target.value })}
              value={this.state.hostName || ''}
            />
          </div>
        </div>
        <div>
          <div>
            <span style={styles.titleText}>Host/Instructor Bio</span>
          </div>
          <textarea
            style={styles.inputDescription}
            placeholder={'Who will be teaching?'}
            onChange={e => this.setState({ hostBio: e.target.value })}
            value={this.state.hostBio || ''}
          />
        </div>

        {/*Host/Instructor Profile Picture*/}
        <div style={{ height: 150, width: '100%' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={styles.titleText}>Host/Instructor Profile Picture</span>
          </div>
          <div
            style={{
              ...styles.hostImage,
              backgroundImage: `url(${hostImageURL})`,
            }}
          />
          <div style={styles.loaderWrapper}>
            <div style={{ ...styles.inputFileWrapper, marginTop: 0 }}>
              <input
                type="file"
                name="upload"
                id="upload_hidden_cover_2"
                accept="image/*"
                onChange={this.setFileName.bind(this, 'host')}
                style={styles.inputFileHidden}
                ref={input => (this.hostImgInputRef = input)}
              />
              {(hostImgUploaded && (
                <div>
                  <span>{this.hostImgInputRef.files[0].name}</span>
                  <span
                    style={styles.cancelImg}
                    onClick={() => {
                      that.setState({ hostImgUploaded: false, hostImageURL: '' });
                      document.getElementById('upload_hidden_cover_2').value = null;
                    }}
                  >
                    Cancel
                  </span>
                </div>
              )) ||
                (!hostImgUploaded && (
                  <div>
                    <button
                      onClick={() => document.getElementById('upload_hidden_cover_2').click()}
                      style={{ ...styles.uploadButton, backgroundColor: Colors.mainOrange }}
                    >
                      Upload
                    </button>
                    <span style={styles.fileTypesLabel}>.jpg or .png files accepted</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        {(!hostName2 && !instructor2Input && (
          <div
            onClick={() => that.setState({ instructor2Input: true })}
            style={{ ...styles.addFeature, marginLeft: 0, marginBottom: 25 }}
          >
            <span>Add A Second Host/Instructor</span>
          </div>
        )) ||
          null}
        {((hostName2 || instructor2Input) && this.renderInstructor2Input()) || null}

        {/*Upload outro/intro*/}
        {soundcast && (
          <div style={{ marginBottom: 40 }} className="row">
            <div className="col-md-12" style={{ marginBottom: 10 }}>
              <div
                onClick={this.showIntroOutro}
                style={{
                  ...styles.titleText,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'inline-block', width: 15 }}>
                  <FontAwesomeIcon icon={showIntroOutro ? faCaretDown : faCaretRight} />
                </div>
                <span>Intro And Outro</span>
                {(!proUser && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'red', marginLeft: 5 }}>
                    PLUS
                  </span>
                )) || <span />}
              </div>
              <div style={{ ...styles.fileTypesLabel, marginBottom: 10, marginLeft: 10 }}>
                Automatically add intro/outro to episodes. mp3 or m4a files accepted
              </div>
            </div>
            <div
              className="col-md-6"
              style={{ display: showIntroOutro ? '' : 'none', paddingLeft: 45 }}
            >
              <span style={{ ...styles.titleText, display: 'inline-block', marginRight: 12 }}>
                Intro
              </span>
              <S3FileUploader
                s3NewFileName={`${soundcast.id}_intro`}
                showUploadedFile={soundcast.intro && soundcast.intro.split('/').pop()}
                onUploadedCallback={ext => that.updateSoundcast('intro', ext)}
                onRemoveCallback={() => that.updateSoundcast('intro')}
              />
            </div>
            <div className="col-md-6" style={{ display: showIntroOutro ? '' : 'none' }}>
              <span style={{ ...styles.titleText, display: 'inline-block', marginRight: 12 }}>
                Outro
              </span>
              <S3FileUploader
                s3NewFileName={`${soundcast.id}_outro`}
                showUploadedFile={soundcast.outro && soundcast.outro.split('/').pop()}
                onUploadedCallback={ext => that.updateSoundcast('outro', ext)}
                onRemoveCallback={() => that.updateSoundcast('outro')}
              />
            </div>
          </div>
        )}

        {landingPage && (
          <div>
            <span style={styles.titleText}>Pricing</span>
            <div style={{ marginTop: 15, marginBottom: 25, display: 'flex', alignItems: 'center' }}>
              <Toggle
                id="charging-status"
                aria-labelledby="charging-label"
                // label="Charge subscribers for this soundcast?"
                checked={this.state.forSale}
                onChange={this.handleChargeOption.bind(this)}
                // thumbSwitchedStyle={styles.thumbSwitched}
                // trackSwitchedStyle={styles.trackSwitched}
                // style={{fontSize: 20, width: '50%'}}
              />
              <span
                id="charging-label"
                style={{ fontSize: 20, fontWeight: 800, marginLeft: '0.5em' }}
              >
                Charge for this soundcast
              </span>
              <Dialog
                title={`Hold on, ${userInfo.firstName}! Please set up payout first. `}
                actions={actions}
                modal={true}
                open={!!this.state.paypalModalOpen}
                onRequestClose={this.handlePaypalModalClose}
              >
                <div style={{ fontSize: 17 }}>
                  <span>
                    You need a payout account so that we could send you your sales proceeds. Please
                    save this soundcast, and go to publisher setting to enter your payout method,
                    before setting up soundcast pricing.
                  </span>
                </div>
              </Dialog>
            </div>
            {forSale && (
              <div style={{ width: '100%,' }}>
                {prices.map((price, i) => {
                  const priceTag = price.price == 'free' ? 0 : price.price;
                  return (
                    <div key={i} className="" style={{ marginBottom: 10 }}>
                      <div style={{ width: '100%' }}>
                        <span style={styles.titleText}>{`${i + 1}. `}</span>
                        <div style={{ width: '45%', display: 'inline-block', marginRight: 10 }}>
                          <span>
                            <strong>Payment Plan Name</strong>
                          </span>
                          <input
                            type="text"
                            style={styles.inputTitle}
                            name="paymentPlan"
                            placeholder="e.g. 3 day access, monthly subscription, etc"
                            onChange={this.handlePriceInputs.bind(this, i)}
                            value={prices[i].paymentPlan}
                          />
                        </div>
                        <div style={{ width: '25%', display: 'inline-block', marginRight: 10 }}>
                          <span>
                            <strong>Billing</strong>
                          </span>
                          <select
                            type="text"
                            style={{ ...styles.inputTitle, paddingTop: 6 }}
                            name="billingCycle"
                            onChange={this.handlePriceInputs.bind(this, i)}
                            value={prices[i].billingCycle}
                          >
                            <option value="one time">one time purchase</option>
                            <option value="rental">one time rental</option>
                            <option value="monthly">monthly subscription</option>
                            <option value="quarterly">quarterly subscription</option>
                            <option value="annual">annual subscription</option>
                          </select>
                        </div>
                        <div style={{ width: '20%', display: 'inline-block' }}>
                          <span>
                            <strong>Price</strong>
                          </span>
                          <div>
                            <span style={{ fontSize: 18 }}>{`$ `}</span>
                            <input
                              type="text"
                              style={{ ...styles.inputTitle, width: '85%' }}
                              name="price"
                              placeholder={''}
                              onChange={this.handlePriceInputs.bind(this, i)}
                              value={priceTag}
                            />
                          </div>
                        </div>
                        <span
                          style={{ marginLeft: 5, cursor: 'pointer', fontSize: 20 }}
                          onClick={this.deletePriceOption.bind(this, i)}
                        >
                          <i className="fa fa-times " aria-hidden="true" />
                        </span>
                      </div>
                      {(prices[i].billingCycle == 'rental' && (
                        <div className="col-md-12" style={{ marginTop: 10, marginBottom: 15 }}>
                          <div className="col-md-4 col-md-offset-6" style={{ marginRight: 10 }}>
                            <span>Rental period</span>
                            <div>
                              <input
                                type="text"
                                style={{ ...styles.inputTitle, width: '70%' }}
                                name="rentalPeriod"
                                placeholder={'2'}
                                onChange={this.handlePriceInputs.bind(this, i)}
                                value={prices[i].rentalPeriod}
                              />
                              <span style={{ fontSize: 18 }}>{` days`}</span>
                            </div>
                          </div>
                        </div>
                      )) ||
                        null}
                      {price.coupons && (
                        <Coupons
                          price={price}
                          priceIndex={i}
                          prices={prices}
                          setState={that.setState.bind(that)}
                          soundcastId={id || soundcast.id}
                        />
                      )}
                      {priceTag > 0 && (
                        <div
                          style={{
                            marginLeft: 25,
                            marginTop: 5,
                            marginBottom: 5,
                            fontSize: 14,
                            color: Colors.mainOrange,
                            cursor: 'pointer',
                          }}
                        >
                          <span
                            onClick={() => {
                              if (!isProOrPlus) {
                                // not pro or plus
                                return this.setState({
                                  showPricingModal: [
                                    'Upgrade to add promo codes',
                                    'Creating promo plans is available on PLUS and PRO plans. Please upgrade to access this feature.',
                                  ],
                                });
                              }
                              if (!prices[i].coupons) {
                                prices[i].coupons = [];
                              }
                              prices[i].coupons.push({
                                code: '',
                                percentOff: 0,
                                couponType: 'discount',
                                expiration: moment()
                                  .add(3, 'months')
                                  .unix(),
                              });
                              that.setState({ prices });
                            }}
                          >
                            Add a coupon{' '}
                            {!isProOrPlus && (
                              <span style={{ color: Colors.link, fontWeight: 700, fontSize: 12 }}>
                                {' '}
                                PRO
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }) /* prices.map */}
                <div
                  onClick={this.addPriceOption.bind(this)}
                  style={{
                    ...styles.addFeature,
                    marginTop: 25,
                    marginBottom: 30,
                    display: 'inline-block',
                  }}
                >
                  Add another price option
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  } // renderAdditionalInputs

  renderInstructor2Input() {
    const { hostName2, hostBio2, hostImageURL2, hostImgUploaded2 } = this.state;
    return (
      <div>
        <div>
          <span style={styles.titleText}>Host/Instructor #2: Name</span>
          <div style={{ ...styles.inputTitleWrapper, width: '35%' }}>
            <input
              type="text"
              style={styles.inputTitle}
              placeholder={''}
              onChange={e => this.setState({ hostName2: e.target.value })}
              value={this.state.hostName2}
            />
          </div>
        </div>
        <div>
          <div>
            <span style={styles.titleText}>Host/Instructor #2: Bio</span>
          </div>
          <textarea
            style={styles.inputDescription}
            placeholder={'Who will be teaching?'}
            onChange={e => this.setState({ hostBio2: e.target.value })}
            value={this.state.hostBio2}
          />
        </div>
        <div style={{ height: 150, width: '100%' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={styles.titleText}>Host/Instructor #2: Profile Picture</span>
          </div>
          <div style={{ ...styles.hostImage, backgroundImage: `url(${hostImageURL2})` }} />
          <div style={styles.loaderWrapper}>
            <div style={{ ...styles.inputFileWrapper, marginTop: 0 }}>
              <input
                type="file"
                name="upload"
                id="upload_hidden_cover_3"
                accept="image/*"
                onChange={this.setFileName.bind(this, 'host2')}
                style={styles.inputFileHidden}
                ref={input => (this.hostImgInputRef = input)}
              />
              {(hostImgUploaded2 && (
                <div>
                  <span>{this.hostImgInputRef.files[0].name}</span>
                  <span
                    style={styles.cancelImg}
                    onClick={() => {
                      that.setState({
                        hostImgUploaded2: false,
                        hostImageURL2: '',
                      });
                      document.getElementById('upload_hidden_cover_3').value = null;
                    }}
                  >
                    Cancel
                  </span>
                </div>
              )) ||
                (!hostImgUploaded2 && (
                  <div>
                    <button
                      onClick={() => document.getElementById('upload_hidden_cover_3').click()}
                      style={{ ...styles.uploadButton, backgroundColor: Colors.mainOrange }}
                    >
                      Upload
                    </button>
                    <span style={styles.fileTypesLabel}>.jpg or .png files accepted</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  handlePriceInputs(i, e) {
    let prices = [...this.state.prices];
    if (e.target.name === 'billingCycle' && prices[i].coupons) {
      prices[i].coupons.forEach(i => (i.couponType = 'discount'));
    }
    prices[i][e.target.name] = e.target.value;
    this.setState({ prices });
  }

  addPriceOption() {
    let prices = [...this.state.prices];
    const price = { paymentPlan: '', billingCycle: 'monthly', price: '' };
    prices.push(price);
    this.setState({ prices });
  }

  deletePriceOption(i) {
    let prices = [...this.state.prices];
    if (prices.length > 1) {
      prices.splice(i, 1);
    } else {
      prices[0] = { paymentPlan: '', billingCycle: 'monthly', price: '' };
    }
    this.setState({ prices });
  }

  handleModalOpen() {
    this.setState({ modalOpen: true, fileCropped: false });
  }

  handleModalClose() {
    // image upload is cancelled
    this.setState({ modalOpen: false });
    if (this.state.hostImg) {
      this.setState({ hostImgUploaded: false });
      document.getElementById('upload_hidden_cover_2').value = null;
    } else if (this.state.hostImg2) {
      this.setState({ hostImgUploaded2: false });
      document.getElementById('upload_hidden_cover_3').value = null;
    } else if (this.state.itunesImage) {
      this.setState({ itunesUploaded: false });
      document.getElementById('upload_hidden_iTunes').value = null;
    } else {
      this.setState({ fileUploaded: false });
      document.getElementById('upload_hidden_cover').value = null;
    }
  }

  uploadViaModal(fileBlob, imageType) {
    this.setState({ fileCropped: true, modalOpen: false });
    if (imageType == 'host') {
      this.setState({ hostImgUploaded: true });
    } else if (imageType == 'host2') {
      this.setState({ hostImgUploaded2: true });
    } else if (imageType == 'itunes') {
      console.log('itunes block called');
      this.setState({ itunesUploaded: true });
    } else {
      this.setState({ fileUploaded: true });
    }
    this._uploadToAws(fileBlob, imageType);
  }

  createPodcast() {
    const that = this;
    const { id, soundcast } = this.props.history.location.state;
    const { firstName, email } = this.props.userInfo;
    const {
      itunesImage,
      itunesExplicit,
      itunesCategory,
      podcastFeedVersion,
      autoSubmitPodcast,
      title,
      itunesTitle,
      itunesHost,
    } = this.state;
    if (!itunesCategory || itunesCategory.length == 0) {
      alert('Please pick at least one category before submitting.');
      return;
    }
    if (!itunesImage) {
      alert('Please upload a cover image before submitting.');
      return;
    }
    this.submit(true, true);
    this.setState({
      startProcessingPodcast: true,
      doneProcessingPodcast: false,
    });
    Axios.post('/api/create_feed', {
      soundcastId: id,
      itunesExplicit,
      itunesImage,
      itunesCategory,
      autoSubmitPodcast,
      firstName,
      email: email[0],
      soundcastTitle: itunesTitle,
      soundcastHost: itunesHost,
    })
      .then(response => {
        that.setState({
          startProcessingPodcast: false,
          doneProcessingPodcast: true,
        });
        if (podcastFeedVersion) {
          alert('Your podcast feed information has been edited!');
        } else {
          alert(
            'Your podcast information is submitted. We will email you when the feed processing is done.'
          );
        }
      })
      .catch(err => {
        that.setState({
          startProcessingPodcast: false,
          doneProcessingPodcast: true,
          podcastError: err.toString(),
        });
        console.log(err);
      });
  }

  renderPodcastInput() {
    const {
      itunesExplicit,
      itunesImage,
      itunesCategory,
      itunesTitle,
      itunesHost,
      imageURL,
      itunesUploaded,
      podcastFeedVersion,
      autoSubmitPodcast,
    } = this.state;
    const { id } = this.props;
    const that = this;
    const img1 = new Image();
    img1.onload = function() {
      var height = img1.naturalHeight || img1.height;
      var width = img1.naturalWidth || img1.width;
      if (height >= 1400 && height <= 3000 && !itunesImage) {
        that.setState({
          itunesImage: imageURL,
        });
      }
    };
    img1.src = imageURL;
    // console.log('itunesCategory: ', itunesCategory);
    const categoryObj = itunesCategories;
    const itunesArr = [];
    for (let key in categoryObj) {
      if (categoryObj[key].sub) {
        categoryObj[key].sub.forEach(sub => itunesArr.push(`${categoryObj[key].name} - ${sub}`));
      } else {
        itunesArr.push(categoryObj[key].name);
      }
    }
    itunesArr.unshift('');
    return (
      <div>
        <div style={{ ...styles.titleText, paddingBottom: 15 }}>
          Your Podcast RSS feed URL is:{' '}
          <a
            href={`https://mysoundwise.com/rss/${id}`}
            style={{ color: Colors.mainOrange }}
          >{`https://mysoundwise.com/rss/${id}`}</a>
        </div>
        {(!podcastFeedVersion && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ ...styles.titleText, paddingBottom: 15 }}>Podcast submission </div>
            <MuiThemeProvider>
              <RadioButtonGroup
                name="podcast submission"
                defaultSelected={autoSubmitPodcast}
                onChange={(e, value) => {
                  that.setState({
                    autoSubmitPodcast: value,
                  });
                }}
              >
                <RadioButton
                  value={true}
                  label="Submit the feed to iTunes & Google Play for me"
                  labelStyle={styles.titleText}
                  style={styles.radioButton}
                />
                <RadioButton
                  value={false}
                  label="I'll submit it myself"
                  labelStyle={styles.titleText}
                  style={styles.radioButton}
                />
              </RadioButtonGroup>
            </MuiThemeProvider>
            <hr />
          </div>
        )) ||
          null}
        <div>
          <span style={styles.titleText}>Podcast Title</span>
          <div style={{ ...styles.inputTitleWrapper, width: '100%' }}>
            <input
              type="text"
              style={styles.inputTitle}
              placeholder={''}
              onChange={e => this.setState({ itunesTitle: e.target.value })}
              value={this.state.itunesTitle || this.state.title}
            />
          </div>
        </div>
        <div>
          <span style={styles.titleText}>Podcast Host Name</span>
          <div style={{ ...styles.inputTitleWrapper, width: '50%' }}>
            <input
              type="text"
              style={styles.inputTitle}
              placeholder={''}
              onChange={e => this.setState({ itunesHost: e.target.value })}
              value={this.state.itunesHost || this.state.hostName}
            />
          </div>
        </div>
        <div style={{ ...styles.titleText, paddingBottom: 15 }}>
          The material contains explicit language
        </div>
        <MuiThemeProvider>
          <RadioButtonGroup
            name="Contains explicit language"
            defaultSelected={itunesExplicit}
            onChange={(e, value) => that.setState({ itunesExplicit: value })}
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
        </MuiThemeProvider>
        <div style={{ height: 150 }}>
          <div style={styles.image}>
            <img src={itunesImage} />
          </div>
          <div style={styles.loaderWrapper}>
            <div style={{ ...styles.titleText, marginLeft: 10 }}>iTunes/Google Play cover art</div>
            <div style={{ ...styles.fileTypesLabel, marginLeft: 10 }}>
              At least 1400 x 1400 pixels in .jpg or .png format. Must not exceed 3000 x 3000 pixels
            </div>
            <div style={{ ...styles.inputFileWrapper, marginTop: 0 }}>
              <input
                type="file"
                name="upload"
                id="upload_hidden_iTunes"
                accept="image/*"
                onChange={this.setFileName.bind(this, 'itunes')}
                style={styles.inputFileHidden}
                ref={input => (this.itunesInputRef = input)}
              />
              {(itunesUploaded && (
                <div>
                  <span>{this.itunesInputRef.files[0].name}</span>
                  <span
                    style={styles.cancelImg}
                    onClick={() => {
                      that.setState({ itunesUploaded: false, itunesImage: '' });
                      document.getElementById('upload_hidden_iTunes').value = null;
                    }}
                  >
                    Cancel
                  </span>
                </div>
              )) ||
                (!itunesUploaded && (
                  <div>
                    <button
                      onClick={() => document.getElementById('upload_hidden_iTunes').click()}
                      style={{ ...styles.uploadButton, backgroundColor: Colors.link }}
                    >
                      Upload
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div style={styles.soundcastSelectWrapper}>
          <div style={{ ...styles.titleText, marginLeft: 10 }}>
            <span>iTunes Category 1 (required)</span>
            <span style={{ color: 'red' }}>*</span>
          </div>
          <select
            value={(itunesCategory && itunesCategory[0] && itunesCategory[0]) || ''}
            style={styles.soundcastSelect}
            onChange={e => {
              const itunesCategory = this.state.itunesCategory || [];
              itunesCategory[0] = e.target.value;
              that.setState({ itunesCategory });
            }}
          >
            {itunesArr.map((cat, i) => {
              return (
                <option value={cat} key={i}>
                  {cat}
                </option>
              );
            })}
          </select>
        </div>
        <div style={styles.soundcastSelectWrapper}>
          <div style={{ ...styles.titleText, marginLeft: 10 }}>
            <span>iTunes Category 2</span>
          </div>
          <select
            value={(itunesCategory && itunesCategory[1] && itunesCategory[1]) || ''}
            style={styles.soundcastSelect}
            onChange={e => {
              const itunesCategory = this.state.itunesCategory;
              itunesCategory[1] = e.target.value;
              that.setState({ itunesCategory });
            }}
          >
            {itunesArr.map((cat, i) => {
              return (
                <option value={cat} key={i}>
                  {cat}
                </option>
              );
            })}
          </select>
        </div>
        <div style={styles.soundcastSelectWrapper}>
          <div style={{ ...styles.titleText, marginLeft: 10 }}>
            <span>iTunes Category 3</span>
          </div>
          <select
            value={(itunesCategory && itunesCategory[2] && itunesCategory[2]) || ''}
            style={styles.soundcastSelect}
            onChange={e => {
              const itunesCategory = this.state.itunesCategory;
              itunesCategory[2] = e.target.value;
              that.setState({ itunesCategory });
            }}
          >
            {itunesArr.map((cat, i) => {
              return (
                <option value={cat} key={i}>
                  {cat}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    );
  }

  render() {
    const {
      imageURL,
      title,
      subscribed,
      fileUploaded,
      landingPage,
      modalOpen,
      hostImg,
      isPodcast,
      createPodcast,
      selectedCategory,
      categories,
      editPodcast,
      episodes,
      forSale,
      imageType,
      startProcessingPodcast,
      doneProcessingPodcast,
      podcastError,
      podcastFeedVersion,
      hostImg2,
      showPricingModal,
    } = this.state;
    const { userInfo, history, id } = this.props;
    const that = this;

    return (
      <MuiThemeProvider>
        <div className="padding-30px-tb" style={{}}>
          {/*Upgrade account block*/}
          <div
            onClick={() => that.setState({ showPricingModal: false })}
            style={{
              display: showPricingModal ? '' : 'none',
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
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                top: '50%',
                left: '50%',
                position: 'fixed',
                width: '66%',
                zIndex: 103,
              }}
            >
              <div className="title-medium" style={{ margin: 25, fontWeight: 800 }}>
                {showPricingModal && showPricingModal[0]}
              </div>
              <div className="title-small" style={{ margin: 25 }}>
                {showPricingModal && showPricingModal[1]}
              </div>
              <div className="center-col">
                <OrangeSubmitButton
                  label="Upgrade"
                  onClick={() => history.push({ pathname: '/pricing' })}
                  styles={{ width: '60%' }}
                />
              </div>
            </div>
          </div>

          <ImageCropModal
            open={modalOpen}
            handleClose={this.handleModalClose.bind(this)}
            upload={this.uploadViaModal.bind(this)}
            hostImg={hostImg}
            hostImg2={hostImg2}
            imageType={imageType}
            file={this.currentImageRef}
          />
          <div className="padding-bottom-20px">
            <span className="title-medium ">Edit Soundcast</span>
          </div>
          <div style={{ marginTop: 15, marginBottom: 25, display: 'flex', alignItems: 'center' }}>
            <Toggle
              id="landing-status"
              aria-labelledby="landing-label"
              checked={this.state.landingPage}
              onChange={this.handleCheck.bind(this)}
            />
            <span id="landing-label" style={{ fontSize: 20, fontWeight: 800, marginLeft: '0.5em' }}>
              This is a public soundcast
            </span>
            {(landingPage && (
              <ul className="nav nav-pills col-md-6" style={{ marginLeft: 25 }}>
                <li role="presentation">
                  <a
                    target="_blank"
                    href={`https://mysoundwise.com/soundcasts/${id}`}
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 600, color: Colors.mainOrange }}>
                      View Landing Page
                    </span>
                  </a>
                </li>
                <li role="presentation">
                  <a target="_blank" onClick={() => that.handleSoundcastSignup()}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: Colors.link }}>
                      View Signup Form
                    </span>
                  </a>
                </li>
              </ul>
            )) ||
              null}
          </div>
          <div className="row">
            <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
              <div style={{ marginBottom: 15 }}>
                <span style={styles.titleText}>Title</span>
                <span style={{ ...styles.titleText, color: 'red' }}>*</span>
                <span style={{ fontSize: 17, marginBottom: 15 }}>
                  <i> (60 characters max)</i>
                </span>
              </div>
              <ValidatedInput
                type="text"
                styles={styles.inputTitle}
                wrapperStyle={styles.inputTitleWrapper}
                placeholder={'Soundcast title'}
                onChange={e => this.setState({ title: e.target.value })}
                value={this.state.title}
                validators={[minLengthValidator.bind(null, 1), maxLengthValidator.bind(null, 60)]}
              />
              <div style={{ marginTop: 20 }}>
                <span style={{ ...styles.titleText, marginTop: 20 }}>Short Description</span>
                <span style={{ ...styles.titleText, color: 'red' }}>*</span>
                <span style={{ fontSize: 17 }}>
                  <i> (300 characters max)</i>
                </span>
              </div>
              <div style={styles.inputTitleWrapper}>
                <textarea
                  type="text"
                  style={styles.inputDescription}
                  placeholder={'A short description of this soundcast (300 characters max)'}
                  onChange={e => this.setState({ short_description: e.target.value })}
                  value={this.state.short_description}
                />
              </div>

              {/*Category*/}
              <span style={styles.titleText}>Category</span>
              <span style={{ ...styles.titleText, color: 'red' }}>*</span>
              <div style={{ width: 370 }} className="dropdown">
                <div
                  style={{ width: '100%', padding: 0, marginTop: 20 }}
                  className="btn dropdown-toggle"
                  data-toggle="dropdown"
                >
                  <div style={styles.dropdownTitle}>
                    <span>{(selectedCategory && selectedCategory.name) || 'Choose category'}</span>
                    <span style={{ position: 'absolute', right: 10, top: 40 }} className="caret" />
                  </div>
                </div>
                <ul style={{ padding: 0 }} className="dropdown-menu">
                  {categories.map((category, i) => (
                    <li style={{ fontSize: '16px' }} key={`category_option${i}`}>
                      <button
                        style={styles.categoryButton}
                        onClick={() => this.setState({ selectedCategory: category })}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 40, height: 150 }}>
                <div style={styles.image}>
                  <img src={imageURL} />
                </div>
                <div style={styles.loaderWrapper}>
                  <div style={{ ...styles.titleText, marginLeft: 10 }}>Soundcast cover art</div>
                  <div style={{ ...styles.fileTypesLabel, marginLeft: 10 }}>
                    (Required: square image between 1400 x 1400 pixels and 3000 x 3000 pixels, in
                    .jpeg or .png format)
                  </div>
                  <div style={{ ...styles.inputFileWrapper, marginTop: 0 }}>
                    <input
                      type="file"
                      name="upload"
                      id="upload_hidden_cover"
                      accept="image/*"
                      onChange={this.setFileName.bind(this, null)}
                      style={styles.inputFileHidden}
                      ref={input => (this.fileInputRef = input)}
                    />
                    {(fileUploaded && (
                      <div>
                        <span>{this.fileInputRef.files[0].name}</span>
                        <span
                          style={styles.cancelImg}
                          onClick={() => {
                            that.setState({
                              fileUploaded: false,
                              imageURL: '',
                              blurredImageURL: null,
                            });
                            document.getElementById('upload_hidden_cover').value = null;
                          }}
                        >
                          Cancel
                        </span>
                      </div>
                    )) ||
                      (!fileUploaded && (
                        <div>
                          <button
                            onClick={() => document.getElementById('upload_hidden_cover').click()}
                            style={{ ...styles.uploadButton, backgroundColor: Colors.link }}
                          >
                            Upload
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              {this.renderAdditionalInputs()}
              <div style={{ paddingTop: 20, paddingBottom: 25 }}>
                <span style={{ ...styles.titleText, marginTop: 20 }}>Other Settings</span>
                <div
                  style={{ marginTop: 15, marginBottom: 25, display: 'flex', alignItems: 'center' }}
                >
                  <Toggle
                    id="charging-status"
                    aria-labelledby="charging-label"
                    // label="Charge subscribers for this soundcast?"
                    checked={this.state.showTimeStamps}
                    onChange={() => that.setState({ showTimeStamps: !that.state.showTimeStamps })}
                    // thumbSwitchedStyle={styles.thumbSwitched}
                    // trackSwitchedStyle={styles.trackSwitched}
                    // style={{fontSize: 20, width: '50%'}}
                  />
                  <span
                    id="charging-label"
                    style={{ fontSize: 20, fontWeight: 800, marginLeft: '0.5em' }}
                  >
                    Show episode publication dates
                  </span>
                </div>
                <div
                  style={{ marginTop: 15, marginBottom: 25, display: 'flex', alignItems: 'center' }}
                >
                  <Toggle
                    id="charging-status"
                    aria-labelledby="charging-label"
                    // label="Charge subscribers for this soundcast?"
                    checked={this.state.showSubscriberCount}
                    onChange={() => {
                      that.setState({ showSubscriberCount: !that.state.showSubscriberCount });
                    }}
                  />
                  <span
                    id="charging-label"
                    style={{ fontSize: 20, fontWeight: 800, marginLeft: '0.5em' }}
                  >
                    Show subscriber count
                  </span>
                </div>
                {(!isPodcast && !forSale && episodes && (
                  <div
                    style={{
                      marginTop: 15,
                      marginBottom: 25,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Toggle
                      id="charging-status"
                      aria-labelledby="charging-label"
                      checked={this.state.createPodcast}
                      onChange={() => that.setState({ createPodcast: !that.state.createPodcast })}
                    />
                    {(podcastFeedVersion && (
                      <span
                        id="charging-label"
                        style={{ fontSize: 20, fontWeight: 800, marginLeft: '0.5em' }}
                      >
                        Edit the podcast feed
                      </span>
                    )) || (
                      <span
                        id="charging-label"
                        style={{ fontSize: 20, fontWeight: 800, marginLeft: '0.5em' }}
                      >
                        Create a podcast feed
                      </span>
                    )}
                  </div>
                )) ||
                  null}
                {(createPodcast && (
                  <div>
                    {this.renderPodcastInput()}
                    <div className="col-lg-5 col-md-6 col-sm-8 col-xs-12 center-col">
                      {(startProcessingPodcast && !doneProcessingPodcast && (
                        <div style={{ marginTop: 25, width: '100%', marginBottom: 25 }}>
                          <div className="" style={{ fontSize: 18, width: '100%' }}>
                            <span>Submitting feed information...</span>
                          </div>
                          <div className="col-md-12" style={{ marginTop: 10 }}>
                            <Dots style={{}} color="#727981" size={32} speed={1} />
                          </div>
                        </div>
                      )) || (
                        <div>
                          <OrangeSubmitButton
                            styles={{ width: '100%' }}
                            label={
                              (podcastFeedVersion && 'Save Edited Podcast Feed') ||
                              'Create Podcast Feed'
                            }
                            onClick={this.createPodcast.bind(this)}
                          />
                          {podcastError && doneProcessingPodcast && (
                            <div style={{ fontSize: 17, marginTop: 10, color: 'red' }}>
                              {podcastError}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )) ||
                  null}
                {(isPodcast && (
                  <div
                    style={{
                      marginTop: 15,
                      marginBottom: 25,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Toggle
                      id="charging-status"
                      aria-labelledby="charging-label"
                      checked={this.state.editPodcast}
                      onChange={() => that.setState({ editPodcast: !that.state.editPodcast })}
                    />
                    <span
                      id="charging-label"
                      style={{ fontSize: 20, fontWeight: 800, marginLeft: '0.5em' }}
                    >
                      Modify the podcast feed
                    </span>
                  </div>
                )) ||
                  null}
                {(isPodcast && editPodcast && this.renderPodcastInput()) || null}
              </div>
              {/*Invitations*/}
              <div
                style={{
                  borderTop: '0.3px solid #9b9b9b',
                  paddingTop: 25,
                  borderBottom: '0.3px solid #9b9b9b',
                  paddingBottom: 25,
                }}
              >
                <div>
                  <span style={styles.titleText}>Subsciption Confirmation Message</span>
                  <Editor
                    editorState={this.state.confirmationEmail}
                    editorStyle={styles.editorStyle}
                    wrapperStyle={styles.wrapperStyle}
                    onEditorStateChange={this.onConfirmationStateChange.bind(this)}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-4 col-md-6 col-sm-12 col-xs-12">
                  <OrangeSubmitButton
                    label="Save Draft"
                    styles={{ backgroundColor: Colors.link, borderColor: Colors.link }}
                    onClick={() => that.submit(false, false)}
                  />
                </div>
                <div className="col-lg-4 col-md-6 col-sm-12 col-xs-12">
                  <OrangeSubmitButton label="Publish" onClick={() => that.submit(true, false)} />
                </div>
                <div className="col-lg-4 col-md-12 col-sm-12 col-xs-12">
                  <TransparentShortSubmitButton
                    styles={{ width: 229 }}
                    label="Cancel"
                    onClick={() => history.goBack()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog modal={true} open={this.state.upgradeModal}>
          <div
            style={{ cursor: 'pointer', float: 'right', fontSize: 29 }}
            onClick={() => this.closeUpgradeModal()}
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
              onClick={() => that.props.history.push({ pathname: '/pricing' })}
            />
          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

EditSoundcast.propTypes = {
  userInfo: PropTypes.object,
  history: PropTypes.object,
};

const styles = {
  titleText: { ...commonStyles.titleText, fontSize: 20 },
  inputTitleWrapper: { ...commonStyles.inputTitleWrapper },
  inputTitle: { ...commonStyles.inputTitle, marginTop: 5 },
  hostImage: { ...commonStyles.hostImage, float: 'left' },
  inputFileHidden: { ...commonStyles.inputFileHidden },
  image: { ...commonStyles.image, float: 'left' },
  cancelImg: { ...commonStyles.cancelImg },
  dropdownTitle: { ...commonStyles.dropdownTitle },
  categoryButton: { ...commonStyles.categoryButton },
  loaderWrapper: {
    ...commonStyles.loaderWrapper,
    width: 'calc(100% - 133px)',
    float: 'left',
  },
  inputDescription: {
    height: 80,
    backgroundColor: Colors.mainWhite,
    width: '100%',
    fontSize: 18,
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 20,
  },
  editorStyle: {
    padding: '5px',
    borderRadius: 4,
    fontSize: 16,
    height: '300px',
    width: '100%',
    backgroundColor: Colors.mainWhite,
  },
  wrapperStyle: {
    borderRadius: 4,
    marginBottom: 25,
    marginTop: 15,
  },
  checkbox: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    verticalAlign: 'middle',
    // WebkitAppearance: 'none',
    // appearance: 'none',
    borderRadius: '1px',
    borderColor: 'black',
    borderWidth: 1,
    boxSizing: 'border-box',
    marginLeft: 10,
  },
  addFeature: {
    fontSize: 20,
    marginLeft: 10,
    color: Colors.link,
    cursor: 'pointer',
  },

  // TODO: move to separate component if functions are the same as in create_episode
  inputFileWrapper: {
    margin: 10,
    width: 'calc(100% - 20px)',
    height: 60,
    // backgroundColor: Colors.mainWhite,
    overflow: 'hidden',
    marginBottom: 0,
    float: 'left',
  },
  uploadButton: {
    backgroundColor: Colors.link,
    width: 80,
    height: 30,
    // float: 'left',
    color: Colors.mainWhite,
    fontSize: 18,
    border: 0,
    marginTop: 5,
  },
  fileTypesLabel: {
    fontSize: 16,
    marginLeft: 0,
    display: 'block',
  },
  radioButton: {
    marginBottom: 16,
  },
  thumbSwitched: {
    backgroundColor: Colors.link,
  },
  trackSwitched: {
    backgroundColor: Colors.link,
  },
  soundcastSelectWrapper: {
    height: 92,
    backgroundColor: Colors.mainWhite,
    marginTop: 15,
    paddingTop: 15,
  },
  soundcastSelect: {
    backgroundColor: 'transparent',
    width: 'calc(100% - 20px)',
    height: 40,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    fontSize: 16,
  },
  dialogTitle: {
    marginTop: 47,
    marginBottom: 49,
    textAlign: 'center',
    fontSize: 22,
  },
};
