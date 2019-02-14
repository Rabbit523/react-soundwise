import React from 'react';
import { Link } from 'react-router-dom';

import { SoundwiseHeader } from './soundwise_header';
import Footer from './footer';

const NotFound = () => (
  <div>
    <SoundwiseHeader showIcon={true} />
    <section
      id="content-section31"
      className="padding-110px-tb xs-padding-60px-tb builder-bg border-none"
    >
      <div className="container">
        <div className="row equalize xs-equalize-auto equalize-display-inherit">
          <div className="col-md-6 col-sm-5 col-xs-12 display-table" style={{ height: '447px' }}>
            <div className="text-center xs-text-center display-table-cell-vertical-middle">
              <img
                className="xs-width-50"
                src="../images/oops.jpg"
                data-img-size="(W)340px X (H)418px"
                alt=""
              />
            </div>
          </div>
          <div
            className="col-md-6 col-sm-7 col-xs-12 xs-text-center display-table"
            style={{ height: '447px' }}
          >
            <div className="display-table-cell-vertical-middle xs-padding-nineteen-top">
              <h2 className="title-extra-big sm-title-extra-large-4 text-orange-peel xs-title-extra-big font-weight-600 tz-text sm-margin-five-bottom">
                404
              </h2>
              <div className="title-extra-large alt-font sm-title-extra-large xs-title-extra-large-2 text-yellow padding-fifteen-bottom margin-fifteen-bottom sm-margin-nine-bottom xs-margin-fifteen-bottom border-bottom-medium-dark tz-text">
                Ooopps...Page not found
              </div>
              <div className="text-medium sm-text-medium xs-text-extra-large text-black width-90 sm-width-100 margin-ten-bottom sm-margin-fifteen-bottom tz-text">
                <p>We hate it when this happens!</p>
              </div>
              <Link
                to="/"
                className="btn btn-large propClone highlight-button-black-border text-black"
              >
                <span className="tz-text">BACK TO HOME</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default NotFound;
