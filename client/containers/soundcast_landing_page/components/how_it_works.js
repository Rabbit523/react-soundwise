import React, { Component } from 'react';

const HowItWorks = props => (
  <section
    className="padding-40px-tb feature-style4 bg-white builder-bg xs-padding-40px-tb border-none"
    id="feature-section6"
  >
    <div className="">
      <div className="row">
        <div className="col-md-12 col-sm-12 col-xs-12 text-center padding-40px-tb">
          <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
            HOW IT WORKS
          </h2>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 col-sm-12 col-xs-12 four-column">
          <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-nine-bottom">
            <div className="border-radius-50 bg-light-orange text-white icon-extra-large line-height-75 feature-icon builder-bg margin-nineteen-bottom sm-margin-sixteen-bottom xs-margin-nine-bottom">
              <i className="fa fa-bicycle" aria-hidden="true" />
            </div>
            <h3 className="text-large text-dark-gray font-weight-600 alt-font margin-six-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
              LEARN EFFICIENTLY
            </h3>
            <div className="text-large text-dark-gray center-col tz-text">
              {' '}
              <p>
                Once you subscribe, you can access your soundcast from the Soundwise mobile app
                anytime. Download the audios and listen when driving, exercising, running
                errands...Learning doesn't have to take up extra time.
              </p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-nineteen-bottom">
            <div className="border-radius-50 bg-light-orange text-white icon-extra-large line-height-75 feature-icon builder-bg margin-nineteen-bottom sm-margin-sixteen-bottom xs-margin-nine-bottom">
              <i className="far fa-clock " aria-hidden="true" />
            </div>
            <h3 className="text-large text-dark-gray font-weight-600 alt-font margin-six-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
              AUTOMATIC UPDATES
            </h3>
            <div className="text-large center-col tz-text text-dark-gray">
              {' '}
              <p>
                If the soundcast you subscribe to is being regularly updated, you will automatically
                receive the new materials on your phone. Enable push notification for the Soundwise
                app and you'll know when your instructor publishes new content in real time.
              </p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 col-xs-12 text-center xs-margin-nineteen-bottom">
            <div className="border-radius-50 bg-light-orange text-white icon-extra-large line-height-75 feature-icon builder-bg margin-nineteen-bottom sm-margin-sixteen-bottom xs-margin-nine-bottom">
              <i className="fa fa-bolt" aria-hidden="true" />
            </div>
            <h3 className="text-large text-dark-gray font-weight-600 alt-font margin-six-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
              RICH INTERACTIONS
            </h3>
            <div className="text-large center-col tz-text text-dark-gray">
              <p>
                With the Soundwise app you can ask the instructor questions and interact with other
                subscribers through comments on the audio materials. You can also interact with the
                instructor by replying to his/her broadcast messages.
              </p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 col-xs-12 text-center">
            <div className="border-radius-50 bg-light-orange text-white icon-extra-large line-height-75 feature-icon builder-bg margin-nineteen-bottom sm-margin-sixteen-bottom xs-margin-nine-bottom">
              <i className="far fa-file-pdf " aria-hidden="true" />
            </div>
            <h3 className="text-large text-dark-gray font-weight-600 alt-font margin-six-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
              SUPPLEMENTARY MATERIALS
            </h3>
            <div className="text-large center-col tz-text text-dark-gray">
              {' '}
              <p>
                Many soundcasts have accompanying notes, worksheets, assignments/action steps. You
                can view them directly within the Soundwise app and track your learning progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
