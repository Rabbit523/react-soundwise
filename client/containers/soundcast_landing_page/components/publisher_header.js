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
import Colors from '../../../styles/colors';
import { signoutUser } from '../../../actions/index';

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
  profileImage: {
    width: 45,
    height: 45,
    float: 'left',
    borderRadius: '50%',
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
};

class _PublisherHeader extends Component {
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
            <li className="propClone sm-no-border">
              <div className="dropdown">
                <div
                  className="btn dropdown-toggle"
                  data-toggle="dropdown"
                  style={{ height: 37, justifyContent: 'center' }}
                >
                  <div style={{}}>
                    {`Hello, ${this.capFirstLetter(this.props.userInfo.firstName)} `}
                    <span className="caret" />
                  </div>
                </div>
                <ul className="dropdown-menu">
                  {this.props.userInfo.soundcasts && (
                    <li>
                      <Link to="/mysoundcasts">My Soundcasts</Link>
                    </li>
                  )}
                  {this.props.userInfo.admin && (
                    <li>
                      <Link to="/dashboard/soundcasts">Admin Dashboard</Link>
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
          <li className="propClone " style={styles.navItem}>
            <Link className="inner-link" to="/signin">
              LOG IN
            </Link>
          </li>
        </ul>
      );
    }
  }

  render() {
    // console.log('this.props.userInfo: ', this.props.userInfo)
    const { publisherID, publisherName, publisherImg } = this.props;
    return (
      <header className="leadgen-agency-1" id="header-section1">
        <nav className="navbar bg-white tz-header-bg no-margin alt-font shrink-header light-header">
          <div className="container navigation-menu">
            <div className="row">
              <div className="col-md-6 col-sm-6 col-xs-9">
                <Link to={`/publishers/${publisherID}`}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        ...styles.profileImage,
                        backgroundImage: `url(${publisherImg ? publisherImg : ''})`,
                      }}
                    />
                    <div
                      className="title-small sm-title-small xs-title-small "
                      style={{ paddingLeft: '0.5em' }}
                    >
                      {publisherName}
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-md-6 col-sm-6 col-xs-3 position-inherit">
                {/*menu button for md, sm, xs*/}
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
                {/*inline menu for lg*/}
                <div
                  id="bs-example-navbar-collapse-1"
                  className="collapse navbar-collapse pull-right font-weight-500"
                >
                  {this.renderLogin()}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
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

const PublisherHeader_worouter = connect(
  mapStateToProps,
  mapDispatchToProps
)(_PublisherHeader);

export const PublisherHeader = withRouter(PublisherHeader_worouter);
