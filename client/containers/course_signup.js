// ** not in use
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import Axios from 'axios';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { orange500, blue500 } from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Link, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';

import {
  signupUser,
  signinUser,
  openSignupbox,
  openConfirmationbox,
  addCourseToCart,
} from '../actions/index';
import AddCourseToUser from '../helpers/add_course_to_user';
import { facebookErrorCallback } from './commonAuth';

var provider = new firebase.auth.FacebookAuthProvider();

const styles = {
  errorStyle: {
    color: orange500,
  },
  underlineStyle: {
    borderColor: orange500,
  },
  floatingLabelStyle: {
    color: orange500,
  },
  floatingLabelFocusStyle: {
    color: blue500,
  },
  table: {
    width: '100%',
    justifyContent: 'center',
    // paddingLeft: '10%',
    // paddingRight: '10%'
  },
  button: {
    backgroundColor: '#F76B1C',
  },
  headerText: {
    color: '#61E1FB',
  },
  error: {
    color: 'red',
  },
  dialog: {
    width: '100%',
    maxWidth: 'none',
    height: '100%',
  },
};

class _CourseSignup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      pic_url: '../images/smiley_face.jpg',
      response: '',
      renderSignup: true,
      message: '',
    };
    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.signupForm = this.signupForm.bind(this);
    this.switchForm = this.switchForm.bind(this);
    this.handleSignupOrLogin = this.handleSignupOrLogin.bind(this);
    this.handleFBSignin = this.handleFBSignin.bind(this);
    this.handleFBSignup = this.handleFBSignup.bind(this);
    this.addCourseToUser = AddCourseToUser.bind(this);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  switchForm() {
    const current = this.state.renderSignup;
    this.setState({
      renderSignup: !current,
    });
  }

  async signUp() {
    const { firstName, lastName, email, password, pic_url } = this.state;
    const that = this;

    if (firstName.length < 1 || lastName.length < 1) {
      alert('Please enter your name!');
    } else if (email.indexOf('@') < 0) {
      alert('Please enter a valid email!');
    } else if (password.length < 1) {
      alert('Please enter a passowrd!');
    }

    try {
      await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);

      this.setState({
        response: 'account created',
      });

      const userId = firebase.auth().currentUser.uid;
      firebase
        .database()
        .ref('users/' + userId)
        .set({
          firstName,
          lastName,
          email,
          pic_url,
        });

      this.props.signupUser({ firstName, lastName, email, pic_url, password });
      this.props.openSignupbox(false);

      if (that.props.course.price == 0) {
        that.addCourseToUser();
      } else {
        that.props.addCourseToCart(that.props.course);
        that.props.history.push('/cart');
      }
    } catch (error) {
      this.setState({
        response: error.toString(),
      });
      console.log(error.toString());
    }
  }

  signIn() {
    let { firstName, lastName, email, password, pic_url } = this.state;
    const that = this;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        firebase.auth().onAuthStateChanged(user => {
          const userId = user.uid;

          firebase
            .database()
            .ref('users/' + userId)
            .once('value')
            .then(snapshot => {
              (firstName = snapshot.val().firstName),
                (lastName = snapshot.val().lastName),
                (email = snapshot.val().email);
              if (snapshot.val().pic_url) {
                pic_url = snapshot.val().pic_url;
              }
              that.props.signinUser({ firstName, lastName, email, pic_url });

              that.props.openSignupbox(false);
              that.setState({
                firstName,
                lastName,
                email,
                pic_url,
              });

              if (that.props.course.price == 0) {
                that.addCourseToUser();
              } else {
                that.props.addCourseToCart(that.props.course);
                that.props.history.push('/cart');
              }
            });
        });
      })
      .catch(error => {
        this.setState({
          response: error.toString(),
        });
        console.log(error.toString());
      });
  }

  signupForm() {
    const { firstName, lastName, email, password } = this.state;
    return (
      <div style={styles.table}>
        <section className=" bg-white builder-bg" id="subscribe-section6">
          <div className="">
            <div className="row">
              <div className="col-md-8 center-col col-sm-12 text-center">
                <h3
                  className="title-extra-large-2 alt-font xs-title-large  margin-four-bottom tz-text"
                  style={styles.headerText}
                >
                  Sign Up for the Course
                </h3>
                <div className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-four-bottom  tz-text">
                  Already have a Soundwise account?{' '}
                  <a onClick={() => this.switchForm()} className="text-decoration-underline">
                    Log in here.
                  </a>
                </div>
              </div>
              <div
                className="col-md-6 col-sm-11 col-xs-11 center-col text-center"
                style={{ padding: '1em', margin: '1em' }}
              >
                <button
                  onClick={() => this.handleFBSignup()}
                  className="text-white btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text bg-blue tz-background-color"
                >
                  <i className="fa fa-facebook icon-medium margin-four-right tz-icon-color vertical-align-sub" />
                  <span className="tz-text">Sign up with Facebook</span>
                </button>
              </div>
              <div className="col-md-6 center-col col-sm-12 text-center">
                <div className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col  tz-text">
                  Or
                </div>
                <h4 className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text">
                  Sign up with email
                </h4>
              </div>
              <div className="col-md-6 center-col col-sm-12 text-center">
                <input
                  onChange={this.handleChange}
                  value={firstName}
                  type="text"
                  name="firstName"
                  id="fname"
                  data-email="required"
                  placeholder="First Name"
                  className="big-input bg-light-gray alt-font border-radius-4"
                />
                <input
                  onChange={this.handleChange}
                  value={lastName}
                  type="text"
                  name="lastName"
                  id="lname"
                  data-email="required"
                  placeholder="Last Name"
                  className="big-input bg-light-gray alt-font border-radius-4"
                />
                <input
                  onChange={this.handleChange}
                  value={email}
                  type="email"
                  name="email"
                  id="email"
                  data-email="required"
                  placeholder="Email"
                  className="big-input bg-light-gray alt-font border-radius-4"
                />
                <input
                  onChange={this.handleChange}
                  value={password}
                  type="password"
                  name="password"
                  id="password"
                  data-email="required"
                  placeholder="Password"
                  className="big-input bg-light-gray alt-font border-radius-4"
                />
                <div style={styles.error}>{this.state.response}</div>
                <div className="margin-seven-top text-small2 sm-width-100 center-col tz-text xs-line-height-20">
                  * We don't share your personal info with anyone. Check out our{' '}
                  <a href="#" className="text-decoration-underline tz-text">
                    Privacy Policy
                  </a>{' '}
                  for more information.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  loginForm() {
    const { email, password } = this.state;
    return (
      <section className=" bg-white builder-bg" id="subscribe-section6">
        <div className="">
          <div className="row">
            <div className="col-md-8 center-col col-sm-12 text-center">
              <h2
                className="title-extra-large-2 alt-font xs-title-large  margin-four-bottom tz-text"
                style={styles.headerText}
              >
                Log In to Take the Course
              </h2>
              <div className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-four-bottom tz-text">
                Need a Soundwise account?{' '}
                <a onClick={() => this.switchForm()} className="text-decoration-underline">
                  Get started here.
                </a>
              </div>
            </div>
            <div
              className="col-md-6 col-sm-11 col-xs-11 center-col text-center"
              style={{ padding: '1.5em', margin: '2em' }}
            >
              <button
                onClick={() => this.handleFBSignin()}
                className="text-white btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text bg-blue tz-background-color"
              >
                <i className="fa fa-facebook icon-medium margin-four-right tz-icon-color vertical-align-sub" />
                <span className="tz-text">Log in with Facebook</span>
              </button>
            </div>
            <div className="col-md-6 center-col col-sm-12 text-center">
              <div className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col  tz-text">
                Or
              </div>
              <h4 className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text">
                Log in with email
              </h4>
            </div>
            <div className="col-md-6 center-col col-sm-12 text-center">
              <input
                onChange={this.handleChange}
                value={email}
                type="email"
                name="email"
                id="email"
                data-email="required"
                placeholder="Email"
                className="big-input bg-light-gray alt-font border-radius-4"
              />
              <input
                onChange={this.handleChange}
                value={password}
                type="password"
                name="password"
                id="password"
                data-email="required"
                placeholder="Password"
                className="big-input bg-light-gray alt-font border-radius-4"
              />
              <div className="pull-right">
                <a href="https://mysoundwise.com/password_reset" target="_blank">
                  Forgot your password?
                </a>
              </div>
              <div style={styles.error}>{this.state.response}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  handleFBSignin() {
    const that = this;
    // firebase.auth().signInWithRedirect(provider)

    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        // The signed-in user info.
        const userId = firebase.auth().currentUser.uid;
        firebase
          .database()
          .ref('users/' + userId)
          .once('value')
          .then(snapshot => {
            if (snapshot.val().firstName !== undefined) {
              // if user already exists
              const firstName = snapshot.val().firstName;
              const lastName = snapshot.val().lastName;
              const email = snapshot.val().email;
              const pic_url = result.user.photoURL;
              const courses = snapshot.val().courses || {};

              let updates = {};
              updates['/users/' + userId + '/pic_url/'] = pic_url;
              firebase
                .database()
                .ref()
                .update(updates);

              that.props.signinUser({
                firstName,
                lastName,
                email,
                pic_url,
                courses,
              });

              if (that.props.course.price == 0) {
                that.addCourseToUser();
              } else {
                that.props.addCourseToCart(that.props.course);
                that.props.history.push('/cart');
              }

              that.props.openSignupbox(false);
            } else {
              //if it's a new user
              const user = result.user;
              const email = user.email;
              const pic_url = result.user.photoURL;
              const name = user.displayName.split(' ');
              const firstName = name[0];
              const lastName = name[1];
              const courses = {};

              firebase
                .database()
                .ref('users/' + userId)
                .set({
                  firstName,
                  lastName,
                  email,
                  pic_url,
                  courses,
                });

              that.props.signinUser({
                firstName,
                lastName,
                email,
                pic_url,
                courses,
              });

              if (that.props.course.price == 0) {
                that.addCourseToUser();
              } else {
                that.props.addCourseToCart(that.props.course);
                that.props.history.push('/cart');
              }

              that.props.openSignupbox(false);
            }
          });
      })
      .catch(error => {
        facebookErrorCallback(error, () => {
          // Facebook account successfully linked to the existing Firebase user.
          const userId = firebase.auth().currentUser.uid;
          firebase
            .database()
            .ref('users/' + userId)
            .once('value')
            .then(snapshot => {
              const { firstName, lastName, email, pic_url, courses } = snapshot.val() || {};
              // if(!courses) {
              //   firebase.database().ref('users/' + userId).set({
              //     courses: {}
              //   })
              // }
              that.props.signinUser({
                firstName,
                lastName,
                email,
                pic_url,
                courses,
              });
              if (that.props.course.price == 0) {
                that.addCourseToUser();
              } else {
                that.props.addCourseToCart(that.props.course);
                that.props.history.push('/cart');
              }
              that.props.openSignupbox(false);
            });
        });
      });
  }

  handleFBSignup() {
    const that = this;

    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        // The signed-in user info.
        const user = result.user;
        const email = user.email;
        const pic_url = result.user.photoURL;
        const name = user.displayName.split(' ');
        const firstName = name[0];
        const lastName = name[1];

        const userId = firebase.auth().currentUser.uid;
        firebase
          .database()
          .ref('users/' + userId)
          .set({
            firstName,
            lastName,
            email,
            pic_url,
          });

        that.props.signupUser({ firstName, lastName, email, pic_url });

        if (that.props.course.price == 0) {
          that.addCourseToUser();
        } else {
          that.props.addCourseToCart(that.props.course);
          that.props.history.push('/cart');
        }

        that.props.openSignupbox(false);
      })
      .catch(error => {
        facebookErrorCallback(error, () => {
          // Facebook account successfully linked to the existing Firebase user.
          const userId = firebase.auth().currentUser.uid;
          firebase
            .database()
            .ref('users/' + userId)
            .once('value')
            .then(snapshot => {
              const { firstName, lastName, email, pic_url } = snapshot.val() || {};
              that.props.signupUser({ firstName, lastName, email, pic_url });
              if (that.props.course.price == 0) {
                that.addCourseToUser();
              } else {
                that.props.addCourseToCart(that.props.course);
                that.props.history.push('/cart');
              }
              that.props.openSignupbox(false);
            });
        });
      });
  }

  handleClose() {
    if (this.props.signupFormOpen) {
      this.props.openSignupbox(false);
    } else if (this.props.confirmationBoxOpen) {
      this.props.openConfirmationbox(false);
    }
  }

  handleSignupOrLogin() {
    if (this.state.renderSignup) {
      this.signUp();
    } else {
      this.signIn();
    }
  }

  signupDialog() {
    const actions = [
      <FlatButton
        label="SUBMIT"
        primary={true}
        keyboardFocused={true}
        onTouchTap={() => this.handleSignupOrLogin()}
      />,
      <FlatButton
        label="CANCEL"
        primary={false}
        keyboardFocused={true}
        onTouchTap={() => this.handleClose()}
      />,
    ];
    return (
      <MuiThemeProvider>
        <Dialog
          // title="Get Started"
          actions={actions}
          modal={false}
          open={this.props.signupFormOpen}
          contentStyle={styles.dialog}
          autoScrollBodyContent={true}
          onRequestClose={() => this.handleClose()}
        >
          {this.state.renderSignup ? this.signupForm() : this.loginForm()}
        </Dialog>
      </MuiThemeProvider>
    );
  }

  render() {
    if (this.state.redirectToCheckout) {
      return <Redirect to="/checkout" />;
    }

    return <div>{this.signupDialog()}</div>;
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      signupUser,
      signinUser,
      openConfirmationbox,
      openSignupbox,
      addCourseToCart,
    },
    dispatch
  );
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  const { signupFormOpen, confirmationBoxOpen } = state.signupBox;
  return {
    userInfo,
    isLoggedIn,
    signupFormOpen,
    confirmationBoxOpen,
  };
};

const CourseSignup_worouter = connect(
  mapStateToProps,
  mapDispatchToProps
)(_CourseSignup);

export const CourseSignup = withRouter(CourseSignup_worouter);
