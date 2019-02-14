import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';
import moment from 'moment';
import Axios from 'axios';
import Dots from 'react-activity/lib/Dots';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import ImageCropModal from './dashboard/components/image_crop_modal';
import Footer from '../components/footer';
import { SoundwiseHeader } from '../components/soundwise_header';
import Colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';
import { OrangeSubmitButton } from '../components/buttons/buttons';

class _UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      pic_url: false,
      profileImgUploaded: false,
      profileSaved: false,
      providerId: '',
      passwordPopUpOpen: false,
      password: '',
      newPassword: '',
      newPassword2: '',
      exp_month: '',
      exp_year: '',
      last4: '',
      brand: '',
      cvc: '',
      newCard: '',
      exp_year_new: new Date().getFullYear(),
      exp_month_new: 0,
      creditCardError: '',
    };
    this.profileImgInputRef = null;
    this.currentImageRef = null;
    this.submit = this.submit.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.changeCreditCard = this.changeCreditCard.bind(this);
    // this.stripeTokenHandler = this.stripeTokenHandler.bind(this);
  }

  componentDidMount() {
    const that = this;
    if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV == 'staging') {
      console.log('Stripe: setting test key');
      Stripe.setPublishableKey('pk_test_BwjUV9yHQNcgRzx59dSA3Mjt');
    } else {
      Stripe.setPublishableKey('pk_live_rR36Qeypo5CrbG1FKgE1XdlL');
    }

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        if (that.props.userInfo.firstName) {
          that.setState({
            firstName: that.props.userInfo.firstName,
            lastName: that.props.userInfo.lastName,
            pic_url: that.props.userInfo.pic_url,
            email: that.props.userInfo.email[0],
            stripe_id: that.props.userInfo.stripe_id,
          });
          if (that.props.userInfo.stripe_id) {
            that.retrieveCustomer(that.props.userInfo.stripe_id);
          }
        }
        that.setState({ providerId: user.providerId });
      } else {
        that.props.history.push('/signin');
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userInfo && nextProps.userInfo.firstName) {
      this.setState({
        firstName: nextProps.userInfo.firstName,
        lastName: nextProps.userInfo.lastName,
        pic_url: nextProps.userInfo.pic_url,
        email: nextProps.userInfo.email[0],
        stripe_id: nextProps.userInfo.stripe_id,
      });
      if (!this.state.stripe_id && nextProps.userInfo.stripe_id) {
        this.retrieveCustomer(nextProps.userInfo.stripe_id);
      }
    }
  }

  retrieveCustomer(stripe_id) {
    if (stripe_id) {
      Axios.get('/api/retrieveCustomer', { params: { stripe_id } }).then(response => {
        const customer = response.data.customer;
        this.setState({
          exp_month: customer.sources.data[0].exp_month,
          exp_year: customer.sources.data[0].exp_year,
          last4: customer.sources.data[0].last4,
          brand: customer.sources.data[0].brand,
        });
      });
    }
  }

  _uploadToAws(file) {
    const _self = this;
    const { firstName, lastName } = this.state;
    let data = new FormData();
    const splittedFileName = file.type.split('/');
    const ext = splittedFileName[splittedFileName.length - 1];
    let fileName =
      encodeURIComponent(`${firstName}-${lastName}`) + `-${moment().format('X')}.${ext}`;

    data.append('file', file, fileName);
    // axios.post('http://localhost:3000/upload/images', data) // - alternative address (need to uncomment on backend)
    Axios.post('/api/upload', data)
      .then(function(res) {
        // POST succeeded...
        // console.log('success upload to aws s3: ', res);
        //replace 'http' with 'https'
        let url = res.data[0].url;
        if (url.slice(0, 5) !== 'https') {
          url = url.replace(/http/i, 'https');
        }
        _self.setState({ pic_url: url });
      })
      .catch(function(err) {
        // POST failed...
        console.log('ERROR upload to aws s3: ', err);
      });
  }

  setFileName(e) {
    // console.log('this.fileInputRef.files: ', this.fileInputRef.files);
    if (this.profileImgInputRef.files[0]) {
      // this._uploadToAws(this.profileImgInputRef.files[0]);
      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (allowedFileTypes.indexOf(this.profileImgInputRef.files[0].type) < 0) {
        alert('Only .png or .jpeg files are accepted. Please upload a new file.');
        return this.setState({ profileImgUploaded: false });
      }
      this.setState({ profileImgUploaded: true });
      this.currentImageRef = this.profileImgInputRef.files[0];
      this.handleModalOpen();
    }
  }

  changePassword() {
    const that = this;
    this.setState({ passwordError: '' });
    const { email, password, newPassword, newPassword2 } = this.state;
    if (newPassword != newPassword2) {
      return this.setState({
        passwordError: 'Please make sure you enter the same new password twice.',
        newPassword: '',
        newPassword2: '',
      });
    } else if (!newPassword.length) {
      return this.setState({
        passwordError: 'New password cannot be empty.',
        newPassword: '',
        newPassword2: '',
      });
    } else {
      this.setState({ passwordPopUpOpen: false });
    }
    const credential = firebase.auth.EmailAuthProvider.credential(email, password);
    const user = firebase.auth().currentUser;
    if (user) {
      const emptyPasswordState = { password: '', newPassword: '', newPassword2: '' };
      user
        .reauthenticateWithCredential(credential)
        .then(() => {
          user
            .updatePassword(newPassword)
            .then(function() {
              const newCredential = firebase.auth.EmailAuthProvider.credential(email, newPassword);
              user.reauthenticateWithCredential(newCredential).then(() => {
                alert('Password changed.');
                that.setState(emptyPasswordState);
              });
            })
            .catch(error => {
              alert(`Failed to change password (updatePassword): ${err}`);
              that.setState(emptyPasswordState);
            });
        })
        .catch(err => {
          alert(`Failed to change password (reauthenticateWithCredential): ${err}`);
          that.setState(emptyPasswordState);
        });
    }
  }

  passwordPopUp() {
    const { password, newPassword, newPassword2, passwordError } = this.state;
    const that = this;

    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={() =>
          that.setState({
            passwordPopUpOpen: false,
            passwordError: '',
          })
        }
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.changePassword}
      />,
    ];

    return (
      <div>
        <MuiThemeProvider>
          <Dialog
            title="Change password"
            actions={actions}
            modal={false}
            open={this.state.passwordPopUpOpen}
            onRequestClose={() =>
              that.setState({
                passwordPopUpOpen: false,
                passwordError: '',
              })
            }
          >
            <div>
              <span style={styles.titleText}>Current password</span>
              <div style={{ ...styles.inputTitleWrapper }}>
                <input
                  type="password"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ password: e.target.value });
                  }}
                  value={password}
                />
              </div>
            </div>
            <div>
              <span style={styles.titleText}>New password</span>
              <div style={{ ...styles.inputTitleWrapper }}>
                <input
                  type="password"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ newPassword: e.target.value });
                  }}
                  value={newPassword}
                />
              </div>
            </div>
            <div>
              <span style={styles.titleText}>Re-enter new password</span>
              <div style={{ ...styles.inputTitleWrapper }}>
                <input
                  type="password"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ newPassword2: e.target.value });
                  }}
                  value={newPassword2}
                />
              </div>
              <div>
                <span style={{ ...styles.inputTitle, color: 'red' }}>{passwordError}</span>
              </div>
            </div>
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }

  creditCardPopUp() {
    const that = this;
    const monthOptions = [];
    const yearOptions = [];
    for (let i = 0; i < 12; i++) {
      monthOptions.push(
        <option value={i} key={i}>
          {moment()
            .month(i)
            .format('MMM (MM)')}
        </option>
      );
      yearOptions.push(
        <option value={i + +moment().format('YYYY')} key={i}>
          {i + +moment().format('YYYY')}
        </option>
      );
    }

    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={() =>
          that.setState({
            creditCardPopUpOpen: false,
            creditCardError: '',
            newCard: '',
            exp_month_new: '',
            exp_year_new: '',
            cvc: '',
          })
        }
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.changeCreditCard}
      />,
    ];

    return (
      <div>
        <MuiThemeProvider>
          <Dialog
            title="Update Credit Card"
            actions={actions}
            modal={false}
            open={this.state.creditCardPopUpOpen}
            onRequestClose={() =>
              that.setState({
                creditCardPopUpOpen: false,
                creditCardError: '',
              })
            }
          >
            <div className="col-md-12" style={{ ...styles.relativeBlock, paddingLeft: 0 }}>
              <input
                onChange={e => {
                  that.setState({ newCard: e.target.value });
                }}
                required
                className="border-radius-4"
                size="20"
                type="text"
                name="number"
                value={that.state.newCard}
                placeholder="Card Number"
                style={styles.input}
              />
              <img
                className="hidden-xs"
                src="../../../images/card_types.png"
                style={styles.cardsImage}
              />
            </div>

            {/*Expiration*/}
            <div className="col-md-9 col-xs-12" style={{ paddingLeft: 0, paddingRight: 0 }}>
              {/*month*/}
              <div style={styles.selectBlock} className="border-radius-4">
                <label style={styles.selectLabel}>Exp Month</label>
                <select
                  onChange={e => {
                    that.setState({ exp_month_new: e.target.value });
                  }}
                  name="exp_month"
                  id="expiry-month"
                  value={that.state.exp_month_new}
                  style={styles.select}
                >
                  {monthOptions.map(item => item)}
                </select>
              </div>

              {/*year*/}
              <div style={styles.selectBlock} className="border-radius-4">
                <label style={styles.selectLabel}>Exp Year</label>
                <select
                  onChange={e => {
                    that.setState({ exp_year_new: e.target.value });
                  }}
                  name="exp_year"
                  value={that.state.exp_year_new}
                  style={styles.select}
                >
                  {yearOptions.map(item => item)}
                </select>
              </div>
            </div>
            <div className="col-md-3 col-xs-12" style={{ paddingLeft: 0 }}>
              {/*cvv/cvc*/}
              <input
                onChange={e => {
                  that.setState({ cvc: e.target.value });
                }}
                required
                className="border-radius-4"
                size="3"
                type="password"
                name="cvc"
                placeholder="CVC"
                value={that.state.cvc}
                style={Object.assign({}, styles.input, styles.cvc)}
              />
            </div>
            {(this.state.creditCardError && (
              <div className="col-md-12" style={{ color: 'red' }}>
                {this.state.creditCardError}
              </div>
            )) ||
              null}
            {/*button*/}
            <div style={styles.buttonWrapper}>
              <div style={styles.securedTextWrapper}>
                <i className="ti-lock" style={styles.securedTextIcon} />
                Transactions are secure and encrypted.
              </div>
              <div style={styles.stripeImageWrapper}>
                <img src="../../../images/powered_by_stripe.png" style={styles.stripeImage} />
              </div>
            </div>
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }

  // changeCreditCard() {
  //   const {newCard, cvc, exp_year_new, exp_month_new} = this.state;
  //   Stripe.card.createToken({
  //     number: newCard,
  //     cvc,
  //     exp_month: exp_month_new,
  //     exp_year: exp_year_new
  //   }, this.stripeTokenHandler);
  // }

  changeCreditCard() {
    const { stripe_id, cvc, newCard, exp_month_new, exp_year_new } = this.state;
    const that = this;
    if (newCard.length == 0) {
      return this.setState({ creditCardError: 'Please enter a card number.' });
    }
    if (cvc.length == 0) {
      return this.setState({ creditCardError: 'Please enter the 3-digit security code (cvc).' });
    }
    Axios.post('/api/updateCreditCard', {
      // source: response.id,
      source: {
        object: 'card',
        exp_month: Number(exp_month_new) + 1,
        exp_year: Number(exp_year_new),
        number: Number(newCard),
        cvc: Number(cvc),
      },
      customer: stripe_id,
      email: stripe_id ? '' : that.props.userInfo.email[0],
    })
      .then(res => {
        // console.log(res.data);
        if (!stripe_id) {
          that.setState({ stripe_id: res.data.id });
          firebase
            .database()
            .ref(`users/${that.props.userInfo.id}/stripe_id`)
            .set(res.data.id);
        }
        that.retrieveCustomer(stripe_id);
        that.setState({
          creditCardPopUpOpen: false,
          creditCardError: '',
          newCard: '',
          exp_month_new: '',
          exp_year_new: '',
          cvc: '',
        });
        alert('Credit card is updated');
      })
      .catch(err => {
        console.log('error from stripe: ', err);
        that.setState({ creditCardError: err, creditCardPopUpOpen: false });
        alert('Credit card update failed. Please try again later.');
      });
  }

  submit() {
    const { firstName, lastName, pic_url, providerId } = this.state;
    const { userInfo, history } = this.props;
    const that = this;
    // const userID = firebase.auth().currentUser.uid;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        const userID = user.uid;
        firebase
          .database()
          .ref(`users/${userID}/firstName`)
          .set(firstName);
        firebase
          .database()
          .ref(`users/${userID}/lastName`)
          .set(lastName);
        firebase
          .database()
          .ref(`users/${userID}/pic_url`)
          .set(pic_url);
        alert('Profile change saved.');
      } else {
        // alert('profile saving failed. Please try again later.');
        // Raven.captureMessage('profile saving failed!')
      }
    });
  }

  handleModalOpen() {
    this.setState({ modalOpen: true });
  }

  handleModalClose() {
    this.setState({ modalOpen: false, profileImgUploaded: false });
    document.getElementById('upload_hidden_cover_2').value = null;
  }

  uploadViaModal(fileBlob, hostImg) {
    this.setState({ fileCropped: true, modalOpen: false, profileImgUploaded: true });
    this._uploadToAws(fileBlob, hostImg);
  }

  render() {
    const {
      firstName,
      lastName,
      pic_url,
      profileImgUploaded,
      profileSaved,
      modalOpen,
      email,
      providerId,
      stripe_id,
    } = this.state;
    const that = this;
    return (
      <div>
        <SoundwiseHeader />
        <section
          className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb"
          id="feature-section14"
        >
          <div className="container">
            <ImageCropModal
              open={modalOpen}
              handleClose={this.handleModalClose.bind(this)}
              upload={this.uploadViaModal.bind(this)}
              hostImg={false}
              file={this.currentImageRef}
            />
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                  MY PROFILE
                </h2>
              </div>
            </div>
            <div className="row" style={{ paddingTop: 30 }}>
              <div className="col-md-6 col-sm-8 col-xs-12 center-col">
                <div className="col-md-6 col-sm-6 col-xs-12">
                  <span style={styles.titleText}>First Name</span>
                  <div style={{ ...styles.inputTitleWrapper }}>
                    <input
                      type="text"
                      style={styles.inputTitle}
                      placeholder={''}
                      onChange={e => {
                        this.setState({ firstName: e.target.value });
                      }}
                      value={firstName}
                    />
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-xs-12">
                  <span style={styles.titleText}>Last Name</span>
                  <div style={{ ...styles.inputTitleWrapper }}>
                    <input
                      type="text"
                      style={styles.inputTitle}
                      placeholder={''}
                      onChange={e => {
                        this.setState({ lastName: e.target.value });
                      }}
                      value={lastName}
                    />
                  </div>
                </div>
                <div className="col-md-12 col-sm-12 col-xs-12" style={{ paddingTop: 30 }}>
                  <div style={{ marginBottom: 10 }}>
                    <span style={styles.titleText}>Profile Picture</span>
                  </div>
                  <div
                    style={{
                      ...styles.profileImage,
                      backgroundImage: `url(${pic_url ? pic_url : ''})`,
                    }}
                  />
                  <div style={styles.loaderWrapper}>
                    <div style={{ ...styles.inputFileWrapper, marginTop: 0 }}>
                      <input
                        type="file"
                        name="upload"
                        id="upload_hidden_cover_2"
                        onChange={this.setFileName.bind(this)}
                        style={styles.inputFileHidden}
                        ref={input => (this.profileImgInputRef = input)}
                      />
                      {(profileImgUploaded && (
                        <div>
                          <span>{this.profileImgInputRef.files[0].name}</span>
                          <span
                            style={styles.cancelImg}
                            onClick={() => {
                              that.setState({
                                profileImgUploaded: false,
                                pic_url: false,
                              });
                              document.getElementById('upload_hidden_cover_2').value = null;
                            }}
                          >
                            Cancel
                          </span>
                        </div>
                      )) ||
                        (!profileImgUploaded && (
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
                            <span style={styles.fileTypesLabel}>.jpg or .png files accepted</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-sm-12 col-xs-12" style={{ paddingTop: 30 }}>
                  <div
                    className="col-md-6 col-sm-12 col-xs-12"
                    style={{ marginBottom: 10, paddingLeft: 0 }}
                  >
                    <div style={styles.titleText}>Email</div>
                    <div style={styles.inputTitleWrapper}>
                      <div style={styles.inputTitle}>{email}</div>
                    </div>
                  </div>
                  {(providerId == 'facebook.com' && (
                    <div
                      className="col-md-6 col-sm-12 col-xs-12"
                      style={{ marginBottom: 10, paddingLeft: 0 }}
                    >
                      <div style={styles.titleText}>Login Provider</div>
                      <div style={styles.inputTitleWrapper}>
                        <div style={styles.inputTitle}>
                          <span>Facebook</span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div
                      className="col-md-6 col-sm-12 col-xs-12"
                      style={{ marginBottom: 10, paddingLeft: 0 }}
                    >
                      <div style={styles.titleText}>Password</div>
                      <div style={styles.inputTitleWrapper}>
                        <div style={styles.inputTitle}>
                          <span>******</span>
                          <span
                            onClick={() => {
                              that.setState({
                                passwordPopUpOpen: true,
                              });
                            }}
                            style={{
                              paddingLeft: 20,
                              color: Colors.mainOrange,
                              cursor: 'pointer',
                            }}
                          >
                            change
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    className="col-md-12 col-sm-12 col-xs-12"
                    style={{ marginBottom: 10, paddingLeft: 0 }}
                  >
                    <div style={styles.titleText}>Billing Information</div>
                    {(stripe_id && (
                      <div style={styles.inputTitleWrapper}>
                        <div style={styles.inputTitle}>
                          <span>
                            <strong>{this.state.brand}</strong>
                          </span>
                          <span>{` **** ***** ${this.state.last4}`}</span>
                        </div>
                        <div style={styles.inputTitle}>
                          {`Exp: ${this.state.exp_month}/${this.state.exp_year}`}
                        </div>
                        <div
                          onClick={() => {
                            that.setState({ creditCardPopUpOpen: true });
                          }}
                          style={{
                            ...styles.inputTitle,
                            color: Colors.mainOrange,
                            cursor: 'pointer',
                          }}
                        >
                          Update credit card
                        </div>
                      </div>
                    )) || (
                      <div style={styles.inputTitleWrapper}>
                        <div
                          onClick={() => {
                            that.setState({ creditCardPopUpOpen: true });
                          }}
                          style={{
                            ...styles.inputTitle,
                            color: Colors.mainOrange,
                            cursor: 'pointer',
                          }}
                        >
                          Add a credit card
                        </div>
                      </div>
                    )}
                    {this.creditCardPopUp()}
                  </div>
                </div>
                {this.passwordPopUp()}
              </div>
            </div>
            <div
              className="col-lg-8 col-md-8 col-sm-12 col-xs-12 center-col text-center"
              style={{ paddingTop: 35 }}
            >
              {(profileSaved && (
                <div style={{ fontSize: 16, color: Colors.mainOrange }}>Profile Saved</div>
              )) || <OrangeSubmitButton label="Save" onClick={this.submit} />}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }
}

const styles = {
  titleText: { ...commonStyles.titleText },
  inputTitleWrapper: { ...commonStyles.inputTitleWrapper },
  inputTitle: { ...commonStyles.inputTitle, fontSize: 16 },
  inputFileHidden: { ...commonStyles.inputFileHidden },
  loaderWrapper: {
    ...commonStyles.loaderWrapper,
    width: 'calc(100% - 133px)',
    float: 'left',
  },
  cancelImg: { ...commonStyles.cancelImg, fontSize: 14 },
  profileImage: {
    width: 100,
    height: 100,
    float: 'left',
    borderRadius: '50%',
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
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
    fontSize: 14,
    border: 0,
    marginTop: 5,
  },
  fileTypesLabel: {
    fontSize: 11,
    marginLeft: 0,
    display: 'block',
  },
  relativeBlock: {
    position: 'relative',
  },
  cardsImage: {
    position: 'absolute',
    right: 20,
    top: 10,
    width: 179,
    height: 26,
  },
  input: {
    height: 46,
    fontSize: 14,
    margin: '0px 0 0 0',
  },
  input2: {
    height: 46,
    fontSize: 14,
    margin: '10px 0 0 0',
  },
  selectBlock: {
    width: '45%',
    height: 46,
    float: 'left',
    marginTop: 9,
    border: `1px solid ${Colors.mainGrey}`,
    paddingLeft: 10,
    marginRight: '5%',
  },
  selectLabel: {
    fontWeight: 'normal',
    display: 'block',
    marginBottom: 0,
    color: Colors.fontBlack,
    fontSize: 14,
  },
  select: {
    border: 0,
    backgroundColor: Colors.mainWhite,
    padding: 0,
    margin: 0,
    color: Colors.fontGrey,
    fontSize: 14,
    position: 'relative',
    right: 3,
  },
  cvc: {
    width: '100%',
    marginTop: 9,
  },
  buttonWrapper: {
    margin: '20px 0 0 0',
  },
  stripeImageWrapper: {
    backgroundColor: Colors.mainOrange,
    overflow: 'hidden',
    position: 'relative',
    width: 138,
    height: 32,
    margin: '10px 10px',
    float: 'left',
    borderRadius: 5,
  },
  stripeImage: {
    width: 138,
    height: 32,
    position: 'relative',
    bottom: 0,
  },
  button: {
    height: 46,
    backgroundColor: Colors.mainOrange,
    fontSize: 14,
  },
  securedTextWrapper: {
    marginTop: 15,
    float: 'left',
  },
  securedTextIcon: {
    fontSize: 16,
  },
  securedText: {
    fontSize: 14,
  },
};

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  return { userInfo, isLoggedIn };
};

export const UserProfile = connect(
  mapStateToProps,
  null
)(_UserProfile);
