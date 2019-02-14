import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import moment from 'moment';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';

export default class Coupons extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const i = this.props.priceIndex;
    const { price, prices, setState, soundcastId } = this.props;

    const isSubscription = !['one time', 'rental'].includes(price.billingCycle);
    return (
      <div>
        {price.coupons.map((coupon, j) => (
          <div
            key={`price${i}coupon${j}`}
            style={{
              marginLeft: 23,
              width: '100%',
              marginTop: 10,
              marginBottom: 15,
              display: 'flex',
              flexFlow: 'row wrap',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                marginRight: 10,
                width: 200,
                minWidth: 200,
              }}
            >
              <span>Coupon Code (no space)</span>
              <div>
                <input
                  type="text"
                  style={{ ...styles.inputTitle }}
                  name="couponCode"
                  onChange={e => {
                    prices[i].coupons[j].code = e.target.value;
                    setState({ prices });
                  }}
                  value={price.coupons[j].code}
                />
              </div>
            </div>
            <div
              style={{
                marginRight: 10,
                width: 160,
                minWidth: 160,
              }}
            >
              <span>Coupon Type</span>
              <div>
                <select
                  type="text"
                  style={{ ...styles.inputTitle, paddingTop: 6 }}
                  name="couponType"
                  onChange={e => {
                    prices[i].coupons[j].couponType = e.target.value;
                    setState({ prices });
                  }}
                  value={price.coupons[j].couponType}
                >
                  <option value="discount">Discount</option>
                  {isSubscription && <option value="trial_period">Trial Period</option>}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 30 }}>
              <span
                style={{
                  marginLeft: 5,
                  cursor: 'pointer',
                  fontSize: 20,
                }}
                onClick={() => {
                  prices[i].coupons.splice(j, 1);
                  setState({ prices });
                }}
              >
                <i className="fa fa-times " aria-hidden="true" />
              </span>
            </div>
            <div style={{ width: '100%', height: 10 /* break line */ }} />
            {(!coupon.couponType || coupon.couponType === 'discount') && (
              <div
                style={{
                  marginRight: 13,
                  marginLeft: 13,
                  width: 110,
                  minWidth: 110,
                }}
              >
                <span>Discount Percent</span>
                <div>
                  <input
                    type="text"
                    style={{ ...styles.inputTitle, width: '50%' }}
                    name="discountPercent"
                    onChange={e => {
                      prices[i].coupons[j].percentOff = e.target.value;
                      setState({ prices });
                    }}
                    value={price.coupons[j].percentOff}
                  />
                  <span style={{ fontSize: 18 }}>{` % off`}</span>
                </div>
              </div>
            )}
            {(!coupon.couponType || coupon.couponType === 'discount') && (
              <div
                style={{
                  marginRight: 13,
                  height: 67,
                  width: 125,
                  minWidth: 125,
                }}
              >
                <span>Price After Discount</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: 14,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{`$${Math.round(
                    (price.price * (100 - price.coupons[j].percentOff)) / 100
                  ).toFixed(2)}`}</span>
                </div>
              </div>
            )}
            {coupon.couponType === 'trial_period' && (
              <div
                style={{
                  marginRight: 13,
                  marginLeft: 13,
                  width: 115,
                  minWidth: 115,
                }}
              >
                <span>Trial length</span>
                <div>
                  <input
                    type="text"
                    style={{ ...styles.inputTitle, width: '56%' }}
                    name="trialLength"
                    onChange={e => {
                      prices[i].coupons[j].trialLength = e.target.value;
                      setState({ prices });
                    }}
                    value={price.coupons[j].trialLength || 0}
                  />
                  <span style={{ fontSize: 18 }}>{` Days`}</span>
                </div>
              </div>
            )}
            <div
              style={{
                marginRight: 10,
                height: 67,
                width: 195,
                minWidth: 195,
              }}
            >
              <span>Expires on</span>
              <div className="dateTimeInput" style={{ minWidth: 145, marginTop: 5 }}>
                <Datetime
                  value={moment.unix(coupon.expiration)}
                  onChange={date => {
                    if (date.unix) {
                      prices[i].coupons[j].expiration = date.unix();
                      setState({ prices });
                    }
                  }}
                />
              </div>
            </div>
            {soundcastId && (
              <div style={{ marginRight: 10 }}>
                <a
                  style={{
                    color: Colors.link,
                    fontWeight: 700,
                    fontSize: 14,
                    marginTop: 23,
                    display: 'inline-block',
                  }}
                  target="_blank"
                  href={`https://mysoundwise.com/soundcasts/${soundcastId}/?c=${
                    prices[i].coupons[j].code
                  }`}
                >
                  Promo Landing Page
                </a>
              </div>
            )}
          </div>
        )) // coupons.map
        }
      </div>
    );
  }
}

Coupons.propTypes = {
  price: PropTypes.object,
  prices: PropTypes.array,
  priceIndex: PropTypes.number,
  setState: PropTypes.func,
};

const styles = {
  inputTitle: { ...commonStyles.inputTitle, marginTop: 5 },
};
