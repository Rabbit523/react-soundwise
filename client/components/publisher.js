import React, { Component } from 'react';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';
import moment from 'moment';
import Axios from 'axios';
import Dots from 'react-activity/lib/Dots';

import Footer from './footer';
import { SoundwiseHeader } from './soundwise_header';

export default class Publisher extends Component {
  constructor(props) {
    super(props);

    this.state = {
      publisher: '',
      soundcasts: [],
      loading: false,
    };
  }

  async componentDidMount() {
    const publisherID = this.props.match.params.id;
    const { history } = this.props;
    const that = this;
    const soundcasts = [];

    const publisher = await firebase
      .database()
      .ref('publishers/' + publisherID)
      .once('value');

    if (!publisher.val()) {
      history.push('/notfound');
    } else {
      const soundcastsArr = Object.keys(publisher.val().soundcasts);
      console.log('soundcastsArr: ', soundcastsArr);
      this.setState({
        publisher: publisher.val(),
        loading: true,
      });

      // await setTimeout(() => {
      //   return true;
      // }, 1000);

      let soundcast;
      for (let i = 0; i < soundcastsArr.length; i++) {
        soundcast = await firebase
          .database()
          .ref(`soundcasts/${soundcastsArr[i]}`)
          .once('value');
        if (soundcast.val() && soundcast.val().landingPage && soundcast.val().published) {
          soundcasts.push({ ...soundcast.val(), id: soundcastsArr[i] });
        }
      }
      this.setState({
        soundcasts,
        loading: false,
      });
    }
  }

  render() {
    const { publisher } = this.state;

    return (
      <div>
        <SoundwiseHeader showIcon={false} />
        <section
          className="padding-70px-tb bg-white builder-bg xs-padding-60px-tb"
          id="feature-section14"
        >
          <div className="container">
            <div className="row margin-five-bottom">
              <div className="col-md-9 col-sm-10 col-xs-12 center-col  ">
                <div
                  className="col-md-4 col-sm-6 col-xs-12 xs-padding-bottom-15px"
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <div
                    alt={`${publisher.name}`}
                    className="img-round-160"
                    style={{ backgroundImage: `url(${publisher.imageUrl})` }}
                  />
                </div>
                <div className="col-md-8 col-sm-6 col-xs-12" style={{ textAlign: 'center' }}>
                  <div className="col-md-12 section-title-medium sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                    {this.state.publisher.name}
                  </div>
                  <div
                    className="col-md-12 social social-icon-color"
                    style={{ marginTop: '1em', marginBottom: '1em' }}
                  >
                    {(publisher.website && (
                      <a
                        href={
                          publisher.website.slice(0, 4) == 'http'
                            ? publisher.website
                            : `http://${publisher.website}`
                        }
                        target="_blank"
                        className="margin-eight-right"
                      >
                        <i className="icon-small sm-icon-extra-small fa fa-link tz-icon-color" />
                      </a>
                    )) ||
                      null}
                    {(publisher.facebook && (
                      <a
                        href={
                          publisher.facebook.slice(0, 4) == 'http'
                            ? publisher.facebook
                            : `http://${publisher.facebook}`
                        }
                        target="_blank"
                        className="margin-eight-right"
                      >
                        <i className="icon-small sm-icon-extra-small fab fa-facebook-f tz-icon-color" />
                      </a>
                    )) ||
                      null}
                    {(publisher.twitter && (
                      <a
                        href={
                          publisher.twitter.slice(0, 4) == 'http'
                            ? publisher.twitter
                            : `http://${publisher.twitter}`
                        }
                        target="_blank"
                        className="margin-eight-right"
                      >
                        <i className="icon-small sm-icon-extra-small fab fa-twitter tz-icon-color" />
                      </a>
                    )) ||
                      null}
                    {publisher.linkedin && (
                      <a
                        href={
                          publisher.linkedin.slice(0, 4) == 'http'
                            ? publisher.linkedin
                            : `http://${publisher.linkedin}`
                        }
                        target="_blank"
                        className="margin-eight-right"
                      >
                        <i className="icon-small sm-icon-extra-small fab fa-linkedin-in tz-icon-color" />
                      </a>
                    )}
                    {publisher.instagram && (
                      <a
                        href={
                          publisher.instagram.slice(0, 4) == 'http'
                            ? publisher.instagram
                            : `http://${publisher.instagram}`
                        }
                        target="_blank"
                        className="margin-eight-right"
                      >
                        <i className="icon-small sm-icon-extra-small fab fa-instagram tz-icon-color" />
                      </a>
                    )}
                  </div>
                  <div className="tz-text text-medium col-md-12">
                    <span>{publisher.publisherInfo}</span>
                  </div>
                </div>
              </div>
            </div>
            {(this.state.loading && (
              <div
                className="col-md-12"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '1em',
                }}
              >
                <Dots style={{ display: 'flex' }} color="#727981" size={32} speed={1} />
              </div>
            )) ||
              null}
            <div
              className="col-md-12"
              style={{ borderTop: 'solid 0.05em #f4f2f2', paddingTop: 45 }}
            >
              {this.state.soundcasts.map((soundcast, i) => {
                let price = '',
                  pre = '',
                  post = '';
                if (!soundcast.forSale) {
                  price = 'Free';
                } else {
                  price = soundcast.prices[0].price;
                  price = Number(price) == 0 ? 'Free' : price;
                  pre = soundcast.prices.length > 1 ? 'From ' : '';
                  if (soundcast.prices[0].billingCycle == 'monthly') {
                    post = ' / month';
                  } else if (soundcast.prices[0].billingCycle == 'quarterly') {
                    post = ' / quarter';
                    // price = Math.floor(price / 3 *100) / 100;
                  } else if (soundcast.prices[0].billingCycle == 'annual') {
                    post = ' / year';
                    // price = Math.floor(price.price / 12 *100) / 100;
                  }
                }
                return (
                  <div
                    key={i}
                    className="col-md-4 col-sm-6 col-xs-12 padding-five  xs-padding-nineteen"
                  >
                    <Link to={`/soundcasts/${soundcast.id}`}>
                      <div className="blog-post">
                        <div className="blog-image margin-twenty-bottom sm-margin-ten-bottom">
                          <img className="img100" alt="" src={soundcast.imageURL} />
                        </div>
                        <div className="post-details">
                          <div className="tz-text text-dark-gray  title-large sm-title-large font-weight-800 display-block margin-ten-bottom xs-margin-five-bottom">
                            {soundcast.title}
                          </div>
                          <div
                            className="tz-text text-dark-gray title-medium sm-title-medium  display-block margin-ten-bottom xs-margin-five-bottom"
                            style={{ fontWeight: 800 }}
                          >
                            {`${pre}${price == 'Free' ? '' : '$'}${price}${post}`}
                          </div>
                          <div className="text-medium tz-text">
                            <p>{soundcast.short_description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <div
          style={{
            bottom: 0,
            width: '100%',
            position: this.state.soundcasts.length > 0 ? 'static' : 'absolute',
          }}
        >
          <Footer />
        </div>
      </div>
    );
  }
}
