import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactStars from 'react-stars';
import { orange50 } from 'material-ui/styles/colors';
import Spinner from 'react-activity/lib/Spinner';
import Axios from 'axios';
import * as firebase from 'firebase';

import SoundcastSignup from '../soundcast_signup';
// import SocialShare from './socialshare'
// import { openSignupbox, openConfirmationbox, addSoundcastToCart } from '../actions/index'

const styles = {
  iconWrap: {
    // width: '100%',
    // height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    transform: `translate(${0}, -${50}%)`,
    top: '50%',
    // zIndex: 10,
    textAlign: 'center',
    // verticalAlign: 'bottom'
    // background: hsla(0, 100%, 50%, 0.4)
  },
  icon: {
    // position: 'relative',
    // top: 0,
    // right: '-10px',
    // bottom: '-10px',
    fontSize: '40px',
    // color: 'white'
  },
};

class _SoundcastHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      soundcastID: '',
      soundcast: {
        title: '',
        short_description: '',
        imageURL: '',
        long_description: '',
      },
      paid: false,
      startPaymentSubmission: false,
      paymentError: '',
    };
  }

  renderProgressBar() {
    if (this.state.startPaymentSubmission) {
      return (
        <Spinner
          style={{ display: 'flex', paddingLeft: '0.5em' }}
          color="#727981"
          size={16}
          speed={1}
        />
      );
    }
  }

  render() {
    const { soundcast } = this.props;
    const soundcastName = soundcast.title.split(' ').join('%20');
    const { originalPrice, displayedPrice, pre, post } = this.props.getPrice(soundcast, 'per');

    return (
      <div>
        <section className=" bg-white" style={{}}>
          <div className="container">
            <div
              className="row equalize sm-equalize-auto equalize-display-inherit"
              style={{
                borderBottom: '0.5px solid lightgrey',
                paddingBottom: 15,
                paddingTop: 35,
              }}
            >
              <div
                className="col-md-7 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin"
                style={{ height: '378px' }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div className="row" style={{ height: '80%' }}>
                    <div style={{ paddingRight: 25, paddingLeft: 25 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <h2
                          style={{ margin: 0 }}
                          className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray  tz-text"
                        >
                          {this.props.soundcast.title}
                        </h2>
                      </div>
                      <div style={{ paddingTop: 25 }}>
                        <span className="text-extra-large sm-text-extra-large font-weight-500 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`${
                          this.props.soundcast.short_description
                        }`}</span>
                      </div>
                      <div
                        className="social social-icon-color text-extra-large sm-text-extra-large  margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text"
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <span className="margin-eight-right title-small sm-title-small">
                          Share this soundcast:
                        </span>
                        <a
                          target="_blank"
                          href={`http://www.facebook.com/sharer/sharer.php?u=https://mysoundwise.com/Soundcasts/${
                            this.props.soundcastID
                          }`}
                          className="margin-eight-right"
                        >
                          <i className="icon-large sm-icon-extra-small fab fa-facebook-f tz-icon-color" />
                        </a>
                        <a
                          target="_blank"
                          href={`https://twitter.com/intent/tweet?text=${soundcastName}. https://mysoundwise.com/soundcasts/${
                            this.props.soundcastID
                          }`}
                          className="margin-eight-right"
                        >
                          <i className="icon-large sm-icon-extra-small fab fa-twitter tz-icon-color" />
                        </a>
                        <a
                          target="_blank"
                          href={`https://plus.google.com/share?url=https://mysoundwise.com/Soundcasts/${
                            this.props.soundcastID
                          }`}
                          className="margin-eight-right"
                        >
                          <i className="icon-large sm-icon-extra-small fab fa-google-plus-g tz-icon-color" />
                        </a>
                        <a
                          target="_blank"
                          href={`https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A//mysoundwise.com/Soundcasts/${
                            this.props.soundcastID
                          }&amp;title=${soundcastName}&amp;source=`}
                          className="margin-eight-right"
                        >
                          <i className="icon-large sm-icon-extra-small fab fa-linkedin-in tz-icon-color" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ paddingBottom: '30px' }}>
                    <div className="col-md-7 col-sm-6 col-xs-12 feature-box-details-second text-center xs-margin-bottom-10px">
                      {soundcast.prices && soundcast.prices[0] && (
                        <span
                          className="title-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text"
                          style={{ fontWeight: 550 }}
                        >
                          <strong>
                            {originalPrice && (
                              <span style={{ color: 'red', paddingRight: 10 }}>
                                <s>{`\u00A0$${Number(originalPrice).toFixed(2)}\u00A0`}</s>
                              </span>
                            )}
                            {`${pre}${displayedPrice}`}
                            <i>{` ${post}`}</i>
                          </strong>
                        </span>
                      )}
                    </div>
                    <div className="col-md-5 col-sm-6 col-xs-12 text-center ">
                      <a
                        className="btn-medium btn btn-circle text-white no-letter-spacing"
                        onClick={this.props.openModal}
                        style={{ backgroundColor: '#F76B1C' }}
                      >
                        <span
                          id="getAccessBtnTest"
                          className="text-extra-large sm-text-extra-large tz-text"
                        >
                          GET ACCESS
                        </span>
                        {this.renderProgressBar()}
                      </a>
                      <div style={{ color: 'red' }}>{this.state.paymentError}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-md-4 col-sm-12 col-xs-12  sm-margin-fifteen-bottom text-center center-col"
                style={{
                  height: '378px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  className=""
                  style={{
                    display: 'inline-block',
                    position: 'relative',
                    width: '350px',
                    height: '350px',
                  }}
                >
                  <img
                    src={this.props.soundcast.imageURL}
                    data-img-size="(W)450px X (H)450px"
                    alt=""
                    style={{
                      width: '350px',
                      height: '350px',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <SoundcastSignup soundcast={this.props.soundcast} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  const { signupFormOpen } = state.signupBox;
  return {
    isLoggedIn,
    userInfo,
    signupFormOpen,
  };
};

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators({ openConfirmationbox, openSignupbox, addSoundcastToCart }, dispatch)
// }

const SoundcastHeader_worouter = connect(
  mapStateToProps,
  null
)(_SoundcastHeader);

export const SoundcastHeader = withRouter(SoundcastHeader_worouter);
