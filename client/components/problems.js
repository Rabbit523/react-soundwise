import React, { Component } from 'react';
import Colors from '../styles/colors';

export default class Problems extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section
        className="padding-90px-tb sm-padding-60px-tb  xs-padding-60px-tb bg-light-gray border-none builder-bg"
        id="content-section38"
      >
        <div className="container">
          <div className="row margin-three-bottom">
            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
              <div className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                DOES ANY OF THIS SOUND LIKE YOU?
              </div>
            </div>
          </div>
          <div className="row equalize xs-equalize-auto">
            <div
              className="col-md-4 col-sm-4 col-xs-12  xs-margin-nine-bottom "
              style={{ height: 401 }}
            >
              <div className="border-radius-6 box-shadow bg-white builder-bg padding-nineteen sm-padding-eleven xs-padding-seventeen xs-width-100 display-table-cell-vertical-middle">
                <div className=" margin-three-bottom display-block tz-text text-center">
                  <i className="fas fa-3x fa-quote-right" style={{ color: Colors.mainOrange }} />
                </div>
                <div
                  className="title-medium text-center font-weight-500  margin-eighteen-bottom tz-text "
                  style={{ color: Colors.mainOrange }}
                >
                  I want to start a <strong style={{ fontSize: 28 }}>podcast</strong>, but…
                </div>
                <ul className="text-large  text-dark-gray margin-twenty-three-bottom tz-text">
                  <li>I have no audience. </li>
                  <li>It’s too much work to set it up.</li>
                  <li>
                    I can’t make money from it anyway. I won’t have gazillion downloads to sell ads
                    on.
                  </li>
                </ul>
              </div>
            </div>
            <div
              className="col-md-4 col-sm-4 col-xs-12  xs-margin-nine-bottom "
              style={{ height: 401 }}
            >
              <div className="border-radius-6 box-shadow bg-white builder-bg padding-nineteen sm-padding-eleven xs-padding-seventeen xs-width-100 display-table-cell-vertical-middle">
                <div className=" margin-three-bottom display-block tz-text text-center">
                  <i className="fas fa-3x fa-quote-right" style={{ color: Colors.mainOrange }} />
                </div>
                <div
                  className="text-center title-medium font-weight-500 margin-eighteen-bottom tz-text "
                  style={{ color: Colors.mainOrange }}
                >
                  I created <strong style={{ fontSize: 28 }}>audio courses</strong> for sale, but…
                </div>
                <ul className="text-large text-dark-gray margin-twenty-three-bottom tz-text">
                  <li>
                    They are in CDs. Managing inventory and shipping is a bore. And they make my
                    business look like a dinosaur.{' '}
                  </li>
                  <li>
                    They are in mp3 downloads. Students can send them to anyone who didn’t pay. I
                    have no idea what happened to them.
                  </li>
                </ul>
              </div>
            </div>
            <div
              className="col-md-4 col-sm-4 col-xs-12 xs-margin-nine-bottom "
              style={{ height: 401 }}
            >
              <div className="border-radius-6 box-shadow bg-white builder-bg padding-nineteen sm-padding-eleven xs-padding-seventeen xs-width-100 display-table-cell-vertical-middle">
                <div className=" margin-three-bottom display-block tz-text text-center">
                  <i className="fas fa-3x fa-quote-right" style={{ color: Colors.mainOrange }} />
                </div>
                <div
                  className="text-center title-medium font-weight-500 margin-eighteen-bottom tz-text "
                  style={{ color: Colors.mainOrange }}
                >
                  I teach <strong style={{ fontSize: 28 }}>training</strong> workshops in person,
                  but…
                </div>
                <ul className="text-large text-dark-gray margin-twenty-three-bottom tz-text">
                  <li>It’s hard to make people show up at a set time. Everyone’s so busy.</li>
                  <li>
                    Students have been bugging me to record the trainings so that they can listen to
                    it later. But how would I know if they do?
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
