import React, { Component } from 'react';
import * as firebase from 'firebase';

import { SoundwiseHeader } from './soundwise_header';
import Footer from './footer';

const styles = {
  button: {
    backgroundColor: '#F76B1C',
  },
  headerText: {
    color: '#F76B1C',
  },
  error: {
    color: 'red',
  },
};

export default class PassRecovery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      submitted: false,
      error: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit() {
    const auth = firebase.auth();
    const { email } = this.state;
    const that = this;

    auth.sendPasswordResetEmail(email).then(
      function() {
        that.setState({
          submitted: true,
        });
      },
      function(error) {
        that.setState({
          error: 'Failed to send password reset email. Did you enter a valid email?',
        });
      }
    );
  }

  render() {
    if (this.state.submitted) {
      return (
        <div>
          <SoundwiseHeader showIcon={true} />
          <section
            className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb"
            id="feature-section14"
          >
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                  <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                    PASSWORD RESET EMAIL SENT
                  </h2>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </div>
      );
    } else {
      return (
        <div>
          <SoundwiseHeader showIcon={true} />
          <section
            className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg"
            id="subscribe-section6"
          >
            <div className="container">
              <div className="row">
                <div className="col-md-8 center-col col-sm-12 text-center">
                  <h2
                    className="title-extra-large-2 alt-font xs-title-large  margin-four-bottom tz-text"
                    style={styles.headerText}
                  >
                    Forgot your password?
                  </h2>
                  <div className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text">
                    If you forgot your password, please enter the email address associated with your
                    account to reset your password.
                  </div>
                </div>
                <div className="col-md-6 center-col col-sm-12 text-center">
                  <input
                    onChange={this.handleChange}
                    value={this.state.email}
                    type="email"
                    name="email"
                    id="email"
                    data-email="required"
                    placeholder="Email"
                    className="big-input bg-light-gray alt-font border-radius-4"
                  />
                  <button
                    onClick={this.handleSubmit}
                    type="submit"
                    className="contact-submit btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text"
                    style={styles.button}
                  >
                    Send reset email
                  </button>
                  <div style={styles.error}>{this.state.error}</div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </div>
      );
    }
  }
}
