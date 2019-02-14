import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import 'url-search-params-polyfill'; // URLSearchParams
import { Helmet } from 'react-helmet';
import firebase from 'firebase';
import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { EditorState, convertToRaw } from 'draft-js';

import { SoundcastHeader } from './components/soundcast_header';
import SoundwiseFooter from './components/footer';

import SoundcastBody from './components/soundcast_body';
import SoundcastFooter from './components/soundcast_footer';
import Banner from './components/banner';
import { PricingModal } from './components/pricing_modal';

import PageHeader from './components/page_header';
import { PublisherHeader } from './components/publisher_header';
import RelatedSoundcasts from './components/related_soundcasts';
// import {CourseSignup} from './course_signup'

class _SoundcastPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      soundcastID: '',
      soundcast: {
        bundle: false,
        title: '',
        short_description: '',
        forSale: true,
        imageURL: '',
        long_description: JSON.stringify(
          convertToRaw(EditorState.createEmpty().getCurrentContent())
        ),
        prices: [{}],
        modalOpen: false,
      },
      coupon: '',
      cardHeight: 0,
      showBanner: false,
      publisherID: '',
      publisherName: '',
      publisherImg: '',
      timerDigits: [],
      checkedPrice: 0,
    };
    this.nv = null;
    this.handleScroll = this.handleScroll.bind(this);
    this.retrieveSoundcast = this.retrieveSoundcast.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.getPrice = this.getPrice.bind(this);
  }

  async componentDidMount() {
    const { history } = this.props;
    const soundcastID = this.props.match.params.id;
    const params = new URLSearchParams(this.props.location.search);

    // check coupon parameter
    if (params.get('c')) {
      this.setState({ coupon: params.get('c') });
      this.startTimer();
    }
    this.retrieveSoundcast(soundcastID);
    if (params.get('custom_token')) {
      const customToken = params.get('custom_token');
      await firebase.auth().signInWithCustomToken(customToken);
    }
    // this.nv.addEventListener('scroll', this.handleScroll);
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillReceiveProps(nextProps) {
    const { history } = this.props;
    if (nextProps.match.params.id !== this.props.match.params.id) {
      const soundcastID = nextProps.match.params.id;
      // console.log('soundcastID: ', soundcastID);
      this.retrieveSoundcast(soundcastID);
    }
  }

  async retrieveSoundcast(soundcastID) {
    const { history } = this.props;
    const soundcastSnapshot = await firebase
      .database()
      .ref(`soundcasts/${soundcastID}`)
      .once('value');
    const soundcast = soundcastSnapshot.val();
    if (!soundcast.prices || !soundcast.prices.length) {
      soundcast.prices = [{ billingCycle: 'free', price: 'free' }];
    }
    if (soundcast) {
      const { expiration, checkedPrice } = this.getPrice(soundcast);
      this.setState({
        soundcast,
        soundcastID,
        publisherID: soundcast.publisherID,
        expiration,
        checkedPrice,
        bundle: soundcast.bundle,
      });
      const publisher = await firebase
        .database()
        .ref(`publishers/${soundcast.publisherID}`)
        .once('value');
      if (publisher.val()) {
        this.setState({
          publisherImg: publisher.val().imageUrl,
          publisherName: publisher.val().name,
        });
      }
    } else {
      history.push('/notfound');
    }
  }

  getPrice(soundcast = this.state.soundcast, slashSign = '/') {
    let price,
      checkedPrice = 0,
      expiration,
      originalPrice,
      couponPrice,
      displayedPrice = 'Free',
      trialLength,
      pre = '',
      post = '';
    if (this.state.coupon) {
      price = soundcast.prices.find((price, index) => {
        if (
          price.coupons &&
          price.coupons.some(coupon => {
            if (
              coupon.code === this.state.coupon &&
              coupon.expiration > Date.now() / 1000 // in future
            ) {
              expiration = coupon.expiration; // set coupon's expiration value
              originalPrice = price.price;
              if (coupon.couponType === 'trial_period') {
                trialLength = coupon.trialLength;
                couponPrice;
              } else {
                // discount coupon type (default)
                couponPrice = Math.round(
                  (Number(price.price) * (100 - Number(coupon.percentOff))) / 100
                );
              }
              return true;
            }
          })
        ) {
          checkedPrice = index;
          return true;
        }
      });
    }
    if (!price) {
      price = soundcast.prices[0];
    }
    if (soundcast.forSale) {
      if (!couponPrice && !trialLength && soundcast.prices.length > 1) {
        pre = 'From ';
      }
      displayedPrice = `$${Number(couponPrice || price.price || 0).toFixed(2)}`;
      switch (price.billingCycle) {
        case 'rental':
          post = `${slashSign} ${price.rentalPeriod}-Day Access`;
          break;
        case 'monthly':
          post = `${slashSign} month`;
          break;
        case 'quarterly':
          post = `${slashSign} quarter`;
          break;
        case 'annual':
          post = `${slashSign} year`;
          break;
      }
    }
    if (trialLength) {
      displayedPrice = `${trialLength} days free trial`;
      post = ``;
    }
    return { checkedPrice, expiration, originalPrice, displayedPrice, pre, post };
  }

  componentWillUnmount() {
    // Make sure to remove the DOM listener when the component is unmounted.
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll(e) {
    // TODO http://underscorejs.org/#throttle
    const headerHeight = this.header.clientHeight;
    const bodyHeigher = this.body.clientHeight;
    const showBanner = window.pageYOffset > headerHeight && window.pageYOffset < bodyHeigher;
    this.setState({ showBanner });
  }

  setMaxCardHeight(cardHeight) {
    if (cardHeight > this.state.cardHeight) {
      this.setState({ cardHeight });
    }
  }

  handleModal() {
    this.setState({ modalOpen: !this.state.modalOpen });
  }

  startTimer() {
    setInterval(() => {
      if (this.state.expiration) {
        let available = Math.floor(this.state.expiration - Date.now() / 1000);
        if (available > 0) {
          let days = Math.floor(available / (24 * 60 * 60));
          available -= days * 24 * 60 * 60;
          let hours = Math.floor(available / (60 * 60));
          available -= hours * 60 * 60;
          let minutes = Math.floor(available / 60);
          let seconds = available % 60;
          if (days > 99) {
            days = 99;
          }
          if (seconds <= 9) {
            seconds = '0' + seconds;
          }
          if (minutes <= 9) {
            minutes = '0' + minutes;
          }
          if (hours <= 9) {
            hours = '0' + hours;
          }
          if (days <= 9) {
            days = '0' + days;
          }
          if (Number(days) <= 3) {
            // within 3 days
            this.setState({ timerDigits: `${days}${hours}${minutes}${seconds}`.split('') });
          }
        }
      }
    }, 1000);
  }

  render() {
    const soundcastID = this.props.match.params.id;
    const {
      soundcast,
      modalOpen,
      showBanner,
      publisherName,
      publisherImg,
      publisherID,
      timerDigits,
      coupon,
      checkedPrice,
      bundle,
    } = this.state;
    if (!soundcastID || !soundcast || (soundcast && soundcast.title && !soundcast.landingPage)) {
      return <Redirect to="/notfound" />;
    }

    return (
      <div>
        <Helmet>
          {(soundcast.podcastFeedVersion && (
            <link
              rel="alternate"
              type="application/rss+xml"
              title={`${soundcast.title}`}
              href={`https://mysoundwise.com/rss/${soundcastID}`}
            />
          )) ||
            null}
          <title>{`${soundcast.title} | Soundwise`}</title>
          <meta property="og:url" content={`https://mysoundwise.com/soundcasts/${soundcastID}`} />
          <meta property="fb:app_id" content="1726664310980105" />
          <meta property="og:title" content={soundcast.title} />
          <meta property="og:description" content={soundcast.short_description} />
          <meta property="og:image" content={soundcast.imageURL} />
          <meta name="description" content={soundcast.short_description} />
          <meta name="keywords" content={soundcast.keywords} />
          <meta name="twitter:title" content={soundcast.title} />
          <meta name="twitter:description" content={soundcast.short_description} />
          <meta name="twitter:image" content={soundcast.imageURL} />
          <meta name="twitter:card" content={soundcast.imageURL} />
        </Helmet>
        <MuiThemeProvider>
          <div>
            {(timerDigits.length && (
              <div
                style={{
                  backgroundColor: '#61e1fb',
                  color: '#f76b1c',
                  position: 'fixed',
                  width: '100%',
                  zIndex: 1002,
                  textAlign: 'center',
                  fontSize: 32,
                  padding: '14px 0 7px',
                  fontWeight: 800,
                }}
              >
                <span
                  style={{ color: 'white', top: '-38px', position: 'relative', paddingRight: 20 }}
                >
                  This Offer Expires In
                </span>
                <span style={styles.timerBlock}>
                  <span style={styles.timerDigit}>{timerDigits[0]}</span>
                  <span style={styles.timerDigit}>{timerDigits[1]}</span>
                  <div style={styles.timerLabel}>Days</div>
                </span>
                <span style={styles.timerColon}>:</span>
                <span style={styles.timerBlock}>
                  <span style={styles.timerDigit}>{timerDigits[2]}</span>
                  <span style={styles.timerDigit}>{timerDigits[3]}</span>
                  <div style={styles.timerLabel}>Hours</div>
                </span>
                <span style={styles.timerColon}>:</span>
                <span style={styles.timerBlock}>
                  <span style={styles.timerDigit}>{timerDigits[4]}</span>
                  <span style={styles.timerDigit}>{timerDigits[5]}</span>
                  <div style={styles.timerLabel}>Minutes</div>
                </span>
                <span style={styles.timerColon}>:</span>
                <span style={{ ...styles.timerBlock, paddingRight: 36 }}>
                  <span style={styles.timerDigit}>{timerDigits[6]}</span>
                  <span style={styles.timerDigit}>{timerDigits[7]}</span>
                  <div style={styles.timerLabel}>Seconds</div>
                </span>
              </div>
            )) ||
              null}
            <div
              ref={elem => (this.header = elem)}
              style={{ paddingTop: timerDigits.length ? 118 : 0 }}
            >
              <PublisherHeader
                soundcastID={soundcastID}
                publisherID={publisherID}
                publisherName={publisherName}
                publisherImg={publisherImg}
              />
              <PricingModal
                soundcast={soundcast}
                soundcastID={soundcastID}
                coupon={coupon}
                checkedPrice={checkedPrice}
                open={modalOpen}
                handleModal={this.handleModal.bind(this)}
              />
              <SoundcastHeader
                getPrice={this.getPrice}
                soundcast={soundcast}
                soundcastID={soundcastID}
                openModal={this.handleModal.bind(this)}
              />
            </div>
            <div ref={elem => (this.body = elem)}>
              <SoundcastBody
                showBanner={showBanner}
                soundcast={soundcast}
                soundcastID={soundcastID}
                openModal={this.handleModal.bind(this)}
                // relatedsoundcasts={_relatedsoundcasts}
                cb={this.setMaxCardHeight.bind(this)}
                userInfo={this.props.userInfo}
                history={this.props.history}
                bundle={bundle}
              />
            </div>
            {(showBanner && (
              <Banner getPrice={this.getPrice} openModal={this.handleModal.bind(this)} />
            )) ||
              null}
            <SoundcastFooter getPrice={this.getPrice} openModal={this.handleModal.bind(this)} />
            <SoundwiseFooter />
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators({ setCurrentPlaylist, setCurrentCourse, loadCourses }, dispatch)
// }

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  return { userInfo, isLoggedIn };
};

const SP_worouter = connect(
  mapStateToProps,
  null
)(_SoundcastPage);

export const SoundcastPage = withRouter(SP_worouter);

const styles = {
  timerBlock: {
    display: 'inline-block',
  },
  timerDigit: {
    backgroundColor: '#f76b1c',
    fontSize: 60,
    borderRadius: 5,
    color: 'white',
    margin: 2,
    display: 'inline-block',
    height: 71,
    lineHeight: '68px',
    padding: '0px 7px',
  },
  timerLabel: {
    fontSize: 18,
  },
  timerColon: {
    fontSize: 44,
    padding: '0px 10px',
    top: '-39px',
    position: 'relative',
    display: 'inline-block',
  },
};
