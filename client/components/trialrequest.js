import React, { Component } from 'react';
import Axios from 'axios';

export default class TrialRequest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      title: '',
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

    const { firstName, lastName, email, phone, company, title } = this.state;

    if (firstName.length === 0) {
      this.setState({
        error: 'please enter your first name',
      });
    } else if (lastName.length == 0) {
      this.setState({
        error: 'please enter your last name',
      });
    } else if (email.length == 0) {
      this.setState({
        error: 'please enter your email',
      });
    } else if (phone.length == 0) {
      this.setState({
        error: 'please enter your phone number',
      });
    } else if (company.length == 0) {
      this.setState({
        error: 'please enter your company name',
      });
    } else if (title.length == 0) {
      this.setState({
        error: 'please enter your job title',
      });
    } else {
      Axios.post('/api/trial_request', {
        //handle mailchimp api call
        firstName,
        lastName,
        email,
        phone,
        company,
        title,
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
          <section
            className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb"
            id="contact-section2"
          >
            <div className="container">
              <div className="row">
                <div className="col-md-3 text-center center-col margin-five-bottom xs-margin-ten-bottom">
                  <img
                    alt="Soundwise Logo"
                    src="/images/soundwiselogo.svg"
                    data-img-size="(W)163px X (H)39px"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                  <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font tz-text margin-ten-bottom xs-margin-fifteen-bottom">
                    Thanks for submitting your free trial request. We'll be in touch shortly.
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
        <section
          className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb"
          id="contact-section2"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-3 text-center center-col margin-five-bottom xs-margin-ten-bottom">
                <img
                  alt="Soundwise Logo"
                  src="/images/soundwiselogo.svg"
                  data-img-size="(W)163px X (H)39px"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font tz-text margin-three-bottom xs-margin-five-bottom">
                  SIGN UP FOR A SOUNDWISE FREE TRIAL
                </h2>
                <h3 className="text-extra-large sm-text-extra-large font-weight-500 margin-three-bottom xs-margin-five-bottom display-block tz-text text-dark-gray">
                  Please fill out the form below
                </h3>
              </div>

              <div className="col-md-12 col-sm-12 center-col contact-form-style2 ">
                <div className="col-md-6 center-col col-sm-12 ">
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <h2 className="text-large text-dark-gray font-weight-600 alt-font margin-three-bottom sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                      First Name
                    </h2>
                    <input
                      onChange={this.handleChange}
                      name="firstName"
                      type="text"
                      data-email="required"
                      placeholder="First name"
                      className="big-input bg-light-gray alt-font border-radius-4"
                      style={{}}
                    />
                  </div>
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <h2 className="text-large text-dark-gray font-weight-600 alt-font margin-three-bottom sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                      Last Name
                    </h2>
                    <input
                      onChange={this.handleChange}
                      name="lastName"
                      type="text"
                      data-email="required"
                      placeholder="Last name"
                      className="big-input bg-light-gray alt-font border-radius-4"
                    />
                  </div>
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <h2 className="text-large text-dark-gray font-weight-600 alt-font margin-three-bottom sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                      Email Address
                    </h2>
                    <input
                      onChange={this.handleChange}
                      name="email"
                      type="text"
                      data-email="required"
                      placeholder="Email"
                      className="big-input bg-light-gray alt-font border-radius-4"
                    />
                  </div>
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <h2 className="text-large text-dark-gray font-weight-600 alt-font margin-three-bottom sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                      Phone Number
                    </h2>
                    <input
                      onChange={this.handleChange}
                      name="phone"
                      type="text"
                      data-email="required"
                      placeholder="Phone number"
                      className="big-input bg-light-gray alt-font border-radius-4"
                    />
                  </div>
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <h2 className="text-large text-dark-gray font-weight-600 alt-font margin-three-bottom sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                      Company Name
                    </h2>
                    <input
                      onChange={this.handleChange}
                      name="company"
                      type="text"
                      data-email="required"
                      placeholder="Company name"
                      className="big-input bg-light-gray alt-font border-radius-4"
                    />
                  </div>
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <h2 className="text-large text-dark-gray font-weight-600 alt-font margin-three-bottom sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                      Job Title
                    </h2>
                    <input
                      onChange={this.handleChange}
                      name="title"
                      type="text"
                      data-email="required"
                      placeholder="Job title"
                      className="big-input bg-light-gray alt-font border-radius-4"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-12 col-sm-12 center-col contact-form-style2 ">
              <div className="row col-md-12 text-center" style={{ color: 'red' }}>
                {this.state.error}
              </div>
              <div className="col-md-12 center-col text-center">
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
