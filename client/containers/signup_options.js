import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import Dots from 'react-activity/lib/Dots';
import Axios from 'axios';
import { Link } from 'react-router-dom';

import Colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';
import { OrangeSubmitButton } from '../components/buttons/buttons';
import { setFeedVerified } from '../actions/index';

class _SignupOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      importFeed: false,
      podcastTitle: '',
      feedUrl: '',
      imageUrl: null,
      publisherEmail: null,
      emailNotFoundError: false,
      feedSubmitting: false,
    };
    this.submitFeed = this.submitFeed.bind(this);
    this.submitCode = this.submitCode.bind(this);
    this.resend = this.resend.bind(this);
  }

  handleFeedSubmission(type, e) {
    this.setState({ [type]: e.target.value });
  }

  submitFeed() {
    this.setState({ feedSubmitting: true });
    Axios.post('/api/parse_feed', {
      feedUrl: this.state.feedUrl,
      // podcastTitle: this.state.podcastTitle, // not used currently
    })
      .then(res => {
        // setting imageUrl, publisherEmail or notClaimed
        res.data && this.setState({ ...res.data, feedSubmitting: false });
      })
      .catch(err => {
        const errMsg = (err && err.response && err.response.data) || err.toString();
        this.setState({ feedSubmitting: false });
        if (errMsg.slice(0, 40) === "Error: Cannot find podcast owner's email") {
          this.setState({ emailNotFoundError: true });
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
    Axios.post('/api/parse_feed', { feedUrl, submitCode, notClaimed })
      .then(res => {
        if (res.data === 'Success_code') {
          this.props.setFeedVerified({ feedUrl, publisherEmail });
          this.props.history.push('/signup/admin');
        }
      })
      .catch(err => {
        const errMsg = (err && err.response && err.response.data) || err.toString();
        if (errMsg.slice(0, 33) === 'Error: incorrect verfication code') {
          alert('Code incorrect!');
        } else {
          const errMsg = 'Verification code request failed';
          console.log(errMsg, err, err && err.response && err.response.data);
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
    const {
      importFeed,
      podcastTitle,
      feedUrl,
      imageUrl,
      publisherEmail,
      emailNotFoundError,
    } = this.state;
    const that = this;
    return (
      <div
        className="row"
        style={{ ...styles.row, height: Math.max(window.innerHeight, 700), overflow: 'auto' }}
      >
        <div className="col-lg-4 col-md-6 col-sm-8 col-xs-12 center-col text-center">
          <img alt="Soundwise Logo" src="/images/soundwiselogo.svg" style={styles.logo} />
          {(importFeed &&
            ((imageUrl && publisherEmail && (
              <div
                style={{ ...styles.containerWrapper, padding: 20 }}
                className="container-confirmation"
              >
                <img className="center-col" src={imageUrl} />
                <div
                  style={{ ...styles.container, padding: 30, width: 340, fontSize: 17 }}
                  className="center-col text-center"
                >
                  Almost there... to verify your ownership of the podcast, we sent a confirmation
                  code to <br />
                  <span style={{ color: Colors.mainOrange }}>{publisherEmail}</span>
                </div>
                <div style={styles.container} className="center-col text-center">
                  <div style={{ paddingBottom: 18, fontSize: 21 }}>
                    Enter the confirmation code:
                  </div>
                  <div>
                    <input ref="codeSign1" onKeyDown={this.onKeyDown.bind(this, 2)} />
                    <input ref="codeSign2" onKeyDown={this.onKeyDown.bind(this, 3)} />
                    <input ref="codeSign3" onKeyDown={this.onKeyDown.bind(this, 4)} />
                    <input ref="codeSign4" />
                  </div>
                </div>
                <div style={{ marginTop: 20 }} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <OrangeSubmitButton
                    styles={{ marginTop: 15, marginBottom: 15 }}
                    label="Submit"
                    onClick={this.submitCode.bind(this)}
                  />
                </div>
                <div style={{ marginTop: 20 }} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <a style={{ color: Colors.link, marginLeft: 5 }} onClick={this.resend.bind(this)}>
                    Resend the confirmation code
                  </a>
                </div>
              </div>
            )) ||
              ((emailNotFoundError && (
                <div style={{ ...styles.containerWrapper, padding: 20 }}>
                  <div
                    style={{ ...styles.container, paddingBottom: 30 }}
                    className="center-col text-center"
                  >
                    <div style={styles.title}>Ooops! There's a problem ...</div>
                  </div>
                  <div
                    style={{ ...styles.container, padding: '20px 30px', width: 490, fontSize: 13 }}
                    className="center-col text-center"
                  >
                    We cannot find the podcast owner's email address in the feed you submitted. An
                    email address is needed to confirm your ownership of the podcast. Please edit
                    your feed to include an owner's email address and re-submit.
                  </div>
                  <div
                    style={{ ...styles.container, padding: 30, width: 490, fontSize: 13 }}
                    className="center-col text-center"
                  >
                    If you think this is a mistake, please contact our support at <br />
                    <span style={{ color: '#f76b1c' }}>support@mysoundwise.com</span>
                  </div>
                </div>
              )) || (
                <div style={{ ...styles.containerWrapper, padding: 20 }}>
                  <div
                    style={{ ...styles.container, paddingBottom: 30 }}
                    className="center-col text-center"
                  >
                    <div style={styles.title}>Submit your podcast feed</div>
                  </div>
                  <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <span style={styles.greyInputText}>Podcast Title</span>
                    <input
                      type="text"
                      style={styles.input}
                      onChange={this.handleFeedSubmission.bind(this, 'podcastTitle')}
                      value={podcastTitle}
                    />
                  </div>
                  <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <span style={styles.greyInputText}>Podcast RSS Feed URL</span>
                    <input
                      type="text"
                      style={styles.input}
                      onChange={this.handleFeedSubmission.bind(this, 'feedUrl')}
                      value={feedUrl}
                    />
                  </div>
                  {(!this.state.feedSubmitting && (
                    <div
                      style={{ marginTop: 20 }}
                      className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                    >
                      <OrangeSubmitButton
                        styles={{ marginTop: 15, marginBottom: 15 }}
                        label="Submit"
                        onClick={this.submitFeed.bind(this)}
                      />
                    </div>
                  )) || (
                    <div
                      style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}
                      className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                    >
                      <span style={{ fontSize: 18, paddingRight: 15 }}>Processing</span>
                      <Dots style={{}} color={Colors.mainOrange} size={32} speed={1} />
                    </div>
                  )}
                </div>
              )))) || (
            <div style={{ ...styles.containerWrapper, padding: 20 }}>
              <div style={styles.container} className="center-col text-center">
                <div style={styles.title}>Choose your adventure</div>
              </div>
              <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <OrangeSubmitButton
                  styles={{ width: '100%', height: 'auto', margin: '20px auto' }}
                  label="I have a podcast RSS feed to submit"
                  onClick={() => that.setState({ importFeed: true })}
                />
              </div>
              <div
                className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span style={{ fontSize: 20, fontWeight: 600, fontStyle: 'italic' }}>or</span>
              </div>
              <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <Link to="/signup/admin">
                  <OrangeSubmitButton
                    id="signupOptionsNewPodcastBtnTest"
                    styles={{
                      backgroundColor: Colors.link,
                      borderColor: Colors.link,
                      width: '100%',
                      height: 'auto',
                      margin: '20px auto',
                    }}
                    label="I'm starting a new podcast / audio program"
                  />
                </Link>
              </div>
              <div style={{ marginTop: 20 }} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <span style={styles.italicText}>Already have a publisher account ? </span>
                <Link
                  to="/signin"
                  style={{ ...styles.italicText, color: Colors.link, marginLeft: 5 }}
                >
                  Sign in >
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};
const mapDispatchToProps = dispatch => {
  return bindActionCreators({ setFeedVerified }, dispatch);
};
const SignupOptions = connect(
  mapStateToProps,
  mapDispatchToProps
)(_SignupOptions);
export default SignupOptions;

const styles = {
  input: { ...commonStyles.input },
  containerWrapper: { ...commonStyles.containerWrapper },
  row: {
    backgroundColor: Colors.window,
    paddingTop: 15,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  logo: {
    marginBottom: 18,
    height: 50,
  },
  container: {
    backgroundColor: Colors.mainWhite,
  },
  title: {
    paddingTop: 20,
    paddingBottom: 20,
    fontSize: 26,
    color: Colors.fontBlack,
  },
  fb: {
    width: 212,
    height: 44,
    marginTop: 10,
    marginBottom: 10,
  },
  fbIcon: {
    marginLeft: 0,
    marginRight: 20,
    position: 'relative',
    bottom: 2,
    right: '10px',
  },
  withEmailText: {
    fontSize: 14,
    display: 'inline-block',
    paddingLeft: 20,
    paddingRight: 20,
    position: 'relative',
    bottom: 35,
    backgroundColor: Colors.mainWhite,
    fontStyle: 'Italic',
  },
  checkbox: {
    width: 20,
  },
  acceptText: {
    fontSize: 11,
    position: 'relative',
    bottom: 3,
  },
  submitButton: {
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: Colors.link,
    borderColor: Colors.link,
  },
  italicText: {
    fontSize: 16,
    fontStyle: 'Italic',
    marginBottom: 10,
    display: 'inline-block',
    height: 16,
    lineHeight: '16px',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 3,
    marginTop: 0,
    position: 'relative',
    // top: 10,
  },
  greyInputText: {
    fontSize: 16,
    float: 'left',
    paddingBottom: 5,
  },
};
