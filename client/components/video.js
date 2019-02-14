import React from 'react';
import { Link } from 'react-router-dom';

const Video = () => (
  <section className="bg-white builder-bg padding-50px-tb xs-padding-30px-tb" id="video-section7">
    <div className="container">
      <div className="row">
        <div className="col-lg-8 col-md-10 col-sm-12 col-xs-12 text-center center-col">
          <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-six-bottom xs-margin-fifteen-bottom tz-text">
            HIGHER PRODUCTIVITY. LOWER TRAINING COST.
          </h2>
        </div>
        <div className="col-lg-8 col-md-10 col-sm-12 col-xs-12 display-table center-col">
          <div className="display-table-cell-vertical-middle">
            <div className="video-overlay">
              <iframe width="560" height="315" src="https://www.youtube.com/embed/cjAw4AM4l0Y" />
            </div>
          </div>
        </div>
        <div className="col-md-8 col-sm-12 col-xs-12 display-table center-col margin-ten-top text-center">
          <Link
            to="/signup/admin"
            className="btn btn-large propClone  btn-circle text-white"
            style={{ backgroundColor: '#61E1FB' }}
          >
            <span className="tz-text">GET START</span>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default Video;
