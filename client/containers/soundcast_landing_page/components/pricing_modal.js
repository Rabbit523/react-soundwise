import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as firebase from 'firebase';
import { Card, CardHeader } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import Colors from '../../../styles/colors';

class _PricingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: 0,
      sumTotal: null,
    };
  }

  componentDidMount() {
    if (this.props.soundcast && this.props.soundcast.prices[0].price) {
      const { prices } = this.props.soundcast;
      const { checked } = this.state;
    }
  }

  componentWillReceiveProps(nextProps) {
    const open = this.props.open || nextProps.open;
    if (open && !this.checkedPriceSet) {
      this.checkedPriceSet = true;
      this.handleCheck(nextProps.checkedPrice); // load checked price
      if (this.props.soundcast.prices.length === 1) {
        this.handleCheckout(); // checkout if having only one price
      }
    }
  }

  handleCheck(checked) {
    const { prices } = this.props.soundcast;
    let sumTotal = '';
    if (prices[checked].price !== 'free') {
      sumTotal = `Total today: $${Number(prices[checked].price).toFixed(2)}`;
      if (this.props.coupon && prices[checked].coupons) {
        // check coupon
        prices[checked].coupons.some(coupon => {
          if (
            coupon.code === this.props.coupon &&
            coupon.expiration > Date.now() / 1000 // in future
          ) {
            const price =
              coupon.couponType === 'trial_period'
                ? 0
                : (Number(prices[checked].price) * (100 - Number(coupon.percentOff))) / 100;
            sumTotal = `Total today: $${Number(Math.round(price)).toFixed(2)}`;
            return true;
          }
        });
      }
    }
    this.setState({ checked, sumTotal });
  }

  handleCheckout() {
    const { history, soundcast, soundcastID, coupon } = this.props;
    const { checked, sumTotal } = this.state;
    const historyState = {
      soundcastID,
      soundcast,
      coupon,
      checked,
      sumTotal,
    };
    firebase.auth().onAuthStateChanged(user => {
      if (user || soundcast.forSale) {
        history.push('/soundcast_checkout', historyState);
      } else {
        history.push('/signup/soundcast_user', historyState);
      }
    });
  }

  handleModalClose() {
    this.setState({ checked: 0, sumTotal: null });
    this.checkedPriceSet = false;
    this.props.handleModal();
  }

  render() {
    const { open, soundcast, soundcastID } = this.props;
    const { checked, sumTotal } = this.state;
    const { prices } = soundcast;

    const actions = [
      <FlatButton
        label="Checkout"
        // primary={true}
        labelStyle={{ color: Colors.mainOrange }}
        onClick={this.handleCheckout.bind(this)}
      />,
      <FlatButton label="Cancel" primary={false} onClick={this.handleModalClose.bind(this)} />,
    ];

    return (
      <div>
        <Dialog
          title="Select Access Option"
          actions={actions}
          modal={true}
          open={!!open}
          autoScrollBodyContent={true}
          onRequestClose={this.handleModalClose.bind(this)}
        >
          {(prices &&
            prices.length > 0 &&
            prices[0].price &&
            prices.map((price, i) => {
              const isChecked = checked == i;
              let _price = price;
              let displayedPrice = Number(price.price),
                originalPrice;
              price.coupons &&
                price.coupons.some(coupon => {
                  if (
                    coupon.code === this.props.coupon &&
                    coupon.expiration > Date.now() / 1000 // in future
                  ) {
                    originalPrice = displayedPrice.toFixed(2);
                    displayedPrice =
                      (Number(price.price) * (100 - Number(coupon.percentOff))) / 100;
                    return true;
                  }
                });

              let currentPrice = `${displayedPrice.toFixed(2)} / month`;
              let billing = 'billed monthly';
              let paymentPlan = price.paymentPlan || 'Free Access';
              if (price.billingCycle == 'annual') {
                currentPrice = `${(Math.floor((displayedPrice / 12) * 100) / 100).toFixed(
                  2
                )} / month`;
                originalPrice = (Math.ceil((originalPrice / 12) * 100) / 100).toFixed(2);
                billing = 'billed annually';
                paymentPlan = price.paymentPlan || 'Annual Subscription';
              } else if (price.billingCycle == 'quarterly') {
                currentPrice = `${(Math.floor((displayedPrice / 3) * 100) / 100).toFixed(
                  2
                )} / month`;
                originalPrice = (Math.ceil((originalPrice / 3) * 100) / 100).toFixed(2);
                billing = 'billed quarterly';
                paymentPlan = price.paymentPlan || 'Annual Subscription';
              } else if (price.billingCycle == 'one time') {
                currentPrice = `${Number(displayedPrice).toFixed(2)}`;
                billing = 'one time charge';
                paymentPlan = price.paymentPlan || 'Permanent Access';
              } else if (price.billingCycle == 'rental') {
                currentPrice = `${Number(displayedPrice).toFixed(2)}`;
                billing = `one time charge (${price.rentalPeriod}-day access)`;
                paymentPlan = price.paymentPlan || `${price.rentalPeriod}-Day Access`;
              }

              if (price.price == 'free') {
                billing = '';
              }

              return (
                <Card key={i} style={styles.card}>
                  <a onClick={this.handleCheck.bind(this, i)}>
                    <div style={{ marginTop: 15, marginBottom: 15 }}>
                      <div className="title-small" style={styles.titleDiv}>
                        {paymentPlan}
                      </div>
                      <div>
                        <div style={styles.priceDiv}>
                          {(price.price == 'free' && <div style={styles.price}>Free</div>) || (
                            <div style={styles.price}>
                              USD{' '}
                              {(originalPrice && !isNaN(originalPrice) && (
                                <s style={{ color: 'red' }}>${originalPrice}</s>
                              )) ||
                                null}
                              {`$${currentPrice}`}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'inline-block',
                            width: '30%',
                            fontSize: 16,
                          }}
                        >
                          <span>{billing}</span>
                        </div>
                        <div style={{ display: 'inline-block', width: '10%' }}>
                          <input
                            style={{ cursor: 'pointer' }}
                            type="checkbox"
                            checked={isChecked}
                            onChange={this.handleCheck.bind(this, i)}
                          />
                        </div>
                      </div>
                    </div>
                  </a>
                </Card>
              );
            })) ||
            null}
          <div style={styles.sumTotal}>
            <span style={{ fontSize: 18 }}>{sumTotal}</span>
          </div>
        </Dialog>
      </div>
    );
  }
}

const styles = {
  card: {
    marginTop: 15,
    marginBottom: 15,
    borderColor: '#f8f8f8',
    borderWidth: 1,
  },
  titleDiv: {
    marginBottom: 10,
    paddingTop: 15,
    marginTop: 10,
    marginLeft: 15,
  },
  priceDiv: {
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 15,
    display: 'inline-block',
    width: '50%',
  },
  price: {
    fontSize: 16,
  },
  sumTotal: {
    marginBottom: 15,
    marginTop: 25,
    marginLeft: 15,
    fontSize: 16,
  },
};

export const PricingModal = withRouter(_PricingModal);
