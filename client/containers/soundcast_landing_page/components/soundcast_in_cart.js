import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';
import moment from 'moment';
import Colors from '../../../styles/colors';

export default class SoundcastInCart extends Component {
  constructor(props) {
    super(props);

    const promoCode =
      (this.props.history &&
        this.props.history.location &&
        this.props.history.location.state &&
        this.props.history.location.state.coupon) ||
      null;
    this.state = {
      enterPromoCode: !!promoCode,
      promoCode,
      price: props.soundcast.prices[props.checked].price,
    };
    this.applyPromoCode = this.applyPromoCode.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  componentDidMount() {
    this.state.promoCode && this.applyPromoCode();
  }

  applyPromoCode() {
    this.setState({
      promoCodeInfo: '',
      promoCodeError: '',
      promoApplied: false,
    });
    const { soundcast, checked, setTotalPrice } = this.props;
    const { promoCode, price } = this.state;
    const validPromoCodes = soundcast.prices[checked].coupons.map(coupon => coupon.code);
    if (validPromoCodes.indexOf(promoCode) > -1) {
      const index = validPromoCodes.indexOf(promoCode);
      const coupon = soundcast.prices[checked].coupons[index];
      if (moment().format('X') < coupon.expiration) {
        const isTrial =
          coupon.couponType === 'trial_period' ? coupon.trialLength.toString() : false;
        const total = isTrial
          ? 0
          : Math.round((price * (100 - coupon.percentOff)) / 100).toFixed(2);
        this.setState({
          price: total,
          promoApplied: true,
          promoCodeInfo: isTrial
            ? `* ${coupon.trialLength} day trial period`
            : `* ${coupon.percentOff} percent discount`,
        });
        setTotalPrice(total, promoCode, isTrial);
      } else {
        this.setState({ promoCodeError: 'This promo code has expired.' });
      }
    } else {
      this.setState({ promoCodeError: "Hmm...this promo code doesn't exist" });
    }
  }

  render() {
    const { soundcast, checked, successPayment } = this.props;
    const that = this;
    const { price, promoCode, promoApplied } = this.state;
    let fee = price == 'free' ? 0 : Math.floor(price * 0.03 * 100) / 100;
    fee = 0.0;

    if (soundcast && successPayment) {
      return (
        // show only cover image and title
        <div className="row" style={styles.course}>
          <div className="col-md-12 col-sm-12 col-xs-12">
            <img src={soundcast.imageURL} alt="" style={styles.courseImage} />
            <div style={styles.courseText}>
              <p style={{ ...styles.courseName, marginTop: 14 }}>{soundcast.title}</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="row" style={styles.course}>
          <div className="col-md-12 col-sm-12 col-xs-12">
            <img src={soundcast.imageURL} alt="" style={styles.courseImage} />
            <div style={styles.courseText}>
              <p style={styles.courseName}>{soundcast.title}</p>
              <div style={styles.underName}>
                <div>
                  <span>{soundcast.prices[checked || 0].paymentPlan}</span>
                </div>
                <div style={styles.feeRow}>
                  <div className="" style={styles.priceWrapper}>
                    <span className="margin-five-bottom" style={styles.price}>
                      {price == 'free' ? Number(0).toFixed(0) : `$${Number(price).toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <div style={styles.feeRow}>
                  <div className="" style={styles.feeWrapper}>
                    <div style={styles.feePriceText}>
                      <span className="margin-five-bottom" style={styles.price}>
                        {`$${fee.toFixed(2)}`}
                      </span>
                    </div>
                    <div style={styles.feeText}>Processing fee:</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-12 col-sm-12 col-xs-12">
            {(!this.state.enterPromoCode && (
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  that.setState({ enterPromoCode: true });
                  setTimeout(() => that.refs.promoCodeInput.focus(), 250);
                }}
              >
                Have a promo code?
              </span>
            )) || (
              <div>
                <input
                  onChange={e => that.setState({ promoCode: e.target.value })}
                  className="border-radius-4"
                  size="20"
                  type="text"
                  name="promo"
                  ref="promoCodeInput"
                  placeholder="Enter promo code"
                  value={this.state.promoCode || ''}
                  style={{ width: '50%', fontSize: 14, height: 35 }}
                />
                {(promoApplied && (
                  <button
                    onClick={this.applyPromoCode}
                    type="button"
                    className="btn"
                    style={{ color: Colors.mainOrange, margin: '0 8px 5px' }}
                  >
                    Applied!
                  </button>
                )) || (
                  <button
                    onClick={this.applyPromoCode}
                    type="button"
                    className="btn"
                    style={{ margin: '0 8px 5px' }}
                  >
                    Apply
                  </button>
                )}
                <div style={{ fontStyle: 'italic' }}>{this.state.promoCodeInfo}</div>
                <div style={{ color: 'red' }}>{this.state.promoCodeError}</div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}

// CourseInCart.propTypes = {
//     course: PropTypes.object,
//     setDiscountedPrise: PropTypes.func,
//     deleteCourseFromCart: PropTypes.func,
// };

const styles = {
  course: {
    marginBottom: 10,
  },
  courseImage: {
    width: 46,
    height: 46,
    float: 'left',
    marginRight: '15px',
  },
  courseText: {
    width: 'calc(100% - 61px)',
    float: 'left',
  },
  courseName: {
    fontSize: 17,
    lineHeight: '17px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    height: 19,
    marginBottom: 3,
    width: '100%',
    color: Colors.fontBlack,
  },
  underName: {
    height: 24,
  },
  couponWrapper: {
    position: 'relative',
    overflow: 'hidden',
    width: '67%',
    float: 'left',
  },
  couponInput: {
    width: 'calc(100% - 42px)',
    fontSize: 10,
    padding: '0 5px 0 5px',
    margin: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  applyCouponButton: {
    backgroundColor: '#61e1fb',
    width: 42,
    height: 24,
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 10,
    align: 'center',
    paddingLeft: 5,
    color: Colors.fontBlack,
  },
  priceWrapper: {
    height: 24,
    width: '33%',
    float: 'right',
  },
  price: {
    lineHeight: '24px',
    height: '24px',
    display: 'block',
    float: 'right',
    marginRight: '10px',
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.fontBlack,
  },
  feeRow: {
    height: 22,
  },
  feeWrapper: {
    float: 'right',
    marginRight: 0,
    fontWeight: 'bold',
    fontSize: 14,
    width: '100%',
    color: Colors.fontBlack,
  },
  feeText: {
    // width: 40,
    marginRight: 60,
    float: 'right',
  },
  feePriceText: {
    width: 53,
    float: 'right',
    textAlign: 'right',
  },
  trash: {
    float: 'right',
    color: Colors.fontBlack,
  },
};
