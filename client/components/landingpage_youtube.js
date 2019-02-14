import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import { bindActionCreators } from 'redux';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Colors from '../styles/colors';
import Axios from 'axios';

import Footer from './footer';
import { signoutUser } from '../actions/index';
import { emailValidator } from '../helpers/validators';

class _LandingPageYoutube extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonValue: 0,
      name: '',
      email: '',
    };
    this.requestDemo = this.requestDemo.bind(this);
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
        source: 'youtube_demo',
      })
        .then(res => {
          //As firebase sends realtime notifications, we do not really need this, but what the heck!
          this.props.history.push('/youtube_demo');
        })
        .catch(error => {
          alert('Oops, we had an error.');
        });
    }
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
        <Helmet>
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://mysoundwise.com/selling" />
          <meta
            property="og:title"
            content="Triple your audience growth with Soundwise's Youtube to podcast convertion tool"
          />
          <meta property="fb:app_id" content="1726664310980105" />
          <meta
            property="og:description"
            content="Soundwise is the leading mobile and web platform for entrepreneurial experts to sell and deliver on-demand audios and increase audience retention with mobile-based audio content."
          />
          <meta
            property="og:image"
            content="https://mysoundwise.com/images/soundwise-youtube.png"
          />
          <title>
            Triple your audience growth with Soundwise's Youtube to podcast convertion tool{' '}
          </title>
          <meta
            name="description"
            content="Reach a bigger audience for your Youtube channel by automatically converting it into a podcast and distributing it to iTunes, Spotify, and Google Podcasts, with Soundwise's easy-to-use Youtube conversion tool. "
          />
          <meta
            name="keywords"
            content="soundwise, youtube, youtube offline, youtube channel growth, podcast, on-demand audios, content repurpose, podcast conversion, podcasting, podcast software, podcast hosting, audio publishing, content management system, audio learning, online learning, podcast mobile app"
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
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("images/youtubeBackground.png")',
              outlineOffset: -3,
              height: 700,
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
                          className="title-extra-large-2 line-height-55 sm-title-extra-large xs-title-extra-large text-white alt-font margin-six-bottom xs-margin-ten-bottom tz-text"
                          data-selector=".tz-text"
                          style={{}}
                        >
                          Triple Your YouTube Channel audience
                        </h1>
                        <div
                          className="text-white text-extra-large xs-text-extra-large width-80 sm-width-90 xs-width-100 margin-eleven-bottom xs-margin-fifteen-bottom tz-text"
                          data-selector=".tz-text"
                          style={{}}
                        >
                          <p>
                            Automatically convert your YouTube channel into an audio podcast and
                            distribute it to iTunes, Spotify, and Google Podcasts. So that more
                            people will find you.
                          </p>
                        </div>
                        <div className="btn-dual">
                          <Link
                            className="btn btn-large  text-dark-gray propClone xs-no-margin xs-margin-five-bottom xs-display-block"
                            to="/pricing"
                            data-selector="a.btn, button.btn"
                            style={{ backgroundColor: Colors.mainOrange }}
                          >
                            <span className="tz-text" data-selector=".tz-text" style={{}}>
                              GET STARTED
                            </span>
                            <i
                              className="fa fa-arrow-right icon-extra-small tz-icon-color"
                              data-selector=".tz-icon-color"
                            />
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
          className="padding-60-tb xs-padding-60px-tb bg-white builder-bg"
          id="feature-section34"
          data-selector=".builder-bg"
          style={{ marginBottom: 35 }}
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="text-center title-extra-large-2 sm-title-large xs-title-extra-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  style={{}}
                  data-selector=".tz-text"
                >
                  Reach New Audience. With No Extra Work.
                </h2>
                <div
                  className="text-extra-large text-dark-gray font-weight-500 margin-five-bottom xs-margin-nineteen-bottom xs-text-center tz-text"
                  style={{}}
                  data-selector=".tz-text"
                >
                  Podcast is the fastest growing content medium. Soundwise’s YouTube integration
                  service is the easiest way to create a podcast from the content of your YouTube
                  channel—fast. With just a few clicks, your content will show up on the hottest
                  podcast platforms including iTunes, Spotify, and Google Podcasts. With the same
                  amount of work, you can now triple your audience reach.&nbsp;
                </div>
              </div>
            </div>
            <div className="row text-center">
              <img
                src="images/youtubeAccent.png"
                data-img-size="(W)958px X (H)115px"
                alt=""
                data-selector="img"
                style={{}}
              />
            </div>
          </div>
        </section>
        <section
          className="padding-70px-tb xs-padding-60px-tb  builder-bg border-none"
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
                    <p>WATCH SOUNDWISE'S YOUTUBE CONVERSION DEMO</p>
                  </h1>
                </div>
              </div>
              <div
                className="col-md-5 col-sm-6 col-xs-12 display-table"
                style={{ height: 200, marginTop: 20 }}
              >
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
          className="padding-60-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section28"
          data-selector=".builder-bg"
          style={{}}
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-md-6  col-sm-6 col-xs-12 xs-text-center xs-margin-nineteen-bottom display-table"
                style={{ height: 638 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <h2
                    className="title-extra-large-2 sm-title-large xs-title-extra-large  text-dark-gray width-90 sm-width-100 margin-eight-bottom tz-text sm-margin-ten-bottom alt-font"
                    style={{}}
                    data-selector=".tz-text"
                  >
                    Hassle-free channel and playlist conversion and file hosting
                  </h2>
                  <div
                    className="text-extra-large text-dark-gray font-weight-500 margin-fifteen-bottom xs-margin-nineteen-bottom xs-text-center tz-text"
                    style={{}}
                    data-selector=".tz-text"
                  >
                    <p>
                      Converting videos from your entire YouTube channel or single playlist into an
                      audio podcast with proper ID3 tags, file hosting, and automatic RSS feed
                      update. All done with a few clicks.
                    </p>
                  </div>

                  <Link
                    className="btn btn-3d btn-large propClone text-white"
                    to="/pricing"
                    data-selector="a.btn, button.btn"
                    style={{ backgroundColor: Colors.link }}
                  >
                    <span className="tz-text" data-selector=".tz-text">
                      GET STARTED TODAY
                    </span>
                  </Link>
                </div>
              </div>
              <div
                className="col-md-5 col-sm-6 col-xs-12 xs-text-center display-table"
                style={{ height: 638, paddingTop: 50 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    alt=""
                    src="images/youtubeSideBar2.png"
                    data-img-size="(W)465px X (H)638px"
                    data-selector="img"
                    style={{}}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-30px-tb feature-style29 bg-white builder-bg xs-padding-60px-tb"
          id="content-section44"
          data-selector=".builder-bg"
          style={{}}
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-md-6 display-table col-sm-12 col-xs-12 xs-margin-nineteen-bottom sm-height-auto"
                style={{}}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    className="img-responsive sm-width-60 xs-width-100 margin-lr-auto sm-margin-twenty-bottom"
                    src="images/youtube-1.png"
                    data-img-size="(W)984px X (H)1376px"
                    alt=""
                    data-selector="img"
                    style={{}}
                  />
                </div>
              </div>
              <div className="col-md-6 col-sm-12 col-xs-12 display-table sm-height-auto" style={{}}>
                <div className="display-table-cell-vertical-middle">
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <h2
                      className="title-extra-large-2 sm-title-large xs-title-extra-large xs-title-large text-dark-gray width-90 sm-width-100 margin-eight-bottom tz-text sm-margin-ten-bottom alt-font"
                      style={{}}
                      data-selector=".tz-text"
                    >
                      Boost sound quality and add intro / outro with 1 click
                    </h2>
                    <p
                      className="text-extra-large text-dark-gray font-weight-500 margin-fifteen-bottom xs-margin-nineteen-bottom xs-text-center tz-text"
                      style={{}}
                      data-selector=".tz-text"
                    >
                      We automatically optimize the volume and sound quality of your converted
                      audios. You are also able to attach pre-recorded episode intro and outro to
                      each episode. So that you can sound professional and on-brand without any of
                      the audio editing hassle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-60px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section28"
          data-selector=".builder-bg"
          style={{}}
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-md-6 col-sm-6 col-xs-12 xs-text-center xs-margin-nineteen-bottom display-table"
                style={{ height: 638 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <h2
                    className="title-extra-large-2 sm-title-large xs-title-extra-large xs-title-large text-dark-gray width-90 sm-width-100 margin-eight-bottom tz-text sm-margin-ten-bottom alt-font"
                    style={{}}
                    data-selector=".tz-text"
                  >
                    Automatic distribution and updates
                  </h2>
                  <div
                    className="text-extra-large text-dark-gray font-weight-500 margin-fifteen-bottom xs-margin-nineteen-bottom xs-text-center tz-text"
                    style={{}}
                    data-selector=".tz-text"
                  >
                    <p>
                      We submit your Youtube-converted podcast to Apple Podcasts, Google Podcasts,
                      and Spotify, without you lifting a finger. (You can also opt to submit it
                      yourself for maximum flexibility.) <p />
                      Your podcast is automatically updated whenever you upload new videos to your
                      YouTube channel.
                    </p>
                  </div>

                  <Link
                    className="btn btn-3d btn-large propClone text-white"
                    to="/pricing"
                    data-selector="a.btn, button.btn"
                    style={{ backgroundColor: Colors.mainGreen }}
                  >
                    <span className="tz-text" data-selector=".tz-text" style={{}}>
                      GET STARTED TODAY
                    </span>
                  </Link>
                </div>
              </div>
              <div className="col-md-6 col-sm-6 col-xs-12 xs-text-center display-table" style={{}}>
                <div className="display-table-cell-vertical-middle">
                  <img
                    alt=""
                    src="images/youtubeSideBar1.png"
                    data-img-size="(W)525px X (H)720px"
                    data-selector="img"
                    style={{}}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-30px-tb feature-style29 bg-white builder-bg xs-padding-60px-tb"
          id="content-section44"
          data-selector=".builder-bg"
          style={{}}
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit ">
              <div
                className="col-md-6 display-table col-sm-12 col-xs-12 xs-margin-nineteen-bottom sm-height-auto"
                style={{}}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    className="img-responsive sm-width-60 xs-width-100 margin-lr-auto sm-margin-twenty-bottom"
                    src="images/1-E.png"
                    data-img-size="(W)984px X (H)1376px"
                    alt=""
                    data-selector="img"
                    style={{}}
                  />
                </div>
              </div>
              <div className="col-md-6 col-sm-12 col-xs-12 display-table sm-height-auto" style={{}}>
                <div className="display-table-cell-vertical-middle">
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <h2
                      className="title-extra-large-2 sm-title-large xs-title-extra-large xs-title-large text-dark-gray width-90 sm-width-100 margin-eight-bottom tz-text sm-margin-ten-bottom alt-font"
                      style={{}}
                      data-selector=".tz-text"
                    >
                      Easily sell your Youtube audios
                    </h2>
                    <p
                      className="text-extra-large text-dark-gray font-weight-500 margin-fifteen-bottom xs-margin-nineteen-bottom xs-text-center tz-text"
                      style={{}}
                      data-selector=".tz-text"
                    >
                      With a few clicks, you can set up your Youtube-converted audios for sale. Your
                      audience get to access your content on the go, with offline playback and
                      background playback, via the Soundwise mobile app. And you get to make extra
                      money.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-30px-tb xs-padding-30px-tb bg-white builder-bg border-none"
          id="title-section1"
          data-selector=".builder-bg"
          style={{}}
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="margin-lr-auto title-extra-large-2 sm-title-large xs-title-extra-large xs-title-large text-dark-gray width-90 sm-width-100 margin-eight-bottom tz-text sm-margin-ten-bottom alt-font"
                  style={{}}
                  data-selector=".tz-text"
                >
                  HOW IT WORKS
                </h2>
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-60px-tb xs-padding-30px-tb bg-white builder-bg"
          id="content-section36"
          data-selector=".builder-bg"
          style={{}}
        >
          <div className="container-fluid">
            <div className="row four-column">
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font tz-text font-weight-600"
                  data-selector=".tz-text"
                  style={{ color: Colors.mainOrange }}
                >
                  01.
                </div>
                <h3
                  className="text-dark-gray text-extra-large alt-font display-block tz-text"
                  data-selector=".tz-text"
                  style={{}}
                >
                  Sign up for a Soundwise account.
                </h3>

                <div className="text-medium tz-text" data-selector=".tz-text" style={{}}>
                  <p>
                    Set up a soundcast which your converted audios will belong to. You need as
                    little as a title and a cover art image to get started. You can set the
                    soundcast to be either free or paid.&nbsp;&nbsp;
                  </p>
                </div>
                <div
                  className="separator-line2 margin-twenty-top tz-background-color"
                  style={{ backgroundColor: Colors.mainOrange }}
                  data-selector=".tz-background-color"
                />
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font  tz-text font-weight-600"
                  data-selector=".tz-text"
                  style={{ color: Colors.mainOrange }}
                >
                  02.
                </div>
                <h3
                  className="text-dark-gray text-extra-large alt-font display-block tz-text"
                  data-selector=".tz-text"
                  style={{}}
                >
                  Connect your YouTube channel.
                </h3>

                <div className="text-medium tz-text" data-selector=".tz-text" style={{}}>
                  <p>
                    Sign in to your YouTube account from your Soundwise dashboard, and link your
                    channel to the soundcast you created. You can choose whether to convert the
                    whole channel or just a playlist.
                  </p>
                </div>
                <div
                  className="separator-line2 margin-twenty-top tz-background-color"
                  data-selector=".tz-background-color"
                  style={{ backgroundColor: Colors.mainOrange }}
                />
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font tz-text font-weight-600"
                  data-selector=".tz-text"
                  style={{ color: Colors.mainOrange }}
                >
                  03.
                </div>
                <h3
                  className="text-dark-gray text-extra-large alt-font display-block tz-text"
                  data-selector=".tz-text"
                  style={{}}
                >
                  We convert your channel into audios and automatically update it.
                </h3>

                <div className="text-medium tz-text" data-selector=".tz-text" style={{}}>
                  <p>
                    We’ll populate your soundcast with audios converted from YouTube. For a free
                    soundcast, you can opt to create a podcast feed. We'll submit it on your behalf
                    to all major podcasting platforms. Or you can set the soundcast to be paid and
                    start selling. &nbsp;
                  </p>
                </div>
                <div
                  className="separator-line2 margin-twenty-top tz-background-color"
                  data-selector=".tz-background-color"
                  style={{ backgroundColor: Colors.mainOrange }}
                />
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font tz-text font-weight-600"
                  data-selector=".tz-text"
                  style={{ color: Colors.mainOrange }}
                >
                  04.
                </div>
                <h3
                  className="text-dark-gray text-extra-large alt-font display-block tz-text"
                  data-selector=".tz-text"
                  style={{}}
                >
                  Sit back and relax.
                </h3>

                <div className="text-medium tz-text" data-selector=".tz-text" style={{}}>
                  <p>
                    Because it’s that simple :) No additional work needed on your part after you
                    link your YouTube channel to Soundwise. Enjoy accelerated audience growth while
                    you take a nap.
                  </p>
                </div>
                <div
                  className="separator-line2 margin-twenty-top tz-background-color"
                  data-selector=".tz-background-color"
                  style={{ backgroundColor: Colors.mainOrange }}
                />
              </div>
            </div>
          </div>
        </section>
        <section
          className="padding-70px-tb xs-padding-60px-tb  builder-bg border-none"
          id="demo_request1"
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
                    <p>WATCH SOUNDWISE'S YOUTUBE CONVERSION DEMO</p>
                  </h1>
                  <div
                    className="text-extra-large xs-text-extra-large width-80 sm-width-100 tz-text text-white"
                    data-selector=".tz-text"
                  />
                </div>
              </div>
              <div
                className="col-md-5 col-sm-6 col-xs-12 display-table"
                style={{ height: 200, marginTop: 20 }}
              >
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
          className="padding-60px-tb builder-bg border-none"
          id="callto-action2"
          data-selector=".builder-bg"
          style={{
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
                    START TODAY
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

export const LandingPageYoutube = connect(
  mapStateToProps,
  mapDispatchToProps
)(_LandingPageYoutube);
