import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Link } from 'react-router-dom';

import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import { inviteListeners } from '../../../helpers/invite_listeners';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      payouts: [
        {
          createdAt: '',
          amount: 0,
        },
      ],
      affiliate: false,
      couponText: '',
    };
    this.handlePlanCancel = this.handlePlanCancel.bind(this);
    this.handleAffiliate = this.handleAffiliate.bind(this);
    this.createCoupon = this.createCoupon.bind(this);
    this.checkAffiliateId = this.checkAffiliateId.bind(this);
  }

  componentDidMount() {
    this.checkAffiliateId();
  }

  componentWillReceiveProps(nextProps) {
    this.checkAffiliateId();
  }

  checkAffiliateId() {
    const { userInfo } = this.props;
    if (!this.state.couponText && userInfo.publisher && userInfo.publisher.stripe_user_id) {
      firebase
        .database()
        .ref(`coupons`)
        .orderByChild(`affiliate`)
        .equalTo(userInfo.publisher.stripe_user_id)
        .once('value')
        .then(snapshot => {
          const value = snapshot.val();
          if (value) {
            // have coupon
            this.setState({
              couponText: Object.keys(value)[0],
            });
          }
        });
    }
  }

  handlePlanCancel() {
    const { userInfo } = this.props;
    if (userInfo.publisher) {
      const {
        plan,
        frequency,
        current_period_end,
        auto_renewal,
        stripe_customer_id,
        subscriptionID,
      } = userInfo.publisher;
      const cancelling = confirm(
        `Are you sure you want to cancel your ${plan.toUpperCase()} subscription?`
      );
      if (cancelling) {
        Axios.post('/api/cancel_plan', { subscriptionID })
          .then(response => {
            firebase
              .database()
              .ref(`publishers/${userInfo.publisherID}/auto_renewal`)
              .set(false);
            alert(
              `Your ${plan.toUpperCase()} plan auto renewal has been canceled. You still have access to ${plan.toUpperCase()} features till ${moment(
                current_period_end * 1000
              ).format('YYYY-MM-DD')}.`
            );
          })
          .catch(err => {
            alert(
              'Oops! There is an error canceling your subscription. Please contact Soundwise support at support@mysoundwise.com.'
            );
          });
      }
    }
  }

  async createCoupon(userName, stripe_user_id, count) {
    const couponText = (userName + (count || '')).toLowerCase();
    const coupon = await firebase
      .database()
      .ref(`coupons/${couponText}`)
      .once('value');
    if (coupon.val()) {
      // coupon exist
      count++;
      this.createCoupon(userName, stripe_user_id, count); // recursion
    } else {
      await firebase
        .database()
        .ref(`coupons/${couponText}`)
        .set({
          count: 0,
          description: '30 Day Free',
          expiration: 4670449076,
          frequency: 'all',
          percentOff: 0,
          trialPeriod: 30,
          affiliate: stripe_user_id,
        });
      this.setState({ couponText });
    }
  }

  async handleAffiliate() {
    const { userInfo } = this.props;
    if (!userInfo || !userInfo.publisher) {
      return alert('Empty user/publisher value');
    }
    const { stripe_user_id } = userInfo.publisher;
    if (!stripe_user_id) {
      // If the publisher does not have a connected stripe payout account yet (stripe_user_id under the publisher node in firebase == null), the screen should alert user
      alert('Please connect your payout account first.');
      // TODO redirect/show card input form (example client/containers/checkout.js)
    } else {
      // if the publisher has a stripe_user_id already, an affiliate id should be generated (use this format: affiliate id = [publisher id]-[stripe_user_id] of the referrer)
      this.createCoupon(userInfo.publisher.name.replace(/[^A-Za-z]/g, ''), stripe_user_id, 0);
      await firebase
        .database()
        .ref(`publishers/${userInfo.publisherID}/affiliate`)
        .set(true);
      this.setState({ affiliate: true });
    }
  }

  affiliateClick(e) {
    e.target.setSelectionRange(0, e.target.value.length);
  }

  render() {
    const { userInfo } = this.props;
    const that = this;
    if (userInfo.publisher) {
      const {
        plan,
        frequency,
        current_period_end,
        auto_renewal,
        stripe_customer_id,
      } = userInfo.publisher;
      const affiliate = userInfo.publisher.affiliate || this.state.affiliate;
      return (
        <div className="container" style={{ minHeight: 700 }}>
          <div className="row">
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <div style={{ marginTop: 20 }}>
                <div style={{ ...styles.titleText, marginBottom: 25 }}>Subscription Plan</div>
                <div>
                  <span
                    style={{
                      ...styles.titleText,
                      color: Colors.mainOrange,
                      marginTop: 20,
                    }}
                  >{`Soundwise ${plan ? plan.toUpperCase() : 'BASIC'} ${
                    frequency ? `- ${frequency.toUpperCase()}` : ''
                  }`}</span>
                </div>
                {(current_period_end && auto_renewal && (
                  <div>
                    <span>{`(Plan will automatically renew on ${moment(
                      current_period_end * 1000
                    ).format('YYYY-MM-DD')})`}</span>
                  </div>
                )) ||
                  (current_period_end && !auto_renewal && (
                    <div>
                      <span>{`(Current subscription ends on ${moment(
                        current_period_end * 1000
                      ).format('YYYY-MM-DD')})`}</span>
                    </div>
                  )) ||
                  null}
                <div>
                  <OrangeSubmitButton
                    label="Change Plan"
                    onClick={() => that.props.history.push({ pathname: '/pricing' })}
                    styles={{
                      margin: '7px 0 50px',
                      backgroundColor: Colors.link,
                      borderWidth: '0px',
                    }}
                  />
                </div>
                {(current_period_end && auto_renewal && (
                  <div style={{ marginTop: 25 }}>
                    <span
                      onClick={this.handlePlanCancel}
                      style={{ cursor: 'pointer', fontSize: 16 }}
                    >
                      Cancel plan
                    </span>
                  </div>
                )) ||
                  null}
                <div style={{ ...styles.titleText, marginTop: 20 }}>Affiliate Program</div>
                <div>{`(50% lifetime commisions on your referrals)`}</div>
                {(affiliate && (
                  <div>
                    <div style={{ ...styles.titleTextSmall, marginTop: 17 }}>
                      <span>Your affiliate link: </span>
                      <a
                        target="_blank"
                        style={{ color: Colors.mainOrange }}
                        href={`https://mysoundwise.com/?a_id=${userInfo.publisherID}-${
                          userInfo.publisher.stripe_user_id
                        }`}
                      >{`https://mysoundwise.com/?a_id=${userInfo.publisherID}-${
                        userInfo.publisher.stripe_user_id
                      }`}</a>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <span style={styles.titleTextSmall}>Your affiliate promo code</span>
                      <span> (1 month free on any paid plans)</span>
                      <span style={styles.titleTextSmall}>: </span>
                      <a
                        href="#"
                        style={{
                          ...styles.titleTextSmall,
                          color: Colors.mainOrange,
                        }}
                      >
                        {this.state.couponText}
                      </a>
                    </div>
                  </div>
                )) || (
                  <div>
                    <OrangeSubmitButton
                      label="Become An Affiliate"
                      onClick={this.handleAffiliate}
                      styles={{
                        margin: '18px 0',
                        backgroundColor: Colors.link,
                        borderWidth: '0px',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}

const styles = {
  titleText: { ...commonStyles.titleText },
  titleTextSmall: {
    fontSize: 15,
    fontWeight: 600,
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 16,
    color: Colors.fontGrey,
    // height: 35,
    fontWeight: 'regular',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
  td: {
    color: Colors.softBlack,
    fontSize: 16,
    // height: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
};
