import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Colors from '../styles/colors';

export default class AudioCourseCreator extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section
        className="padding-50px-tb xs-padding-60px-tb bg-light-gray builder-bg"
        id="content-section26"
      >
        <div className="container">
          <div className="row" style={{ height: 495 }}>
            <div className="col-md-12 col-sm-12 col-xs-12 equalize no-padding">
              <div
                className="col-md-6 col-sm-6 col-xs-12  tz-background-color display-table"
                style={{ height: 495, backgroundColor: Colors.mainGreen }}
              >
                <div className="display-table-cell-vertical-middle padding-fifteen sm-padding-fifteen xs-padding-nineteen xs-no-padding-lr">
                  <div className="alt-font title-extra-large sm-section-title-medium text-dark-gray xs-title-extra-large margin-ten-bottom xs-margin-ten-bottom tz-text">
                    Sell your audio streaming products with confidence.
                  </div>
                  <ul className="text-large sm-text-large margin-nine-bottom  tz-text">
                    <li>
                      Sell your audio content as <strong>individual series or bundles</strong>
                    </li>
                    <li>
                      Charge <strong>subscription fee</strong>, one-time fee, or limited-time access
                      fee
                    </li>
                    <li>
                      Easily publish free series to iTunes and Google Play for{' '}
                      <strong>lead generation</strong>
                    </li>
                    <li>
                      Deliver <strong>supplementary materials</strong> (e.g. pdf worksheets) along
                      with your audios
                    </li>
                    <li>
                      Comprehensive <strong>analytics</strong> to track content engagement
                    </li>
                  </ul>
                  <Link
                    to="/signup/admin"
                    className="btn btn-medium propClone bg-dark-gray btn-circle text-white xs-margin-seven-bottom"
                  >
                    <span className="tz-text">Get Started For Free</span>
                  </Link>
                </div>
              </div>
              <div
                className="col-lg-6 col-md-6 col-sm-6 col-xs-12 tz-builder-bg-image cover-background"
                data-img-size="(W)800px X (H)640px"
                style={{
                  background: `linear-gradient(rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.01)), url("images/pricing_input.gif")`,
                  height: 495,
                }}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
}
