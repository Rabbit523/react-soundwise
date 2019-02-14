import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import firebase from 'firebase';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Colors from '../styles/colors';

import { SoundwiseHeader } from '../components/soundwise_header';
import Footer from '../components/footer';
import Pricing from '../components/pricing';

class _PricingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popupOpen: false,
      creditCardError: '',
      planChosen: null,
      frequency: 'annual',
      priceChosen: null,
      prices: {
        annual: {
          basic: 15,
          pro: 79,
          plus: 39,
          platinum: 239,
        },
        monthly: {
          basic: 19,
          pro: 99,
          plus: 49,
          platinum: 299,
        },
      },
    };
    this.goToCheckout = this.goToCheckout.bind(this);
    this.changeFrequency = this.changeFrequency.bind(this);
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

  goToCheckout(plan, frequency, price) {
    this.props.history.push({
      pathname: '/buy',
      state: {
        plan,
        frequency,
        price,
      },
    });
  }

  capFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  changeFrequency() {
    if (this.state.frequency == 'annual') {
      this.setState({
        frequency: 'monthly',
      });
    } else if (this.state.frequency == 'monthly') {
      this.setState({
        frequency: 'annual',
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
    const { userInfo, isLoggedIn } = this.props;
    return (
      <div>
        <Helmet>
          <title>{'Plans and pricing | Soundwise'}</title>
          <meta property="og:url" content="https://mysoundwise.com/pricing" />
          <meta property="fb:app_id" content="1726664310980105" />
          <meta property="og:title" content="Plans and pricing | Soundwise" />
          <meta
            property="og:description"
            content={"Learn About Features & Pricing. Find the Plan That's Right For You."}
          />
          <meta
            property="og:image"
            content="https://mysoundwise.com/images/soundwise_homepage.png"
          />
          <meta
            name="description"
            content={"Learn About Features & Pricing. Find the Plan That's Right For You."}
          />
          <meta
            name="keywords"
            content="soundwise, training, online education, education software, subscription, soundwise inc, real estate, real estate broker, real estate agents, real estate brokerage, real estate training, audio publishing, content management system, audio, mobile application, learning, online learning, online course, podcast, mobile app"
          />
          <meta name="twitter:title" content="Plans and pricing | Soundwise" />
          <meta
            name="twitter:description"
            content="Learn About Features & Pricing. Find the Plan That's Right For You."
          />
          <meta
            name="twitter:image"
            content="https://mysoundwise.com/images/soundwise_homepage.png"
          />
          <meta
            name="twitter:card"
            content="https://mysoundwise.com/images/soundwise_homepage.png"
          />
        </Helmet>
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
        <Pricing
          goToCheckout={this.goToCheckout}
          changeFrequency={this.changeFrequency}
          prices={this.state.prices}
          frequency={this.state.frequency}
          isLoggedIn={isLoggedIn}
          userInfo={userInfo}
        />
        <Footer showPricing={true} />
      </div>
    );
  }
}

const styles = {
  totalRow: {
    borderTop: `1px solid ${Colors.mainGrey}`,
    height: 22,
  },
  totalWrapper: {
    float: 'right',
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.fontBlack,
  },
  totalText: {
    width: 40,
    marginRight: 50,
    float: 'left',
  },
  totalPriceText: {
    width: 53,
    float: 'right',
    textAlign: 'right',
  },
  cardsImage: {
    position: 'absolute',
    right: 4,
    top: 10,
    width: 179,
    height: 26,
  },
  input: {
    height: 46,
    fontSize: 14,
    margin: '40px 0 0 0',
  },
  input2: {
    height: 46,
    fontSize: 14,
    margin: '10px 0 0 0',
  },
  selectBlock: {
    width: '35%',
    height: 46,
    float: 'left',
    marginTop: 9,
    border: `1px solid ${Colors.mainGrey}`,
    paddingLeft: 10,
    marginRight: '5%',
  },
  selectLabel: {
    fontWeight: 'normal',
    display: 'block',
    marginBottom: 0,
    color: Colors.fontBlack,
    fontSize: 14,
  },
  select: {
    border: 0,
    backgroundColor: Colors.mainWhite,
    padding: 0,
    margin: 0,
    color: Colors.fontGrey,
    fontSize: 14,
    position: 'relative',
    right: 3,
  },
  cvc: {
    width: '20%',
    marginTop: 9,
  },
  buttonWrapper: {
    margin: '20px 0 0 0',
  },
  stripeImageWrapper: {
    backgroundColor: Colors.mainOrange,
    overflow: 'hidden',
    position: 'relative',
    width: 138,
    height: 32,
    margin: '10px 10px',
    float: 'left',
    borderRadius: 5,
  },
  stripeImage: {
    width: 138,
    height: 32,
    position: 'relative',
    bottom: 0,
  },
  button: {
    height: 46,
    backgroundColor: Colors.mainOrange,
    fontSize: 14,
  },
  securedTextWrapper: {
    marginTop: 15,
    float: 'left',
  },
  securedTextIcon: {
    fontSize: 16,
  },
  securedText: {
    fontSize: 14,
  },
  relativeBlock: {
    position: 'relative',
  },
};

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  return { userInfo, isLoggedIn };
};

export const PricingPage = connect(
  mapStateToProps,
  null
)(_PricingPage);
