import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';

import { SoundwiseHeader } from './soundwise_header';
import Footer from './footer';

class _OrderConfirmation extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const that = this;
    setTimeout(() => {
      that.props.history.push('/myprograms');
    }, 500);
  }

  render() {
    return (
      <div>
        <SoundwiseHeader showIcon={true} />
        <section
          className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="title-section1"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                  THANKS FOR YOUR ORDER!
                </h2>
                <div className="text-medium width-60 margin-lr-auto md-width-70 sm-width-100 tz-text">
                  Now start listening to your course
                </div>
              </div>
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <div className="btn-dual">
                  <Link to="/myprograms">
                    <button
                      type="submit"
                      className="tz-text bg-golden-yellow tz-text btn btn-large text-dark-gray propClone contact-submit btn-circle xs-width-100"
                      data-selector=".tz-text"
                      style={{ marginTop: '5em' }}
                    >
                      GO TO MY PROGRAMS
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }
}

export const OrderConfirmation = withRouter(_OrderConfirmation);
