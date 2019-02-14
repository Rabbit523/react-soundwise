// ** not in use
// ** Old checkout page
// TODO - compare with soundwise_checkout, soundcast_checkout / remove

import React, { Component } from 'react';
import Axios from 'axios';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import Dots from 'react-activity/lib/Dots';
import { withRouter } from 'react-router';
import * as firebase from 'firebase';
import moment from 'moment';

import { SoundwiseHeader } from '../components/soundwise_header';
import { deleteCart } from '../actions/index';
import Colors from '../styles/colors';
import commonStyles from '../styles/commonStyles';

let stripe, elements;

class _Checkout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      paymentError: '',
      submitDisabled: false,
      number: '',
      cvc: '',
      exp_month: '0',
      exp_year: new Date().getFullYear(),
      totalPay: 0,
      paid: false,
      startPaymentSubmission: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.stripeTokenHandler = this.stripeTokenHandler.bind(this);
    this.renderProgressBar = this.renderProgressBar.bind(this);
    this.addCourseToUser = this.addCourseToUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV == 'staging') {
      console.log('Stripe: setting test key');
      stripe = Stripe.setPublishableKey('pk_test_BwjUV9yHQNcgRzx59dSA3Mjt');
    } else {
      stripe = Stripe.setPublishableKey('pk_live_rR36Qeypo5CrbG1FKgE1XdlL');
    }
    this.setState({ totalPay: this.props.total });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.total === 0) {
      //if it's free course, then no need for credit card info. Push course to user and then redirect
      this.addCourseToUser(this.props.userInfo.stripe_id);
    }
    this.setState({ totalPay: nextProps.total });
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  async onSubmit(event) {
    event.preventDefault();
    if (this.state.startPaymentSubmission) {
      return;
    }
    const lastSubmitDate = Number(localStorage.getItem('checkoutPaid') || 0);
    if (Date.now() - lastSubmitDate < 10000) {
      // 10 seconds since last success call not passed
      return;
    }
    this.setState({ startPaymentSubmission: true });
    const { number, cvc } = this.state;
    const exp_month = Number(this.state.exp_month) + 1;
    const exp_year = Number(this.state.exp_year);
    this.setState({ submitDisabled: true, paymentError: null });
    Stripe.card.createToken({ number, cvc, exp_month, exp_year }, this.stripeTokenHandler);
  }

  stripeTokenHandler(status, response) {
    const amount = this.state.totalPay;
    const email = this.props.userInfo.email;
    const that = this;

    if (response.error) {
      this.setState({
        paymentError: response.error.message,
        submitDisabled: false,
        startPaymentSubmission: false,
      });
    } else {
      Axios.post('/api/charge', {
        amount,
        source: response.id,
        currency: 'usd',
        receipt_email: email,
        description: that.props.shoppingCart[0].name,
        statement_descriptor: 'Soundwise Audio Course',
      })
        .then(function(response) {
          const paid = response.data.paid; //boolean
          const customer = response.data.customer;
          if (paid) {
            // if payment made, push course to user data, and redirect to a thank you page
            localStorage.setItem('checkoutPaid', Date.now());
            that.setState({ paid, startPaymentSubmission: false });
            that.addCourseToUser(customer); //push course to user profile and redirect
          }
        })
        .catch(function(error) {
          console.log('error from stripe: ', error);
          that.setState({
            paymentError: 'Your payment is declined :( Please check your credit card information.',
            startPaymentSubmission: false,
          });
        });
    }
  }

  addCourseToUser(customer) {
    const that = this;
    const userId = firebase.auth().currentUser.uid;
    this.props.shoppingCart.map(cartCourse => {
      const course = cartCourse;

      let sectionProgress = {};
      course.sections.forEach(section => {
        sectionProgress[section.section_id] = {
          playProgress: 0,
          completed: false,
          timesRepeated: 0,
        };
      });

      course.sectionProgress = sectionProgress;

      const updates = {};
      updates['/users/' + userId + '/courses/' + course.id] = course;
      // store stripe customer ID info: (only works with real credit cards)
      if (customer !== undefined && customer.length > 0) {
        updates['/users/' + userId + '/stripe_id'] = customer;
      }
      updates['/courses/' + course.id + '/users/' + userId] = userId;
      firebase
        .database()
        .ref()
        .update(updates);

      Axios.post('/api/email_signup', {
        //handle mailchimp api call
        firstName: that.props.userInfo.firstName,
        lastName: that.props.userInfo.lastName,
        email: that.props.userInfo.email,
        courseID: course.id,
      })
        .then(() => {
          that.props.deleteCart();
          that.props.history.push('/confirmation');
        })
        .catch(err => {
          that.props.deleteCart();
          that.props.history.push('/confirmation');
        });
    });
  }

  renderProgressBar() {
    if (this.state.startPaymentSubmission) {
      return (
        <div style={commonStyles.dots}>
          <Dots style={{ display: 'flex' }} color="#727981" size={32} speed={1} />
        </div>
      );
    }
  }

  render() {
    const items_num = this.props.shoppingCart.length;
    // const subtotal = this.props.shoppingCart.reduce((cumm, course) => {
    //   return cumm + course.price
    // }, 0)
    const subtotal = Math.floor(this.state.totalPay) / 100;

    const monthOptions = [];
    const yearOptions = [];
    for (let i = 0; i < 12; i++) {
      monthOptions.push(
        <option value={i} key={i}>
          {moment()
            .month(i)
            .format('MMM (MM)')}
        </option>
      );
      yearOptions.push(
        <option value={i + +moment().format('YYYY')} key={i}>
          {i + +moment().format('YYYY')}
        </option>
      );
    }

    return (
      <div>
        <section className="bg-white builder-bg" id="subscribe-section6">
          <div className="container" style={{ paddingBottom: '70px' }}>
            <div className="row equalize ">
              <div className="col-md-6 center-col col-sm-12 ">
                <div style={styles.totalRow}>
                  <div style={styles.totalWrapper}>
                    <div style={styles.totalText}>Total:</div>
                    <div style={styles.subTotal}>{`$${subtotal}`}</div>
                  </div>
                </div>
                <form onSubmit={this.onSubmit}>
                  {/*card number*/}
                  <div style={styles.relativeBlock}>
                    <input
                      onChange={this.handleChange}
                      required
                      className="border-radius-4"
                      size="20"
                      type="text"
                      name="number"
                      placeholder="Card Number"
                      style={styles.input}
                    />
                    <img src="../images/card_types.png" style={styles.cardsImage} />
                  </div>

                  {/*Expiration*/}
                  <div className="">
                    {/*month*/}
                    <div style={styles.selectBlock} className="border-radius-4">
                      <label style={styles.selectLabel}>Exp Month</label>
                      <select
                        onChange={this.handleChange}
                        name="exp_month"
                        id="expiry-month"
                        style={styles.select}
                      >
                        {monthOptions.map(item => item)}
                      </select>
                    </div>

                    {/*year*/}
                    <div style={styles.selectBlock} className="border-radius-4">
                      <label style={styles.selectLabel}>Exp Year</label>
                      <select onChange={this.handleChange} name="exp_year" style={styles.select}>
                        {yearOptions.map(item => item)}
                      </select>
                    </div>

                    {/*cvv/cvc*/}
                    <input
                      onChange={this.handleChange}
                      required
                      className="border-radius-4"
                      size="4"
                      type="password"
                      name="cvc"
                      placeholder="CVC"
                      autoComplete="new-password"
                      style={Object.assign({}, styles.input, styles.cvc)}
                    />
                  </div>

                  {/*button*/}
                  <div style={styles.buttonWrapper}>
                    {this.state.paymentError && (
                      <span style={{ color: 'red' }}>{this.state.paymentError}</span>
                    )}
                    <button
                      className="contact-submit btn propClone btn-3d text-white width-100 builder-bg tz-text"
                      type="submit"
                      style={styles.button}
                    >
                      PAY NOW
                    </button>
                    <div style={styles.securedTextWrapper}>
                      <i className="ti-lock" style={styles.securedTextIcon} />
                      Transactions are secure and encrypted.
                    </div>
                    <div style={styles.stripeImageWrapper}>
                      <img src="../images/powered_by_stripe.png" style={styles.stripeImage} />
                    </div>
                    {this.renderProgressBar()}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
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
    marginRight: 30,
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.fontBlack,
  },
  totalText: {
    width: 40,
    marginRight: 50,
    float: 'left',
  },
  subTotal: {
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
    width: 238,
    height: 32,
    margin: '10px auto',
    float: 'left',
  },
  stripeImage: {
    width: 238,
    height: 52,
    position: 'relative',
    bottom: 10,
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
  const { shoppingCart } = state.checkoutProcess;
  return {
    userInfo,
    isLoggedIn,
    shoppingCart,
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteCart }, dispatch);
}

const Checkout_worouter = connect(
  mapStateToProps,
  mapDispatchToProps
)(_Checkout);
export const Checkout = withRouter(Checkout_worouter);
