import React from 'react';
import { Link } from 'react-router-dom';
import Toggle from 'react-toggle';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import Colors from '../styles/colors';

const Pricing = props => (
  <div>
    <section
      className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg"
      id="pricing-table5"
      style={{ paddingBottom: 80, paddingTop: 30 }}
    >
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12 text-center">
            <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
              START SPREADING YOUR KNOWLEDGE WITH AUDIO
            </h2>
            <div className="title-small width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-five-bottom xs-margin-eleven-bottom">
              Build an engaged audience and make money from your knowledge using the fastest growing
              media format on the planet.
            </div>
          </div>
        </div>
        <div
          className="row "
          style={{
            marginBottom: 45,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              id="share-label"
              className="title-medium xs-title-medium "
              style={{ fontWeight: 800, marginRight: '0.5em' }}
            >
              Monthly
            </span>
            <Toggle
              id="frequency"
              icons={false}
              aria-labelledby="share-label"
              // label="Charge subscribers for this soundcast?"
              checked={props.frequency == 'annual'}
              onChange={props.changeFrequency}
              // thumbSwitchedStyle={styles.thumbSwitched}
              // trackSwitchedStyle={styles.trackSwitched}
              // style={{fontSize: 20, width: '50%'}}
            />
            <span
              id="share-label"
              className="title-medium xs-title-medium "
              style={{ fontWeight: 800, marginLeft: '0.5em' }}
            >
              Annual
            </span>
            <span className="title-medium xs-title-medium " style={{ marginLeft: '0.2em' }}>
              (save 20%)
            </span>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px">
            <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
              <li className="tz-background-color" style={{ backgroundColor: Colors.mainGreen }}>
                <h5
                  className="text-white font-weight-600 title-large tz-text alt-font"
                  style={{ marginTop: 0, marginBottom: 0 }}
                >
                  BASIC
                </h5>
                <div
                  className="text-large text-white alt-font tz-text no-margin-bottom font-weight-600"
                  style={{ fontSize: 15 }}
                >
                  {' '}
                  <span className="no-margin-bottom"> Get started</span>{' '}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }} />
              </li>
              <li className="tz-border">
                <div
                  className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text"
                  style={{
                    color: Colors.mainGreen,
                    marginTop: 0,
                    marginBottom: 0,
                    fontWeight: 800,
                  }}
                >
                  {`$${props.prices[props.frequency]['basic']}`}
                  <span
                    style={{
                      color: Colors.mainGreen,
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    /month
                  </span>
                </div>
                {(props.frequency == 'annual' && (
                  <div className="tz-text alt-font">{`SAVE $${(props.prices['monthly']['basic'] -
                    props.prices['annual']['basic']) *
                    12} A YEAR`}</div>
                )) || <div className="tz-text alt-font">&nbsp;</div>}
                <div style={{ marginTop: '1em' }}>
                  {(props.isLoggedIn &&
                    props.userInfo.publisher &&
                    (props.userInfo.publisher.plan == 'basic' &&
                      props.userInfo.publisher.current_period_end > moment().format('X')) && (
                      <div
                        className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                        style={{ backgroundColor: 'transparent', width: '80%' }}
                      >
                        <span className="tz-text">Current Plan</span>
                      </div>
                    )) ||
                    (props.isLoggedIn &&
                      props.userInfo.publisher &&
                      ((props.userInfo.publisher.plan == 'basic' &&
                        props.userInfo.publisher.current_period_end < moment().format('X')) ||
                        props.userInfo.publisher.plan == 'plus' ||
                        props.userInfo.publisher.plan == 'pro' ||
                        props.userInfo.publisher.plan == 'platinum' ||
                        !props.userInfo.publisher.plan) && (
                        <div
                          className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                          onClick={() =>
                            props.goToCheckout(
                              'basic',
                              props.frequency,
                              props.prices[props.frequency]['basic']
                            )
                          }
                          style={{
                            backgroundColor: Colors.mainGreen,
                            width: '80%',
                          }}
                        >
                          <span className="tz-text">GET BASIC</span>
                        </div>
                      )) ||
                    (!props.isLoggedIn && (
                      <div
                        className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                        onClick={() =>
                          props.goToCheckout(
                            'basic',
                            props.frequency,
                            props.prices[props.frequency]['basic']
                          )
                        }
                        style={{
                          backgroundColor: Colors.mainGreen,
                          width: '80%',
                        }}
                      >
                        <span className="tz-text">GET BASIC</span>
                      </div>
                    ))}
                </div>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-star" style={{ color: Colors.mainGreen, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  <strong>10% transaction fee</strong> on soundcast sales
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-star" style={{ color: Colors.mainGreen, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Up to <strong>1 soundcast</strong> hosted
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Unlimited listener signup
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Uploading of companion materials (PDFs, texts, images){' '}
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Audio recording from dashboard
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  One-click RSS feed generation
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  YouTube integration
                </span>
                <a
                  data-for="main"
                  data-tip="One-click conversion of your YouTube channel into<br /> a soundcast with automatic update"
                >
                  <i
                    className="far  fa-question-circle"
                    style={{ marginLeft: 5, marginBottom: 3, color: 'green', fontSize: 12 }}
                  />
                </a>
                <ReactTooltip id="main" place="right" type="dark" multiline={true} />
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  MailChimp integration
                </span>
                <a
                  data-for="main"
                  data-tip="Automatically export your soundcast subscriber email <br />addresses to your MailChimp email list"
                >
                  <i
                    className="far  fa-question-circle"
                    style={{ marginLeft: 5, marginBottom: 3, color: 'green', fontSize: 12 }}
                  />
                </a>
                <ReactTooltip id="main" place="right" type="dark" multiline={true} />
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  One-click deployment of free soundcasts to Apple Podcasts, Google Podcasts &
                  Spotify
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Automatic audio file metadata tagging (e.g. ID3 tags for mp3s)
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Optimized soundcast landing page and publisher “store front” page
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Private soundcasts
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Listener access to mobile and web apps
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Audience interaction on mobile app (e.g. likes, comments, group messages)
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Selling soundcasts as one-time purchase rental, or subscription
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Creating coupons and promotional sales pages
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Payment processing
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-star" style={{ color: Colors.mainGreen, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  <strong>Monthly payouts</strong> to bank account or debit card
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-star" style={{ color: Colors.mainGreen, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Service support
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Complete analytics for each listener on Soundwise
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Automatic audio editing
                </span>
              </li>
              <li>
                {(props.isLoggedIn &&
                  props.userInfo.publisher &&
                  (props.userInfo.publisher.plan == 'basic' &&
                    props.userInfo.publisher.current_period_end > moment().format('X')) && (
                    <div
                      className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                      style={{ backgroundColor: 'transparent', width: '80%' }}
                    >
                      <span className="tz-text">Current Plan</span>
                    </div>
                  )) ||
                  (props.isLoggedIn &&
                    props.userInfo.publisher &&
                    ((props.userInfo.publisher.plan == 'basic' &&
                      props.userInfo.publisher.current_period_end < moment().format('X')) ||
                      props.userInfo.publisher.plan == 'plus' ||
                      props.userInfo.publisher.plan == 'pro' ||
                      props.userInfo.publisher.plan == 'platinum' ||
                      !props.userInfo.publisher.plan) && (
                      <div
                        className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                        onClick={() =>
                          props.goToCheckout(
                            'basic',
                            props.frequency,
                            props.prices[props.frequency]['basic']
                          )
                        }
                        style={{
                          backgroundColor: Colors.mainOrange,
                          width: '80%',
                        }}
                      >
                        <span className="tz-text">GET BASIC</span>
                      </div>
                    )) ||
                  (!props.isLoggedIn && (
                    <div
                      className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                      onClick={() =>
                        props.goToCheckout(
                          'basic',
                          props.frequency,
                          props.prices[props.frequency]['basic']
                        )
                      }
                      style={{
                        backgroundColor: Colors.mainGreen,
                        width: '80%',
                      }}
                    >
                      <span className="tz-text">GET BASIC</span>
                    </div>
                  ))}
              </li>
            </ul>
          </div>
          <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px">
            <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
              <li className="tz-background-color" style={{ backgroundColor: Colors.link }}>
                <h5
                  className="text-white title-large font-weight-600 tz-text alt-font"
                  style={{ marginTop: 0, marginBottom: 0 }}
                >
                  PLUS
                </h5>
                <div className="text-large text-white alt-font tz-text no-margin-bottom font-weight-600">
                  {' '}
                  <div className="no-margin-bottom" style={{ fontSize: 15 }}>
                    Build an audience
                  </div>{' '}
                </div>
              </li>
              <li className="tz-border">
                <div
                  className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text"
                  style={{
                    color: Colors.link,
                    marginTop: 0,
                    marginBottom: 0,
                    fontWeight: 800,
                  }}
                >
                  {`$${props.prices[props.frequency]['plus']}`}
                  <span
                    style={{
                      color: Colors.link,
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    /month
                  </span>
                </div>
                {(props.frequency == 'annual' && (
                  <div className="tz-text alt-font">{`SAVE $${(props.prices['monthly']['plus'] -
                    props.prices['annual']['plus']) *
                    12} A YEAR`}</div>
                )) || <div className="tz-text alt-font">&nbsp;</div>}
                <div style={{ marginTop: '1em' }}>
                  {(props.isLoggedIn &&
                    props.userInfo.publisher &&
                    (props.userInfo.publisher.plan == 'plus' &&
                      props.userInfo.publisher.current_period_end > moment().format('X')) && (
                      <div
                        className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                        style={{ backgroundColor: 'transparent', width: '80%' }}
                      >
                        <span className="tz-text">Current Plan</span>
                      </div>
                    )) ||
                    (props.isLoggedIn &&
                      props.userInfo.publisher &&
                      ((props.userInfo.publisher.plan == 'plus' &&
                        props.userInfo.publisher.current_period_end < moment().format('X')) ||
                        props.userInfo.publisher.plan == 'pro' ||
                        props.userInfo.publisher.plan == 'platinum' ||
                        !props.userInfo.publisher.plan) && (
                        <div
                          className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                          onClick={() =>
                            props.goToCheckout(
                              'plus',
                              props.frequency,
                              props.prices[props.frequency]['plus']
                            )
                          }
                          style={{ backgroundColor: Colors.link, width: '80%' }}
                        >
                          <span className="tz-text">GET PLUS</span>
                        </div>
                      )) ||
                    (!props.isLoggedIn && (
                      <div
                        id="pricingGetPlusBtnTest"
                        className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                        onClick={() =>
                          props.goToCheckout(
                            'plus',
                            props.frequency,
                            props.prices[props.frequency]['plus']
                          )
                        }
                        style={{ backgroundColor: Colors.link, width: '80%' }}
                      >
                        <span className="tz-text">GET PLUS</span>
                      </div>
                    ))}
                </div>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-star" style={{ color: Colors.link, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  <strong>5% transaction fee</strong> on soundcast sales
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-star" style={{ color: Colors.link, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Up to <strong>10 soundcasts or 500 episodes</strong> hosted
                </span>
                <a
                  data-for="main"
                  data-tip="The less stringent limit applies. <br/>
                  e.g. You can have more than 10 soundcasts <br/>as long as the total number of episodes <br/>is under 500. You can have more than 500 episodes <br /> as long as the total number of soundcasts is less than 10."
                >
                  <i
                    className="far  fa-question-circle"
                    style={{ marginLeft: 5, marginBottom: 3, color: Colors.link, fontSize: 12 }}
                  />
                </a>
                <ReactTooltip id="main" place="right" type="dark" multiline={true} />
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Unlimited listener signup
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Uploading of companion materials (PDFs, texts, images){' '}
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Audio recording from dashboard
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  One-click RSS feed generation
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  YouTube integration
                </span>
                <a
                  data-for="main"
                  data-tip="One-click conversion of your YouTube channel into<br /> a soundcast with automatic update"
                >
                  <i
                    className="far  fa-question-circle"
                    style={{ marginLeft: 5, marginBottom: 3, color: 'green', fontSize: 12 }}
                  />
                </a>
                <ReactTooltip id="main" place="right" type="dark" multiline={true} />
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  MailChimp integration
                </span>
                <a
                  data-for="main"
                  data-tip="Automatically export your soundcast subscriber email <br />addresses to your MailChimp email list"
                >
                  <i
                    className="far  fa-question-circle"
                    style={{ marginLeft: 5, marginBottom: 3, color: 'green', fontSize: 12 }}
                  />
                </a>
                <ReactTooltip id="main" place="right" type="dark" multiline={true} />
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  One-click deployment of free soundcasts to Apple Podcasts, Google Podcasts &
                  Spotify
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Automatic audio file metadata tagging (e.g. ID3 tags for mp3s)
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Optimized soundcast landing page and publisher “store front” page
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Private soundcasts
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Listener access to mobile and web apps
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Audience interaction on mobile app (e.g. likes, comments, group messages)
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Selling soundcasts as one-time purchase, rental, or subscription
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Creating coupons and promotional sales pages
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Payment processing
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-star" style={{ color: Colors.link, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  <strong>Monthly payouts</strong> to bank account or debit card
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-star" style={{ color: Colors.link, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  <strong>Priority</strong> service support
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Complete analytics for each listener on Soundwise
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Automatic audio editing
                </span>
              </li>
              <li>
                {(props.isLoggedIn &&
                  props.userInfo.publisher &&
                  (props.userInfo.publisher.plan == 'plus' &&
                    props.userInfo.publisher.current_period_end > moment().format('X')) && (
                    <div
                      className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                      style={{ backgroundColor: 'transparent', width: '80%' }}
                    >
                      <span className="tz-text">Current Plan</span>
                    </div>
                  )) ||
                  (props.isLoggedIn &&
                    props.userInfo.publisher &&
                    ((props.userInfo.publisher.plan == 'plus' &&
                      props.userInfo.publisher.current_period_end < moment().format('X')) ||
                      props.userInfo.publisher.plan == 'pro' ||
                      props.userInfo.publisher.plan == 'platinum' ||
                      !props.userInfo.publisher.plan) && (
                      <div
                        className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                        onClick={() =>
                          props.goToCheckout(
                            'plus',
                            props.frequency,
                            props.prices[props.frequency]['plus']
                          )
                        }
                        style={{ backgroundColor: Colors.link, width: '80%' }}
                      >
                        <span className="tz-text">GET PLUS</span>
                      </div>
                    )) ||
                  (!props.isLoggedIn && (
                    <div
                      className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                      onClick={() =>
                        props.goToCheckout(
                          'plus',
                          props.frequency,
                          props.prices[props.frequency]['plus']
                        )
                      }
                      style={{ backgroundColor: Colors.link, width: '80%' }}
                    >
                      <span className="tz-text">GET PLUS</span>
                    </div>
                  ))}
              </li>
            </ul>
          </div>
          <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px">
            <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
              <li className="tz-background-color" style={{ backgroundColor: Colors.mainOrange }}>
                <h5
                  className="text-white font-weight-600 title-large tz-text alt-font"
                  style={{ marginTop: 0, marginBottom: 0 }}
                >
                  PRO
                </h5>
                <div
                  className="text-large text-white alt-font tz-text no-margin-bottom font-weight-600"
                  style={{ fontSize: 15 }}
                >
                  {' '}
                  <span className="no-margin-bottom"> Make it a career</span>{' '}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="popular position-absolute bg-yellow border-radius-2 text-black alt-font text-large builder-bg tz-text">
                    MOST POPULAR
                  </div>
                </div>
              </li>
              <li className="tz-border">
                <div
                  className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text"
                  style={{
                    color: Colors.mainOrange,
                    marginTop: 0,
                    marginBottom: 0,
                    fontWeight: 800,
                  }}
                >
                  {`$${props.prices[props.frequency]['pro']}`}
                  <span
                    style={{
                      color: Colors.mainOrange,
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    /month
                  </span>
                </div>
                {(props.frequency == 'annual' && (
                  <div className="tz-text alt-font">{`SAVE $${(props.prices['monthly']['pro'] -
                    props.prices['annual']['pro']) *
                    12} A YEAR`}</div>
                )) || <div className="tz-text alt-font">&nbsp;</div>}
                <div style={{ marginTop: '1em' }}>
                  {(props.isLoggedIn &&
                    props.userInfo.publisher &&
                    (props.userInfo.publisher.plan == 'pro' &&
                      props.userInfo.publisher.current_period_end > moment().format('X')) && (
                      <div
                        className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                        style={{ backgroundColor: 'transparent', width: '80%' }}
                      >
                        <span className="tz-text">Current Plan</span>
                      </div>
                    )) ||
                    (props.isLoggedIn &&
                      props.userInfo.publisher &&
                      ((props.userInfo.publisher.plan == 'pro' &&
                        props.userInfo.publisher.current_period_end < moment().format('X')) ||
                        props.userInfo.publisher.plan == 'plus' ||
                        props.userInfo.publisher.plan == 'platinum' ||
                        !props.userInfo.publisher.plan) && (
                        <div
                          className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                          onClick={() =>
                            props.goToCheckout(
                              'pro',
                              props.frequency,
                              props.prices[props.frequency]['pro']
                            )
                          }
                          style={{
                            backgroundColor: Colors.mainOrange,
                            width: '80%',
                          }}
                        >
                          <span className="tz-text">GET PRO</span>
                        </div>
                      )) ||
                    (!props.isLoggedIn && (
                      <div
                        className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                        onClick={() =>
                          props.goToCheckout(
                            'pro',
                            props.frequency,
                            props.prices[props.frequency]['pro']
                          )
                        }
                        style={{
                          backgroundColor: Colors.mainOrange,
                          width: '80%',
                        }}
                      >
                        <span className="tz-text">GET PRO</span>
                      </div>
                    ))}
                </div>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-star" style={{ color: Colors.mainOrange, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  <strong>No transaction fee</strong> on soundcast sales
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-star" style={{ color: Colors.mainOrange, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  <strong>Unlimited</strong> audio storage and hosting
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Unlimited listener signup
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Uploading of companion materials (PDFs, texts, images){' '}
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Audio recording from dashboard
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  One-click RSS feed generation
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  YouTube integration
                </span>
                <a
                  data-for="main"
                  data-tip="One-click conversion of your YouTube channel into<br /> a soundcast with automatic update"
                >
                  <i
                    className="far  fa-question-circle"
                    style={{ marginLeft: 5, marginBottom: 3, color: 'green', fontSize: 12 }}
                  />
                </a>
                <ReactTooltip id="main" place="right" type="dark" multiline={true} />
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  MailChimp integration
                </span>
                <a
                  data-for="main"
                  data-tip="Automatically export your soundcast subscriber email <br />addresses to your MailChimp email list"
                >
                  <i
                    className="far  fa-question-circle"
                    style={{ marginLeft: 5, marginBottom: 3, color: 'green', fontSize: 12 }}
                  />
                </a>
                <ReactTooltip id="main" place="right" type="dark" multiline={true} />
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  One-click deployment of free soundcasts to Apple Podcasts, Google Podcasts &
                  Spotify
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Automatic audio file metadata tagging (e.g. ID3 tags for mp3s)
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Optimized soundcast landing page and publisher “store front” page
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Private soundcasts
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Listener access to mobile and web apps
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Audience interaction on mobile app (e.g. likes, comments, group messages)
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Selling soundcasts as one-time purchase rental, or subscription
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Creating coupons and promotional sales pages
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Payment processing
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far  fa-star" style={{ color: Colors.mainOrange, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  <strong>Instant payouts</strong> to bank account or debit card
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-star" style={{ color: Colors.mainOrange, fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  <strong>Priority</strong> service support and <strong>onboarding call</strong>
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Complete analytics for each listener on Soundwise
                </span>
              </li>
              <li
                className="tz-border"
                style={{ textAlign: 'left', paddingLeft: 15, paddingRight: 5 }}
              >
                <i className="far fa-check-circle" style={{ color: 'green', fontSize: 16 }} />
                <span style={{ paddingLeft: 5 }} className="text-large text-dark-gray">
                  Automatic audio editing
                </span>
              </li>
              <li>
                {(props.isLoggedIn &&
                  props.userInfo.publisher &&
                  (props.userInfo.publisher.plan == 'pro' &&
                    props.userInfo.publisher.current_period_end > moment().format('X')) && (
                    <div
                      className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                      style={{ backgroundColor: 'transparent', width: '80%' }}
                    >
                      <span className="tz-text">Current Plan</span>
                    </div>
                  )) ||
                  (props.isLoggedIn &&
                    props.userInfo.publisher &&
                    ((props.userInfo.publisher.plan == 'pro' &&
                      props.userInfo.publisher.current_period_end < moment().format('X')) ||
                      props.userInfo.publisher.plan == 'plus' ||
                      props.userInfo.publisher.plan == 'platinum' ||
                      !props.userInfo.publisher.plan) && (
                      <div
                        className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                        onClick={() =>
                          props.goToCheckout(
                            'pro',
                            props.frequency,
                            props.prices[props.frequency]['pro']
                          )
                        }
                        style={{
                          backgroundColor: Colors.mainOrange,
                          width: '80%',
                        }}
                      >
                        <span className="tz-text">GET PRO</span>
                      </div>
                    )) ||
                  (!props.isLoggedIn && (
                    <div
                      className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                      onClick={() =>
                        props.goToCheckout(
                          'pro',
                          props.frequency,
                          props.prices[props.frequency]['pro']
                        )
                      }
                      style={{
                        backgroundColor: Colors.mainOrange,
                        width: '80%',
                      }}
                    >
                      <span className="tz-text">GET PRO</span>
                    </div>
                  ))}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <section
      style={{ backgroundColor: Colors.mainGreen }}
      className="padding-60px-tb offer bg-white builder-bg xs-padding-60px-tb"
      id="callto-action5"
      data-selector=".builder-bg"
    >
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12 text-center  ">
            <div className="offer-box-left">
              <span
                className="title-small xs-title-extra-large text-dark-gray display-block alt-font tz-text "
                data-selector=".tz-text"
              >
                No risk required to up your audio game.
              </span>
              <span
                className="title-extra-large xs-title-extra-large display-block alt-font font-weight-700 text-dark-gray margin-four-bottom xs-margin-thirteen-bottom tz-text"
                data-selector=".tz-text"
              >
                30-Day Money Back Guarantee
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Pricing;
