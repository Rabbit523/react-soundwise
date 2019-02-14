import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Link } from 'react-router-dom';
import Dots from 'react-activity/lib/Dots';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import { inviteListeners } from '../../../helpers/invite_listeners';

import ValidatedInput from '../../../components/inputs/validatedInput';
import ImageCropModal from './image_crop_modal';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';

var parseQueryString = function(queryString) {
  var params = {},
    queries,
    temp,
    i,
    l;
  // Split into key/value pairs
  queries = queryString.split('&');
  // Convert the array of strings into an object
  for (i = 0, l = queries.length; i < l; i++) {
    temp = queries[i].split('=');
    params[temp[0]] = temp[1];
  }
  return params;
};

// TODO handle  NODE_ENV === 'staging' condition
const redirectURI =
  process.env.NODE_ENV === 'dev'
    ? 'http://localhost:3000/dashboard/publisher&client_id=ca_BwcFWisx5opzCTEBnz5M16ss7Oj6VKeK'
    : 'https://mysoundwise.com/dashboard/publisher&client_id=ca_BwcFxIj5tpCcv3JqmXy7usb88tBSBRD4';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publisherName: '',
      publisherImg: '',
      publisherEmail: '',
      stripe_user_id: null,
      fileUploaded: false,
      admins: [],
      adminFormShow: false,
      inviteSent: false,
      inviteeEmail: '',
      inviteeFirstName: '',
      inviteeLastName: '',
      publisherSaved: false,
      authorized: false,
      creatingAccount: false,
      modalOpen: false,
    };
    this.loadFromProp(props.userInfo);
    this.loadFromProp = this.loadFromProp.bind(this);
    this.handleStripeRedirect = this.handleStripeRedirect.bind(this);
    this._uploadToAws = this._uploadToAws.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    const that = this;
    if (this.props.userInfo.publisher) {
      const { userInfo } = this.props;
      this.loadFromProp(userInfo);
      const that = this;
      const publisherId = userInfo.publisherID;
      let admins = [];
      firebase
        .database()
        .ref(`publishers/${publisherId}/administrators`)
        .on('value', snapshot => {
          const adminArr = Object.keys(snapshot.val());
          const promises = adminArr.map(adminId => {
            return firebase
              .database()
              .ref(`users/${adminId}`)
              .once('value')
              .then(snapshot => {
                let snapshotVal = snapshot.val();
                if (snapshotVal) {
                  admins.push({
                    firstName: snapshotVal.firstName,
                    lastName: snapshotVal.lastName,
                    email: snapshotVal.email[0],
                  });
                }
              })
              .then(res => res, err => console.log(err));
          });

          Promise.all(promises).then(
            res => {
              that.setState({
                admins,
              });
            },
            err => {
              console.log('promise error: ', err);
            }
          );
        });

      this.handleStripeRedirect(publisherId, userInfo);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.userInfo.soundcasts_managed &&
      nextProps.userInfo.publisher &&
      nextProps != this.props
    ) {
      const { userInfo } = nextProps;
      this.loadFromProp(userInfo);
      const that = this;
      const publisherId = userInfo.publisherID;
      let admins = [];
      firebase
        .database()
        .ref(`publishers/${publisherId}/administrators`)
        .on('value', snapshot => {
          const adminArr = Object.keys(snapshot.val());
          const promises = adminArr.map(adminId => {
            return firebase
              .database()
              .ref(`users/${adminId}`)
              .once('value')
              .then(snapshot => {
                let snapshotVal = snapshot.val();
                if (snapshotVal) {
                  admins.push({
                    firstName: snapshotVal.firstName,
                    lastName: snapshotVal.lastName,
                    email: snapshotVal.email[0],
                  });
                }
              })
              .then(res => res, err => console.log(err));
          });

          Promise.all(promises).then(
            res => {
              that.setState({
                admins,
              });
            },
            err => {
              console.log('promise error: ', err);
            }
          );
        });

      this.handleStripeRedirect(publisherId, userInfo);
    }
  }

  handleStripeRedirect(publisherId, userInfo) {
    // handle stripe re-direct
    const that = this;
    const queryString = window.location.search.substring(1);
    if (queryString.length > 0) {
      const params = parseQueryString(queryString);
      // console.log('params.code: ', params.code);
      if (params.state == publisherId && !this.state.authorized && !this.state.creatingAccount) {
        that.setState({
          creatingAccount: true,
        });
        let publisherPlan = null;
        const { publisher } = that.props.userInfo;
        if (publisher) {
          publisherPlan = publisher.plan;
        }
        Axios.post('/api/create_stripe_account', {
          code: params.code,
          publisherId,
          publisherName: this.state.publisherName,
          publisherPlan,
        })
          .then(res => {
            that.setState({
              stripe_user_id: res.stripe_user_id || res.data.stripe_user_id,
              authorized: true,
              creatingAccount: false,
            });
            that.loadFromProp(userInfo);
          })
          .catch(err => console.log('stripe client posting error: ', err));
      }
    }
  }

  loadFromProp(userInfo) {
    if (userInfo.publisher) {
      const publisherId = userInfo.publisherID;
      const {
        name,
        imageUrl,
        email,
        stripe_user_id,
        publisherInfo,
        website,
        facebook,
        twitter,
        linkedin,
        instagram,
      } = userInfo.publisher;
      const { publisherName, publisherImg, publisherEmail } = this.state;
      this.setState({
        publisherName: name ? name : publisherName,
        publisherImg: imageUrl ? imageUrl : publisherImg,
        publisherEmail: email ? email : publisherEmail,
        publisherId,
        stripe_user_id,
        publisherInfo: publisherInfo ? publisherInfo : '',
        website: website ? website : '',
        facebook: facebook ? facebook : '',
        twitter: twitter ? twitter : '',
        linkedin: linkedin ? linkedin : '',
        instagram: instagram ? instagram : '',
      });
    }
  }

  _uploadToAws(file) {
    const _self = this;
    let data = new FormData();
    const splittedFileName = file.type.split('/');
    const ext = splittedFileName[splittedFileName.length - 1];
    const id = `${moment().format('X')}p`;
    data.append('file', file, `${id}.${ext}`);
    Axios.post('/api/upload', data)
      .then(function(res) {
        // POST succeeded...

        //replace 'http' with 'https'
        let url = res.data[0].url;
        if (url.slice(0, 5) !== 'https') {
          url = url.replace(/http/i, 'https');
        }

        _self.setState({ publisherImg: url });
      })
      .catch(function(err) {
        // POST failed...
        console.log('ERROR upload to aws s3: ', err);
      });
  }

  setFileName(e) {
    // console.log('this.fileInputRef.files: ', this.fileInputRef.files);
    if (this.fileInputRef.files[0]) {
      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (allowedFileTypes.indexOf(this.fileInputRef.files[0].type) < 0) {
        alert('Only .png or .jpeg files are accepted. Please upload a new file.');
        this.setState({ fileUploaded: false });
        return;
      }
      this.setState({ fileUploaded: true });
      this.currentImageRef = this.fileInputRef.files[0];
      this.handleModalOpen();
    }
  }

  submit() {
    const { publisher } = this.props.userInfo;
    const {
      publisherImg,
      publisherName,
      publisherId,
      publisherEmail,
      publisherInfo,
      website,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = this.state;
    const that = this;
    const revisedPublisher = {
      ...publisher,
      name: publisherName,
      imageUrl: publisherImg,
      email: publisherEmail,
      publisherInfo,
      website,
      facebook,
      twitter,
      linkedin,
      instagram,
    };

    firebase
      .database()
      .ref(`publishers/${publisherId}`)
      .set(revisedPublisher)
      .then(() => {
        // console.log('publisher saved');
        alert('Publisher data saved.');
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleInvite(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  inviteAdmin() {
    const publisherId = this.props.userInfo.publisherID;
    const userInfo = this.props.userInfo;
    const {
      inviteeEmail,
      inviteeFirstName,
      inviteeLastName,
      publisherName,
      publisherImg,
    } = this.state;
    const inviteeArr = [inviteeEmail];
    const subject = `${userInfo.firstName} ${
      userInfo.lastName
    } invites you to become an admin for ${publisherName}`;
    const content = `<p>Hi ${inviteeFirstName}!</p><p></p><p>This is an invitation for you to join the admin team of ${publisherName} on Soundwise. You can sign up for your admin account <a href="https://mysoundwise.com/signup/admin/${publisherId}">here</a>.</p><p></p><p>If you already have an account on Soundwise, you can log in and join your team <a href="https://mysoundwise.com/signin/admin/${publisherId}">here</a>.</p><p>These links are unique for you. Please do not share.</p>`;

    inviteListeners(inviteeArr, subject, content, publisherName, publisherImg);

    const email = inviteeEmail.replace(/\./g, '(dot)');
    firebase
      .database()
      .ref(`publishers/${publisherId}/invitedAdmins/${email}`)
      .set(true);

    this.setState({
      inviteSent: true,
    });
  }

  handleModalOpen() {
    this.setState({
      modalOpen: true,
      fileCropped: false,
    });
  }

  handleModalClose() {
    this.setState({
      modalOpen: false,
      fileUploaded: false,
    });
    document.getElementById('upload_hidden_cover').value = null;
  }

  uploadViaModal(fileBlob, hostImg) {
    this.setState({
      fileCropped: true,
      modalOpen: false,
      fileUploaded: true,
    });
    this._uploadToAws(fileBlob, hostImg);
  }

  requestStripeDashboard() {
    let newWindow = window.open('', '_blank');
    newWindow.document.write('Loading...');
    const that = this;
    const { stripe_user_id } = this.state;
    Axios.post('/api/requestStripeDashboard', { stripe_user_id })
      .then(res => {
        // window.open(res.url, '_blank');
        newWindow.location.href = res.data.url;
      })
      .catch(err => {
        that.setState({
          errorMessage: err.response.data,
        });
        newWindow.document.write(err.response.data);
      });
  }

  render() {
    const {
      publisherImg,
      publisherName,
      publisherInfo,
      website,
      facebook,
      twitter,
      linkedin,
      instagram,
      publisherEmail,
      publisherSaved,
      fileUploaded,
      admins,
      adminFormShow,
      inviteeFirstName,
      inviteeLastName,
      inviteeEmail,
      inviteSent,
      stripe_user_id,
      creatingAccount,
      modalOpen,
    } = this.state;
    const that = this;
    const { userInfo } = this.props;

    return (
      <div className="container">
        <ImageCropModal
          open={modalOpen}
          handleClose={this.handleModalClose.bind(this)}
          upload={this.uploadViaModal.bind(this)}
          hostImg={false}
          file={this.currentImageRef}
        />
        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12" style={{ minHeight: 700 }}>
            <div style={{ marginTop: 20 }}>
              <span style={{ ...styles.titleText, marginTop: 20 }}>Publisher Name</span>
            </div>
            <div style={styles.inputTitleWrapper}>
              <input
                type="text"
                style={styles.inputTitle}
                onChange={e => {
                  this.setState({ publisherName: e.target.value });
                }}
                value={publisherName}
              />
            </div>
            <div style={{ height: 150 }}>
              <div style={styles.image}>
                <img src={publisherImg} />
              </div>
              <div style={styles.loaderWrapper}>
                <span style={{ ...styles.titleText, marginLeft: 10 }}>
                  Publisher Profile Image (square image)
                </span>
                <div style={{ ...styles.inputFileWrapper, marginTop: 0 }}>
                  <input
                    type="file"
                    name="upload"
                    id="upload_hidden_cover"
                    accept="image/*"
                    onChange={this.setFileName.bind(this)}
                    style={styles.inputFileHidden}
                    ref={input => (this.fileInputRef = input)}
                  />
                  {(fileUploaded && (
                    <div>
                      <span>{this.fileInputRef.files[0].name}</span>
                      <span
                        style={styles.cancelImg}
                        onClick={() => {
                          that.setState({ fileUploaded: false });
                          document.getElementById('upload_hidden_cover').value = null;
                          that.loadFromProp(userInfo);
                        }}
                      >
                        Cancel
                      </span>
                    </div>
                  )) ||
                    (!fileUploaded && (
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
                        <span style={styles.fileTypesLabel}>.jpg or .png files accepted</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div>
              <div style={{ marginTop: 20 }}>
                <span style={{ ...styles.titleText, marginTop: 20 }}>Publisher Info</span>
                <span>
                  <i>{` (280 characters max)`}</i>
                </span>
              </div>
              <div style={styles.inputTitleWrapper}>
                <input
                  type="text"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ publisherInfo: e.target.value });
                  }}
                  value={publisherInfo}
                />
              </div>
            </div>
            <div>
              <div style={{ marginTop: 20 }}>
                <span style={{ ...styles.titleText, marginTop: 20 }}>Publisher Email</span>
              </div>
              <div style={styles.inputTitleWrapper}>
                <input
                  type="text"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ publisherEmail: e.target.value });
                  }}
                  value={publisherEmail}
                />
              </div>
            </div>
            <div>
              <div style={{ marginTop: 20 }}>
                <span style={{ ...styles.titleText, marginTop: 20 }}>Website</span>
              </div>
              <div style={styles.inputTitleWrapper}>
                <input
                  type="text"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ website: e.target.value });
                  }}
                  value={website}
                />
              </div>
            </div>
            <div>
              <div style={{ marginTop: 20 }}>
                <span style={{ ...styles.titleText, marginTop: 20 }}>Facebook</span>
              </div>
              <div style={styles.inputTitleWrapper}>
                <input
                  type="text"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ facebook: e.target.value });
                  }}
                  value={facebook}
                />
              </div>
            </div>
            <div>
              <div style={{ marginTop: 20 }}>
                <span style={{ ...styles.titleText, marginTop: 20 }}>Twitter</span>
              </div>
              <div style={styles.inputTitleWrapper}>
                <input
                  type="text"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ twitter: e.target.value });
                  }}
                  value={twitter}
                />
              </div>
            </div>
            <div>
              <div style={{ marginTop: 20 }}>
                <span style={{ ...styles.titleText, marginTop: 20 }}>LinkedIn</span>
              </div>
              <div style={styles.inputTitleWrapper}>
                <input
                  type="text"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ linkedin: e.target.value });
                  }}
                  value={linkedin}
                />
              </div>
            </div>
            <div>
              <div style={{ marginTop: 20 }}>
                <span style={{ ...styles.titleText, marginTop: 20 }}>Instagram</span>
              </div>
              <div style={styles.inputTitleWrapper}>
                <input
                  type="text"
                  style={styles.inputTitle}
                  onChange={e => {
                    this.setState({ instagram: e.target.value });
                  }}
                  value={instagram}
                />
              </div>
            </div>
            <div className="row" style={{ paddingBottom: 30 }}>
              <div className="col-lg-8 col-md-8 col-sm-12 col-xs-12 text-center">
                {(publisherSaved && (
                  <div
                    style={{
                      paddingTop: 25,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 16, color: Colors.mainOrange }}>Saved</span>
                  </div>
                )) || (
                  <OrangeSubmitButton
                    label="Save"
                    onClick={this.submit}
                    styles={{ margin: '20px auto' }}
                  />
                )}
              </div>
              <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <TransparentShortSubmitButton
                  label="Cancel"
                  styles={{ margin: '20px auto' }}
                  onClick={() => this.loadFromProp(userInfo)}
                />
              </div>
            </div>
            <div
              className="row"
              style={{
                padding: '30px 0px 30px 0px',
                borderTop: '0.5px solid lightgrey',
                borderBottom: '0.5px solid lightgrey',
              }}
            >
              <div
                className="col-md-7"
                style={{ display: 'flex', alignItems: 'center', height: 37 }}
              >
                {(stripe_user_id && (
                  <div>
                    <span
                      style={{
                        ...styles.titleText,
                        color: 'green',
                        marginRight: 15,
                      }}
                    >
                      <i className="fa fa-check" aria-hidden="true" />
                    </span>
                    <span style={styles.titleText}>Stripe Payout Account Connected</span>
                  </div>
                )) ||
                  (creatingAccount && (
                    <span style={styles.titleText}>Setting up Stripe Account</span>
                  )) || <span style={styles.titleText}>Set up Payouts with Stripe</span>}
              </div>
              <div className="col-md-4">
                {(creatingAccount && (
                  <Dots style={{ display: 'flex' }} color="#727981" size={24} speed={1} />
                )) || (
                  <a
                    href={`https://connect.stripe.com/express/oauth/authorize?redirect_uri=${redirectURI}&state=${
                      userInfo.publisherID
                    }`}
                  >
                    <OrangeSubmitButton
                      label={stripe_user_id ? 'Reconnect >' : 'Start >>'}
                      styles={{
                        backgroundColor: 'transparent',
                        borderColor: stripe_user_id ? 'transparent' : Colors.softBlack,
                        width: '100%',
                        margin: '0px auto',
                        color: Colors.softBlack,
                      }}
                    />
                  </a>
                )}
              </div>
              {(stripe_user_id && (
                <div className="col-md-12">
                  <div style={{ marginTop: 30 }}>
                    <div
                      style={{
                        ...styles.titleText,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                      onClick={this.requestStripeDashboard.bind(this)}
                    >
                      <span>View Payout Account</span>
                    </div>
                    <div style={{ color: 'red' }}>{this.state.errorMessage}</div>
                  </div>
                </div>
              )) ||
                null}
            </div>
            <div style={{ marginTop: 20 }}>
              <span style={{ ...styles.titleText, marginTop: 20 }}>Admins</span>
            </div>
            <div style={{ marginTop: 10, marginBottom: 20 }}>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {admins.map((admin, i) => (
                  <li key={i}>
                    <span className="text-large">{`${admin.firstName} ${admin.lastName} (${
                      admin.email
                    })`}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span
                style={styles.addAdmin}
                onClick={() => {
                  that.setState({
                    adminFormShow: true,
                    inviteSent: false,
                    inviteeEmail: '',
                    inviteeFirstName: '',
                    inviteeLastName: '',
                  });
                }}
              >
                Add Another Admin
              </span>
            </div>
            {adminFormShow && !inviteSent && (
              <div className="row" style={{ marginBottom: 10, marginLeft: 5 }}>
                <div
                  style={{
                    width: '25%',
                    display: 'inline-block',
                    marginRight: 10,
                  }}
                >
                  <span>First Name</span>
                  <input
                    type="text"
                    style={styles.inputTitle}
                    name="inviteeFirstName"
                    onChange={this.handleInvite.bind(this)}
                    value={inviteeFirstName}
                  />
                </div>
                <div
                  style={{
                    width: '25%',
                    display: 'inline-block',
                    marginRight: 10,
                  }}
                >
                  <span>Last Name</span>
                  <input
                    type="text"
                    style={styles.inputTitle}
                    name="inviteeLastName"
                    onChange={this.handleInvite.bind(this)}
                    value={inviteeLastName}
                  />
                </div>
                <div
                  style={{
                    width: '40%',
                    display: 'inline-block',
                    marginRight: 10,
                  }}
                >
                  <span>Email</span>
                  <input
                    type="text"
                    style={styles.inputTitle}
                    name="inviteeEmail"
                    onChange={this.handleInvite.bind(this)}
                    value={inviteeEmail}
                  />
                </div>
                <div>
                  <button
                    onClick={this.inviteAdmin.bind(this)}
                    style={{
                      ...styles.uploadButton,
                      backgroundColor: Colors.link,
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
            {adminFormShow && inviteSent && (
              <div style={{ marginTop: 10 }}>
                <span className="text-large">
                  <i>{`An email invitation has been sent to ${inviteeEmail}.`}</i>
                </span>
              </div>
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
  inputFileHidden: { ...commonStyles.inputFileHidden },
  image: { ...commonStyles.image, float: 'left' },
  loaderWrapper: {
    ...commonStyles.loaderWrapper,
    width: 'calc(100% - 133px)',
    float: 'left',
  },
  cancelImg: { ...commonStyles.cancelImg, fontSize: 14 },
  editorStyle: {
    padding: '5px',
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
  addAdmin: {
    fontSize: 16,
    // marginLeft: 10,
    marginTop: 20,
    marginBottom: 10,
    color: Colors.link,
    cursor: 'pointer',
  },
};
