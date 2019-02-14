import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import * as firebase from "firebase"
import { bindActionCreators } from 'redux'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'

import {signoutUser} from '../actions/index'
import Slider from './slider'
import Headerscroll from './headerscroll'

const styles = {
  li: {
    float: 'right'
  },
  header: {
    paddingBottom: '50px'
  },
  navItem: {
    display: 'inline'
  },
  navlink: {
    fontSize: 16,
    paddingTop: 17,
    // float: 'right',
    // marginTop: 6,
  },
  aboutLink: {
    marginTop: 6,
    fontSize: 16,
    float: 'left',
  },
  navButton: {
    borderColor: 'white',
    borderWidth: 2,
    padding: '10px 10px',
    marginTop: 6,
  },
};

class _Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonValue: 0
    }

  }

  capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  signoutUser() {
    let that = this
    firebase.auth().signOut().then(function() {
        console.log('Signed Out')
        that.props.signoutUser()
      }, function(error) {
        console.error('Sign Out Error', error);
      })

  }

  handleButtonChange(e, value) {
    this.setState({
      buttonValue: value
    })
    if(this.state.buttonValue===1) {
      this.signoutUser()
    }
  }


  render() {
    const {title, tagline, logoImage, backgroundImage, gradient1, gradient2} = this.props.content
    return (
      <div className="header-style6">
          <header className="header-style10" id="header-section17">

              <nav className="navbar tz-header-bg alt-font no-margin shrink-transparent-header-dark dark-header">
                  <div className="container navigation-menu">
                      <div className="row">

                          <div className="col-md-2 col-sm-2 col-xs-3">
                              <Link to='/' className="inner-link"><img alt="" src={logoImage} data-img-size="(W)163px X (H)40px"/></Link>
                          </div>
                          <div className='col-md-3 col-sm-4 col-xs-7'>

                              <div className="nav-button propClone no-margin-tb  btn-medium margin-twelve-left xs-no-margin-right text-white font-weight-600" >
                                <Link className="text-white font-weight-600" style={styles.aboutLink} to='/experts'>Expert Trainers</Link>
                              </div>
                          </div>
                          <div className="col-md-7 col-sm-7 col-xs-2 position-inherit">
                              <button data-target="#bs-example-navbar-collapse-1" data-toggle="collapse" className="navbar-toggle collapsed" type="button">
                                  <span className="sr-only">Toggle navigation</span>
                                  <span className="icon-bar"></span>
                                  <span className="icon-bar"></span>
                                  <span className="icon-bar"></span>
                              </button>
                              <div id="bs-example-navbar-collapse-1" className="collapse navbar-collapse pull-right">
                                  <ul className="nav navbar-nav" style={{}}>
                                      <li className="propClone"><Link className="inner-link" to="/pricing" style={styles.navlink}>Pricing</Link></li>
                                      <li className="propClone"><Link className="inner-link" to="/wave_video" style={styles.navlink}>Soundwave Video Maker</Link></li>
                                      <li className="propClone"><Link className="inner-link" to="/signin" style={styles.navlink}>Log In</Link></li>
                                      <li className="propClone  float-left sm-no-margin-tb"><Link to='/signup_options' className=" btn xs-margin-lr-auto xs-float-none xs-display-block" style={styles.navButton}><span className='tz-text'>START FOR FREE</span></Link></li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                  </div>
              </nav>

          </header>
          <section className="no-padding cover-background tz-builder-bg-image border-none" data-img-size="(W)1920px X (H)994px" style={{background:`linear-gradient(-45deg, ${gradient1}, ${gradient2}), url(${backgroundImage})`}}>
              <div className="container one-fourth-screen xs-padding-nineteen-bottom position-relative">
                  <div className="slider-typography xs-position-static text-center">
                      <div className="slider-text-middle-main">

                          <div className="slider-text-middle text-left padding-left-right-px">
                              <div className="col-md-6 no-padding margin-twenty-top sm-margin-twenty-three-top header-banner" >
                                  <h1 className="title-extra-large-4 md-title-extra-large-3 line-height-65 sm-title-extra-large   text-transform-none margin-ten-bottom sm-margin-nine-bottom alt-font tz-text text-white" style={{fontWeight: 800}} >{title}</h1>
                                  <div className=" title-medium margin-fifteen-bottom sm-margin-nine-bottom width-80 sm-width-90 tz-text text-white font-weight-700"><div>{tagline}</div></div>
                                  <div className="float-left width-100" style={{paddingBottom: 45}}>
                                      <Link to="/signup_options" className="btn btn-large propClone text-black xs-margin-ten-bottom xs-width-100 float-left"  style={{backgroundColor: '#F76B1C'}}><span className="tz-text">START FOR FREE</span></Link>

                                  </div>
                                  <div className="float-left width-100 xs-text-center">
                                      <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8" target="_blank" className="sm-width-140px float-left xs-float-none xs-display-inline-block"><img src="../images/app-store-badge.png" style={{width: 175,}} data-img-size="(W)200px X (H)61px" alt="" /></a>
                                      <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android" target="_blank" className="sm-width-140px float-left xs-float-none margin-five-left xs-margin-two-left xs-display-inline-block"><img src="../images/google-play-badge.png" data-img-size="(W)200px X (H)61px" style={{width: 175,}} alt="" /></a>
                                  </div>
                              </div>
                          </div>

                      </div>
                  </div>
              </div>
          </section>
      </div>
    )
  }
}



function mapDispatchToProps(dispatch) {
  return bindActionCreators({ signoutUser }, dispatch)
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  return {
    userInfo, isLoggedIn
  }
}

export const Header = connect(mapStateToProps, mapDispatchToProps)(_Header)

                            // <div id="bs-example-navbar-collapse-1" className="collapse navbar-collapse pull-right">
                            //    {this.renderLogin()}
                            // </div>