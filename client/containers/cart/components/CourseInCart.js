// ** not in use
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';
import Colors from '../../../styles/colors';

export default class CourseInCart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      coupon: '',
      couponError: '',
    };
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleCoupon() {
    const that = this;

    firebase
      .database()
      .ref('/coupons')
      .once('value')
      .then(snapshot => {
        const { course, setDiscountedPrise, addCourseToUser, userInfo } = this.props;
        const coupons = snapshot.val();
        const today = Date.now();
        const expiration =
          (coupons[that.state.coupon] && Date.parse(coupons[that.state.coupon].expiration)) ||
          today;

        if (coupons[that.state.coupon] && today <= expiration) {
          const coupon = coupons[that.state.coupon];

          if (course.id === coupon.course_id) {
            // count coupon only when it is applied
            let updates = {};
            updates['/coupons/' + that.state.coupon + '/count'] = coupon.count + 1;
            firebase
              .database()
              .ref()
              .update(updates);

            // send new discountedPrice to cart
            let discountedPrice = course.price * (1 - coupon.discount / 100);
            setDiscountedPrise(course.id, Math.floor(discountedPrice * 100) / 100);
            if (discountedPrice == 0) {
              addCourseToUser();
            }
          } else {
            // TODO: show message that coupon is belong to another course
          }
        } else if (
          coupons[that.state.coupon] &&
          today > Date.parse(coupons[that.state.coupon].expiration)
        ) {
          that.setState({
            couponError: 'This coupon has expired',
          });
        } else {
          that.setState({
            couponError: 'This coupon does not exist',
          });
        }
      });
  }

  render() {
    const { course } = this.props;

    return (
      <div className="row" style={styles.course}>
        <div className="col-md-12 col-sm-12 col-xs-12">
          <img src={course.img_url_mobile} alt="" style={styles.courseImage} />
          <div style={styles.courseText}>
            <p style={styles.courseName}>{course.name}</p>
            <div style={styles.underName}>
              <div style={styles.couponWrapper} className="border-radius-4">
                <input
                  size="20"
                  type="text"
                  name="coupon"
                  placeholder="Coupon Code"
                  style={styles.couponInput}
                  onChange={this.handleChange.bind(this)}
                />
                <div style={styles.applyCouponButton} onClick={this.handleCoupon.bind(this)}>
                  Apply
                </div>
                <div style={{ color: 'red' }}>{this.state.couponError}</div>
              </div>
              <div className="feature-box-details-second pull-right" style={styles.priceWrapper}>
                <a onClick={() => this.props.deleteCourseFromCart(course)} style={styles.trash}>
                  <i className="fa fa-trash fa-2x" aria-hidden="true" />
                </a>
                <span className="margin-five-bottom" style={styles.price}>
                  {`$${course.discountedPrice}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CourseInCart.propTypes = {
  course: PropTypes.object,
  setDiscountedPrise: PropTypes.func,
  deleteCourseFromCart: PropTypes.func,
};

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
  trash: {
    float: 'right',
    color: Colors.fontBlack,
  },
};
