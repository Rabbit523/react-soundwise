import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import jimp from 'jimp';
import toBuffer from 'blob-to-buffer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import firebase from 'firebase';
import { Editor } from 'react-draft-wysiwyg';
import { convertToRaw, EditorState, convertFromHTML, ContentState } from 'draft-js';
import Toggle from 'react-toggle';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCaretRight from '@fortawesome/fontawesome-free-solid/faCaretRight';
import faCaretDown from '@fortawesome/fontawesome-free-solid/faCaretDown';
import ImageCropModal from './image_crop_modal';
import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import { inviteListeners } from '../../../helpers/invite_listeners';
import ValidatedInput from '../../../components/inputs/validatedInput';
import S3FileUploader from '../../../components/s3_file_uploader';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';
import Coupons from './coupons';
const {
  podcastCategories,
  getRandomColor,
  isFreeAccount,
} = require('../../../../server/scripts/utils.js')();

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

export default class AddSoundcast extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      subscribers: '',
      short_description: '',
      long_description: EditorState.createEmpty(),
      imageURL: '',
      blurredImageURL: null,
      fileUploaded: false,
      landingPage: true,
      features: [''],
      hostName: '',
      hostBio: '',
      hostImageURL: 'https://d1jzcuf08rvzm.cloudfront.net/user_profile_pic_placeholder.png',
      hostImgUploaded: '',
      forSale: false,
      prices: [],
      modalOpen: false,
      upgradeModal: false,
      upgradeModalTitle: '',
      categories: Object.keys(podcastCategories).map(i => {
        return { name: podcastCategories[i].name };
      }), // main 16 categories ('Arts', 'Comedy', ...)
      selectedCategory: null,
      paypalEmail: '',
      confirmationEmail: EditorState.createWithContent(confirmationEmail),
      showIntroOutro: false,
      showPricingModal: false,
      intro: null,
      outro: null,
    };

    this.soundcastId = `${moment().format('x')}s`;
    this.fileInputRef = null;
    this.hostImgInputRef = null;
    this.currentImageRef = null;
    this.firebaseListener = null;
    this.uploadIntroAudioInput = null;
    this.uploadOutroAudioInput = null;
    this.addFeature = this.addFeature.bind(this);
    this.showIntroOutro = this.showIntroOutro.bind(this);
    this.isAvailableCoupon100PercentOff = this.isAvailableCoupon100PercentOff.bind(this);
    this.closeUpgradeModal = this.closeUpgradeModal.bind(this);
  }

  componentDidMount() {
    this.props.userInfo.publisher && this.checkUserStatus(this.props.userInfo);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.proUser && nextProps.userInfo.publisher) {
      this.checkUserStatus(nextProps.userInfo);
    }
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

  _uploadToAws(file, hostImg) {
    let data = new FormData();
    const splittedFileName = file.type.split('/');
    const ext = splittedFileName[splittedFileName.length - 1];
    const fileName = `${hostImg ? 'host-image-' : ''}${moment().format('x')}.${ext}`;

    data.append('file', file, fileName);

    Axios.post('/api/upload', data)
      .then(res => {
        // POST succeeded...
        console.log('success upload to aws s3: ', res);

        //replace 'http' with 'https'
        let url = res.data[0].url;
        if (url.slice(0, 5) !== 'https') {
          url = url.replace(/http/i, 'https');
        }

        if (hostImg) {
          this.setState({ hostImageURL: url });
        } else {
          this.setState({ imageURL: url });
        }

        if (!hostImg) {
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

                        //replace 'http' with 'https'
                        let url = res.data[0].url;
                        if (url.slice(0, 5) !== 'https') {
                          url = url.replace(/http/i, 'https');
                        }

                        this.setState({ blurredImageURL: url });
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

  setFileName(hostImg, e) {
    // console.log('this.fileInputRef.files: ', this.fileInputRef.files);
    if (hostImg) {
      // this._uploadToAws(this.hostImgInputRef.files[0], true);
      if (this.hostImgInputRef.files[0]) {
        this.setState({
          hostImgUploaded: true,
          hostImg: true,
        });
        this.currentImageRef = this.hostImgInputRef.files[0];
      }
    } else {
      // this._uploadToAws(this.fileInputRef.files[0], null)
      if (this.fileInputRef.files[0]) {
        this.setState({
          fileUploaded: true,
          hostImg: false,
        });
        this.currentImageRef = this.fileInputRef.files[0];
      }
    }

    const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (allowedFileTypes.indexOf(this.currentImageRef.type) < 0) {
      alert('Only .png or .jpeg files are accepted. Please upload a new file.');
      if (hostImg) {
        this.setState({
          hostImgUploaded: false,
        });
      } else {
        this.setState({
          fileUploaded: false,
        });
      }
      return;
    }
    this.handleModalOpen();
  }

  submit(publish) {
    let {
      title,
      blurredImageURL,
      subscribers,
      short_description,
      long_description,
      landingPage,
      features,
      hostName,
      hostBio,
      hostImageURL,
      forSale,
      prices,
      confirmationEmail,
      introUrl,
      outroUrl,
      selectedCategory,
    } = this.state;
    const imageURL =
      this.state.imageURL ||
      `https://dummyimage.com/300.png/${getRandomColor()}/ffffff&text=${encodeURIComponent(title)}`;
    if (title.length == 0) {
      return alert('Please enter a soundcast title before saving.');
    }
    if (short_description == 0) {
      return alert('Please enter a short description for the soundcast before saving.');
    }
    if (!selectedCategory) {
      return alert('Please choose a category before saving.');
    }
    if (prices.length === 0) {
      //if pricing isn't specified, then this is a free soundcast
      prices = [{ price: 'free' }];
    }
    const { userInfo, history } = this.props;
    // const host = [{hostName, hostBio, hostImageURL}];
    const that = this;

    if (!this.isAvailableCoupon100PercentOff(prices)) {
      this.setState({
        upgradeModal: true,
        upgradeModalTitle: 'Please upgrade to create 100% off discounts',
      });
      return;
    }

    // need to remove all spaces
    subscribers = subscribers.replace(/\s/g, '');

    const subscribersArr = subscribers.split(',');
    for (var i = subscribersArr.length - 1; i >= 0; i--) {
      if (subscribersArr[i].indexOf('@') === -1) {
        subscribersArr.splice(i, 1);
      }
    }

    // send email invitations to invited listeners
    const subject = `${userInfo.publisher.name} invites you to subscribe to ${title}`;
    const content = `<p>Hi there!</p><p></p><p>${
      userInfo.publisher.name
    } has invited you to subscribe to <a href="${
      landingPage ? 'https://mysoundwise.com/soundcasts/' + that.soundcastId : ''
    }" target="_blank">${title}</a> on Soundwise. If you don't already have the Soundwise app on your phone--</p><p><strong>iPhone user: <strong>Download the app <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8">here</a>.</p><p><strong>Android user: <strong>Download the app <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android">here</a>.</p><p></p><p>Once you have the app, simply log in using the email address that this email was sent to. Your new soundcast will be loaded automatically.</p><p>The Soundwise Team</p>`;
    inviteListeners(
      subscribersArr,
      subject,
      content,
      userInfo.publisher.name,
      userInfo.publisher.imageUrl
    );

    const invited = {};
    subscribersArr.map((email, i) => {
      let _email = email.replace(/\./g, '(dot)');
      _email = _email.trim().toLowerCase();
      invited[_email] = moment().format('X'); //invited listeners are different from subscribers. Subscribers are invited listeners who've accepted the invitation and signed up via mobile app
    });

    this.firebaseListener = firebase.auth().onAuthStateChanged(user => {
      if (user && that.firebaseListener) {
        const creatorID = user.uid;
        const last_update = Number(moment().format('X'));
        const newSoundcast = {
          title,
          imageURL,
          blurredImageURL,
          creatorID,
          short_description,
          long_description: JSON.stringify(convertToRaw(long_description.getCurrentContent())),
          confirmationEmail: JSON.stringify(convertToRaw(confirmationEmail.getCurrentContent())),
          date_created: moment().format('X'),
          publisherID: userInfo.publisherID,
          invited,
          landingPage,
          features,
          category: selectedCategory.name,
          hostName,
          hostBio,
          hostImageURL,
          forSale,
          prices,
          last_update,
          published: publish,
          intro: introUrl || null,
          outro: outroUrl || null,
        };

        let _promises_1 = [
          // add soundcast
          firebase
            .database()
            .ref(`soundcasts/${that.soundcastId}`)
            .set(newSoundcast)
            .then(
              res => {
                // console.log('success add soundcast: ', res);
                return res;
              },
              err => {
                console.log('ERROR add soundcast: ', err);
                Promise.reject(err);
              }
            ),
          // add soundcast to publisher
          firebase
            .database()
            .ref(`publishers/${userInfo.publisherID}/soundcasts/${that.soundcastId}`)
            .set(true)
            .then(
              res => {
                // console.log('success add soundcast to publisher: ', res);
                return res;
              },
              err => {
                console.log('ERROR add soundcast to publisher: ', err);
                Promise.reject(err);
              }
            ),
          // add soundcast to admin
          firebase
            .database()
            .ref(`users/${creatorID}/soundcasts_managed/${that.soundcastId}`)
            .set(true)
            .then(
              res => {
                // console.log('success add soundcast to admin.soundcasts_managed: ', res);
                return res;
              },
              err => {
                console.log('ERROR add soundcast to admin.soundcasts_managed: ', err);
                Promise.reject(err);
              }
            ),
          Axios.post('/api/soundcast', {
            title,
            soundcastId: that.soundcastId,
            publisherId: userInfo.publisherID,
            imageURL,
            category: selectedCategory.name,
            published: publish,
            landingPage,
            forSale,
            updateDate: last_update,
          })
            .then(res => {
              if (prices.length && userInfo.publisher && userInfo.publisher.stripe_user_id) {
                Axios.post('/api/createUpdatePlans', {
                  soundcastID: that.soundcastID,
                  publisherID: userInfo.publisherID,
                  stripe_account: userInfo.publisher.stripe_user_id,
                  title,
                  prices: landingPage && forSale ? prices : [],
                }).catch(err => alert(`Error creating plans ${err}`));
              }
              return res;
            })
            .catch(err => {
              console.log('ERROR API post soundcast: ', err);
              Promise.reject(err);
            }),
        ];

        //add soundcast to admins
        let adminArr = Object.keys(userInfo.publisher.administrators);

        let _promises_2 = adminArr.map(adminId => {
          return firebase
            .database()
            .ref(`users/${adminId}/soundcasts_managed/${that.soundcastId}`)
            .set(true)
            .then(
              res => {
                // console.log('success add soundcast to admin.soundcasts_managed: ', res);
                return res;
              },
              err => {
                console.log('ERROR add soundcast to admin.soundcasts_managed: ', err);
                Promise.reject(err);
              }
            );
        });

        let _promises = _promises_1.concat(_promises_2);
        Promise.all(_promises).then(
          res => {
            console.log('completed adding soundcast');
            alert('New soundcast created.');
            history.goBack();
          },
          err => {
            console.log('failed to complete adding soundcast');
          }
        );
      } else {
        // alert('Soundcast saving failed. Please try again later.');
      }
    });
    this.firebaseListener && this.firebaseListener();
  }

  componentWillUnmount() {
    this.firebaseListener = null;
  }

  handleCheck() {
    const { landingPage } = this.state;
    this.setState({
      landingPage: !landingPage,
    });
  }

  setFeatures(i, event) {
    const features = [...this.state.features];
    features[i] = event.target.value;
    this.setState({
      features,
    });
  }

  deleteFeature(i, event) {
    const features = [...this.state.features];
    if (features.length >= 2) {
      features.splice(i, 1);
    } else {
      features[0] = '';
    }
    this.setState({
      features,
    });
  }

  addFeature() {
    const features = [...this.state.features];
    features.push('');
    this.setState({
      features,
    });
  }

  handleChargeOption() {
    const { forSale } = this.state;
    const { userInfo } = this.props;

    if (!forSale) {
      if (!userInfo.publisher.stripe_user_id) {
        this.submit.bind(this, false);
        this.setState({
          paypalModalOpen: true,
        });
      } else {
        this.setState({
          forSale: !forSale,
          prices: [{ paymentPlan: '', billingCycle: 'one time', price: '0' }],
        });
      }
    } else {
      this.setState({
        forSale: !forSale,
        prices: [{ price: 'free' }],
      });
    }
  }

  handlePaypalModalClose() {
    if (this.state.paypalModalOpen) {
      this.setState({
        paypalModalOpen: false,
      });
    }
  }

  handlePaypalInput() {
    const { paypalEmail, forSale } = this.state;
    const { userInfo } = this.props;
    firebase
      .database()
      .ref(`publishers/${userInfo.publisherID}/paypalEmail`)
      .set(paypalEmail);
    this.setState({
      paypalModalOpen: false,
      forSale: !forSale,
      prices: [{ paymentPlan: '', billingCycle: 'monthly', price: '' }],
    });
  }

  onEditorStateChange(editorState, confirmationEmail) {
    this.setState({
      long_description: editorState,
    });
  }

  onConfirmationStateChange(editorState) {
    this.setState({
      confirmationEmail: editorState,
    });
  }

  showIntroOutro() {
    const { showIntroOutro, proUser, showPricingModal } = this.state;
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

  renderAdditionalInputs() {
    const featureNum = this.state.features.length;
    const {
      hostImageURL,
      long_description,
      hostImgUploaded,
      landingPage,
      forSale,
      prices,
      confirmationEmail,
      proUser,
      showIntroOutro,
    } = this.state;
    const { userInfo } = this.props;
    const that = this;
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
        {/*What Listeners Will Get*/}
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
                {(i == featureNum - 1 && (
                  <span style={styles.addFeature} onClick={this.addFeature}>
                    Add
                  </span>
                )) ||
                  null}
              </div>
            );
          })}
        </div>

        {/*Long Description*/}
        <span style={{ ...styles.titleText, marginBottom: 5 }}>Long Description</span>
        <div>
          <Editor
            editorState={long_description}
            editorStyle={styles.editorStyle}
            wrapperStyle={styles.wrapperStyle}
            onEditorStateChange={this.onEditorStateChange.bind(this)}
          />
        </div>

        {/*Host/Instructor Name*/}
        <div>
          <span style={styles.titleText}>Host/Instructor Name</span>
          <div style={{ ...styles.inputTitleWrapper, width: '35%' }}>
            <input
              type="text"
              style={styles.inputTitle}
              placeholder={''}
              onChange={e => {
                this.setState({ hostName: e.target.value });
              }}
              value={this.state.hostName}
            />
          </div>
        </div>

        {/*Host/Instructor Bio*/}
        <div>
          <div>
            <span style={styles.titleText}>Host/Instructor Bio</span>
          </div>
          <textarea
            style={styles.inputDescription}
            placeholder={'Who will be teaching?'}
            onChange={e => {
              this.setState({ hostBio: e.target.value });
            }}
            value={this.state.hostBio}
          />
        </div>

        {/*Host/Instructor Profile Picture*/}
        <div style={{ marginTop: 10 }} className="row">
          <div style={{ marginBottom: 10 }} className="col-md-12">
            <span style={styles.titleText}>Host/Instructor Profile Picture</span>
          </div>

          <div
            style={{
              ...styles.hostImage,
              backgroundImage: `url(${hostImageURL})`,
            }}
            className="col-md-3"
          />
          <div style={styles.loaderWrapper} className="col-md-9">
            <div style={{ ...styles.inputFileWrapper, marginTop: 0 }}>
              <input
                type="file"
                name="upload"
                id="upload_hidden_cover_2"
                accept="image/*"
                onChange={this.setFileName.bind(this, true)}
                style={styles.inputFileHidden}
                ref={input => (this.hostImgInputRef = input)}
              />
              {(hostImgUploaded && (
                <div>
                  <span>{this.hostImgInputRef.files[0].name}</span>
                  <span
                    style={styles.cancelImg}
                    onClick={() => {
                      that.setState({
                        hostImgUploaded: false,
                        hostImageURL: '',
                      });
                      that.hostImgInputRef = null;
                      document.getElementById('upload_hidden_cover_2').value = null;
                    }}
                  >
                    Cancel
                  </span>
                </div>
              )) || (
                <div>
                  <button
                    onClick={() => {
                      document.getElementById('upload_hidden_cover_2').click();
                    }}
                    style={{
                      ...styles.uploadButton,
                      backgroundColor: Colors.mainOrange,
                    }}
                  >
                    Upload
                  </button>
                  <span style={styles.fileTypesLabel}>jpg or png files accepted</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/*Upload outro/intro*/}
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
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'red',
                    marginLeft: 5,
                  }}
                >
                  PLUS
                </span>
              )) || <span />}
            </div>
            <div
              style={{
                ...styles.fileTypesLabel,
                marginBottom: 10,
                marginLeft: 10,
              }}
            >
              Automatically add intro/outro to episodes. mp3 or m4a files accepted
            </div>
          </div>
          <div
            className="col-md-6"
            style={{ display: showIntroOutro ? '' : 'none', paddingLeft: 45 }}
          >
            <span
              style={{
                ...styles.titleText,
                display: 'inline-block',
                marginRight: 12,
              }}
            >
              Intro
            </span>
            <S3FileUploader
              s3NewFileName={`${this.soundcastId}_intro`}
              onUploadedCallback={ext => {
                that.setState({
                  introUrl: `https://mysoundwise.com/tracks/${that.soundcastId}_intro.${ext}`,
                });
              }}
            />
          </div>
          <div className="col-md-6" style={{ display: showIntroOutro ? '' : 'none' }}>
            <span
              style={{
                ...styles.titleText,
                display: 'inline-block',
                marginRight: 12,
              }}
            >
              Outro
            </span>
            <S3FileUploader
              s3NewFileName={`${this.soundcastId}_outro`}
              onUploadedCallback={ext => {
                that.setState({
                  outroUrl: `https://mysoundwise.com/tracks/${that.soundcastId}_outro.${ext}`,
                });
              }}
            />
          </div>
        </div>

        {/*Pricing*/}
        {landingPage && (
          <div>
            <span style={styles.titleText}>Pricing</span>
            <div
              style={{
                marginTop: 15,
                marginBottom: 15,
                display: 'flex',
                alignItems: 'center',
              }}
            >
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
                        <div
                          style={{
                            width: '45%',
                            display: 'inline-block',
                            marginRight: 10,
                          }}
                        >
                          <span>Payment Plan Name</span>
                          <input
                            type="text"
                            style={styles.inputTitle}
                            name="paymentPlan"
                            placeholder="e.g. 3 day access, monthly subscription, etc"
                            onChange={this.handlePriceInputs.bind(this, i)}
                            value={prices[i].paymentPlan}
                          />
                        </div>
                        <div
                          style={{
                            width: '25%',
                            display: 'inline-block',
                            marginRight: 10,
                          }}
                        >
                          <span>Billing</span>
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
                          <span>Price</span>
                          <div>
                            <span style={{ fontSize: 18 }}>{`$ `}</span>
                            <input
                              type="text"
                              style={{ ...styles.inputTitle, width: '85%' }}
                              name="price"
                              placeholder={''}
                              onChange={this.handlePriceInputs.bind(this, i)}
                              value={prices[i].price}
                            />
                          </div>
                        </div>
                        <span
                          style={{
                            marginLeft: 5,
                            cursor: 'pointer',
                            fontSize: 20,
                          }}
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
                              // not pro or plus
                              if (!isProOrPlus) {
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
                              <span
                                style={{
                                  color: Colors.link,
                                  fontWeight: 700,
                                  fontSize: 12,
                                }}
                              >
                                {' '}
                                PRO
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
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
  }

  handlePriceInputs(i, e) {
    let prices = [...this.state.prices];
    if (e.target.name === 'billingCycle' && prices[i].coupons) {
      prices[i].coupons.forEach(i => (i.couponType = 'discount'));
    }
    prices[i][e.target.name] = e.target.value;
    this.setState({
      prices,
    });
  }

  addPriceOption() {
    let prices = [...this.state.prices];
    const price = {
      paymentPlan: '',
      billingCycle: 'one time',
      price: '0',
    };
    prices.push(price);
    this.setState({
      prices,
    });
  }

  deletePriceOption(i) {
    let prices = [...this.state.prices];
    if (prices.length > 1) {
      prices.splice(i, 1);
    } else {
      prices[0] = {
        paymentPlan: '',
        billingCycle: 'monthly',
        price: '',
      };
    }
    this.setState({
      prices,
    });
  }

  handleModalOpen() {
    this.setState({
      modalOpen: true,
    });
  }

  handleModalClose() {
    this.setState({
      modalOpen: false,
    });
    if (this.state.hostImg) {
      this.setState({
        hostImgUploaded: false,
      });
      document.getElementById('upload_hidden_cover_2').value = null;
    } else {
      this.setState({
        fileUploaded: false,
      });
      document.getElementById('upload_hidden_cover').value = null;
    }
  }

  uploadViaModal(fileBlob) {
    this.setState({
      fileCropped: true,
      modalOpen: false,
    });

    if (this.state.hostImg) {
      this.setState({
        hostImgUploaded: true,
      });
    } else {
      this.setState({
        fileUploaded: true,
      });
    }

    this._uploadToAws(fileBlob, this.state.hostImg);
  }

  render() {
    const {
      imageURL,
      fileUploaded,
      modalOpen,
      hostImg,
      showPricingModal,
      selectedCategory,
      categories,
    } = this.state;
    const { history } = this.props;
    const that = this;

    return (
      <MuiThemeProvider>
        <div className="padding-30px-tb">
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
                  onClick={() => that.props.history.push({ pathname: '/pricing' })}
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
            file={this.currentImageRef}
          />
          <div className="padding-bottom-20px">
            <span className="title-medium ">Add A Soundcast</span>
          </div>
          <div className="col-lg-10 col-md-11 col-sm-12 col-xs-12">
            <div
              className=""
              style={{
                marginTop: 15,
                marginBottom: 25,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Toggle
                id="landing-status"
                aria-labelledby="landing-label"
                checked={this.state.landingPage}
                onChange={this.handleCheck.bind(this)}
              />
              <span
                id="landing-label"
                style={{ fontSize: 20, fontWeight: 800, marginLeft: '0.5em' }}
              >
                This is a public soundcast
              </span>
            </div>
            {/*Title*/}
            <span style={styles.titleText}>Title</span>
            <span style={{ ...styles.titleText, color: 'red' }}>*</span>
            <span style={{ fontSize: 17 }}>
              <i> (60 characters max)</i>
            </span>
            <ValidatedInput
              type="text"
              styles={styles.inputTitle}
              wrapperStyles={styles.inputTitleWrapper}
              placeholder={'Soundcast title'}
              onChange={e => {
                this.setState({ title: e.target.value });
              }}
              value={this.state.title}
              validators={[minLengthValidator.bind(null, 1), maxLengthValidator.bind(null, 60)]}
            />

            {/*Short Description*/}
            <span style={styles.titleText}>Short Description</span>
            <span style={{ ...styles.titleText, color: 'red' }}>*</span>
            <span style={{ fontSize: 17 }}>
              <i> (300 characters max)</i>
            </span>

            <div style={styles.inputTitleWrapper}>
              <textarea
                type="text"
                style={styles.inputDescription}
                placeholder={'A short description of this soundcast'}
                onChange={e => {
                  this.setState({ short_description: e.target.value });
                }}
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
                <div style={styles.dropdownTitle} id="addSoundcastChooseCategoryBtnTest">
                  <span>{(selectedCategory && selectedCategory.name) || 'Choose category'}</span>
                  <span style={{ position: 'absolute', right: 10, top: 40 }} className="caret" />
                </div>
              </div>
              <ul style={{ padding: 0 }} className="categoriesMenuTest dropdown-menu">
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

            {/*Soundcast cover art*/}
            <div style={{ marginBottom: 30, marginTop: 30 }} className="row">
              <div className="col-md-3">
                <div style={styles.image}>
                  <img src={imageURL} />
                </div>
              </div>
              <div className="col-md-9">
                <div style={styles.loaderWrapper}>
                  <div style={{ ...styles.titleText, marginLeft: 10 }}>Soundcast cover art</div>
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
                    )) || (
                      <div>
                        <button
                          onClick={() => {
                            document.getElementById('upload_hidden_cover').click();
                          }}
                          style={{
                            ...styles.uploadButton,
                            backgroundColor: Colors.link,
                          }}
                        >
                          Upload
                        </button>
                        <div style={styles.fileTypesLabel}>
                          <span>
                            (jpg or png files accepted; square image, recommended at least 800px by
                            800px)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {this.renderAdditionalInputs()}

            {/*Confirmation email*/}
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

            {/*Bubmission buttons*/}
            <div className="row">
              <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <OrangeSubmitButton
                  id="saveDraftSoundcastBtnTest"
                  label="Save Draft"
                  styles={{
                    backgroundColor: Colors.link,
                    borderColor: Colors.link,
                  }}
                  onClick={this.submit.bind(this, false)}
                />
              </div>
              <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <OrangeSubmitButton label="Publish" onClick={this.submit.bind(this, true)} />
              </div>
              <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <TransparentShortSubmitButton label="Cancel" onClick={() => history.goBack()} />
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
              onClick={() =>
                that.props.history.push({
                  pathname: '/pricing',
                })
              }
            />
          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

AddSoundcast.propTypes = {
  userInfo: PropTypes.object,
  history: PropTypes.object,
};

const styles = {
  titleText: { ...commonStyles.titleText, fontSize: 20 },
  inputTitle: { ...commonStyles.inputTitle, marginTop: 5 },
  inputTitleWrapper: { ...commonStyles.inputTitleWrapper },
  inputFileHidden: { ...commonStyles.inputFileHidden },
  hostImage: { ...commonStyles.hostImage, marginLeft: 10 },
  image: { ...commonStyles.image },
  loaderWrapper: { ...commonStyles.loaderWrapper },
  cancelImg: { ...commonStyles.cancelImg },
  dropdownTitle: { ...commonStyles.dropdownTitle },
  categoryButton: { ...commonStyles.categoryButton },
  inputDescription: {
    height: 100,
    fontSize: 18,
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 20,
    resize: 'vertical',
    overflow: 'auto',
  },
  editorStyle: {
    padding: '5px',
    fontSize: 16,
    borderRadius: 4,
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
    // overflow: 'hidden',
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
    fontStyle: 'italic',
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
  dialogTitle: {
    marginTop: 47,
    marginBottom: 49,
    textAlign: 'center',
    fontSize: 22,
  },
};
