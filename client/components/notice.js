import React from 'react';
import { withRouter } from 'react-router';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Link } from 'react-router-dom';

import { SoundwiseHeader } from './soundwise_header';
import Footer from './footer';

const _Notice = props => (
  <div>
    <SoundwiseHeader />
    <section
      className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb"
      id="subscribe-section6"
    >
      <div className="container  text-dark-gray border-none" style={{ fontSize: '18px' }}>
        <div className="row">
          <div className="col-md-9 center-col col-sm-12 ">
            {(props.location.state.soundcastTitle && (
              <div
                className="section-title-small text-dark-gray font-weight-500 alt-font margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text"
                style={{ textAlign: 'center', lineHeight: '150%' }}
              >
                <div>
                  <strong>Thanks for signing up for</strong>
                </div>
                <div>{props.location.state.soundcastTitle}</div>
              </div>
            )) ||
              null}
            {(props.location.state.ios && (
              <div style={{ lineHeight: '150%' }}>
                <div
                  className="section-title-small text-dark-gray font-weight-500 alt-font margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text"
                  style={{ textAlign: 'center', marginTop: 20 }}
                >
                  <span>
                    <strong>How to Access Your Soundcast</strong>
                  </span>
                </div>
                <div className="col-md-8 col-sm-9 col-xs-12 center-col text-center">
                  <div className="section-title-small" style={{ marginBottom: 15 }}>
                    <span>
                      <strong>Mobile</strong>
                    </span>
                  </div>
                  <div className="text-large">
                    <span>
                      <strong>Step 1: </strong>
                    </span>
                    <span>Download the Soundwise app</span>
                  </div>
                  <div className="width-100 text-center">
                    <a
                      href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8"
                      target="_blank"
                      className="xs-width-150px display-inline-block margin-two"
                    >
                      <img
                        alt=""
                        style={{ width: 175 }}
                        src="../images/app-store-badge.png"
                        data-img-size="(W)175px X (H)51px"
                      />
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android"
                      target="_blank"
                      className="xs-width-150px display-inline-block margin-two"
                    >
                      <img
                        src="../images/google-play-badge.png"
                        data-img-size="(W)200px X (H)61px"
                        style={{ width: 175 }}
                        alt=""
                      />
                    </a>
                  </div>
                  <div className="text-large" style={{ marginBottom: 10 }}>
                    <span>
                      <strong>Step 2: </strong>
                    </span>
                    <span>Sign in to the app with your Soundwise account credentials</span>
                  </div>
                  <div className="text-large">
                    <span>
                      <strong>Step 3: </strong>
                    </span>
                    <span>Enjoy your soundcast!</span>
                  </div>
                </div>
                <div className="section-title-small" style={{ textAlign: 'center', marginTop: 20 }}>
                  <div style={{ marginBottom: 10 }}>
                    <strong>Desktop</strong>
                  </div>
                  <MuiThemeProvider>
                    <Link to="/mysoundcasts">
                      <FlatButton label="Access your soundcast" style={{ color: '#f76b1c' }} />
                    </Link>
                  </MuiThemeProvider>
                </div>
              </div>
            )) ||
              null}
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export const Notice = withRouter(_Notice);
