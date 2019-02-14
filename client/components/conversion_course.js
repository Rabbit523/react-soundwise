import React, { Component } from 'react';
import Axios from 'axios';

import { SoundwiseHeader } from './soundwise_header';
import Footer from './footer';
import Colors from '../styles/colors';

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

export default class ConversionCourse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      firstName: '',
      lastName: '',
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
    const { email, firstName, lastName, submitted } = this.state;
    const that = this;
    if (!submitted) {
      Axios.post('/api/add_emails', {
        emailListId: 3921133,
        emailAddressArr: [{ firstName, lastName, email }],
      })
        .then(listId => {
          that.setState({
            submitted: true,
          });
        })
        .catch(err => {
          that.setState({
            error: 'Hmm...something went wrong. Please refresh the page and try again.',
          });
        });
    }
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
                    Success! We'll let you know when the course enrollment opens!
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
            className="padding-70px-tb xs-padding-60px-tb bg-white builder-bg"
            id="subscribe-section6"
          >
            <div className="container">
              <div className="row">
                <div className="col-md-12 center-col col-sm-12 text-center">
                  <h2
                    className="title-extra-large-5 sm-title-extra-large-2 font-weight-700 alt-font   margin-four-bottom tz-text"
                    style={styles.headerText}
                  >
                    THE PODCAST CONVERSION MASTER COURSE
                  </h2>
                  <div className="title-large sm-title-extra-large  width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text">
                    Learn how to turn more of your podcast listeners into customers...without being
                    pushy.
                  </div>
                </div>
                <div className="col-md-8 center-col col-sm-12 text-center">
                  <div
                    style={{ color: Colors.mainGreen }}
                    className="title-extra-large sm-title-extra-large-2 XS-title-extra-large font-weight-600 width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text"
                  >
                    Get on the waitlist and be notified when the course enrollment opens:
                  </div>
                  <input
                    onChange={this.handleChange}
                    value={this.state.firstName}
                    type="text"
                    name="firstName"
                    id="firstName"
                    data-email="required"
                    placeholder="First Name"
                    className="big-input bg-light-gray alt-font border-radius-4"
                  />
                  <input
                    onChange={this.handleChange}
                    value={this.state.lastName}
                    type="text"
                    name="lastName"
                    id="lastName"
                    data-email="required"
                    placeholder="Last Name"
                    className="big-input bg-light-gray alt-font border-radius-4"
                  />
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
                    Notify me when enrollment opens
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
