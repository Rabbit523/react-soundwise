import React, { Component } from 'react';
import Axios from 'axios';

import { SoundwiseHeader } from './soundwise_header';

export default class Referral extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      friendFirstName1: '',
      friendLastName1: '',
      friendEmail1: '',
      friendFirstName2: '',
      friendLastName2: '',
      friendEmail2: '',
      friendFirstName3: '',
      friendLastName3: '',
      friendEmail3: '',
      error: '',
      submitted: false,
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
    const that = this;
    const friends = [];
    const {
      friendFirstName1,
      friendLastName1,
      friendEmail1,
      friendFirstName2,
      friendLastName2,
      friendEmail2,
      friendFirstName3,
      friendLastName3,
      friendEmail3,
    } = this.state;

    if (friendFirstName1 && friendEmail1) {
      friends.push({
        firstName: friendFirstName1,
        lastName: friendLastName1,
        email: friendEmail1,
      });
    }
    if (friendFirstName2 && friendEmail2) {
      friends.push({
        firstName: friendFirstName2,
        lastName: friendLastName2,
        email: friendEmail2,
      });
    }
    if (friendFirstName3 && friendEmail3) {
      friends.push({
        firstName: friendFirstName3,
        lastName: friendLastName3,
        email: friendEmail3,
      });
    }

    if (friends.length === 0) {
      this.setState({
        error: 'please enter at least one friend',
      });
    } else if (this.state.firstName.length == 0) {
      this.setState({
        error: 'please enter your name',
      });
    } else {
      Axios.post('/api/referral', {
        //handle mailchimp api call
        friends,
        firstName: that.state.firstName,
        lastName: that.state.lastName,
      })
        .then(() => {
          that.setState({
            submitted: true,
          });
        })
        .catch(err => {
          that.setState({
            error: 'Oops! Something went wrong. Please try again.',
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
            id="contact-section2"
          >
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                  <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font tz-text margin-ten-bottom xs-margin-fifteen-bottom">
                    SUCCESS! THANKS!
                  </h2>
                </div>
              </div>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div>
        <SoundwiseHeader />
        <section
          className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb"
          id="contact-section2"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font tz-text margin-ten-bottom xs-margin-fifteen-bottom">
                  GIFT A SOUNDWISE COURSE TO FRIENDS. IT'S FREE!
                </h2>
                <h3 className="text-extra-large sm-text-extra-large font-weight-500 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text text-dark-gray">
                  We'll send a 100% off coupon for Soundwise pilot courses to your friends on your
                  behalf.
                </h3>
              </div>
              <div className="col-md-12 col-sm-12 center-col contact-form-style2 no-padding row">
                <div className="col-md-6 col-sm-6 col-xs-12">
                  <input
                    onChange={this.handleChange}
                    name="firstName"
                    type="text"
                    data-email="required"
                    placeholder="Your first name"
                    className="medium-input "
                  />
                </div>
                <div className="col-md-6 col-sm-6 col-xs-12">
                  <input
                    onChange={this.handleChange}
                    name="lastName"
                    type="text"
                    data-email="required"
                    placeholder="Your last name"
                    className="medium-input"
                  />
                </div>
              </div>

              <div className="col-md-12 col-sm-12 center-col contact-form-style2 ">
                <h2 className="text-large text-dark-gray font-weight-600 alt-font margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                  Friend 1:
                </h2>
                <div className="row">
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <input
                      onChange={this.handleChange}
                      name="friendFirstName1"
                      type="text"
                      data-email="required"
                      placeholder="First name"
                      className="medium-input "
                      style={{}}
                    />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <input
                      onChange={this.handleChange}
                      name="friendLastName1"
                      type="text"
                      data-email="required"
                      placeholder="Last name"
                      className="medium-input "
                    />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <input
                      onChange={this.handleChange}
                      name="friendEmail1"
                      type="text"
                      data-email="required"
                      placeholder="Email"
                      className="medium-input "
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12 col-sm-12 center-col contact-form-style2 ">
                <h2 className="text-large text-dark-gray font-weight-600 alt-font margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                  Friend 2:
                </h2>
                <div className="row">
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <input
                      onChange={this.handleChange}
                      name="friendFirstName2"
                      type="text"
                      data-email="required"
                      placeholder="First name"
                      className="medium-input "
                      style={{}}
                    />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <input
                      onChange={this.handleChange}
                      name="friendLastName2"
                      type="text"
                      data-email="required"
                      placeholder="Last name"
                      className="medium-input "
                    />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <input
                      onChange={this.handleChange}
                      name="friendEmail2"
                      type="text"
                      data-email="required"
                      placeholder="Email"
                      className="medium-input "
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12 col-sm-12 center-col contact-form-style2 ">
                <h2 className="text-large text-dark-gray font-weight-600 alt-font margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                  Friend 3:
                </h2>
                <div className="row">
                  <div className="col-md-4 col-sm-4 col-xs-12 text-dark-gray">
                    <input
                      onChange={this.handleChange}
                      name="friendFirstName3"
                      type="text"
                      data-email="required"
                      placeholder="First name"
                      className="medium-input "
                      style={{}}
                    />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <input
                      onChange={this.handleChange}
                      name="friendLastName3"
                      type="text"
                      data-email="required"
                      placeholder="Last name"
                      className="medium-input "
                    />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <input
                      onChange={this.handleChange}
                      name="friendEmail3"
                      type="text"
                      data-email="required"
                      placeholder="Email"
                      className="medium-input "
                    />
                  </div>
                </div>
              </div>

              <div
                className="col-md-12 col-sm-12 center-col contact-form-style2 "
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div style={{ color: 'red' }}>{this.state.error}</div>
                <button
                  onClick={this.handleSubmit}
                  className="contact-submit btn-large btn bg-orange text-white tz-text"
                  type="submit"
                >
                  SUBMIT
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
