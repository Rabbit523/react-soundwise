import React, { Component } from 'react';
import Axios from 'axios';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import { bindActionCreators } from 'redux';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Colors from '../styles/colors';
import { HashLink as Link } from 'react-router-hash-link';

import Footer from './footer';

const styles = {
  button: {
    backgroundColor: '#F76B1C',
  },
  headerText: {
    color: '#F76B1C',
  },
  error: {
    color: 'red',
  },
};

export default class PodcastingCourse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      firstName: '',
      submitted: false,
      error: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit() {
    const { email, firstName, submitted } = this.state;
    const that = this;
    if (!submitted) {
      Axios.post('/api/add_emails', {
        emailListId: 3921133,
        emailAddressArr: [{ firstName, email }],
      })
        .then(listId => {
          that.setState({
            submitted: true,
          });
          alert("Congratulations! You've been added to the course waitlist.");
        })
        .catch(err => {
          that.setState({
            error: 'Hmm...something went wrong. Please refresh the page and try again.',
          });
        });
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
                        to="/conversion#whatyouwilllearn"
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
                        CURRICULUM
                      </Link>
                    </li>
                    <li className="propClone">
                      <Link
                        className="inner-link"
                        to="/conversion#instructor"
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
                        INTSTUCTOR
                      </Link>
                    </li>
                    <li className="propClone">
                      <Link
                        className="inner-link"
                        to="/conversion#bonuses"
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
                        BONUSES
                      </Link>
                    </li>
                    <li className="propClone">
                      <Link
                        className="inner-link"
                        to="/conversion#guarantee"
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
                        GUARANTEE
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </header>
          <section
            className="no-padding position-relative cover-background tz-builder-bg-image border-none hero-style1"
            id="hero-section1"
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("images/mic.png")',
            }}
            data-selector=".tz-builder-bg-image"
          >
            <div className="container one-fourth-screen position-relative">
              <div className="row">
                <div className="slider-typography xs-position-static text-center">
                  <div className="slider-text-middle-main">
                    <div className="slider-text-middle text-center xs-padding-fifteen xs-no-padding-lr">
                      <div className="col-lg-11 col-md-12 col-sm-12 col-xs-12 center-col">
                        <h1
                          className="title-extra-large-4 line-height-65 font-weight-800 sm-title-extra-large-4 xs-title-extra-large-2 text-white alt-font margin-eight-bottom tz-text"
                          data-selector=".tz-text"
                        >
                          Create A Profitable Podcast That Radically Increases Your Sales,
                          Conversions, And Customer Loyalty In 8 Weeks
                        </h1>
                        <div
                          className="text-light-gray title-small xs-text-extra-large width-100 md-width-100 margin-twelve-bottom tz-text margin-lr-auto"
                          data-selector=".tz-text"
                        >
                          Without the overwhelms, tech headaches, and uncomfortable sales pitches.
                          Even if you are not a “good speaker” and know nothing about podcasting.
                        </div>
                        <div className="btn-dual" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <section
          className=" padding-70px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section32"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-lg-5 col-md-6 col-sm-6 xs-12 xs-text-center xs-margin-nineteen-bottom display-table"
                style={{ height: 651 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <h2
                    className="alt-font title-extra-large sm-title-large xs-title-large  margin-eight-bottom tz-text sm-margin-ten-bottom"
                    style={{ color: Colors.mainOrange }}
                    data-selector=".tz-text"
                  >
                    Stop running the customer acquisition hamster wheel
                  </h2>
                  <div
                    className="text-large tz-text width-90 sm-width-100 margin-seven-bottom sm-margin-ten-bottom"
                    data-selector=".tz-text"
                  >
                    If you are a coach, consultant, service provider, or online entrepreneur, you
                    know how hard it is to get your message out there these days. It’s a noisy world
                    we live in. Most hardworking business owners struggle because they spend so much
                    time working on things that have a low return-- feeding their social media
                    accounts with low-conversion content and calling it “marketing”, or cold calling
                    prospects and running after individual leads that don’t amount to must most of
                    the time.{' '}
                  </div>
                  <div
                    className="text-large tz-text width-90 sm-width-100 margin-fifteen-bottom sm-margin-ten-bottom"
                    data-selector=".tz-text"
                  >
                    You may have had the sad realization that the endless social media
                    treadmill-running hardly moves the needle for your business. And trying to hunt
                    down individual prospects and prove yourself to each and every one of them is
                    absolutely exhausting.{' '}
                  </div>
                </div>
              </div>
              <div
                className="col-lg-7 col-md-6 col-sm-6 xs-12 xs-text-center display-table"
                style={{ height: 651 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    alt=""
                    src="images/wheel.png"
                    data-img-size="(W)800px X (H)785px"
                    data-selector="img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="title-section1"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  What if you can have a reliable way to spread your message that regularly brings
                  in additional revenue every month…while establishing yourself as an industry
                  leader and subject-matter expert?
                </h2>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-70px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section50"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-md-6 col-sm-6 xs-12 xs-text-center display-table"
                style={{ height: 481 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    alt=""
                    src="images/listeningStats.png"
                    data-img-size="(W)800px X (H)681px"
                    data-selector="img"
                  />
                </div>
              </div>
              <div
                className="col-md-6 col-sm-6 xs-12 xs-text-center xs-margin-nineteen-bottom display-table"
                style={{ height: 481 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div
                    className="text-extra-large tz-text width-90 sm-width-100 margin-five-bottom sm-margin-ten-bottom"
                    data-selector=".tz-text"
                  >
                    In case you’ve been living under a rock for the past three years, podcasting has
                    been growing by leaps and bounds. The number of podcast listeners in the US is
                    increasing at about 40% a year. There are now more podcast listeners in the
                    country than Twitter users.{' '}
                  </div>
                  <div
                    className="text-extra-large tz-text width-90 sm-width-100 margin-ten-bottom sm-margin-ten-bottom xs-margin-twenty-bottom"
                    data-selector=".tz-text"
                  >
                    Businesses of all sizes and industries, from your local hardware store to large
                    enterprises like Goldman Sachs and McKinsey &amp; Company, are starting their
                    own podcast to generate new leads, market their brand, and convert more
                    customers.
                  </div>
                  <br />
                  <div
                    className="title-large tz-text width-90 sm-width-100 margin-ten-bottom text-center sm-margin-ten-bottom xs-margin-twenty-bottom"
                    data-selector=".tz-text"
                  >
                    Why? Because--{' '}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-50px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="title-section1"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  PODCASTING IS THE NEW CUSTOMER CONVERSION SECRET WEAPON
                </h2>
                <div
                  className="title-small width-60 margin-lr-auto md-width-70 sm-width-100 tz-text"
                  data-selector=".tz-text"
                >
                  Even if you’ve had your own blog/vlog or been able to get press coverage, having
                  your own podcast can help you:
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb bg-white builder-bg xs-padding-60px-tb"
          id="title-section8"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row four-column">
              <div className="col-md-3 col-sm-6 col-xs-12 sm-margin-ten-bottom xs-margin-twenty-three-bottom">
                <h5
                  className="margin-eight-bottom text-dark-sky-blue text-large alt-font sm-title-small xs-margin-seven-bottom tz-text"
                  data-selector=".tz-text"
                >
                  Get more customers to buy from you
                </h5>
                <div className="text-large tz-text" data-selector=".tz-text">
                  Your podcast is an amazing tool for showcasing your expertise, building your brand
                  recognition, and creating an ongoing, trusting relationship with existing and
                  potential customers.&nbsp;
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 sm-margin-ten-bottom xs-margin-twenty-three-bottom">
                <h5
                  className="margin-eight-bottom text-large alt-font sm-title-small xs-margin-seven-bottom tz-text"
                  data-selector=".tz-text"
                >
                  Stand out from your competition
                </h5>
                <div className="text-large tz-text" data-selector=".tz-text">
                  Your podcast is the stage for you to claim the rock star status in your industry.
                  It creates an intimate opportunity for your existing and potential buyers to get
                  to know the unique you and what you offer, without you un-scalably trying to chase
                  them down individually.&nbsp;
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 xs-margin-twenty-three-bottom">
                <h5
                  className="margin-eight-bottom text-large alt-font sm-title-small xs-margin-seven-bottom tz-text"
                  data-selector=".tz-text"
                >
                  Boost your industry authority status
                </h5>
                <div className="text-large tz-text" data-selector=".tz-text">
                  Your podcast is your speaking podium without time limit. It helps you attract
                  other speaking, writing and media exposure opportunities. Depending on the format
                  of your podcast, it also helps you build relationship with other top players in
                  your industry and further solidity your authority status.
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12">
                <h5
                  className="margin-eight-bottom text-large alt-font sm-title-small xs-margin-seven-bottom tz-text"
                  data-selector=".tz-text"
                >
                  Generate consistent, reliable revenue
                </h5>
                <div
                  className="text-large tz-text margin-fifteen-bottom xs-margin-eleven-bottom"
                  data-selector=".tz-text"
                >
                  Your podcast, if executed right, becomes a powerful, evergreen customer
                  acquisition funnel. It gives customers the opportunity to come to you and get to
                  know the unique value you provide. It helps you build customer relationships in a
                  scalable manner. So that you can grow your business faster and make a bigger
                  impact.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-70px-tb xs-padding-60px-tb bg-light-gray builder-bg border-none"
          id="title-section3"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-sm-12 col-xs-12  sm-margin-nine-bottom xs-margin-fifteen-bottom text-dark-gray">
                <div
                  className="title-medium xs-title-medium width-90 sm-width-100 display-block tz-text"
                  data-selector=".tz-text"
                >
                  Here's a secret...
                </div>
                <div
                  className="title-extra-large-2 ex-title-extra-large width-90 sm-width-100 display-block tz-text"
                  data-selector=".tz-text"
                >
                  You can still have the early mover advantage in podcasting. That’s why you should
                  start now
                </div>
              </div>
              <div className="col-md-6 col-sm-12 col-xs-12 text-large">
                <div className="tz-text margin-five-bottom" data-selector=".tz-text">
                  If you’ve had the foresight to start a YouTube channel back in 2005, or start an
                  Instagram account in 2010, your business would have been so much more successful
                  than where it is now. Alas, you missed those opportunities. Once EVERYBODY has
                  jumped on the vlogging and social media bandwaggen, it’s too late. Getting
                  yourself seen and heard through those channels is now insanely difficult.
                </div>
                <br />
                <div className="tz-text margin-five-bottom" data-selector=".tz-text">
                  Although podcasting as a medium has been around for a while, its takeoff is still
                  a recent event. Here’s a comparison to put things in perspective. There’re
                  currently around 500k active podcasts. If that seems like a large number, consider
                  this-- Youtube has 50 million channels and there’re 350 million blogs on Tumblr
                  alone. (Is there any wonder that only five people read your blog?)
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="bg-gray builder-bg border-none"
          id="content-section48"
          data-selector=".builder-bg"
        >
          <div className="container-fluid">
            <div className="row equalize">
              <div
                className="col-lg-6 col-md-6 col-sm-12 col-xs-12 display-table"
                style={{ height: 730 }}
              >
                <div className="display-table-cell-vertical-middle padding-twenty-six md-padding-twenty xs-no-padding-lr">
                  <div
                    className="title-medium sm-title-medium xs-title-medium font-weight-500 tz-text margin-seven-bottom sm-margin-ten-bottom width-85 md-width-100"
                    style={{ lineHeight: 'normal' }}
                    data-selector=".tz-text"
                  >
                    Right now is the perfect time to ride the surging wave of podcasting, before the
                    huge crowd catches on. Because today, if you do podcasting right (meaning: with
                    the right content and right strategy), you still have the opportunity to capture
                    a substantial audience base that has the potential to become your biggest
                    business asset, with relatively small effort. One year or two years from now, I
                    wouldn’t be able to tell you the same.{' '}
                  </div>
                </div>
              </div>
              <div
                className="col-lg-6 col-md-6 col-sm-12 col-xs-12 no-padding xs-no-padding-15 bg-gray tz-builder-bg-image cover-background xs-height-350-px"
                data-img-size="(W)1026px X (H)850px"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0)), url("images/podcastsVS.png")',
                  height: 600,
                }}
                data-selector=".tz-builder-bg-image"
              />
            </div>
          </div>
        </section>
        <section
          className=" padding-70px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="title-section1"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <div
                  className="title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  So you want to start a podcast?
                </div>
                <h2
                  className="title-extra-large margin-lr-auto  sm-width-100 tz-text"
                  data-selector=".tz-text"
                >
                  STARTING YOUR PODCAST WITH THE RIGHT PROCESS MAKES THE DIFFERENCE BETWEEN BUSINESS
                  ACQUISITION HEAVEN AND CONTENT TREADMILL HELL
                </h2>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-70px-tb xs-padding-60px-tb bg-dark-blue builder-bg border-none"
          id="title-section2"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 ">
                <h2
                  className="section-title-small sm-section-title-small text-white alt-font margin-five-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  <p>
                    As a three-time podcast host, I have built a successful personal development
                    teaching and coaching business around my top-of-iTunes podcast. As the founder
                    of Soundwise, I’ve had the honor to help podcast hosts design, create, and grow
                    their podcasts almost every day.
                  </p>
                  <p>
                    Over time I realized something interesting-- I could pretty much tell whether a
                    podcast was going to succeed or not, just by looking at how the host planned for
                    and ran the podcast. When a podcast fails to get traction, it’s usually not
                    because of a lack of talent, charisma, or expertise about the subject matter on
                    the host’s part. And it’s certainly not because creating a podcast is all that
                    difficult.
                  </p>
                  <p>
                    It’s usually because the host does not have the right content strategy and
                    audience building system in place to make their podcast stand out from the crowd
                    and convert listeners into customers.
                  </p>
                </h2>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-50px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="title-section1"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text text-center"
                  data-selector=".tz-text"
                >
                  Here are some of the most common mistakes that cause new podcasts to fail:
                </h2>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section36"
          data-selector=".builder-bg"
        >
          <div className="container-fluid">
            <div className="row four-column">
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font tz-text font-weight-600"
                  style={{ color: Colors.mainOrange }}
                  data-selector=".tz-text"
                >
                  01.
                </div>
                <h3
                  className="text-dark-gray text-extra-large alt-font display-block tz-text"
                  data-selector=".tz-text"
                >
                  Not treating the podcast like a product offering
                </h3>
                <div
                  className="text-large text-dark-gray margin-six-bottom tz-text"
                  data-selector=".tz-text"
                >
                  Many new hosts start their podcast blindly following the successful podcasts
                  they’ve listened to. The result is a large number of “me too” podcasts that merely
                  create noise in the podcasting space and not benefit the host in any tangible
                  way.&nbsp;
                </div>
                <br />
                <div
                  className="text-large text-dark-gray margin-six-bottom tz-text"
                  data-selector=".tz-text"
                >
                  If you want your podcast to go places, treat it like a product you create for your
                  potential customers. Thinking through what problem your podcast is solving for
                  your listeners and what are the unique benefits your podcast offers is the basic
                  foundation for your podcasting success.
                </div>
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
                >
                  Not thinking through the “end game”
                </h3>
                <div
                  className="text-large text-dark-gray margin-six-bottom tz-text"
                  data-selector=".tz-text"
                >
                  Amateur podcast hosts often have no idea where their podcast is located on their
                  customer’s journey. If you ask them, “Why are you doing a podcast?” They tell you
                  things like “to build my brand”, “to spread my message”. While those are legit
                  goals, they are much too vague to provide any guidance in terms of how to best
                  structure your podcast and what type of content you should create.
                </div>
                <br />
                <div
                  className="text-large text-dark-gray margin-six-bottom tz-text"
                  data-selector=".tz-text"
                >
                  Not thinking through the relationship between your podcast and your other
                  products/services is the surefire way to waste a bunch of time and money running
                  in circles with your podcast.&nbsp;
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 padding-six no-padding-tb sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="margin-seven-bottom xs-margin-five-bottom title-extra-large-4 alt-font  tz-text font-weight-600"
                  data-selector=".tz-text"
                  style={{ color: Colors.mainOrange }}
                >
                  03.
                </div>
                <h3
                  className="text-dark-gray text-extra-large alt-font display-block tz-text"
                  data-selector=".tz-text"
                >
                  Focus on expanding reach prematurely
                </h3>
                <div
                  className="text-large text-dark-gray margin-six-bottom tz-text"
                  data-selector=".tz-text"
                >
                  <div>
                    When I coach new podcast hosts, their first question is often times “How do I
                    get more listeners?” I totally understand the desire for more exposure. But
                    here’s the counter-intuitive truth: when you start a new podcast, getting more
                    listeners should be the least of your concerns!&nbsp;
                  </div>
                  <br />
                  <div>
                    Your limited time and energy should be focused on optimizing your podcast
                    first-- learning what you need to say and how you should say it on air, to
                    create a memorable impression in your listeners’ mind and heart. If you don’t
                    have a high-converting podcast in the first place, you’d just be wasting the
                    listener traffic you work hard to obtain, and not getting much business benefit
                    in the end.&nbsp;
                  </div>
                </div>
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
                >
                  Not having a scalable work process in place
                </h3>
                <div
                  className="text-large text-dark-gray margin-six-bottom tz-text"
                  data-selector=".tz-text"
                >
                  <div>
                    Podcasting today is easier than ever. Still, there’re a lot of different
                    logistical components to a successful podcast, e.g. planning your episodes,
                    choosing the right recording and editing setup, creating descriptions and other
                    supplementary materials… And if you host an interview podcast, there’s another
                    layer of logistics involving guest booking, onboarding, recording and
                    promotion.&nbsp;
                  </div>
                  <br />
                  <div>
                    Without having an organized, efficient work process, what you will find is there
                    are stumbling blocks everywhere and you spend an ungodly amount of time and
                    energy fixing problems instead of creating high-converting content.&nbsp;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="bg-white builder-bg border-none"
          id="content-section12"
          data-selector=".builder-bg"
        >
          <div className="container-fluid">
            <div className="row equalize">
              <div
                className="col-lg-4 col-md-4 col-sm-12 col-xs-12 no-padding xs-no-padding-15 bg-gray tz-builder-bg-image cover-background"
                data-img-size="(W)1000px X (H)800px"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.0)), url("images/mic2.jpg")',
                  height: 931,
                }}
                data-selector=".tz-builder-bg-image"
              />
              <div
                className="col-lg-8 col-md-8 col-sm-12 col-xs-12  tz-background-color display-table"
                style={{ height: 931 }}
                data-selector=".tz-background-color"
              >
                <div className="display-table-cell-vertical-middle padding-twenty-six md-padding-twenty xs-no-padding-lr">
                  <div
                    className="title-medium sm-title-medium xs-title-medium font-weight-500 tz-text margin-seven-bottom sm-margin-ten-bottom width-85 md-width-100"
                    data-selector=".tz-text"
                  >
                    <div>
                      If you’re going to create a podcast, don’t do it haphazardly. Treat it like a
                      serious project and follow an effective system to plan, create, and grow your
                      podcast.
                    </div>
                    <br />
                    <div>
                      I’m passionate about helping experts, coaches and entrepreneurs spread their
                      message. Because by helping you make a difference in your audience’s life, I’m
                      also indirectly creating a bigger impact in the world. I firmly believe that
                      podcasting can become your biggest business asset-- getting you more customers
                      and cash flow while changing more lives-- if you do it right.
                    </div>
                    <br />
                    <div>
                      That’s why I gathered my personal knowledge in creating and growing multiple
                      successful podcasts, and my experience working with hundreds of podcast hosts
                      and audio course creators, to bring to you the Podcast Conversion Master
                      Course-- a step by step system to create and grow a highly profitable podcast
                      that helps you effectively capture an audience and turn your audience into
                      real fans and customers.&nbsp;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="title-section11"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="text-center">
                <img
                  className="display-block margin-two-bottom sm-margin-four-bottom xs-margin-nine-bottom margin-lr-auto"
                  src="images/micIcon.png"
                  data-img-size="(W)62px X (H)41px"
                  alt=""
                  data-selector="img"
                />
                <div
                  className="section-title-small sm-section-title-medium xs-section-title-small text-dark-gray font-weight-700 alt-font margin-one-bottom text-center xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  INTRODUCING
                </div>
                <h2
                  className="title-extra-large-2 sm-section-title-medium xs-section-title-small text-dark-gray font-weight-700 alt-font margin-seven-bottom text-center xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                  style={{ marginTop: 0 }}
                >
                  THE PODCAST CONVERSION MASTER COURSE
                </h2>
                <div
                  className="separator-line2 bg-middle-gray margin-seven-bottom text-center xs-margin-fifteen-bottom margin-lr-auto builder-bg"
                  data-selector=".builder-bg"
                />
                <div
                  className="tz-text title-small  sm-width-90 text-center center-col"
                  data-selector=".tz-text"
                >
                  Everything you need to create a steller podcast that helps you drastically
                  increase your sales conversion, elevate your expert status, and get more paying
                  customers
                </div>
                <br />
                <div
                  className="tz-text title-medium sm-width-90 text-center center-col"
                  style={{ lineHeight: 'normal' }}
                  data-selector=".tz-text"
                >
                  The Podcast Conversion Master Course is the only podcasting course that not only
                  gives you the logistical step-by-steps of creating your own podcast, but teaches
                  you the powerful audio content strategies that help you convert more listeners
                  into customers, while being naturally you, without sounding salesy or pushy. You
                  will also learn how to build an engaged listener community that increases customer
                  loyalty and lifetime value.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="title-section1"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  What’s Inside
                </h2>
                <div
                  className="text-large width-80 margin-lr-auto md-width-80 sm-width-100 tz-text"
                  data-selector=".tz-text"
                >
                  (All of the course content are immediately available via Soundwise web and mobile
                  apps after enrollment)
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="bg-white builder-bg  padding-30px-tb feature-style3 xs-padding-60px-tb"
          id="feature-section3"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row four-column font-weight-800">
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div className="feature-box">
                  <div className="margin-eleven-bottom xs-margin-five-bottom">
                    <i
                      className="fas fa-microphone text-white  tz-icon-color"
                      data-selector=".tz-icon-color"
                      style={{ backgroundColor: Colors.mainOrange }}
                    />
                  </div>
                  <div
                    className="font-weight-800 feature-title text-large alt-font display-block margin-three-bottom xs-margin-five-bottom tz-text"
                    data-selector=".tz-text"
                  >
                    5 modules of course lessons in audio and PDF slides
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div className="feature-box">
                  <div className="margin-eleven-bottom xs-margin-five-bottom">
                    <i
                      className="fas fa-edit text-white  tz-icon-color"
                      data-selector=".tz-icon-color"
                      style={{ backgroundColor: Colors.mainOrange }}
                    />
                  </div>
                  <div
                    className="font-weight-800 feature-title text-large alt-font display-block margin-three-bottom xs-margin-five-bottom tz-text"
                    data-selector=".tz-text"
                  >
                    Worksheets
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center xs-margin-fifteen-bottom">
                <div className="feature-box">
                  <div className="margin-eleven-bottom xs-margin-five-bottom">
                    <i
                      className="far fa-list-alt text-white tz-icon-color"
                      data-selector=".tz-icon-color"
                      style={{ backgroundColor: Colors.mainOrange }}
                    />
                  </div>
                  <div
                    className="font-weight-800 feature-title text-large alt-font display-block margin-three-bottom xs-margin-five-bottom tz-text"
                    data-selector=".tz-text"
                  >
                    <p>Checklists &amp; Templates</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center">
                <div className="feature-box">
                  <div className="margin-eleven-bottom xs-margin-five-bottom">
                    <i
                      className="fas fa-gift text-white tz-icon-color"
                      data-selector=".tz-icon-color"
                      style={{ backgroundColor: Colors.mainOrange }}
                    />
                  </div>
                  <div
                    className="font-weight-800 feature-title text-large alt-font display-block margin-three-bottom xs-margin-five-bottom tz-text"
                    data-selector=".tz-text"
                  >
                    Bonus materials
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg border-none"
          id="whatyouwilllearn"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  What You Will Learn
                </h2>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section23"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize sm-equalize-auto equalize-display-inherit">
              <div
                className="col-md-5 col-sm-12 col-xs-12 display-table sm-margin-fifteen-bottom"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    src="images/module1.png"
                    data-img-size="(W)800px X (H)650px"
                    alt=""
                    data-selector="img"
                  />
                </div>
              </div>
              <div
                className="col-md-6 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <h2
                        className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text"
                        data-selector=".tz-text"
                      >
                        Module 1: Positioning, Positioning, Positioning… a.k.a. Set the Foundation
                        for A High Converting Podcast
                      </h2>
                      <span
                        className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text"
                        data-selector=".tz-text"
                      >
                        Before you create any content, you need to get clear on a few big-picture
                        elements that set your podcast up for success. By end of Module 1, you will:
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <ul className="list-style-none text-extra-large sm-text-extra-large">
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Have perfect clarity on the specific ways your podcast will contribute
                            to the customer journey for your business
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Identify exactly who you’re creating your podcast for and what make them
                            tick&nbsp;
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Learn the secret to create your audio charisma on demand, while being
                            authentically you
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Lay the foundation to set your podcast apart from the competitions and
                            get loyal listeners
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Learn a highly effective framework to help position your podcast that
                            quickly grabs your listeners
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section23"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize sm-equalize-auto equalize-display-inherit">
              <div
                className="col-md-5 col-sm-12 col-xs-12 display-table sm-margin-fifteen-bottom"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    src="images/module2.png"
                    data-img-size="(W)800px X (H)650px"
                    alt=""
                    data-selector="img"
                  />
                </div>
              </div>
              <div
                className="col-md-6 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <h2
                        className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text"
                        data-selector=".tz-text"
                      >
                        Module 2: Design your essential podcasting assets to immediately impresses
                        and hooks listeners
                      </h2>
                      <span
                        className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text"
                        data-selector=".tz-text"
                      >
                        Your podcast needs a unique “store front” to hook listeners and then viable
                        content strategies to produce great episodes and make your listeners come
                        back for more. By end of Module 2, you will:
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <ul className="list-style-none text-extra-large sm-text-extra-large">
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Understand the pros and cons of different podcast formats, and determine
                            the format for your podcast that will be most beneficial to your
                            business
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Have a high converting podcast title, tagline, and description to stand
                            out from the crowd
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Create a podcast cover art that conveys who you are and speaks to your
                            ideal customers
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Learn the different types of episode topics and how they contribute to
                            your customer conversion. Determine the right mix of your podcast
                            topics.
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Learn the secret to never run out of high-converting episode topic ideas
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section23"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize sm-equalize-auto equalize-display-inherit">
              <div
                className="col-md-5 col-sm-12 col-xs-12 display-table sm-margin-fifteen-bottom"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    src="images/module3.png"
                    data-img-size="(W)800px X (H)650px"
                    alt=""
                    data-selector="img"
                  />
                </div>
              </div>
              <div
                className="col-md-6 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <h2
                        className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text"
                        data-selector=".tz-text"
                      >
                        Module 3: How to craft high-converting podcast episodes from start to finish
                      </h2>
                      <span
                        className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text"
                        data-selector=".tz-text"
                      >
                        Once you turn on the mic, what do you need to say to get listeners hooked
                        and come back? This module teaches you the nitty gritty of creating
                        high-converting episodes. By end of Module 3, you will:
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <ul className="text-extra-large sm-text-extra-large list-style-none">
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Craft a concise and compelling episode intro that clearly speaks to your
                            ideal listeners
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Learn a 5-part high converting episode formula that makes your audience
                            want to buy from you
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Get the secrets to create a powerful “audio presence” that makes
                            listening to you a mesmerizing experience{' '}
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Discover what stories you need to tell and how to tell them in your
                            episodes that move your audience to take actions
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Find out how to conduct high converting guest interviews that create
                            win-win for you and your guests
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section23"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize sm-equalize-auto equalize-display-inherit">
              <div
                className="col-md-5 col-sm-12 col-xs-12 display-table sm-margin-fifteen-bottom"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    src="images/module4.png"
                    data-img-size="(W)800px X (H)650px"
                    alt=""
                    data-selector="img"
                  />
                </div>
              </div>
              <div
                className="col-md-6 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <h2
                        className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text"
                        data-selector=".tz-text"
                      >
                        Module 4: Build your audience tribe like a pro to inspire die-hard fans and
                        repeat customers
                      </h2>
                      <span
                        className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text"
                        data-selector=".tz-text"
                      >
                        The best customers are repeat customers. And building a trusting
                        relationship with your listeners on air and off air is crucial for a
                        sustaining business. By end of Module 4, you will:
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <ul className="text-extra-large sm-text-extra-large list-style-none">
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Understand why having an audience community is a powerful conversion
                            tool and how to get your first 100 real fans
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Learn effective tactics to get your audience more engaged and invested
                            in your community
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Discover the top strategies to get your audience to start talking to you
                            and to each other
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Learn simple, reliable ways to continue improving your podcast with the
                            help of your tribe
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Find out how to leverage your listener feedback to create amazing new
                            products/services that practically sell themselves
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg"
          id="content-section23"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize sm-equalize-auto equalize-display-inherit">
              <div
                className="col-md-5 col-sm-12 col-xs-12 display-table sm-margin-fifteen-bottom"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    src="images/module5.png"
                    data-img-size="(W)800px X (H)650px"
                    alt=""
                    data-selector="img"
                  />
                </div>
              </div>
              <div
                className="col-md-6 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin"
                style={{ height: 594 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <h2
                        className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text"
                        data-selector=".tz-text"
                      >
                        Module 5: The most powerful strategies to expand your podcast’s reach and
                        get more listeners
                      </h2>
                      <span
                        className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text"
                        data-selector=".tz-text"
                      >
                        You’ve built a top notch, high-converting podcast. Now it’s time to promote
                        it and get more ears on your podcast. By end of Module 5, you’ll:
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <ul className="text-extra-large sm-text-extra-large list-style-none">
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Learn how to turn your existing listeners and your guests into a highly
                            effective (and free) marketing team
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Discover an effective content repurpose strategy that easily increases
                            the reach of every episode by tenfold
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Learn the top strategies to get more traffic to your podcast without
                            spending a lot of money
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Find out how to leverage your show notes and descriptions to build your
                            email list
                          </span>
                        </li>
                        <li className="position-relative padding-left-30px line-height-34 text-large">
                          <i
                            className="fa fa-check text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"
                            data-selector=".tz-icon-color"
                          />
                          <span className="tz-text" data-selector=".tz-text">
                            Get a fail-proof roadmap to consistently and reliably grow your podcast
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="about-style3  padding-30px-tb xs-padding-60px-tb bg-white builder-bg"
          id="instructor"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  id="tz-slider-text125"
                >
                  Your Instructor
                </h2>
              </div>
            </div>
            <div className="row">
              <div id="" className="">
                <div className="item">
                  <div
                    className="col-md-6 col-sm-6 about-text bg-cream text-left tz-background-color"
                    id="tz-bg-color-7"
                    style={{ backgroundColor: '#ffffff', padding: 85 }}
                  >
                    <div className="text-dark-gray text-large tz-text" id="tz-slider-text129">
                      <div>
                        Natasha Che is a tech entrepreneur and the founder of Soundwise, the #1
                        mobile-focused audio publishing platform for experts, influencers and solo
                        entrepreneurs to sell on-demand audios and to leverage their podcast to grow
                        their email list and build an audience tribe.
                      </div>
                      <br />
                      <div>
                        She is also a personal growth teacher and an award-winning podcast host. She
                        currently hosts the top-of-iTunes podcast, The School of Intuition.&nbsp;
                      </div>
                      <br />
                      <div>
                        Natasha has coached over 200 experts and entrepreneurs on how to use
                        podcasting to grow their business. She has been featured on Huffington Post,
                        Entrepreneur, Thrive Global, YourTango, Elephant Journal, Sivana East, among
                        others.&nbsp;
                      </div>
                      <br />
                      <div>
                        Natasha holds a PhD in Economics from Georgetown University and lives in
                        Washington DC.
                      </div>
                    </div>
                  </div>
                  <div
                    className="col-md-6 col-sm-6 about-img cover-background tz-builder-bg-image"
                    id="tz-bg-45"
                    data-img-size="(W)800px X (H)800px"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.0)), url("images/natashache.jpg")',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb bg-white builder-bg feature-style1 xs-padding-60px-tb"
          id="feature-section1"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-five-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  If you put in the effort and do the homeworks, here’s what you can expect from
                  taking the Podcast Conversion Master Course…
                </h2>
              </div>
            </div>
            <div className="row four-column">
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="padding-ten border-radius-8 bg-white border-light builder-bg"
                  data-selector=".builder-bg"
                >
                  <div className="title-extra-large-5 text-sky-blue margin-fifteen-top">
                    <i
                      className="fas fa-microphone ti-image tz-icon-color"
                      aria-hidden="true"
                      data-selector=".tz-icon-color"
                    />
                  </div>
                  <div
                    className="content-box bg-light-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <div
                      className="text-large alt-font text-dark-gray margin-seven-bottom sm-margin-three-bottom tz-text"
                      data-selector=".tz-text"
                      style={{ textAlign: 'left' }}
                    >
                      In 8 weeks you will have created a kickass podcast that becomes one of your
                      most profitable assets in business, for years to come
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="padding-ten border-radius-8 bg-white border-light builder-bg"
                  data-selector=".builder-bg"
                >
                  <div className="title-extra-large-5 text-sky-blue margin-fifteen-top">
                    <i
                      className="fas fa-bullhorn tz-icon-color"
                      aria-hidden="true"
                      data-selector=".tz-icon-color"
                    />
                  </div>
                  <div
                    className="content-box bg-light-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <div
                      className="text-large alt-font text-dark-gray margin-seven-bottom sm-margin-three-bottom tz-text"
                      data-selector=".tz-text"
                      style={{ textAlign: 'left' }}
                    >
                      You will be in possession of a most powerful marketing tool, which opens doors
                      for you that you didn’t know existed, allowing you to earn more, make a bigger
                      difference, and achieve more freedom in your life and business&nbsp;
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="padding-ten border-radius-8 bg-white border-light builder-bg"
                  data-selector=".builder-bg"
                >
                  <div className="title-extra-large-5 text-sky-blue margin-fifteen-top">
                    <i
                      className="fas fa-trophy tz-icon-color"
                      aria-hidden="true"
                      data-selector=".tz-icon-color"
                    />
                  </div>
                  <div
                    className="content-box bg-light-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <div
                      className="text-large alt-font text-dark-gray margin-seven-bottom sm-margin-three-bottom tz-text"
                      data-selector=".tz-text"
                      style={{ textAlign: 'left' }}
                    >
                      You will have the absolute confidence in your ability to create amazing audio
                      content that get your listeners hooked and get you more customers
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-fifteen-bottom">
                <div
                  className="padding-ten border-radius-8 bg-white border-light builder-bg"
                  data-selector=".builder-bg"
                >
                  <div className="title-extra-large-5 text-sky-blue margin-fifteen-top">
                    <i
                      className="fas fa-chart-line tz-icon-color"
                      aria-hidden="true"
                      data-selector=".tz-icon-color"
                    />
                  </div>
                  <div
                    className="content-box bg-light-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <div
                      className="text-large alt-font text-dark-gray margin-seven-bottom sm-margin-three-bottom tz-text"
                      data-selector=".tz-text"
                      style={{ textAlign: 'left' }}
                    >
                      You will have crystal clarity about how to consistently grow your podcast to
                      get more listeners, what you need to say and how you need to say it on air to
                      turn listeners into subscribers and loyal customers
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-white builder-bg"
          id="subscribe-section6"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-8 center-col col-sm-12 text-center">
                <h2
                  className="title-extra-large-2 alt-font xs-title-large margin-four-bottom tz-text"
                  data-selector=".tz-text"
                  style={{ color: Colors.mainGreen }}
                >
                  Get On The Waitlist For When Enrollment Opens
                </h2>
              </div>
              <div className="col-md-6 center-col col-sm-12 text-center">
                <input
                  onChange={this.handleChange}
                  value={this.state.firstName}
                  type="text"
                  name="firstName"
                  id="firstName"
                  data-email="required"
                  placeholder="Your First Name"
                  className="big-input bg-light-gray alt-font border-radius-4"
                />
                <input
                  onChange={this.handleChange}
                  value={this.state.email}
                  type="text"
                  name="email"
                  id="email"
                  data-email="required"
                  placeholder="Your Email"
                  className="big-input bg-light-gray alt-font border-radius-4"
                />
                <button
                  onClick={this.handleSubmit}
                  type="submit"
                  className="contact-submit btn btn-extra-large2 propClone  btn-3d text-white width-100 builder-bg tz-text"
                  data-selector=".tz-text"
                  style={{ backgroundColor: Colors.mainOrange }}
                >
                  LET ME KNOW WHEN ENROLLMENT OPENS!
                </button>
                <div style={styles.error}>{this.state.error}</div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb blog-style1 bg-white builder-bg"
          id="bonuses"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-seven-bottom xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  Enroll in The Podcast Conversion Master Course to get over $1000 of bonuses. FOR
                  FREE
                </h2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4 col-sm-4 col-xs-12 xs-margin-nineteen-bottom">
                <div className="blog-post">
                  <div className="blog-image">
                    <img
                      className="img100"
                      alt=""
                      src="images/bonus1.png"
                      data-img-size="(W)800px X (H)507px"
                      data-selector="img"
                    />
                  </div>
                  <div
                    className="post-details bg-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <div
                      className="post-author tz-background-color bg-dark-gray margin-thirteen-bottom md-margin-eleven-bottom xs-margin-eight-bottom"
                      data-selector=".tz-background-color"
                    >
                      <span className="tz-text text-white blog-name" data-selector=".tz-text">
                        BONUS #1
                      </span>{' '}
                    </div>
                    <span
                      className="tz-text text-dark-gray blog-post-title text-large font-weight-600 margin-five-bottom display-inline-block md-margin-five-bottom"
                      data-selector=".tz-text"
                    >
                      Soundwise PRO plan subscription ($816 value)
                    </span>
                    <div
                      className="text-large tz-text"
                      data-selector=".tz-text"
                      style={{ textAlign: 'left' }}
                    >
                      Soundwise is the indispensable tool to help you leverage your podcast to build
                      your email list, grow an engaged listener community, and sell on-demand audio
                      programs. you can also use Soundwise to host an unlimited number of podcasts
                      and audio programs. You will get access to Soundwise’s higher-tier paid plan
                      for an entire year, free of charge.
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-sm-4 col-xs-12 xs-margin-nineteen-bottom">
                <div className="blog-post">
                  <div className="blog-image">
                    <img
                      className="img100"
                      alt=""
                      src="images/bonus2.png"
                      data-img-size="800px (W) X 507px (H)"
                      data-selector="img"
                    />
                  </div>
                  <div
                    className="post-details bg-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <div
                      className="post-author tz-background-color bg-dark-gray margin-thirteen-bottom md-margin-eleven-bottom xs-margin-eight-bottom"
                      data-selector=".tz-background-color"
                    >
                      <span className="tz-text text-white blog-name" data-selector=".tz-text">
                        BONUS #2
                      </span>{' '}
                    </div>
                    <span
                      className="tz-text text-dark-gray blog-post-title text-large font-weight-600 margin-five-bottom display-inline-block md-margin-five-bottom"
                      data-selector=".tz-text"
                    >
                      111 media outlets to submit your repurposed podcasting content ($250 value)
                    </span>
                    <div
                      className="text-large tz-text"
                      data-selector=".tz-text"
                      style={{ textAlign: 'left' }}
                    >
                      Leverage the power of proper content repurpose to supercharge the reach of
                      your podcast. The bonus complements the training in Module 5 to increase the
                      exposure of your podcast and reach new audience.
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-sm-4 col-xs-12 xs-margin-nineteen-bottom">
                <div className="blog-post">
                  <div className="blog-image">
                    <img
                      className="img100"
                      alt=""
                      src="images/bonus3.png"
                      data-img-size="(W)800px X (H)507px"
                      data-selector="img"
                    />
                  </div>
                  <div
                    className="post-details bg-gray tz-background-color"
                    data-selector=".tz-background-color"
                  >
                    <div
                      className="post-author tz-background-color bg-dark-gray margin-thirteen-bottom md-margin-eleven-bottom xs-margin-eight-bottom"
                      data-selector=".tz-background-color"
                    >
                      <span className="tz-text text-white blog-name" data-selector=".tz-text">
                        BONUS #3
                      </span>{' '}
                    </div>
                    <span
                      className="tz-text text-dark-gray blog-post-title text-large font-weight-600 margin-five-bottom display-inline-block md-margin-five-bottom"
                      data-selector=".tz-text"
                    >
                      The only tech guide you need to start a quality podcast, even if you have no
                      idea what to do ($100 value)
                    </span>
                    <div
                      className="text-large tz-text"
                      data-selector=".tz-text"
                      style={{ textAlign: 'left' }}
                    >
                      With this bonus module, you’ll get a checklist of tools you need and a simple
                      workflow set up that result in a great sounding podcast produced in a
                      streamlined manner. No more overwhelm and confusion about podcasting
                      tech.&nbsp;
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12 col-sm-12 col-xs-12 text-center margin-ten-top xs-no-margin-top" />
            </div>
          </div>
        </section>
        <section
          className=" padding-70px-tb xs-padding-60px-tb bg-dark-blue builder-bg border-none"
          id="title-section5"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row">
              <div className="text-center">
                <h2
                  className="section-title-large sm-section-title-medium xs-section-title-small text-white alt-font margin-seven-bottom text-center xs-margin-fifteen-bottom tz-text"
                  data-selector=".tz-text"
                >
                  The Podcast Conversion Master Course is for you if…
                </h2>
                <div
                  className="separator-line2 bg-brown margin-seven-bottom  xs-margin-fifteen-bottom margin-lr-auto builder-bg"
                  data-selector=".builder-bg"
                />
                <div
                  className="tz-text text-white text-large  sm-width-90  center-col"
                  data-selector=".tz-text"
                  style={{ textAlign: 'left' }}
                >
                  <div className="no-margin-bottom">
                    •<span style={{ whiteSpace: 'pre' }}> </span>
                    You’re a coach, consultant, entrepreneur or professional service provider who
                    want to get more customers and get your existing customers to buy more from you
                  </div>
                  <div className="no-margin-bottom">
                    •<span style={{ whiteSpace: 'pre' }}> </span>
                    You know that your business will grow and you will make a bigger impact in the
                    world if you can get your message and your knowledge out to more people
                  </div>
                  <div className="no-margin-bottom">
                    •<span style={{ whiteSpace: 'pre' }}> </span>
                    You’re tired of being the best-kept secret in your industry
                  </div>
                  <div className="no-margin-bottom">
                    •<span style={{ whiteSpace: 'pre' }}> </span>
                    You know having a podcast can significantly benefit your brand and your
                    business. And you want to do it the right way to save you time, headache and get
                    the business results you deserve
                  </div>
                  <div className="no-margin-bottom">
                    •<span style={{ whiteSpace: 'pre' }}> </span>
                    Or maybe you’ve done podcasting before. But you didn’t have a reliable strategy
                    to actually get business benefit from your podcast. And you’re committed to up
                    your podcast conversion game to grow more customers and revenues.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-50px-tb xs-padding-60px-tb bg-white builder-bg"
          id="guarantee"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto equalize-display-inherit">
              <div
                className="col-lg-5 col-md-6 col-sm-6 xs-12 xs-text-center xs-margin-nineteen-bottom display-table"
                style={{ height: 651 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div
                    className="text-extra-large font-weight-800 tz-text width-90 sm-width-100 "
                    data-selector=".tz-text"
                  >
                    Up your podcasting game with no risk
                  </div>
                  <h2
                    className="alt-font title-extra-large sm-title-large xs-title-large text-fast-blue margin-eight-bottom tz-text sm-margin-ten-bottom"
                    data-selector=".tz-text"
                    style={{ marginTop: 0, color: Colors.mainOrange }}
                  >
                    30 Day Money Back Guarantee&nbsp;
                  </h2>
                  <div
                    className="text-large tz-text width-90 sm-width-100 margin-seven-bottom sm-margin-ten-bottom"
                    data-selector=".tz-text"
                  >
                    <p>
                      I truly want you to get the benefit of having an amazing podcast that will
                      help you convert and keep more customers. And I have built this course to help
                      you accomplish just that. If you sincerely put in the effort to do the work
                      recommended in the course curriculum, I promise you that your effort will be
                      rewarded. That being said, if you don’t feel like it worked for you after
                      doing the full course work, simply submit the work you’ve done (including the
                      worksheets, checklists, and the podcast you’ve created), within 30 days of
                      purchase, I will refund your course fee in full. This is only for people who
                      have really put in the effort to do the work. So if you’d like a refund, make
                      sure you submit proof that you’ve completed all the assignments and action
                      steps in the course with your best effort.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="col-lg-7 col-md-6 col-sm-6 xs-12 xs-text-center display-table"
                style={{ height: 651 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <img
                    alt=""
                    src="images/guarantee.png"
                    data-img-size="(W)800px X (H)785px"
                    data-selector="img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className=" padding-30px-tb xs-padding-60px-tb bg-light-gray builder-bg border-none"
          id="subscribe-section9"
          data-selector=".builder-bg"
        >
          <div className="container">
            <div className="row equalize xs-equalize-auto">
              <div
                className="col-md-7 col-sm-6 col-xs-12 xs-margin-thirteen-bottom display-table"
                style={{ height: 245 }}
              >
                <div className="display-table-cell-vertical-middle">
                  <h1
                    className="title-extra-large-2 alt-font sm-title-extra-large xs-title-extra-large  margin-five-bottom tz-text width-80 sm-width-100"
                    style={{ color: Colors.mainGreen }}
                    data-selector=".tz-text"
                  >
                    Get On The Waitlist For When Enrollment Opens
                  </h1>
                </div>
              </div>
              <div className="col-md-5 col-sm-6 col-xs-12 display-table" style={{ height: 245 }}>
                <div className="display-table-cell-vertical-middle">
                  <input
                    onChange={this.handleChange}
                    value={this.state.firstName}
                    type="text"
                    name="firstName"
                    id="firstName"
                    data-email="required"
                    placeholder="*Your First Name"
                    className="big-input border-radius-4"
                  />
                  <input
                    onChange={this.handleChange}
                    value={this.state.email}
                    type="text"
                    name="email"
                    id="email"
                    data-email="required"
                    placeholder="*Your Email"
                    className="big-input border-radius-4"
                  />
                  <button
                    onClick={this.handleSubmit}
                    type="submit"
                    className="contact-submit btn btn-large propClone  text-white builder-bg tz-text"
                    style={{ backgroundColor: Colors.mainOrange }}
                    data-selector=".tz-text"
                  >
                    LET ME KNOW WHEN ENROLLMENT HAPPENS!
                  </button>
                  <div style={styles.error}>{this.state.error}</div>
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
