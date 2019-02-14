import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import { bindActionCreators } from 'redux';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Colors from '../styles/colors';

import Footer from './footer';
import { signoutUser } from '../actions/index';

class _HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonValue: 0,
    };
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

  handleButtonChange(e, value) {
    this.setState({
      buttonValue: Number(value),
    });
    if (Number(value) == 1) {
      this.signoutUser();
    }
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
                    style={{
                      color: 'rgb(255, 255, 255)',
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
        <ul className="nav navbar-nav">
          <li className="propClone">
            <Link
              to="/signin"
              className="inner-link"
              data-selector="nav a"
              style={{
                color: 'rgb(255, 255, 255)',
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
                color: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(255, 255, 255)',
                borderColor: 'rgba(0, 0, 0, 0)',
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
        <div className="header-style8">
          <header className="header-style8" id="header-section16">
            <nav
              className="navbar tz-header-bg no-margin alt-font navigation-menu dark-header"
              data-selector=".tz-header-bg"
            >
              <div className="pull-left">
                <a href="#home" className="inner-link" data-selector="nav a">
                  <img
                    alt=""
                    src="images/soundwiselogo_white.svg"
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
                </a>
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
                  className="collapse navbar-collapse pull-right"
                >
                  <ul className="nav navbar-nav">
                    <li className="propClone">
                      <Link
                        className="inner-link"
                        to="/selling"
                        data-selector="nav a"
                        style={{
                          color: 'rgb(255, 255, 255)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)',
                          fontFamily: 'Montserrat, sans-serif',
                          textTransform: 'none',
                          fontSize: '16px',
                          fontWeight: 700,
                        }}
                        id="ui-id-19"
                      >
                        SELL MORE AUDIOS
                      </Link>
                    </li>
                    <li className="propClone">
                      <Link
                        to="/podcast"
                        className="inner-link"
                        data-selector="nav a"
                        style={{
                          color: 'rgb(255, 255, 255)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)',
                          fontFamily: 'Montserrat, sans-serif',
                          textTransform: 'none',
                          fontSize: '16px',
                          fontWeight: 700,
                        }}
                        id="ui-id-18"
                      >
                        GROW LISTENER TRIBE
                      </Link>
                    </li>
                    <li className="propClone">
                      <Link
                        className="inner-link"
                        to="/pricing"
                        data-selector="nav a"
                        style={{
                          color: 'rgb(255, 255, 255)',
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
          <section
            className="no-padding cover-background tz-builder-bg-image"
            data-img-size="(W)1920px X (H)750px"
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("images/dog.png")',
            }}
            data-selector=".tz-builder-bg-image"
            id="ui-id-10"
          >
            <div className="container one-fourth-screen position-relative">
              <div className="slider-typography text-center">
                <div className="slider-text-middle-main">
                  <div className="slider-text-middle">
                    <div className="col-md-12 header-banner">
                      <div
                        className="line-height-55 sm-title-extra-large xs-title-extra-large-4 tz-text text-white font-weight-700  alt-font margin-two-bottom banner-title xs-margin-seven-bottom"
                        style={{
                          color: 'rgb(255, 255, 255)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          fontWeight: 700,
                          fontFamily: 'Montserrat, sans-serif',
                          textTransform: 'none',
                          borderRadius: '0px',
                          fontSize: 65,
                        }}
                      >
                        <p style={{ lineHeight: '55px' }}>GROW YOUR BUSINESS</p>
                        <p style={{ lineHeight: '55px' }}>WITH AUDIO</p>
                      </div>
                      <div className="text-white title-medium sm-title-medium margin-six-bottom banner-text width-60 md-width-90 center-col">
                        <span
                          className="tz-text"
                          data-selector=".tz-text"
                          style={{
                            color: 'rgb(255, 255, 255)',
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            fontSize: 20,
                            fontFamily: 'Open Sans, sans-serif',
                            borderRadius: 0,
                            fontWeight: 500,
                          }}
                          id="ui-id-22"
                        >
                          The premium solution for entrepreneurial experts to grow an engaged
                          podcast audience, convert listeners to customers, and sell on-demand
                          audios.
                        </span>
                      </div>
                      <div className="display-inline-block margin-one">
                        <Link
                          className="font-weight-600 btn-large btn line-height-20 bg-white text-black no-letter-spacing"
                          to="/selling"
                          data-selector="a.btn, button.btn"
                          style={{
                            color: 'rgb(0, 0, 0)',
                            borderColor: 'rgba(0, 0, 0, 0)',
                            fontWeight: 600,
                            fontFamily: 'Montserrat, sans-serif',
                            borderRadius: 4,
                            backgroundColor: Colors.mainOrange,
                            fontSize: 18,
                          }}
                          id="ui-id-13"
                        >
                          <span
                            className="tz-text"
                            data-selector=".tz-text"
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0)',
                              fontWeight: 600,
                              fontFamily: 'Montserrat, sans-serif',
                              borderRadius: 0,
                              color: 'rgb(255, 255, 255)',
                              fontSize: 22,
                            }}
                            id="ui-id-15"
                          >
                            SELL ON-DEMAND AUDIOS
                          </span>
                        </Link>
                      </div>
                      <div className="display-inline-block margin-one">
                        <Link
                          className="font-weight-600 btn-large btn line-height-20 bg-white text-black no-letter-spacing"
                          to="/podcast"
                          data-selector="a.btn, button.btn"
                          style={{
                            color: 'rgb(0, 0, 0)',
                            borderColor: 'rgba(0, 0, 0, 0)',
                            fontWeight: 600,
                            fontFamily: 'Montserrat, sans-serif',
                            borderRadius: 4,
                            backgroundColor: Colors.link,
                            fontSize: 18,
                          }}
                          id="ui-id-12"
                        >
                          <span
                            className="tz-text"
                            data-selector=".tz-text"
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0)',
                              fontWeight: 600,
                              fontFamily: 'Montserrat, sans-serif',
                              borderRadius: 0,
                              color: 'rgb(255, 255, 255)',
                              fontSize: 22,
                            }}
                            id="ui-id-14"
                          >
                            CONVERT PODCAST LISTENERS
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section
          id="clients-section4"
          className="padding-110px-tb bg-white builder-bg clients-section4 xs-padding-60px-tb"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row center-col">
              <div className="col-md-3 col-sm-6 col-xs-12">
                <div className="client-logo-outer">
                  <div className="client-logo-inner">
                    <img
                      src="images/huffington-post-logo.png"
                      data-img-size="(W)800px X (H)500px"
                      alt=""
                      data-selector="img"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12">
                <div className="client-logo-outer">
                  <div className="client-logo-inner">
                    <img
                      src="images/entrepreneur-logo.png"
                      data-img-size="(W)800px X (H)500px"
                      alt=""
                      data-selector="img"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12">
                <div className="client-logo-outer">
                  <div className="client-logo-inner">
                    <img
                      src="images/NAB-logo.jpg"
                      data-img-size="(W)800px X (H)500px"
                      alt=""
                      data-selector="img"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12">
                <div className="client-logo-outer">
                  <div className="client-logo-inner">
                    <img
                      src="images/podcastmovement.jpg"
                      data-img-size="(W)800px X (H)500px"
                      alt=""
                      data-selector="img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer showPricing={true} />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ signoutUser }, dispatch);
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  return {
    userInfo,
    isLoggedIn,
  };
};

export const HomePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(_HomePage);
