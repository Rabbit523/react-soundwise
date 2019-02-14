import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import firebase from 'firebase';
import Datetime from 'react-datetime';
import { Editor } from 'react-draft-wysiwyg';
import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  convertFromHTML,
  createFromBlockArray,
  ContentState,
} from 'draft-js';
import Toggle from 'material-ui/Toggle';

import ImageCropModal from './image_crop_modal';
import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import { inviteListeners } from '../../../helpers/invite_listeners';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';
import Coupons from './coupons';
const { podcastCategories, getRandomColor } = require('../../../../server/scripts/utils.js')();

const subscriptionConfirmEmailHtml = `<div style="font-size:18px;"><p>Hi [subscriber first name],</p>
<p></p>
<p>Thanks for signing up to [title]. If you don't have the Soundwise mobile app installed on your phone, please access your program by downloading the app first--</p>
<p><strong>
<span>iPhone user: Download the app </span>
<a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8"><span style="border-bottom: 2px solid currentColor;">here</span></a>.
</strong></p>
<p><strong>
<span>Android user: Download the app <span>
<a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android"><span style="border-bottom: 2px solid currentColor;" >here</span></a>.
</strong></p><p></p>
<p>...and then sign in to the app with the same credential you used to sign up to this soundcast.</p><p></p><p>If you've already installed the app, your new soundcast should be loaded automatically.</p>
</div>`;
const subscriptionConfirmationEmail = convertFromHTML(subscriptionConfirmEmailHtml);
const confirmationEmail = ContentState.createFromBlockArray(
  subscriptionConfirmationEmail.contentBlocks,
  subscriptionConfirmationEmail.entityMap
);

export default class CreateBundle extends Component {
  constructor(props) {
    super(props);

    this.state = {
      soundcasts: [{}],
      selectedSoundcasts: [],
      selectedSoundcastsArr: [],
      title: '',
      short_description: '',
      long_description: EditorState.createEmpty(),
      imageURL: '',
      fileUploaded: false,
      landingPage: true,
      features: [''],
      forSale: false,
      prices: [],
      modalOpen: false,
      confirmationEmail: EditorState.createWithContent(confirmationEmail),
      submitted: false,
      categories: Object.keys(podcastCategories).map(i => {
        return { name: podcastCategories[i].name };
      }), // main 16 categories ('Arts', 'Comedy', ...)
      selectedCategory: null,
    };

    this.soundcastId = `${moment().format('x')}s`;
    this.fileInputRef = null;
    this.currentImageRef = null;
    this.firebaseListener = null;
    this.fetchSoundcasts = this.fetchSoundcasts.bind(this);
    this.selectSoundcasts = this.selectSoundcasts.bind(this);
    this.addFeature = this.addFeature.bind(this);
  }

  componentDidMount() {
    if (this.props.history.location.state) {
      const { id, bundle } = this.props.history.location.state;
      if (bundle) {
        this.soundcastId = id;
        let editorState, confirmEmailEditorState;
        const {
          title,
          imageURL,
          short_description,
          long_description,
          landingPage,
          features,
          forSale,
          prices,
          soundcastsIncluded,
          confirmationEmail,
          category,
        } = bundle;
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
          short_description,
          landingPage,
          imageURL: imageURL ? imageURL : null,
          long_description: editorState,
          confirmationEmail: confirmEmailEditorState,
          features,
          forSale,
          prices,
          selectedSoundcastsArr: soundcastsIncluded,
          selectedCategory: { name: category },
        });
      }
    }
    if (this.props.userInfo) {
      const { userInfo } = this.props;
      this.setState({
        userInfo,
      });
      if (userInfo.publisherID) {
        this.fetchSoundcasts(userInfo.publisherID);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userInfo) {
      const { userInfo } = nextProps;
      this.setState({
        userInfo,
      });
      if (userInfo.publisherID && !this.props.userInfo.publisherID) {
        this.fetchSoundcasts(userInfo.publisherID);
      }
    }
  }

  async fetchSoundcasts(publisherID) {
    const soundcasts = [];
    const soundcastsObj = await firebase
      .database()
      .ref(`publishers/${publisherID}/soundcasts`)
      .once('value');
    const soundcastsArr = Object.keys(soundcastsObj.val());
    for (var i = 0; i < soundcastsArr.length; i++) {
      const soundcast = await firebase
        .database()
        .ref(`soundcasts/${soundcastsArr[i]}`)
        .once('value');
      if (soundcast.val() && soundcast.val().published && !soundcast.val().bundle) {
        // only add the soundcasts that are not bundles
        soundcasts.push({ title: soundcast.val().title, id: soundcastsArr[i] });
      }
    }
    const selectedSoundcasts = [];
    if (this.state.selectedSoundcastsArr && this.state.selectedSoundcastsArr.length) {
      soundcasts.forEach(soundcast => {
        if (this.state.selectedSoundcastsArr.indexOf(soundcast.id) > -1) {
          selectedSoundcasts.push(soundcast);
        }
      });
    }
    this.setState({
      soundcasts,
      selectedSoundcasts: selectedSoundcasts.length > 0 ? selectedSoundcasts : soundcasts,
    });
  }

  selectSoundcasts(selectedSoundcasts) {
    this.setState({ selectedSoundcasts });
  }

  _uploadToAws(file, hostImg) {
    const _self = this;
    let data = new FormData();
    const splittedFileName = file.type.split('/');
    const ext = splittedFileName[splittedFileName.length - 1];
    let fileName = '';
    if (hostImg) {
      fileName = `host-image-${moment().format('x')}.${ext}`;
    } else {
      fileName = `${moment().format('x')}.${ext}`;
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

        if (hostImg) {
          _self.setState({ hostImageURL: url });
        } else {
          _self.setState({ imageURL: url });
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
      subscribers,
      short_description,
      long_description,
      landingPage,
      features,
      selectedSoundcasts,
      forSale,
      prices,
      confirmationEmail,
      selectedCategory,
    } = this.state;
    const imageURL =
      this.state.imageURL ||
      `https://dummyimage.com/300.png/${getRandomColor()}/ffffff&text=${encodeURIComponent(title)}`;
    if (title.length == 0) {
      return alert('Please enter a bundle title before saving.');
    }
    if (short_description == 0) {
      return alert('Please enter a short description for the bundle before saving.');
    }
    if (selectedSoundcasts.length < 2) {
      return alert('Please select at least two soundcasts to form the bundle.');
    }
    if (!selectedCategory) {
      return alert('Please choose a category before saving.');
    }
    if (prices.length === 0) {
      //if pricing isn't specified, then this is a free soundcast
      prices = [{ price: 'free' }];
    }
    const soundcastsArr = selectedSoundcasts.map(soundcast => soundcast.id);
    const { userInfo, history } = this.props;
    // const host = [{hostName, hostBio, hostImageURL}];
    const that = this;
    this.setState({ submitted: true });
    this.firebaseListener = firebase.auth().onAuthStateChanged(async user => {
      if (user && that.firebaseListener) {
        const creatorID = user.uid;
        const last_update = Number(moment().format('X'));
        const editedSoundcast = {
          title,
          bundle: true,
          creatorID,
          soundcastsIncluded: soundcastsArr,
          imageURL,
          short_description,
          long_description: JSON.stringify(convertToRaw(long_description.getCurrentContent())),
          confirmationEmail: JSON.stringify(convertToRaw(confirmationEmail.getCurrentContent())),
          date_created: moment().format('X'),
          publisherID: userInfo.publisherID,
          landingPage,
          features,
          forSale,
          prices,
          last_update,
          published: publish,
          category: selectedCategory.name,
        };

        const bundleSnapshot = await firebase
          .database()
          .ref(`soundcasts/${that.soundcastId}`)
          .once('value');
        const bundleOld = bundleSnapshot.val();
        const newSoundcast = Object.assign({}, bundleOld || {}, editedSoundcast);

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
          Axios.post('/api/soundcast', {
            soundcastId: that.soundcastId,
            publisherId: userInfo.publisherID,
            updateDate: last_update,
            title,
            imageURL,
            forSale,
            category: selectedCategory.name,
            landingPage,
            published: publish,
          })
            .then(async res => {
              if (userInfo.publisher && userInfo.publisher.stripe_user_id) {
                const snapshot = await firebase
                  .database()
                  .ref(`soundcasts/${that.soundcastId}`)
                  .once('value');
                const couponsToRemove = [];
                (snapshot.val().prices || []).forEach(price => {
                  (price.coupons || []).forEach(coupon => couponsToRemove.push(coupon.code));
                });
                Axios.post('/api/createUpdatePlans', {
                  soundcastID: that.soundcastId,
                  publisherID: userInfo.publisherID,
                  stripe_account: userInfo.publisher.stripe_user_id,
                  title,
                  prices: landingPage && forSale ? prices : [],
                  couponsToRemove, // old coupons removal
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

        // let _promises = _promises_1.concat(_promises_2, _promises_3);
        let _promises = _promises_1.concat(_promises_2);
        Promise.all(_promises).then(
          res => {
            console.log('completed adding soundcast');
            if (that.props.match.params.tab == 'edit_bundle') {
              alert('Bundle information saved.');
            } else {
              alert('New bundle created.');
            }
            history.goBack();
          },
          err => {
            that.setState({
              submitted: false,
            });
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
        this.setState({
          paypalModalOpen: true,
        });
      } else {
        this.setState({
          forSale: !forSale,
          prices: [
            {
              paymentPlan: 'soundcast purchase',
              billingCycle: 'one time',
              price: '0',
            },
          ],
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
    } = this.state;
    const { userInfo } = this.props;
    const isProOrPlus = ['pro', 'plus'].includes(userInfo.publisher && userInfo.publisher.plan);
    const that = this;
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
          <i>{` (list the main benefits and features of this bundle)`}</i>
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

        {/*Pricing*/}
        {landingPage && (
          <div>
            <span style={styles.titleText}>Pricing</span>
            <div style={{ marginTop: 15, marginBottom: 15 }}>
              <Toggle
                label="Charge for this bundle?"
                toggled={this.state.forSale}
                onClick={this.handleChargeOption.bind(this)}
                thumbSwitchedStyle={styles.thumbSwitched}
                trackSwitchedStyle={styles.trackSwitched}
                style={{ fontSize: 20, width: '50%' }}
              />
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
                    before setting up pricing.
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
                          soundcastId={that.soundcastId}
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
                <div onClick={this.addPriceOption.bind(this)} style={styles.addFeature}>
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
      paymentPlan: 'soundcast purchase',
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
        paymentPlan: 'soundcast purchase',
        billingCycle: 'monthly',
        price: '0',
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

  uploadViaModal(fileBlob, hostImg) {
    this.setState({
      fileCropped: true,
      modalOpen: false,
    });
    if (hostImg) {
      this.setState({
        hostImgUploaded: true,
      });
    } else {
      this.setState({
        fileUploaded: true,
      });
    }
    this._uploadToAws(fileBlob, hostImg);
  }

  render() {
    const {
      imageURL,
      title,
      subscribers,
      fileUploaded,
      landingPage,
      modalOpen,
      hostImg,
      soundcasts,
      selectedSoundcasts,
      submitted,
      categories,
      selectedCategory,
    } = this.state;
    const { userInfo, history } = this.props;
    const that = this;

    return (
      <MuiThemeProvider>
        <div className="padding-30px-tb">
          <ImageCropModal
            open={modalOpen}
            handleClose={this.handleModalClose.bind(this)}
            upload={this.uploadViaModal.bind(this)}
            hostImg={hostImg}
            file={this.currentImageRef}
          />
          <div className="padding-bottom-20px">
            <span className="title-medium ">Create A Multi-Soundcast Bundle</span>
          </div>
          <div className="col-lg-10 col-md-11 col-sm-12 col-xs-12">
            {/*The landing page*/}
            <div style={{ marginTop: 15, marginBottom: 15 }}>
              <Toggle
                label="Add a public landing page for this bundle"
                toggled={this.state.landingPage}
                onClick={this.handleCheck.bind(this)}
                thumbSwitchedStyle={styles.thumbSwitched}
                trackSwitchedStyle={styles.trackSwitched}
                style={{ fontSize: 20, width: '60%' }}
              />
            </div>
            {landingPage && (
              <div style={{ marginBottom: 20, fontSize: 20 }}>
                <span>The landing page will be published at </span>
                <span>
                  <a
                    target="_blank"
                    style={{ color: Colors.mainOrange }}
                    href={`https://mysoundwise.com/soundcasts/${this.soundcastId}`}
                  >
                    {`https://mysoundwise.com/soundcasts/${this.soundcastId}`}
                  </a>
                </span>
              </div>
            )}

            {/*Title*/}
            <span style={styles.titleText}>Bundle Title</span>
            <span style={{ ...styles.titleText, color: 'red' }}>*</span>
            <span style={{ fontSize: 17 }}>
              <i> (60 characters max)</i>
            </span>
            <ValidatedInput
              type="text"
              styles={styles.inputTitle}
              wrapperStyles={styles.inputTitleWrapper}
              placeholder={'e.g. The Insight Meditation Masterclass'}
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
            <div style={{ ...styles.inputTitleWrapper, marginBottom: 0 }}>
              <textarea
                type="text"
                style={styles.inputDescription}
                placeholder={'A short description of this bundle'}
                onChange={e => {
                  this.setState({ short_description: e.target.value });
                }}
                value={this.state.short_description}
              />
            </div>

            {/*Soundcasts in bundle*/}
            <div style={{ paddingBottom: 24 }}>
              <span style={styles.titleText}>Soundcasts included in the bundle</span>
              <span style={{ ...styles.titleText, color: 'red' }}>*</span>
              <div style={{ marginTop: 10, marginBottom: 10, paddingLeft: 10 }}>
                <label
                  style={{
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <input
                    onChange={() => {
                      if (selectedSoundcasts.length == soundcasts.length) {
                        that.setState({ selectedSoundcasts: [] });
                      } else {
                        that.setState({ selectedSoundcasts: soundcasts });
                      }
                    }}
                    type="checkbox"
                    value={soundcasts}
                    checked={selectedSoundcasts.length == soundcasts.length}
                    style={{ width: 50, height: 30 }}
                  />
                  Select all
                </label>
              </div>
              <div
                style={{
                  maxHeight: 250,
                  overflowY: 'auto',
                  padding: 10,
                  border: '0.5px solid #9b9b9b',
                }}
              >
                <CheckboxGroup
                  checkboxDepth={3}
                  name="soundcasts"
                  value={selectedSoundcasts}
                  onChange={this.selectSoundcasts}
                >
                  {soundcasts.map((soundcast, i) => {
                    return (
                      <div key={i}>
                        <label
                          style={{
                            fontSize: 17,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Checkbox style={{ width: 50, height: 30 }} value={soundcast} />
                          {soundcast.title}
                        </label>
                      </div>
                    );
                  })}
                </CheckboxGroup>
              </div>
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

            {/*Soundcast cover art*/}
            <div style={{ marginBottom: 30, marginTop: 30 }} className="row">
              <div className="col-md-3">
                <div style={styles.image}>
                  <img src={imageURL} />
                </div>
              </div>
              <div className="col-md-9">
                <div style={styles.loaderWrapper}>
                  <div style={{ ...styles.titleText, marginLeft: 10 }}>Bundle cover art</div>
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
                <span style={styles.titleText}>Sales Confirmation Email</span>
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
                  label="Save Draft"
                  styles={{
                    backgroundColor: Colors.link,
                    borderColor: Colors.link,
                  }}
                  onClick={!submitted ? this.submit.bind(this, false) : () => {}}
                />
              </div>
              <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <OrangeSubmitButton
                  label="Publish"
                  onClick={!submitted ? this.submit.bind(this, true) : () => {}}
                />
              </div>
              <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <TransparentShortSubmitButton label="Cancel" onClick={() => history.goBack()} />
              </div>
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

CreateBundle.propTypes = {
  userInfo: PropTypes.object,
  history: PropTypes.object,
};

const styles = {
  titleText: { ...commonStyles.titleText, fontSize: 20 },
  inputTitleWrapper: { ...commonStyles.inputTitleWrapper },
  inputTitle: { ...commonStyles.inputTitle },
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
  },
  thumbSwitched: {
    backgroundColor: Colors.link,
  },
  trackSwitched: {
    backgroundColor: Colors.link,
  },
};
