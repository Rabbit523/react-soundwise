import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as firebase from 'firebase';
import { bindActionCreators } from 'redux';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Colors from '../styles/colors';
import { signoutUser } from '../actions/index';

const styles = {
  navItem: {
    // display: 'inline',
  },
  navlink: {
    // fontSize: 16,
    // paddingTop: 17,
    // float: 'right',
    // marginTop: 6,
  },
};

class _SoundwiseHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonValue: 0,
    };
    this.signoutUser = this.signoutUser.bind(this);
    this.handleButtonChange = this.handleButtonChange.bind(this);
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
    // console.log('this.props.userInfo: ', this.props.userInfo)
    return (
      <div style={{ paddingBottom: 80 }}>
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

const SoundwiseHeader2_worouter = connect(
  mapStateToProps,
  mapDispatchToProps
)(_SoundwiseHeader);

export const SoundwiseHeader2 = withRouter(SoundwiseHeader2_worouter);
