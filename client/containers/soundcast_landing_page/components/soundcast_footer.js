import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import Axios from 'axios';

// import { openSignupbox, openConfirmationbox, addCourseToCart } from '../actions/index';
import { withRouter } from 'react-router';
import { orange50 } from 'material-ui/styles/colors';

export default class SoundcastFooter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { displayedPrice, post } = this.props.getPrice();

    return (
      <section
        className=" builder-bg border-none"
        id="callto-action2"
        style={{
          backgroundColor: '#F76B1C',
          paddingBottom: '90px',
          paddingTop: '90px',
        }}
      >
        <div className="container">
          <div className="row equalize">
            <div className="col-md-12 col-sm-12 col-xs-12 text-center" style={{ height: '46px' }}>
              <div className="display-inline-block sm-display-block vertical-align-middle margin-five-right sm-no-margin-right sm-margin-ten-bottom tz-text alt-font text-white title-large sm-title-large xs-title-large">
                <span className="tz-text">Get This Soundcast for</span>
                <span>
                  <strong>{` ${displayedPrice} ${post}`}</strong>
                </span>
              </div>
              <a
                onClick={this.props.openModal}
                className="btn-large btn text-white highlight-button-white-border btn-circle"
              >
                <span className="tz-text">Get Access</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
