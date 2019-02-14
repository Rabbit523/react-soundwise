import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import { Route, Link, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';

import { signinUser } from '../actions/index';
import Colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';
import { GreyInput } from '../components/inputs/greyInput';
import { minLengthValidator, emailValidator } from '../helpers/validators';
import { OrangeSubmitButton } from '../components/buttons/buttons';
import { signInPassword, signInFacebook, compileUser } from './commonAuth';

class _AppSignin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      message: '',
      pic_url: '',
      courses: '',
      redirectToReferrer: false,
    };

    this.publisherID = null;
  }

  componentDidMount() {
    // console.log('params in signin: ', this.props.match.params);
    if (this.props.match.params.id) {
      this.publisherID = this.props.match.params.id;
    }
    const location = (this.props.history && this.props.history.location) || {};
    if (location.state && location.state.soundcast) {
      const { soundcast, soundcastID, checked, sumTotal, soundcastUser } = location.state;
      this.setState({ soundcast, soundcastID, checked, sumTotal, soundcastUser });
    }
  }

  signInClick() {
    const { email, password, soundcastUser } = this.state;
    const { signinUser, history, match } = this.props;
    signInPassword(
      email,
      password,
      user => {
        console.log('Success signInPassword', user);
        signinUser(user);
        if (history.location.state && history.location.state.soundcast) {
          compileUser(user, signinUser);
          history.push('/soundcast_checkout', {
            soundcast: history.location.state.soundcast,
            soundcastID: history.location.state.soundcastID,
            checked: history.location.state.checked,
            sumTotal: history.location.state.sumTotal,
            userInfo: user,
            soundcastUser,
          });
        } else if (user.admin && !match.params.id) {
          compileUser(user, signinUser);
          history.push('/dashboard/soundcasts');
        } else if (match.params.id) {
          this.signInInvitedAdmin(match, history);
        } else if (user.courses) {
          compileUser(user, signinUser);
          history.push('/myprograms');
        } else {
          compileUser(user, signinUser);
          history.push('/mysoundcasts');
        }
      },
      error => this.setState({ message: error.toString() })
    );
  }

  signInInvitedAdmin() {
    const { signinUser, history, match } = this.props;
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        const userId = user.uid;
        firebase
          .database()
          .ref(`publishers/${match.params.id}/administrators/${userId}`)
          .set(true);
        firebase
          .database()
          .ref(`publishers/${match.params.id}/soundcasts`)
          .once('value')
          .then(snapshot => {
            firebase
              .database()
              .ref(`users/${userId}/soundcasts_managed`)
              .set(snapshot.val());
            firebase
              .database()
              .ref(`users/${userId}/admin`)
              .set(true);
            firebase
              .database()
              .ref(`users/${userId}/publisherID`)
              .set(match.params.id);
            console.log('completed adding publisher to invited admin');
          })
          .then(() => {
            firebase
              .database()
              .ref(`users/${userId}`)
              .on('value', snapshot => {
                compileUser(snapshot.val(), signinUser);
              });
          })
          .then(() => {
            history.push('/dashboard/soundcasts');
          });
      } else {
        // alert('profile saving failed. Please try again later.');
        // Raven.captureMessage('invited admin saving failed!')
      }
    });
  }

  handleFBAuth() {
    const { signinUser, history, match } = this.props;
    const { soundcastUser } = this.state;
    signInFacebook(
      user => {
        console.log('Success signInFacebook', user);
        if (user && user.firstName) {
          // if user already exists
          signinUser(user);
          if (history.location.state && history.location.state.soundcast) {
            compileUser(user, signinUser);
            history.push('/soundcast_checkout', {
              soundcast: history.location.state.soundcast,
              soundcastID: history.location.state.soundcastID,
              checked: history.location.state.checked,
              sumTotal: history.location.state.sumTotal,
              soundcastUser,
            });
          } else if (user.admin && !match.params.id) {
            compileUser(user, signinUser);
            history.push('/dashboard/soundcasts');
          } else if (match.params.id) {
            this.signInInvitedAdmin(match, history);
          } else {
            history.push('/myprograms');
          }
        } else {
          //if it's a new user
          // const { email, photoURL: pic_url, displayName } = result.user;
          // const name = displayName.split(' ');
          // const _userToRegister = {
          //   firstName: name[0],
          //   lastName: name[1],
          //   email,
          //   pic_url,
          // };
          //
          // firebase.database().ref('users/' + userId).set(_userToRegister);
          // signinUser(_userToRegister);
          // // from login page now register subscribers by default
          // history.push('/myprograms');
          alert(
            'You don’t have a Soundwise account. Please create or sign up for a soundcast to get started.'
          );
          if (match.params.id) {
            history.push(`/signup/admin/${match.params.id}`);
          } else {
            history.push('/signup_options');
          }
        }
      },
      error => this.setState({ message: error.toString() })
    );
  }

  handleChange(field, e) {
    this.setState({ [field]: e.target.value });
  }

  render() {
    const {
      firstName,
      lastName,
      email,
      password,
      checked,
      redirectToReferrer,
      message,
      soundcast,
      sumTotal,
    } = this.state;
    const { from } = this.props.location.state || {
      from: { pathname: '/courses' },
    };
    const { history } = this.props;

    if (redirectToReferrer) {
      return <Redirect to={from} />;
    }
    return (
      <div className="row" style={{ ...styles.row, height: window.innerHeight, overflow: 'auto' }}>
        {(soundcast && (
          <div className="col-lg-8 col-md-12 col-sm-12 col-xs-12 center-col">
            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12  text-center">
              <img
                className="hidden-xs"
                alt="Soundwise Logo"
                src={soundcast.imageURL}
                style={{ ...styles.logo, height: 120 }}
              />
              <div style={styles.containerWrapper}>
                <div style={styles.container} className="center-col text-center">
                  <div
                    style={{
                      ...styles.title,
                      fontSize: 20,
                      lineHeight: 'normal',
                    }}
                  >
                    {soundcast.title}
                  </div>
                  <button
                    onClick={() => this.handleFBAuth()}
                    className="text-white btn btn-medium propClone btn-3d width-60 builder-bg tz-text bg-blue tz-background-color"
                    style={styles.fb}
                  >
                    <i
                      className="fab fa-facebook-f icon-extra-small margin-four-right tz-icon-color vertical-align-sub"
                      style={styles.fbIcon}
                    />
                    <span className="tz-text">SIGN IN with FACEBOOK</span>
                  </button>
                  <hr />
                  <span style={styles.withEmailText}>or with email</span>
                </div>
                <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <GreyInput
                    type="email"
                    styles={{}}
                    wrapperStyles={styles.inputTitleWrapper}
                    placeholder={'Email'}
                    onChange={this.handleChange.bind(this, 'email')}
                    value={email}
                    validators={[minLengthValidator.bind(null, 1)]}
                  />
                  <GreyInput
                    type="password"
                    styles={{}}
                    wrapperStyles={styles.inputTitleWrapper}
                    placeholder={'Password'}
                    onChange={this.handleChange.bind(this, 'password')}
                    value={password}
                    validators={[minLengthValidator.bind(null, 1)]}
                  />
                  <div>
                    <span style={{ color: 'red', fontSize: 16 }}>{message}</span>
                  </div>
                  <OrangeSubmitButton
                    styles={{ marginTop: 15, marginBottom: 15 }}
                    label="Get Access"
                    onClick={this.signInClick.bind(this)}
                  />
                  <div
                    style={{
                      fontSize: 14,
                      textDecoration: 'underline',
                      marginBottom: 20,
                    }}
                  >
                    <Link to="/password_reset">Forgot your password? </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
              <div
                className="margin-twenty-one-top sm-margin-nineteen-top title-medium text-dark-gray"
                style={{ paddingBottom: 35, textAlign: 'center' }}
              >
                <span>{soundcast.title}</span>
              </div>
              <div
                style={{ marginBottom: 20, fontSize: 15 }}
                className="text-large text-center text-dark-gray"
              >
                {soundcast.short_description}
              </div>
              <ul
                className=""
                style={{
                  paddingBottom: '1em',
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              >
                {soundcast.features &&
                  soundcast.features.map((feature, i) => {
                    return (
                      <li
                        key={i}
                        className=" text-dark-gray text-large  margin-lr-auto col-md-12 col-sm-12 col-xs-12 tz-text"
                        style={{
                          paddingLeft: '0em',
                          paddingRight: '1em',
                          paddingTop: '1em',
                          paddingBottom: '1em',
                          listStyleType: 'none',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ paddingRight: 10 }}>⭐</span>
                        {feature}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        )) || (
          <div className="col-lg-4 col-md-6 col-sm-8 col-xs-12 center-col text-center">
            <img
              className="hidden-xs"
              alt="Soundwise Logo"
              src="/images/soundwiselogo.svg"
              style={styles.logo}
            />
            <div style={styles.containerWrapper}>
              <div style={styles.container} className="center-col text-center">
                <div style={{ ...styles.title, lineHeight: 'normal' }}>
                  {(history.location.state && history.location.state.text) || 'Hello!'}
                </div>
                <button
                  onClick={() => this.handleFBAuth()}
                  className="text-white btn btn-medium propClone btn-3d width-60 builder-bg tz-text bg-blue tz-background-color"
                  style={styles.fb}
                >
                  <i
                    className="fab fa-facebook-f icon-extra-small margin-four-right tz-icon-color vertical-align-sub"
                    style={styles.fbIcon}
                  />
                  <span className="tz-text">SIGN IN with FACEBOOK</span>
                </button>
                <hr />
                <span style={styles.withEmailText}>or with email</span>
              </div>
              <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <GreyInput
                  type="email"
                  styles={{}}
                  wrapperStyles={styles.inputTitleWrapper}
                  placeholder={'Email'}
                  onChange={this.handleChange.bind(this, 'email')}
                  value={email}
                  validators={[minLengthValidator.bind(null, 1)]}
                />
                <GreyInput
                  type="password"
                  styles={{}}
                  wrapperStyles={styles.inputTitleWrapper}
                  placeholder={'Password'}
                  onChange={this.handleChange.bind(this, 'password')}
                  onKeyPress={e => {
                    e.key === 'Enter' && this.signInClick.bind(this)();
                  }}
                  value={password}
                  validators={[minLengthValidator.bind(null, 1)]}
                />
                <div>
                  <span style={{ color: 'red', fontSize: 16 }}>{message}</span>
                </div>
                <OrangeSubmitButton
                  id="appSigninBtnTest"
                  styles={{ marginTop: 15, marginBottom: 15 }}
                  label="SIGN IN"
                  onClick={this.signInClick.bind(this)}
                />
                <div style={{ fontSize: 14, textDecoration: 'underline' }}>
                  <Link to="/password_reset">Forgot your password? </Link>
                </div>
                <div style={{ marginBottom: 10, marginTop: 15 }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
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
  },
  container: {
    backgroundColor: Colors.mainWhite,
  },
  title: {
    paddingTop: 20,
    fontSize: 32,
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
    right: '10%',
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
    marginTop: 40,
    marginBottom: 20,
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
    fontSize: 14,
    marginBottom: 0,
    marginTop: 0,
    position: 'relative',
    top: 10,
  },
  greyInputText: {
    fontSize: 14,
  },
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ signinUser }, dispatch);
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  return { userInfo, isLoggedIn };
};

const AppSignin_worouter = connect(
  mapStateToProps,
  mapDispatchToProps
)(_AppSignin);

export const AppSignin = withRouter(AppSignin_worouter);
