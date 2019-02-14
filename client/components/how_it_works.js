import React, { Component } from 'react';

export default class HowItWorks extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section
        className="padding-50px-tb feature-style4 bg-white builder-bg xs-padding-50px-tb border-none"
        id="feature-section6"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12 text-center padding-50px-tb">
              <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-seven-bottom xs-margin-fifteen-bottom tz-text">
                HOW A SOUNDWISE COURSE WORKS
              </h2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12n four-column">
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-nine-bottom">
                <div className="border-radius-50 bg-light-orange text-white icon-extra-large line-height-75 feature-icon builder-bg margin-nineteen-bottom sm-margin-sixteen-bottom xs-margin-nine-bottom">
                  <i className="fa fa-clock-o" aria-hidden="true" />
                </div>
                <h3 className="text-large text-dark-gray font-weight-600 alt-font margin-six-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                  LEARN AT YOUR OWN PACE
                </h3>
                <div className="text-large text-dark-gray center-col tz-text">
                  {' '}
                  <p>
                    You can always access the course from your account. Your course progress is
                    saved. Come back to it whenever you want.
                  </p>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-nineteen-bottom">
                <div className="border-radius-50 bg-light-orange text-white icon-extra-large line-height-75 feature-icon builder-bg margin-nineteen-bottom sm-margin-sixteen-bottom xs-margin-nine-bottom">
                  <i className="fa fa-bicycle" aria-hidden="true" />
                </div>
                <h3 className="text-large text-dark-gray font-weight-600 alt-font margin-six-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                  LEARN ON THE GO
                </h3>
                <div className="text-large center-col tz-text text-dark-gray">
                  {' '}
                  <p>
                    Audio lessons are perfect for listening on your phone. You can also preload the
                    lessons and access them offline, without using your data plan.
                  </p>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center xs-margin-nineteen-bottom">
                <div className="border-radius-50 bg-light-orange text-white icon-extra-large line-height-75 feature-icon builder-bg margin-nineteen-bottom sm-margin-sixteen-bottom xs-margin-nine-bottom">
                  <i className="fa fa-file-pdf-o" aria-hidden="true" />
                </div>
                <h3 className="text-large text-dark-gray font-weight-600 alt-font margin-six-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                  COMPLEMENTARY MATERIALS
                </h3>
                <div className="text-large center-col tz-text text-dark-gray">
                  <p>
                    The courses come with transcripts, notes, and/or additional resources to help
                    you learn better.
                  </p>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center">
                <div className="border-radius-50 bg-light-orange text-white icon-extra-large line-height-75 feature-icon builder-bg margin-nineteen-bottom sm-margin-sixteen-bottom xs-margin-nine-bottom">
                  <i className="fa fa-bolt" aria-hidden="true" />
                </div>
                <h3 className="text-large text-dark-gray font-weight-600 alt-font margin-six-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">
                  ACTION ORIENTED
                </h3>
                <div className="text-large center-col tz-text text-dark-gray">
                  {' '}
                  <p>
                    Every course includes exercises and action steps to help you implement the ideas
                    you learned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
