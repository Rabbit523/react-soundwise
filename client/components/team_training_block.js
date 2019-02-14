import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Colors from '../styles/colors';

export default class TeamTrainingBlock extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section
        className="padding-50px-tb xs-padding-60px-tb bg-light-gray builder-bg"
        id="content-section25"
      >
        <div className="container">
          <div className="row equalize" style={{ height: 495 }}>
            <div
              className="col-lg-6 col-md-6 col-sm-6 col-xs-12 tz-builder-bg-image cover-background"
              data-img-size="(W)800px X (H)640px"
              style={{
                background: `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.01)), url("images/subscriber.gif")`,
                height: '495px',
              }}
            />
            <div
              className="col-lg-6 col-md-6 col-sm-6 col-xs-12 tz-background-color display-table"
              style={{ height: '495px', backgroundColor: Colors.mainOrange }}
            >
              <div className="display-table-cell-vertical-middle padding-nineteen sm-padding-fifteen xs-padding-nineteen xs-no-padding-lr">
                <div className="title-extra-large alt-font sm-section-title-medium font-weight-500 xs-title-extra-large text-white margin-twelve-bottom xs-margin-ten-bottom tz-text">
                  Get your team to train efficiently on the go.
                </div>
                <ul className="text-large text-white sm-text-large margin-fifteen-bottom tz-text">
                  <li>
                    <strong>Record</strong> your training sessions directly from the browser
                  </li>
                  <li>
                    <strong>Send recordings</strong> to your team’s phones with one click
                  </li>
                  <li>
                    <strong>Track</strong> who has listened to what down to each team member
                  </li>
                  <li>
                    Send group text messages to further <strong>engage</strong> your team in
                    training
                  </li>
                </ul>
                <Link
                  to="/signup/admin"
                  className="btn btn-medium propClone bg-white btn-circle text-deep-blue xs-margin-seven-bottom"
                >
                  <span className="tz-text">Get Started For Free</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
