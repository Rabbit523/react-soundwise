import React from 'react';
import { Link } from 'react-router-dom'

const Callto_action = () => (
  <section className=" bg-dark-blue footer-top builder-bg xs-padding-60px-tb border-none" style={{paddingTop: 50, paddingBottom: 70}}>
    <div className="container">
      <div className="row">
        { /* section title */ }
        <div className="col-md-12 col-sm-12 col-xs-12 margin-two-bottom text-center xs-margin-fifteen-bottom">
          <h2 className="text-white alt-font center-col title-extra-large sm-title-medium text-center tz-text font-weight-300">Get started today</h2>
          <div className="width-50 sm-width-90 text-blue-gray text-extra-large center-col margin-three-top tz-text">
            <p>Let Soundwise help you get a real audience and make money from your knowledge.</p>
            <p>Start for free. Cancel anytime.</p>
          </div>
        </div>
        <div className="col-md-12 col-sm-12 col-xs-12 text-center" style={{marginBottom: 20}}>
          <Link to="/signup/admin" className="btn-large btn text-dark-blue btn-3d"  style={{backgroundColor: '#61E1FB'}}><span className="tz-text">START FOR FREE</span></Link>
        </div>
        <div className="col-md-12 col-sm-12 col-xs-12 text-center">
            <div className="offer-box-right">
                <div className="width-100 text-center">
                    <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8" target="_blank" className="xs-width-150px display-inline-block margin-two"><img alt="" style={{width: 175}} src="../images/app-store-badge.png" data-img-size="(W)175px X (H)51px" /></a>
                    <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android" target="_blank" className="xs-width-150px display-inline-block margin-two"><img src="../images/google-play-badge.png" data-img-size="(W)200px X (H)61px" style={{width: 175,}} alt="" /></a>
                </div>
            </div>
        </div>
      </div>
    </div>
  </section>
);

export default Callto_action;