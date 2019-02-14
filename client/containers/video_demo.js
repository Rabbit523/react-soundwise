import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import firebase from 'firebase';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import Colors from '../styles/colors';
import Footer from '../components/footer';

class _VideoDemo extends Component {
  constructor(props) {
    super(props);
  }

  signoutUser() {
    let that = this;
    firebase
      .auth()
      .signOut()
      .then(
        function() {
          that.props.signoutUser();
          that.props.history.push('/signin');
        },
        function(error) {
          console.error('Sign Out Error', error);
        }
      );
  }

  capFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  renderLogin() {
    if (this.props.isLoggedIn) {
      if (this.props.userInfo.admin) {
        return (
          <ul
            className="nav navbar-nav"
            style={{
              verticalAlign: 'center',
            }}
          >
            <li className="propClone sm-no-border" style={{ marginTop: 5 }}>
              <div className="dropdown">
                <div
                  className="btn dropdown-toggle"
                  data-toggle="dropdown"
                  style={{ height: 37, justifyContent: 'center' }}
                >
                  <div
                    className="text-dark-gray"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)',
                      fontFamily: 'Montserrat, sans-serif',
                      textTransform: 'none',
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  >
                    {`Hello, ${this.capFirstLetter(this.props.userInfo.firstName)} `}
                    <span className="caret" />
                  </div>
                </div>
                <ul className="dropdown-menu">
                  {this.props.userInfo.soundcasts && (
                    <li>
                      <Link style={{ color: 'black' }} to="/mysoundcasts">
                        My Soundcasts
                      </Link>
                    </li>
                  )}
                  {this.props.userInfo.admin && (
                    <li>
                      <Link to="/dashboard/soundcasts" style={{ color: 'black' }}>
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  {this.props.userInfo.courses && (
                    <li>
                      <Link to="/myprograms" style={{ color: 'black' }}>
                        My Courses
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/myprofile" style={{ color: 'black' }}>
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <a onClick={() => this.signoutUser()}>
                      <font style={{ color: 'black' }}>Log Out</font>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        );
      } else {
        return (
          <ul className="nav navbar-nav">
            {this.props.userInfo.courses && (
              <li className="propClone sm-no-border">
                <Link to="/courses" className="inner-link">
                  COURSES
                </Link>
              </li>
            )}
            {this.props.userInfo.courses && (
              <li>
                <Link to="/myprograms">My Library</Link>
              </li>
            )}
            {this.props.userInfo.soundcasts && (
              <li>
                <Link to="/mysoundcasts">My Soundcasts</Link>
              </li>
            )}
            <li className="propClone sm-no-border">
              <a className="dropdown-toggle" data-toggle="dropdown">
                {`Hello, ${this.capFirstLetter(this.props.userInfo.firstName)} `}
                <span className="caret" />
              </a>
              <ul className="dropdown-menu">
                {this.props.userInfo.soundcasts && (
                  <li>
                    <Link to="/mysoundcasts">My Soundcasts</Link>
                  </li>
                )}
                {this.props.userInfo.courses && (
                  <li>
                    <Link to="/myprograms">My Courses</Link>
                  </li>
                )}
                <li>
                  <Link to="/myprofile">My Profile</Link>
                </li>
                <li>
                  <a onClick={() => this.signoutUser()}>
                    <font style={{ color: 'black' }}>LOG OUT</font>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        );
      }
    } else {
      return (
        <ul className="nav navbar-nav text-dark-gray">
          <li className="propClone">
            <Link
              to="/signin"
              className="inner-link text-dark-gray"
              data-selector="nav a"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)',
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 700,
              }}
              id="ui-id-21"
            >
              LOG IN
            </Link>
          </li>
          <li className="nav-button propClone float-left btn-medium sm-no-margin-tb">
            <Link
              className="inner-link"
              to="/pricing"
              className="sm-text-medium display-block sm-bg-white text-black sm-padding-nav-btn width-100 sm-display-inline-block sm-width-auto"
              data-selector="nav a"
              style={{
                backgroundColor: 'rgb(255, 255, 255)',
                borderColor: '#1e1e1e',
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 700,
              }}
              id="ui-id-17"
            >
              SIGN UP
            </Link>
          </li>
        </ul>
      );
    }
  }

  render() {
    return (
      <div>
        <div style={{ paddingBottom: 80 }} className="">
          <header className="header-style8" id="header-section16">
            <nav
              className="navbar tz-header-bg no-margin alt-font navigation-menu dark-header"
              data-selector=".tz-header-bg"
            >
              <div className="pull-left">
                <Link to="/" className="inner-link" data-selector="nav a">
                  <img
                    alt=""
                    src="images/soundwiselogo.svg"
                    data-img-size="(W)163px X (H)40px"
                    data-selector="img"
                    style={{
                      borderRadius: 0,
                      bordeColor: 'rgb(78, 78, 78)',
                      borderStyle: 'none',
                      borderWidth: '1px',
                      maxHeight: 40,
                    }}
                    id="ui-id-16"
                  />
                </Link>
              </div>
              <div className="pull-right">
                <button
                  data-target="#bs-example-navbar-collapse-1"
                  data-toggle="collapse"
                  className="navbar-toggle collapsed"
                  type="button"
                >
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar" />
                  <span className="icon-bar" />
                  <span className="icon-bar" />
                </button>
                <div
                  id="bs-example-navbar-collapse-1"
                  className="collapse navbar-collapse pull-right text-dark-gray"
                >
                  <ul className="nav navbar-nav">
                    <li className="text-dark-gray propClone">
                      <Link
                        className="inner-link text-dark-gray"
                        to="/selling"
                        data-selector="nav a"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)',
                          fontFamily: 'Montserrat, sans-serif',
                          textTransform: 'none',
                          fontSize: '16px',
                          fontWeight: 700,
                        }}
                        id="ui-id-19"
                      >
                        SELLING AUDIOS
                      </Link>
                    </li>
                    <li className="text-dark-gray propClone">
                      <Link
                        to="/podcast"
                        className="inner-link text-dark-gray"
                        data-selector="nav a"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)',
                          fontFamily: 'Montserrat, sans-serif',
                          textTransform: 'none',
                          fontSize: '16px',
                          fontWeight: 700,
                        }}
                        id="ui-id-18"
                      >
                        PODCAST HOSTS
                      </Link>
                    </li>
                    <li className="text-dark-gray propClone">
                      <Link
                        className="inner-link text-dark-gray"
                        to="/pricing"
                        data-selector="nav a"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)',
                          fontFamily: 'Montserrat, sans-serif',
                          textTransform: 'none',
                          fontSize: '16px',
                          fontWeight: 700,
                        }}
                        id="ui-id-20"
                      >
                        PRICING
                      </Link>
                    </li>
                    {this.renderLogin()}
                  </ul>
                </div>
              </div>
            </nav>
          </header>
        </div>
        <section
          className="bg-white builder-bg padding-50px-tb xs-padding-60px-tb"
          id="video-section7"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center center-col">
                <h2
                  className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-six-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  THE BEST WAY TO SELL AND DELIVER YOUR ON-DEMAND AUDIOS
                </h2>
                <div
                  className="text-extra-large width-90 margin-lr-auto md-width-70 sm-width-100 tz-text margin-thirteen-bottom xs-margin-nineteen-bottom"
                  data-selector=".tz-text"
                >
                  <p>
                    Coaches, experts and entrepreneurs use Soundwise to sell more of their
                    high-value audio courses and programs, build a engaged audience, and turn
                    audience into loyal customers.
                  </p>
                  <p>
                    See how easy it is to create, sell, and deliver on-demand audios with
                    Soundwise's state-of-art platform in this overview video!
                  </p>
                </div>
              </div>
              <div className="col-lg-10 col-md-10 col-sm-12 col-xs-12 display-table center-col">
                <div className="display-table-cell-vertical-middle">
                  <div className="video-overlay">
                    <iframe
                      src="https://player.vimeo.com/video/291301465?title=0&amp;amp;byline=0&amp;amp;portrait=0"
                      width="600"
                      frameborder="0"
                      allowFullScreen=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-50px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="title-section1"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                  style={{ marginTop: 0 }}
                >
                  SELL 20% MORE AUDIOS WITH NO ADDITIONAL WORK. BUILD A RAVING AUDIENCE. GET LOYAL
                  CUSTOMERS.
                </h2>
                <div
                  className="text-extra-large width-60 margin-lr-auto md-width-70 sm-width-100 tz-text"
                  data-selector=".tz-text"
                >
                  Plans start at $15 / month. 30 day money back guarantee.&nbsp;
                </div>
              </div>
              <div
                className="col-md-6 col-sm-10 col-xs-12 display-table center-col margin-fifteen-top text-center"
                style={{ paddingTop: 45, paddingBottom: 60 }}
              >
                <Link
                  to="/pricing"
                  className="contact-submit btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text"
                  style={{ backgroundColor: Colors.mainOrange }}
                >
                  GET STARTED
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer showPricing={true} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  return { userInfo, isLoggedIn };
};

export const VideoDemo = connect(
  mapStateToProps,
  null
)(_VideoDemo);
