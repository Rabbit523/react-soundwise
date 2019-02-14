import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import { bindActionCreators } from 'redux';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Axios from 'axios';

import Colors from '../styles/colors';
import Footer from './footer';
import { signoutUser } from '../actions/index';
import { emailValidator } from '../helpers/validators';

class _LandingPageSelling extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonValue: 0,
      name: '',
      email: '',
    };
    this.requestDemo = this.requestDemo.bind(this);
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

  validateForm(email) {
    if (!emailValidator(email)) {
      alert('Please enter a valid email!');
      return false;
    } else {
      return true;
    }
  }

  handleChange(prop, e) {
    this.setState({ [prop]: e.target.value });
  }

  requestDemo(e) {
    e.preventDefault();
    const validForm = this.validateForm(this.state.email);
    if (validForm) {
      Axios.post('/api/email_demo_request', {
        email: this.state.email,
        first_name: this.state.name,
        source: 'demo_request',
      })
        .then(res => {
          //As firebase sends realtime notifications, we do not really need this, but what the heck!
          this.props.history.push('/video_demo');
        })
        .catch(error => {
          alert('Oops, we had an error.');
        });
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
        <Helmet>
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://mysoundwise.com/selling" />
          <meta
            property="og:title"
            content="Soundwise: #1 Mobile-Centric Platform For Selling & Delivering On-Demand Audios"
          />
          <meta property="fb:app_id" content="1726664310980105" />
          <meta
            property="og:description"
            content="Soundwise is the leading mobile and web platform for selling and delivering on-demand audio streaming programs. "
          />
          <meta
            property="og:image"
            content="https://mysoundwise.com/images/soundwise-selling.png"
          />
          <title>
            Soundwise: #1 Mobile-Centric Platform For Selling & Delivering On-Demand Audios{' '}
          </title>
          <meta
            name="description"
            content="Soundwise is the leading mobile and web platform for selling and delivering on-demand audio streaming programs. "
          />
          <meta
            name="keywords"
            content="soundwise, sell audios, on-demand audios, audio courses, podcast conversion, podcasting, audio training, online education, podcast software, podcast hosting,  soundwise, audio publishing, content management system, audio learning, online learning, online course, podcast mobile app"
          />
        </Helmet>
        <div className="header-style8">
          <header className="header-style8" id="header-section16">
            <nav
              className="navbar tz-header-bg no-margin alt-font navigation-menu dark-header"
              data-selector=".tz-header-bg"
            >
              <div className="pull-left">
                <Link to="/" className="inner-link" data-selector="nav a">
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
            className="no-padding position-relative cover-background tz-builder-bg-image border-none hero-style1"
            id="hero-section1"
            data-img-size="(W)1920px X (H)800px"
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.01)), url("images/girl.png")',
            }}
            data-selector=".tz-builder-bg-image"
          >
            <div className="container one-fourth-screen xs-height-400-px position-relative">
              <div className="row">
                <div className="slider-typography xs-position-absolute text-center">
                  <div className="slider-text-middle-main">
                    <div className="slider-text-middle text-left">
                      <div className="col-md-8 col-sm-10 col-xs-12 xs-text-center">
                        <h1
                          className="line-height-55 sm-title-extra-large-3 xs-title-extra-large-4 text-white alt-font margin-six-bottom xs-margin-ten-bottom tz-text"
                          data-selector=".tz-text"
                          style={{
                            color: 'rgb(255, 255, 255)',
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            fontFamily: 'Montserrat, sans-serif',
                            borderRadius: 0,
                            fontSize: 60,
                            fontWeight: 800,
                          }}
                          id="ui-id-19"
                        >
                          <p>SELL MORE AUDIOS </p>
                          <p>ON THE GO</p>
                        </h1>
                        <div
                          className="text-white  xs-text-extra-large width-80 sm-width-90 xs-width-100 margin-eleven-bottom xs-margin-fifteen-bottom tz-text"
                          data-selector=".tz-text"
                          style={{
                            color: 'rgb(255, 255, 255)',
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            fontWeight: 400,
                            fontFamily: 'Open Sans, sans-serif',
                            borderRadius: 0,
                            fontSize: 24,
                          }}
                          id="ui-id-20"
                        >
                          <p>
                            The #1 mobile and web platform for selling and delivering on-demand
                            audio streaming programs.&nbsp;
                          </p>
                        </div>
                        <div className="btn-dual">
                          <Link
                            to="/pricing"
                            className="btn btn-large  text-dark-gray propClone xs-no-margin xs-margin-five-bottom xs-display-block"
                            data-selector="a.btn, button.btn"
                            style={{ backgroundColor: Colors.link }}
                          >
                            <span
                              className="tz-text"
                              data-selector=".tz-text"
                              style={{
                                color: 'rgb(40, 40, 40)',
                                backgroundColor: 'rgba(0, 0, 0, 0)',
                                fontWeight: 600,
                                fontFamily: 'Montserrat, sans-serif',
                                borderRadius: 0,
                                fontSize: 18,
                              }}
                              id="ui-id-62"
                            >
                              START SELLING
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <section
          className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="content-section52"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-md-7 col-sm-7 col-xs-12 xs-text-center xs-margin-nineteen-bottom display-table"
                style={{ height: 510 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    alt=""
                    src="images/2-A.png"
                    data-img-size="(W)800px X (H)788px"
                    data-selector="img"
                  />
                </div>
              </div>
              <div
                className="col-md-5 col-sm-5 col-xs-12 xs-text-center display-table"
                style={{ height: 510 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <h2
                    className="alt-font  sm-section-title-medium  xs-title-extra-large margin-ten-bottom xs-margin-ten-bottom tz-text"
                    data-selector=".tz-text"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontSize: 42,
                      fontWeight: 700,
                      fontFamily: 'Montserrat, sans-serif',
                      borderRadius: 0,
                      color: 'rgb(247, 107, 28)',
                    }}
                    id="ui-id-28"
                  >
                    Sell 20% more audios with no additional work
                  </h2>
                  <div
                    className=" sm-text-medium margin-fifteen-bottom  tz-text"
                    data-selector=".tz-text"
                    style={{
                      color: 'rgb(112, 112, 112)',
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontWeight: 400,
                      fontFamily: 'Open Sans, sans-serif',
                      borderRadius: 0,
                      fontSize: 18,
                    }}
                    id="ui-id-52"
                  >
                    <p>
                      Give listeners the opportunity to buy more of your audios right from their
                      phone. While they’re listening to one of your programs. Automatic increase of
                      customer lifetime value. Without any extra work.
                    </p>
                  </div>
                  <Link
                    to="/pricing"
                    className="btn btn-medium propClone  btn-circle text-white xs-margin-seven-bottom"
                    data-selector="a.btn, button.btn"
                    style={{
                      color: 'rgb(255, 255, 255)',
                      borderColor: 'rgba(0, 0, 0, 0)',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif',
                      borderRadius: 30,
                      backgroundColor: 'rgb(247, 107, 28)',
                    }}
                    id="ui-id-29"
                  >
                    <span
                      className="tz-text"
                      data-selector=".tz-text"
                      style={{
                        color: 'rgb(255, 255, 255)',
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        fontWeight: 600,
                        fontFamily: 'Montserrat, sans-serif',
                        borderRadius: 0,
                        fontSize: 16,
                      }}
                      id="ui-id-51"
                    >
                      START SELLING
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <div
              className="row padding-nine-top margin-nine-top xs-padding-fifteen-top border-top tz-border equalize xs-equalize-auto equalize-display-inherit"
              data-selector=".tz-border"
            >
              <div
                className="col-md-4 col-sm-4 col-xs-12 xs-text-center xs-margin-nine-bottom"
                style={{ height: 54 }}
              >
                <div className="col-md-2 col-sm-2 col-xs-12 xs-margin-seven-bottom">
                  <i
                    className="fas fa-magic title-extra-large sm-title-large xs-title-extra-large-5 text-light-gray2 tz-icon-color"
                    aria-hidden="true"
                    data-selector=".tz-icon-color"
                  />
                </div>
                <div className="col-md-10 col-sm-10 col-xs-12 feature-box-details">
                  <span
                    className="tz-text alt-font font-weight-600 sm-text-medium margin-three-bottom sm-margin-five-bottom xs-margin-three-bottom display-inline-block"
                    data-selector=".tz-text"
                    style={{
                      color: 'rgb(40, 40, 40)',
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif',
                      borderRadius: 0,
                      fontXize: 16,
                    }}
                    id="ui-id-53"
                  >
                    Beautiful mobile and web sales pages for all your audios.&nbsp;
                  </span>
                </div>
              </div>
              <div
                className="col-md-4 col-sm-4 col-xs-12 xs-text-center xs-margin-nine-bottom"
                style={{ height: 54 }}
              >
                <div className="col-md-2 col-sm-2 col-xs-12 xs-margin-seven-bottom">
                  <i
                    className="fas fa-hand-pointer title-extra-large sm-title-large xs-title-extra-large-5 text-light-gray2 tz-icon-color"
                    aria-hidden="true"
                    data-selector=".tz-icon-color"
                  />
                </div>
                <div className="col-md-10 col-sm-10 col-xs-12 feature-box-details">
                  <span
                    className="tz-text alt-font font-weight-600 sm-text-medium margin-three-bottom sm-margin-five-bottom xs-margin-three-bottom display-inline-block"
                    data-selector=".tz-text"
                    style={{
                      color: 'rgb(40, 40, 40)',
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif',
                      borderRadius: 0,
                      fontXize: 16,
                    }}
                    id="ui-id-54"
                  >
                    1-tap purchase from the Soundwise mobile app.&nbsp;
                  </span>
                </div>
              </div>
              <div
                className="col-md-4 col-sm-4 col-xs-12 xs-text-center xs-margin-nine-bottom"
                style={{ height: 54 }}
              >
                <div className="col-md-2 col-sm-2 col-xs-12 xs-margin-seven-bottom">
                  <i
                    className="fas fa-bullhorn title-extra-large sm-title-large xs-title-extra-large-5 text-light-gray2 tz-icon-color"
                    aria-hidden="true"
                    data-selector=".tz-icon-color"
                  />
                </div>
                <div className="col-md-10 col-sm-10 col-xs-12 feature-box-details">
                  <span
                    className="tz-text text-medium text-dark-gray alt-font font-weight-600 sm-text-medium margin-three-bottom sm-margin-five-bottom xs-margin-three-bottom display-inline-block"
                    data-selector=".tz-text"
                    style={{
                      color: 'rgb(40, 40, 40)',
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif',
                      borderRadius: 0,
                      fontXize: 16,
                    }}
                    id="ui-id-55"
                  >
                    Generate leads with free content, e.g. a podcast
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section32"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-lg-5 col-md-6 col-sm-6 xs-12 xs-text-center xs-margin-nineteen-bottom display-table"
                style={{ height: 652 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <h2
                    className="alt-font sm-title-large xs-title-large  margin-eight-bottom tz-text sm-margin-ten-bottom"
                    data-selector=".tz-text"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontSize: 42,
                      fontWeight: 700,
                      fontFamily: 'Montserrat, sans-serif',
                      borderRadius: 0,
                      color: 'rgb(97, 225, 251)',
                    }}
                    id="ui-id-30"
                  >
                    Take control of how you sell
                  </h2>
                  <div
                    className=" tz-text width-90 sm-width-100 margin-seven-bottom sm-margin-ten-bottom"
                    data-selector=".tz-text"
                    style={{
                      color: 'rgb(112, 112, 112)',
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontWeight: 400,
                      fontFamily: 'Open Sans, sans-serif',
                      borderRadius: 0,
                      fontSize: 18,
                    }}
                    id="ui-id-47"
                  >
                    <p>
                      Create your own audio “Netflix” by bundling different programs. Sell your
                      audios as subscription or one-time purchase. Deliver companion content with
                      ease.&nbsp;&nbsp;
                    </p>
                  </div>
                  <div
                    className=" tz-text width-90 sm-width-100 margin-fifteen-bottom sm-margin-ten-bottom"
                    data-selector=".tz-text"
                    style={{
                      color: 'rgb(112, 112, 112)',
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontWeight: 400,
                      fontFamily: 'Open Sans, sans-serif',
                      borderRadius: 0,
                      fontSize: 18,
                    }}
                    id="ui-id-48"
                  >
                    <p>
                      <i
                        className="far fa-play-circle"
                        style={{ color: Colors.link, marginRight: 5 }}
                      />{' '}
                      Charge recurring subscription, one-time fee, or rental fee
                    </p>
                    <p>
                      <i
                        className="far fa-play-circle"
                        style={{ color: Colors.link, marginRight: 5 }}
                      />{' '}
                      Supercharge sales with coupons and limited time promotion
                    </p>
                    <p>
                      <i
                        className="far fa-play-circle"
                        style={{ color: Colors.link, marginRight: 5 }}
                      />{' '}
                      Deliver companion materials in text, image or pdf
                    </p>
                  </div>
                  <Link
                    to="/pricing"
                    className="btn btn-medium propClone btn-circle  text-white"
                    href="#"
                    data-selector="a.btn, button.btn"
                    style={{
                      color: Colors.link,
                      borderColor: 'rgba(0, 0, 0, 0)',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif',
                      borderRadius: 30,
                      backgroundColor: Colors.link,
                    }}
                    id="ui-id-31"
                  >
                    <span
                      className="tz-text"
                      data-selector=".tz-text"
                      style={{
                        color: 'rgb(255, 255, 255)',
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        fontWeight: 600,
                        fontFamily: 'Montserrat, sans-serif',
                        borderRadius: 0,
                        fontSize: 16,
                      }}
                      id="ui-id-49"
                    >
                      START SELLING
                    </span>
                  </Link>
                </div>
              </div>
              <div
                className="col-lg-7 col-md-6 col-sm-6 xs-12 xs-text-center display-table"
                style={{ height: 652 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    alt=""
                    src="images/2-B.png"
                    data-img-size="(W)800px X (H)785px"
                    data-selector="img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="hero-style4">
          <section
            id="testimonials-section11"
            className="bg-light-orange builder-bg testimonial-style11 border-none"
          >
            <div className="container position-relative">
              <div className="row equalize xs-equalize-auto equalize-display-inherit">
                <div
                  className="col-md-6 col-sm-6 col-xs-12 slider-text-middle text-left xs-text-center pull-right display-table"
                  style={{ height: 698 }}
                >
                  <div className="display-table-cell-vertical-middle padding-nineteen no-padding-lr">
                    <div className="icon-big text-white margin-two-bottom">
                      <i className="fas fa-quote-left tz-icon-color" aria-hidden="true" />
                    </div>
                    <h1 className="alt-font text-large text-white sm-title-small xs-title-medium margin-eight-bottom tz-text width-80 sm-width-100 font-weight-600">
                      I chose to create my teaching materials in audio, because my customers are
                      busy parents who often don’t have the blocks of time to read or watch content.
                      Using Soundwise allows them to listen and learn about parenting from me while
                      driving their kids around. I’m not necessarily tech savvy. That’s why
                      Soundwise is a godsend. Because their team held my hand through every step of
                      setting up my soundcasts. They really have the best customer service!
                    </h1>
                    <div className="text-large text-golden-yellow margin-ten-top">
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb no-margin-left"
                        aria-hidden="true"
                      />
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb"
                        aria-hidden="true"
                      />
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb"
                        aria-hidden="true"
                      />
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb"
                        aria-hidden="true"
                      />
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="tz-text alt-font text-medium text-dark-gray font-weight-600">
                      Evonne Weinhaus, best-selling author and relationship therapist{' '}
                    </div>
                    <div>
                      <a
                        target="_blank"
                        href="http://evonneweinhaus.com/"
                        className="tz-text alt-font text-white text-medium sm-text-medium"
                      >
                        evonneweinhaus.com
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-xs-12 display-table" style={{ height: 698 }}>
                  <div className="display-table-cell-vertical-bottom">
                    <img src="images/testimonial1.png" data-img-size="(W)600px X (H)741px" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <section
          className="padding-110px-tb xs-padding-60px-tb bg-light-gray builder-bg border-none"
          id="content-section4"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-md-5 col-sm-5 col-xs-12 text-center xs-margin-fifteen-bottom display-table"
                style={{ height: 603 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    src="images/2-C.png"
                    data-img-size="(W)296px X (H)603px"
                    alt=""
                    data-selector="img"
                  />
                </div>
              </div>
              <div className="col-md-7 col-sm-7 col-xs-12 display-table" style={{ height: 603 }}>
                <div className="display-table-cell-vertical-middle">
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12 section-title5 margin-eleven-bottom xs-margin-fifteen-bottom xs-text-center">
                      <h2
                        className=" sm-section-title-medium xs-section-title-large width-90 sm-width-100  alt-font line-height-45 margin-five-bottom tz-text"
                        data-selector=".tz-text"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          fontSize: 42,
                          fontWeight: 700,
                          fontFamily: 'Montserrat, sans-serif',
                          borderRadius: 0,
                          color: 'rgb(247, 107, 28)',
                        }}
                        id="ui-id-33"
                      >
                        Impress your customers with professional delivery
                      </h2>
                      <div
                        className=" width-90 sm-width-100 tz-text"
                        data-selector=".tz-text"
                        style={{
                          color: 'rgb(112, 112, 112)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          fontWeight: 400,
                          fontFamily: 'Open Sans, sans-serif',
                          borderRadius: 0,
                          fontSize: 18,
                        }}
                        id="ui-id-40"
                      >
                        No more file transfer hassle for your listeners. Immediate access to your
                        content on Soundwise mobile and web apps after purchase.
                      </div>
                    </div>
                  </div>
                  <div className="row two-column">
                    <div className="col-md-6 col-sm-6 col-xs-12 features-box margin-six-bottom xs-text-center xs-margin-nine-bottom">
                      <div className="margin-seven-bottom xs-margin-three-bottom">
                        <i
                          className="fas fa-angle-double-down  tz-icon-color ti-world"
                          aria-hidden="true"
                          data-selector=".tz-icon-color"
                          style={{
                            fontSize: 30,
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            color: 'rgb(247, 107, 28)',
                          }}
                          id="ui-id-32"
                        />
                      </div>
                      <h3
                        className=" font-weight-600 display-block margin-two-bottom tz-text"
                        data-selector=".tz-text"
                        style={{
                          color: 'rgb(40, 40, 40)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          fontWeight: 600,
                          fontFamily: 'Open Sans, sans-serif',
                          borderRadius: 0,
                          fontSize: 18,
                        }}
                        id="ui-id-42"
                      >
                        Intimate
                      </h3>
                      <div
                        className=" tz-text"
                        data-selector=".tz-text"
                        style={{
                          color: 'rgb(112, 112, 112)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          fontWeight: 400,
                          fontFamily: 'Open Sans, sans-serif',
                          borderRadius: 0,
                          fontSize: 18,
                        }}
                        id="ui-id-41"
                      >
                        <p>
                          <span>
                            Listeners can enjoy your audios from their phone IMMEDIATELY after they
                            buy.
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6 col-sm-6 col-xs-12 features-box margin-six-bottom xs-text-center xs-margin-nine-bottom">
                      <div className="margin-seven-bottom xs-margin-three-bottom">
                        <i
                          className="fas fa-hdd icon-medium tz-icon-color"
                          aria-hidden="true"
                          data-selector=".tz-icon-color"
                          style={{ color: Colors.mainOrange }}
                        />
                      </div>
                      <h3
                        className=" font-weight-600 display-block margin-two-bottom tz-text"
                        data-selector=".tz-text"
                        style={{
                          color: 'rgb(40, 40, 40)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          fontWeight: 600,
                          fontFamily: 'Open Sans, sans-serif',
                          borderRadius: 0,
                          fontSize: 18,
                        }}
                        id="ui-id-43"
                      >
                        Secure
                      </h3>
                      <div
                        className=" tz-text"
                        data-selector=".tz-text"
                        style={{
                          color: 'rgb(112, 112, 112)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          fontWeight: 400,
                          fontFamily: 'Open Sans, sans-serif',
                          borderRadius: 0,
                          fontSize: 18,
                        }}
                        id="ui-id-44"
                      >
                        <p>
                          Your audios files are never exposed. No need to worry about unauthorized
                          copying.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6 col-sm-6 col-xs-12 features-box xs-margin-eleven-bottom xs-text-center xs-margin-nine-bottom">
                      <div className="margin-seven-bottom xs-margin-three-bottom">
                        <i
                          className="far fa-chart-bar icon-medium tz-icon-color ti-pencil-alt"
                          aria-hidden="true"
                          data-selector=".tz-icon-color"
                          style={{
                            fontSize: 30,
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            color: 'rgb(247, 107, 28)',
                          }}
                          id="ui-id-34"
                        />
                      </div>
                      <h3
                        className="text-large text-dark-gray font-weight-600 display-block margin-two-bottom tz-text"
                        data-selector=".tz-text"
                      >
                        Smart
                      </h3>
                      <div
                        className=" tz-text"
                        data-selector=".tz-text"
                        style={{
                          color: 'rgb(112, 112, 112)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          fontWeight: 400,
                          fontFamily: 'Open Sans, sans-serif',
                          borderRadius: 0,
                          fontSize: 18,
                        }}
                        id="ui-id-45"
                      >
                        <p>
                          Know how your content is consumed. Track listening record of every
                          listener.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6 col-sm-6 col-xs-12 features-box xs-text-center">
                      <div className="margin-seven-bottom xs-margin-three-bottom">
                        <i
                          className="fas fa-laptop icon-medium tz-icon-color ti-gallery"
                          aria-hidden="true"
                          data-selector=".tz-icon-color"
                          style={{
                            fontSize: 30,
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            color: 'rgb(247, 107, 28)',
                          }}
                          id="ui-id-35"
                        />
                      </div>
                      <h3
                        className="text-large text-dark-gray font-weight-600 display-block margin-two-bottom tz-text"
                        data-selector=".tz-text"
                      >
                        Easy
                      </h3>
                      <div
                        className=" tz-text"
                        data-selector=".tz-text"
                        style={{
                          color: 'rgb(112, 112, 112)',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          fontWeight: 400,
                          fontFamily: 'Open Sans, sans-serif',
                          borderRadius: 0,
                          fontSize: 18,
                        }}
                        id="ui-id-46"
                      >
                        <p>
                          Your customers can listen from all their devices with progress remembered.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section51"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-md-6 col-sm-6 xs-12 xs-text-center xs-margin-nineteen-bottom display-table"
                style={{ height: 481 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <h2
                    className="alt-font  sm-title-large xs-section-title-large line-height-40 width-90 sm-width-100 margin-eight-bottom tz-text sm-margin-ten-bottom"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontSize: 42,
                      fontWeight: 700,
                      fontFamily: 'Montserrat, sans-serif',
                      color: 'rgb(97, 225, 251)',
                    }}
                    data-selector=".tz-text"
                    id="ui-id-37"
                  >
                    Build a listener community
                  </h2>
                  <div
                    className="text-extra-large tz-text width-90 sm-width-100 margin-five-bottom sm-margin-ten-bottom"
                    data-selector=".tz-text"
                  >
                    <div>
                      Inspire listeners to become active members of your community. Listener avatars
                      and profiles help them get to know one another. Comments and messages help you
                      stay connected.
                    </div>
                    <div />
                  </div>
                  <div
                    className=" tz-text width-90 sm-width-100 margin-ten-bottom sm-margin-ten-bottom xs-margin-twenty-bottom"
                    style={{
                      color: 'rgb(112, 112, 112)',
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontWeight: 400,
                      fontFamily: 'Open Sans, sans-serif',
                      borderRadius: 0,
                      fontSize: 18,
                    }}
                    data-selector=".tz-text"
                    id="ui-id-39"
                  >
                    <p>
                      <i
                        className="far fa-check-circle"
                        style={{ color: Colors.link, marginRight: 5 }}
                      />{' '}
                      Send group messages and emails to your listeners
                    </p>
                    <p>
                      <i
                        className="far fa-check-circle"
                        style={{ color: Colors.link, marginRight: 5 }}
                      />{' '}
                      Encourage your listeners to post comments
                    </p>
                  </div>
                  <Link
                    className="btn-medium btn-circle btn  btn-border  propClone"
                    to="/pricing"
                    data-selector="a.btn, button.btn"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif',
                      borderRadius: 30,
                      color: 'rgb(97, 225, 251)',
                      borderColor: 'rgb(97, 225, 251)',
                    }}
                    id="ui-id-38"
                  >
                    <span
                      className="tz-text"
                      style={{
                        color: 'rgb(97, 225, 251)',
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        fontWeight: 600,
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: 16,
                      }}
                      data-selector=".tz-text"
                      id="ui-id-50"
                    >
                      START SELLING
                    </span>
                  </Link>
                </div>
              </div>
              <div
                className="col-md-6 col-sm-6 xs-12 xs-text-center display-table"
                style={{ height: 481 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    alt=""
                    src="images/2-D.png"
                    data-img-size="(W)800px X (H)681px"
                    data-selector="img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="hero-style4">
          <section
            id="testimonials-section11"
            className="bg-light-orange builder-bg testimonial-style11 border-none"
          >
            <div className="container position-relative">
              <div className="row equalize xs-equalize-auto equalize-display-inherit">
                <div
                  className="col-md-6 col-sm-6 col-xs-12 pull-right slider-text-middle text-left xs-text-center  display-table"
                  style={{ height: 598 }}
                >
                  <div className="display-table-cell-vertical-middle padding-nineteen no-padding-lr">
                    <div className="icon-big text-white margin-two-bottom">
                      <i className="fas fa-quote-left tz-icon-color" aria-hidden="true" />
                    </div>
                    <h1 className="alt-font text-large text-white sm-title-small xs-title-medium margin-eight-bottom tz-text width-80 sm-width-100 font-weight-600">
                      It’s been a fantastic experience using Soundwise to deliver our automobile
                      sales training materials. Our students are sales professionals who are on the
                      go a lot. Having the trainings in audio delivered to their phone not only
                      saves their time, but gives them the maximum learning flexibility. The team at
                      Soundwise is the most helpful and customer-oriented. They go above and beyond
                      to help us achieve what we want, and have given us recommendations on
                      positioning and selling our materials that we might not have otherwise thought
                      of. We couldn’t have asked for a better partner...
                    </h1>
                    <div className="text-large text-golden-yellow margin-ten-top">
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb no-margin-left"
                        aria-hidden="true"
                      />
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb"
                        aria-hidden="true"
                      />
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb"
                        aria-hidden="true"
                      />
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb"
                        aria-hidden="true"
                      />
                      <i
                        className="fa fa-star tz-icon-color margin-one-half no-margin-tb"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="tz-text alt-font text-medium text-dark-gray font-weight-600">
                      Steven Burns, Founder & CEO, MOTiiV
                    </div>
                    <div>
                      <a
                        target="_blank"
                        href="https://www.motiiv.net/"
                        className="tz-text alt-font text-white text-medium sm-text-medium"
                      >
                        motiiv.net
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-xs-12 display-table" style={{ height: 598 }}>
                  <div className="display-table-cell-vertical-bottom">
                    <img src="images/testimonial2.png" data-img-size="(W)600px X (H)741px" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <section
          className="padding-110px-tb bg-white builder-bg feature-style1 xs-padding-60px-tb"
          id="feature-section1"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  HOW IT WORKS
                </h2>
              </div>
            </div>
            <div className="row four-column">
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="padding-ten border-radius-8 bg-white border-light builder-bg"
                  data-selector=".builder-bg"
                >
                  <div
                    className="title-extra-large-5 margin-fifteen-top"
                    style={{ color: Colors.link }}
                  >
                    <i
                      className="fas fa-upload tz-icon-color"
                      aria-hidden="true"
                      data-selector=".tz-icon-color"
                    />
                  </div>
                  <div
                    className="content-box bg-light-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <h3
                      className="text-medium alt-font text-dark-gray margin-seven-bottom sm-margin-three-bottom tz-text"
                      data-selector=".tz-text"
                    >
                      UPLOAD
                    </h3>
                    <div className="tz-text text-medium" data-selector=".tz-text">
                      {' '}
                      <p className="no-margin-bottom">
                        Upload your audios and supplementary materials.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="padding-ten border-radius-8 bg-white border-light builder-bg"
                  data-selector=".builder-bg"
                >
                  <div
                    className="title-extra-large-5 margin-fifteen-top"
                    style={{ color: Colors.link }}
                  >
                    <i
                      className="far fa-file-alt tz-icon-color"
                      aria-hidden="true"
                      data-selector=".tz-icon-color"
                    />
                  </div>
                  <div
                    className="content-box bg-light-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <h3
                      className="text-medium alt-font text-dark-gray margin-seven-bottom sm-margin-three-bottom tz-text"
                      data-selector=".tz-text"
                    >
                      POLISH
                    </h3>
                    <div className="tz-text text-medium" data-selector=".tz-text">
                      {' '}
                      <p className="no-margin-bottom">
                        Make a landing page and make it pretty.
                      </p>{' '}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="padding-ten border-radius-8 bg-white border-light builder-bg"
                  data-selector=".builder-bg"
                >
                  <div
                    className="title-extra-large-5 margin-fifteen-top"
                    style={{ color: Colors.link }}
                  >
                    <i
                      className="fas fa-dollar-sign tz-icon-color"
                      aria-hidden="true"
                      data-selector=".tz-icon-color"
                    />
                  </div>
                  <div
                    className="content-box bg-light-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <h3
                      className="text-medium alt-font text-dark-gray margin-seven-bottom sm-margin-three-bottom tz-text"
                      data-selector=".tz-text"
                    >
                      PRICE IT
                    </h3>
                    <div className="tz-text text-medium" data-selector=".tz-text">
                      {' '}
                      <p className="no-margin-bottom">
                        Set your price and connect your payout account.
                      </p>{' '}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="padding-ten border-radius-8 bg-white border-light builder-bg"
                  data-selector=".builder-bg"
                >
                  <div
                    className="title-extra-large-5 margin-fifteen-top"
                    style={{ color: Colors.link }}
                  >
                    <i
                      className="far fa-credit-card tz-icon-color"
                      aria-hidden="true"
                      data-selector=".tz-icon-color"
                    />
                  </div>
                  <div
                    className="content-box bg-light-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <h3
                      className="text-medium alt-font text-dark-gray margin-seven-bottom sm-margin-three-bottom tz-text"
                      data-selector=".tz-text"
                    >
                      SELL
                    </h3>
                    <div className="tz-text text-medium" data-selector=".tz-text">
                      {' '}
                      <p className="no-margin-bottom">
                        Start selling on web and mobile. Collect money.
                      </p>{' '}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-110px-tb xs-padding-60px-tb  builder-bg border-none"
          id="demo_request"
          data-selector=".builder-bg"
          style={{ backgroundColor: Colors.link }}
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto">
              <div
                className="col-md-7 col-sm-6 col-xs-12 xs-margin-thirteen-bottom display-table"
                style={{ height: 200 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <h1
                    className="title-extra-large-2 alt-font sm-title-extra-large xs-title-extra-large text-white font-weight-700 margin-five-bottom tz-text width-80 sm-width-100"
                    data-selector=".tz-text"
                  >
                    <p>WATCH SOUNDWISE DEMO VIDEO</p>
                  </h1>
                  <div
                    className="text-extra-large xs-text-extra-large width-80 sm-width-100 tz-text text-white"
                    data-selector=".tz-text"
                  >
                    Sell more audios. Build an engaged audience. Turn more listeners into customers.
                  </div>
                </div>
              </div>
              <div className="col-md-5 col-sm-6 col-xs-12 display-table" style={{ height: 200 }}>
                <div className="display-table-cell-vertical-middle">
                  <form onSubmit={this.requestDemo}>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      data-email="required"
                      placeholder="*First Name"
                      className="big-input border-radius-4"
                      onChange={e => this.handleChange('name', e)}
                    />
                    <input
                      type="text"
                      name="email"
                      id="email"
                      data-email="required"
                      placeholder="*Email"
                      className="big-input border-radius-4"
                      onChange={e => this.handleChange('email', e)}
                    />
                    <button
                      type="submit"
                      className="contact-submit btn btn-large propClone  text-white builder-bg tz-text"
                      data-selector=".tz-text"
                      style={{ backgroundColor: Colors.mainOrange }}
                    >
                      <p>REQUEST DEMO</p>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="call-to-action4 padding-90px-tb builder-bg offer bg-gray border-none xs-padding-60px-tb"
          id="callto-action4"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-md-6 col-sm-6 col-xs-12 display-table slider-text-middle text-left xs-margin-nineteen-bottom xs-text-center"
                style={{ height: 585 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div className="offer-box-left">
                    <span
                      className=" alt-font xs-title-extra-large letter-spacing-minus-1 text-dark-gray display-block font-weight-700 margin-nine-bottom tz-text"
                      style={{
                        color: 'rgb(40, 40, 40)',
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        fontWeight: 700,
                        fontFamily: 'Montserrat, sans-serif',
                        borderRadius: 0,
                        fontSize: 60,
                        lineHeight: '65px',
                      }}
                      data-selector=".tz-text"
                      id="ui-id-70"
                    >
                      Sell and deliver your audios with confidence
                    </span>
                    <div
                      className="width-90 sm-width-100 margin-sixteen-bottom tz-text"
                      data-selector=".tz-text"
                      style={{
                        color: 'rgb(112, 112, 112)',
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        fontWeight: 400,
                        fontFamily: 'Open Sans, sans-serif',
                        fontSize: 18,
                      }}
                      id="ui-id-59"
                    >
                      <p>
                        Get your audio programs on Soundwise today. Make more money. Make a bigger
                        impact. Make your customers happy.&nbsp;
                      </p>
                    </div>
                  </div>
                  <div className="float-left width-100 xs-text-center">
                    <a
                      target="_blank"
                      href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8"
                      className="sm-width-140px float-left xs-float-none xs-display-inline-block"
                    >
                      <img
                        src="images/app-store-badge.png"
                        data-img-size="(W)200px X (H)61px"
                        style={{ width: 200 }}
                        alt=""
                        data-selector="img"
                      />
                    </a>
                    <a
                      target="_blank"
                      href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android"
                      className="sm-width-140px float-left xs-float-none margin-five-left xs-margin-two-left xs-display-inline-block"
                    >
                      <img
                        src="images/google-play-badge.png"
                        data-img-size="(W)200px X (H)61px"
                        style={{ width: 200 }}
                        alt=""
                        data-selector="img"
                      />
                    </a>
                  </div>
                </div>
              </div>
              <div
                className="col-md-6 col-sm-6 col-xs-12 display-table text-right xs-margin-lr-auto xs-fl-none xs-no-padding-bottom"
                style={{ height: 585 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    src="images/2-E.png"
                    data-img-size="(W)800px X (H)828px"
                    alt=""
                    data-selector="img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-60px-tb builder-bg border-none"
          id="callto-action2"
          data-selector=".builder-bg"
          style={{
            padding: '60px 0px',
            borderColor: 'rgb(112, 112, 112)',
            backgroundColor: 'rgb(247, 107, 28)',
          }}
        >
          <div className="container">
            <div className="row equalize">
              <div
                className="col-md-12 col-sm-12 col-xs-12 text-center sm-margin-twenty-one-bottom"
                style={{ height: 47 }}
              >
                <div
                  className="display-inline-block sm-display-block vertical-align-middle margin-five-right sm-no-margin-right sm-margin-ten-bottom tz-text alt-font text-white title-medium sm-title-medium"
                  data-selector=".tz-text"
                >
                  30-day money back guarantee. No risk required.
                </div>
                <Link
                  to="/pricing"
                  className="btn-large btn text-white highlight-button-white-border btn-circle"
                  data-selector="a.btn, button.btn"
                >
                  <span
                    className="tz-text"
                    data-selector=".tz-text"
                    style={{
                      color: 'rgb(255, 255, 255)',
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 18,
                    }}
                    id="ui-id-61"
                  >
                    START SELLING
                  </span>
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

export const LandingPageSelling = connect(
  mapStateToProps,
  mapDispatchToProps
)(_LandingPageSelling);
