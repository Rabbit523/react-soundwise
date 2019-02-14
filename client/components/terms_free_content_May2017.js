import React, { Component } from 'react';
import Checkbox from 'material-ui/Checkbox';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as firebase from 'firebase';

import { SoundwiseHeader } from './soundwise_header';
import Footer from './footer';

const styles = {
  checkbox: {
    marginBottom: '16px',
    fontSize: '18px',
  },
};

export default class TermsFreeContent extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      email: '',
      error: '',
      submitted: false,
      checked: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleCheck(event, checked) {
    if (checked) {
      this.setState({
        checked: true,
      });
    }
  }

  handleSubmit() {
    if (!this.state.name) {
      this.setState({
        error: 'Please enter your name',
      });
    } else if (!this.state.email) {
      this.setState({
        error: 'Please enter your email address',
      });
    } else if (!this.state.checked) {
      this.setState({
        error: 'Please agree to the terms and conditions before submitting',
      });
    } else {
      const { name, email } = this.state;

      firebase
        .database()
        .ref('contentcreators')
        .push({ name, email });
      this.setState({
        submitted: true,
      });
    }
  }

  renderTable() {
    if (this.state.submitted) {
      return (
        <div className="col-md-12 col-sm-12 col-xs-12 text-center">
          <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font tz-text margin-ten-bottom xs-margin-fifteen-bottom">
            Sent. Thanks!
          </h2>
        </div>
      );
    } else {
      return (
        <div>
          <div className="col-md-12 col-sm-12 col-xs-12 center-col contact-form-style2 no-padding row">
            <MuiThemeProvider>
              <Checkbox
                label="I have read and agreed to the above terms and conditions."
                style={styles.checkbox}
                onCheck={this.handleCheck}
              />
            </MuiThemeProvider>
            <div className="col-md-5 col-sm-5 col-xs-12">
              <input
                onChange={this.handleChange}
                name="name"
                type="text"
                data-email="required"
                placeholder="Your name"
                className="medium-input "
              />
            </div>
            <div className="col-md-5 col-sm-5 col-xs-12">
              <input
                onChange={this.handleChange}
                name="email"
                type="text"
                data-email="required"
                placeholder="Your email"
                className="medium-input"
              />
            </div>
            <div
              className="col-md-2 col-sm-2 col-xs-12 center-col contact-form-style2 "
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <button
                onClick={this.handleSubmit}
                className="contact-submit btn-large btn bg-orange text-white tz-text"
                type="submit"
              >
                SUBMIT
              </button>
            </div>
          </div>
          <div style={{ color: 'red' }}>{this.state.error}</div>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <SoundwiseHeader showIcon={true} />
        <section
          className=" bg-white builder-bg xs-padding-60px-tb"
          id="contact-section2 border-none"
          style={{
            paddingBottom: '30px',
            paddingTop: '110px',
            boderBottom: '0px',
          }}
        >
          <div className="container text-dark-gray border-none" style={{ fontSize: '18px' }}>
            <h3
              className="section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text"
              style={{ textAlign: 'center' }}
            >
              Terms and Conditions for Non-Exclusive Use of Free Content
            </h3>
            <h3
              className="text-extra-large sm-text-extra-large font-weight-500 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text text-dark-gray"
              style={{ textAlign: 'center' }}
            >
              (last updated: May 01, 2017)
            </h3>
            &nbsp;
            <p>
              <strong>
                <u>Grant of License</u>:
              </strong>{' '}
              Subject to the terms and conditions set forth in this agreement (the “Terms”), You
              (“Content Creator”) grant Soundwise Inc. (“Soundwise”) a non-exclusive,
              non-transferable, royalty-free, and revocable, worldwide license to incorporate your
              submitted content (each a “Property” and together the “Properties”) as part of the
              resources made available to the general public, free of charge, on Soundwise’s web and
              mobile applications (the “Apps”).
            </p>
            &nbsp;
            <p>
              <strong>
                <u>Representations</u>:
              </strong>{' '}
              You represent that You have the right to grant Soundwise all rights provided
              hereunder, and Soundwise's use of the Properties as permitted herein will not infringe
              on the rights of any third party.
            </p>
            &nbsp;
            <p>
              <strong>
                <u>Withdrawal</u>:
              </strong>{' '}
              You have the right to withdraw a Property submitted to Soundwise. You shall give
              Soundwise as much advance notice as practicable of any such withdrawal. In the event
              of any notice of withdrawal, Soundwise shall delete all copies of the withdrawn
              Property in its possession or control, within ninety (90) days from the receipt of
              such written notice, whether physical or electronic, and cease any use of and require
              Soundwise Subscribers to cease continued use of such Property.
            </p>
            &nbsp;
            <p>
              <strong>
                <u>Termination</u>:
              </strong>{' '}
              Either party may terminate this agreement upon written notice in the event of (i) the
              other party’s material breach of any of its obligations under these Terms, provided
              that the breaching party is provided with thirty (30) days after receiving written
              notice from the non-breaching party to cure such breach; (ii) the other party’s
              bankruptcy, dissolution, liquidation or reorganization.
            </p>
            &nbsp;
            <p>
              <strong>
                <u>Promotion/Use of name</u>:
              </strong>{' '}
              Soundwise may market and promote the availability of the Properties, and incorporate
              the Properties in electronic communications related to the Apps that it creates and
              sends for informational or educational purposes to the same extent that it
              incorporates content from other providers in such communications, as provided herein
              these Terms.
            </p>
            &nbsp;
            <p>
              These Terms represent the entire agreement of the parties with respect to the subject
              matter hereof. Soundwise reserves the right to modify and/or make changes to these
              Terms. If Soundwise makes material changes to these Terms, Soundwise shall notify You
              using prominent means such as by email notice.  If You do not withdraw Properties,
              after the effective date of any change, it will be deemed an acceptance of and an
              agreement to follow and be bound by the Terms as changed. The revised Terms supersedes
              all previous Terms.
            </p>
          </div>
        </section>
        <section
          className=" bg-white builder-bg xs-padding-40px-tb"
          id="contact-section2 border-none"
          style={{ paddingBottom: '110px' }}
        >
          <div className="container border-none">
            <div className="row border-none">{this.renderTable()}</div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }
}
