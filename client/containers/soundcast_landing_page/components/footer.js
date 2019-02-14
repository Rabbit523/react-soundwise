import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const SoundwiseFooter = props => (
  <footer id="footer-section11" className="padding-30px-tb bg-dark-gray builder-bg">
    <div className="container">
      <div className="row equalize">
        <div className="center-col col-lg-6 col-md-6 col-sm-6 col-xs-12 xs-text-center xs-margin-four-bottom display-table text-center">
          <div className="text-large text-white font-weight-800" style={{ marginBottom: 10 }}>
            Powered by
          </div>
          <Link to="/">
            <img
              src="/images/soundwiselogo_white.svg"
              data-img-size="(W)163px X (H)40px"
              alt="Soundwise Logo"
            />
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default SoundwiseFooter;
