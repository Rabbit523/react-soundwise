import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import Axios from 'axios';

// import { openSignupbox, openConfirmationbox, addCourseToCart } from '../actions/index';
import { withRouter } from 'react-router';
import { orange50 } from 'material-ui/styles/colors';

export default class Banner extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { displayedPrice, post } = this.props.getPrice();

    return (
      <section className=" builder-bg border-none" id="callto-action2" style={styles.footer}>
        <div className="container">
          <div
            className=""
            style={{
              height: 50,
              margin: '1em',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div>
              <a
                onClick={this.props.openModal}
                className="btn-large btn text-white highlight-button-white-border btn-circle"
              >
                <span className="tz-text">Get This Soundcast for</span>
                <span>
                  <strong>{` ${displayedPrice} ${post}`}</strong>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

const styles = {
  footer: {
    position: 'fixed',
    zIndex: 99999,
    bottom: 0,
    width: '100%',
    backgroundColor: '#F76B1C',
    // fontSize: 12,
    // fontWeight: 'normal',
    // color: '#fff',
    textSlign: 'center',
    cursor: 'pointer',
  },
};
