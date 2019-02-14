import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Axios from 'axios';
import Dots from 'react-activity/lib/Dots';
import draftToHtml from 'draftjs-to-html';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import moment from 'moment';

import { sendEmail, signinUser } from '../../../actions/index';
import Colors from '../../../styles/colors';
import { inviteListeners } from '../../../helpers/invite_listeners';
import { addToEmailList } from '../../../helpers/addToEmailList';

class _Payment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      paymentError: '',
      submitDisabled: false,
      firstName: '',
      lastName: '',
      email: '',
      number: '',
      cvc: '',
      exp_month: 0,
      exp_year: new Date().getFullYear(),
      totalPay: 0,
      isFreeSoundcast: false,
      paid: false,
      startPaymentSubmission: false,
      stripe_id: '',
      userInfo: null,
      confirmationEmailSent: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.stripeTokenHandler = this.stripeTokenHandler.bind(this);
    this.addSoundcastToUser = this.addSoundcastToUser.bind(this);
    this.renderProgressBar = this.renderProgressBar.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateProps = this.updateProps.bind(this);
    this.addUserToMailChimp = this.addUserToMailChimp.bind(this);
    this.newUserOrSoundcast = true;
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV == 'staging') {
      console.log('Stripe: setting test key');
      Stripe.setPublishableKey('pk_test_BwjUV9yHQNcgRzx59dSA3Mjt');
    } else {
      Stripe.setPublishableKey('pk_live_rR36Qeypo5CrbG1FKgE1XdlL');
    }
    this.updateProps(this.props);
    this.props.setAddSoundcastToUser(this.addSoundcastToUser);
  }

  componentWillReceiveProps(nextProps) {
    this.updateProps(nextProps);
  }

  updateProps(props) {
    this.setState({ totalPay: props.totalPrice });
    if (!this.updatePropsLock && props.soundcast && props.userInfo && props.userInfo.email) {
      this.updatePropsLock = true; // execute only once
      const isFree = props.totalPrice === 0 || props.totalPrice == 'free';
      if (!isFree && props.soundcast.prices && props.soundcast.prices.some(i => i.coupons)) {
        console.log('1. isFreeSoundcast: false');
        this.setState({ isFreeSoundcast: false });
        return; // ignore if soundcast not free and have coupons
      }
      if (isFree && !props.isTrial) {
        console.log('2. isFreeSoundcast: true');
        this.setState({ isFreeSoundcast: true });
        // if it's free course, then no need for credit card info.
        // add soundcast to user and then redirect
        // - prevent audocheckout if trial coupon used
        this.addSoundcastToUser(null, props.userInfo, props.soundcastID || this.props.soundcastID);
      } else {
        console.log('3. isFreeSoundcast: false');
        this.setState({ isFreeSoundcast: false });
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    //Set newUserOrSoundcast if emails aren't same, will be used to update mailchimp.
    if (!_.isEqual(this.props.userInfo.email, nextProps.userInfo.email)) {
      this.newUserOrSoundcast = true;
    }

    //Same user but new soundcast, so we set it to true, so mailchimp is updated.
    if (this.props.soundcastID != nextProps.soundcastID) {
      this.newUserOrSoundcast = true;
    }

    //Comparing arrays below is incorrect and should be corrected.
    //This is probably leading to multiple updates, should use !_.isEqual
    if (
      this.props.isEmailSent != nextProps.isEmailSent ||
      this.props.totalPrice != nextProps.totalPrice ||
      this.props.userInfo.email !== nextProps.userInfo.email ||
      nextState.paymentError ||
      nextState.startPaymentSubmission
    ) {
      // this.setState({confirmationEmailSent : true})
      return true;
    } else {
      return false;
    }
  }

  componentWillUnmount() {
    // console.log('payment component will unmount');
  }

  addUserToMailChimp(userInfo) {
    if (this.newUserOrSoundcast) {
      const { soundcast } = this.props;
      if (typeof soundcast.mailChimp != 'undefined' && typeof userInfo.email != 'undefined') {
        //There shold be a publisherID, but lets still check for it.
        if (typeof soundcast.publisherID != 'undefined') {
          this.newUserOrSoundcast = false;
          Axios.post('/api/mail_manage_addsubscriber', {
            publisherId: soundcast.publisherID,
            mailChimpInfo: soundcast.mailChimp,
            listId: soundcast.mailChimpId,
            user: {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              email: userInfo.email[0],
            },
          })
            .then(res => {
              //Nothing to be done, as it is opaque to user.
            })
            .catch(error => {
              console.log('Received error', error);
            });
        }
      }
    }
  }

  handleChange(e) {
    if (e.target.value) {
      // cache values (bug #58)
      if (e.target.name === 'firstName') {
        localStorage.setItem('soundwiseSignupFName', e.target.value);
      }
      if (e.target.name === 'lastName') {
        localStorage.setItem('soundwiseSignupLName', e.target.value);
      }
      if (e.target.name === 'email') {
        localStorage.setItem('soundwiseSignupEmail', e.target.value);
      }
    }
    this.setState({ [e.target.name]: e.target.value });
  }

  addSoundcastToUser(charge, userInfoFromProp, soundcastID) {
    const userInfo = userInfoFromProp || this.props.userInfo;
    // console.log(`soundcastID: ${soundcastID} userInfo: ${userInfo} charge: ${charge}`);

    if (!userInfo || !userInfo.email) {
      return; // skip if not logged in
    }

    const that = this;
    const { soundcast, checked, sumTotal, history, coupon } = this.props;
    const { confirmationEmail } = soundcast;
    const { totalPay } = this.state;
    const _email = userInfo.email[0].replace(/\./g, '(dot)');

    const { billingCycle, paymentPlan, price, rentalPeriod } = soundcast.prices[checked];
    let current_period_end = rentalPeriod
      ? moment()
          .add(Number(rentalPeriod), 'days')
          .format('X')
      : 4638902400; // rental period or forever (2117/1/1 )

    const paymentID = (charge && charge.id) || null;
    const planID = (charge && charge.plan && charge.plan.id) || null;
    current_period_end =
      charge && charge.current_period_end ? charge.current_period_end : current_period_end; //if it's not a recurring billing ('one time' or 'rental'), set the end period to 2117/1/1 or rental expiration date.

    // send email invitations to subscribers
    const subject = `${userInfo.firstName}, here's how to access your soundcast`;
    let content;
    if (confirmationEmail) {
      const editorState = JSON.parse(confirmationEmail);
      const confirmEmailHTML = draftToHtml(editorState);
      content = confirmEmailHTML.replace('[subscriber first name]', userInfo.firstName);
      content = content.replace('[soundcast title]', soundcast.title);
    } else {
      content = `<p>Hi ${userInfo.firstName}!</p><p></p><p>Thanks for signing up for ${
        soundcast.title
      }. If you don't have the Soundwise mobile app installed on your phone, please access your soundcast by downloading the app first--</p><p><strong>iPhone user: </strong>Download the app <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8">here</a>.</p><p><strong>Android user: </strong>Download the app <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android">here</a>.</p><p></p><p>...and then sign in to the app with the same credential you used to sign up for this soundcast.</p><p></p><p>If you've already installed the app, your new soundcast should be loaded automatically.</p>`;
    }

    this.addUserToMailChimp(userInfo);

    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const userId = user.uid;
        const connectedCustomer = (charge && charge.connectedCustomer) || null;
        const platformCustomer = charge ? charge.platformCustomer || charge.stripe_id : null;
        const soundcastsIds = soundcast.bundle ? soundcast.soundcastsIncluded : [soundcastID];
        if (soundcast.bundle) {
          // add user to bundle
          await firebase
            .database()
            .ref(`soundcasts/${soundcastID}/subscribed/${userId}`)
            .set(moment().format('X'));
        }
        for (const soundcastID of soundcastsIds) {
          // add soundcast to user
          await firebase
            .database()
            .ref(`users/${userId}/soundcasts/${soundcastID}`)
            .set({
              subscribed: true,
              paymentID,
              customerID: connectedCustomer,
              current_period_end,
              billingCycle: billingCycle || null,
              planID,
              date_subscribed: moment().format('X'),
            });

          // add user to soundcast
          await firebase
            .database()
            .ref(`soundcasts/${soundcastID}/subscribed/${userId}`)
            .set(moment().format('X'));

          // remove from invited list
          await firebase
            .database()
            .ref(`soundcasts/${soundcastID}/invited/${_email}`)
            .remove();

          if (coupon) {
            await Axios.post('/api/coupon', {
              // TODO review
              coupon: coupon,
              soundcastId: soundcastID,
              soundcastTitle: soundcast.title,
              publisherId: soundcast.publisherID,
              userId: userId,
              timeStamp: moment().format('X'),
            }).catch(err => console.log('err: ', err));
          }

          // if it's a free soundcast, add subscriber to publisher
          if (totalPay == 0 || totalPay == 'free') {
            // TODO review block
            await firebase
              .database()
              .ref(`publishers/${soundcast.publisherID}/freeSubscribers/${userId}/${soundcastID}`)
              .set(true);
            const snapshot = await firebase
              .database()
              .ref(`publishers/${soundcast.publisherID}/freeSubscribers/${userId}`)
              .once('value');
            if (!snapshot.val()) {
              const snapshot = await firebase
                .database()
                .ref(`publishers/${soundcast.publisherID}/freeSubscriberCount`)
                .once('value');
              await firebase
                .database()
                .ref(`publishers/${soundcast.publisherID}/freeSubscriberCount`)
                .set(snapshot.val() ? snapshot.val() + 1 : 1); // increment or set 1
            }
          }
        }
        // add stripe_id to user data if not already exists
        if (platformCustomer && user.stripe_id !== platformCustomer) {
          await firebase
            .database()
            .ref(`users/${userId}/stripe_id`)
            .set(platformCustomer);
          that.props.signinUser({ stripe_id: platformCustomer }); // set userInfo.stripe_id
        }
      } else {
        console.log('Error payment addSoundcastToUser empty user variable');
      }

      if (!that.props.isEmailSent && !that.state.confirmationEmailSent) {
        that.setState({ confirmationEmailSent: true });
        that.props.sendEmail();
        firebase
          .database()
          .ref(`publishers/${soundcast.publisherID}`)
          .once('value', async snapshot => {
            if (!snapshot.val()) {
              return console.log('Error payment addSoundcastToUser empty publisher');
            }
            const publisherEmail = snapshot.val().email || snapshot.val().paypalEmail;
            await addToEmailList(
              soundcastID,
              [
                {
                  email: userInfo.email[0],
                  firstName: userInfo.firstName,
                  lastName: userInfo.lastName,
                },
              ],
              'subscriberEmailList',
              soundcast.subscriberEmailList
            );
            inviteListeners(
              [userInfo.email[0]],
              subject,
              content,
              snapshot.val().name,
              snapshot.val().imageUrl,
              publisherEmail
            ); // use transactional email for this

            // Redirect to /notice page
            that.setState({ success: true });
            const text = `Thanks for signing up to ${
              soundcast.title
            }. We'll send you an email with instructions to download the Soundwise app. If you already have the app on your phone, your new soundcast will be automatically loaded once you sign in to your account.`;
            history.push({
              pathname: '/notice',
              state: {
                text,
                soundcastTitle: soundcast.title,
                soundcast,
                soundcastID,
                checked,
                sumTotal,
                ios:
                  'https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8',
                android:
                  'https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android',
              },
            });
          });
      }
    });
  }

  async onSubmit(event) {
    event.preventDefault();
    if (this.props.hideCardInputs) {
      // skip card input
      return this.props.handleStripeId(null, this.state);
    }
    if (this.state.startPaymentSubmission) {
      return;
    }
    const lastSubmitDate = Number(localStorage.getItem('paymentPaidOneTimeRental') || 0);
    const lastSubmitDate2 = Number(localStorage.getItem('paymentPaidRecurring') || 0);
    if (Date.now() - lastSubmitDate < 10000 || Date.now() - lastSubmitDate2 < 10000) {
      // 10 seconds since last success call not passed - prevent double payment
      return;
    }

    this.setState({
      startPaymentSubmission: true,
      submitDisabled: true,
      paymentError: null,
    });
    const { number, cvc } = this.state;
    const exp_month = Number(this.state.exp_month) + 1;
    const exp_year = Number(this.state.exp_year);
    Stripe.card.createToken({ number, cvc, exp_month, exp_year }, this.stripeTokenHandler);
  }

  stripeTokenHandler(status, response) {
    const amount = Number(this.state.totalPay || this.props.totalPrice).toFixed(2) * 100; // in cents
    const userInfo = this.props.userInfo;
    const { email, stripe_id } = userInfo;
    const receipt_email = (email && email[0]) || this.state.email;
    const { soundcast, checked, soundcastID, handleStripeId, coupon, isTrial } = this.props;
    const that = this;
    let { billingCycle, paymentPlan, price } = soundcast.prices[checked];

    if (billingCycle === '') {
      billingCycle = 'one time'; // treat empty string as "one time"
      firebase
        .database()
        .ref(`soundcasts/${soundcastID}/prices/${checked}/billingCycle`)
        .set('one time');
    }

    if (response.error) {
      return this.setState({
        paymentError: response.error.message,
        submitDisabled: false,
        startPaymentSubmission: false,
      });
    }

    // handle response
    firebase
      .database()
      .ref(`publishers/${soundcast.publisherID}`)
      .once('value')
      .then(snapshot => {
        if (snapshot.val() && snapshot.val().stripe_user_id) {
          const stripe_user_id = snapshot.val().stripe_user_id; // publisher's id for stripe connected account
          const planID =
            `${soundcast.publisherID}-${soundcastID}` +
            `-${soundcast.title}-${billingCycle}-${price}`;
          if (billingCycle == 'one time' || billingCycle == 'rental') {
            //if purchase or rental, post to api/charge
            Axios.post('/api/transactions/handleOnetimeCharge', {
              amount,
              source: response.id,
              currency: 'usd',
              receipt_email,
              // customer: stripe_id,
              billingCycle,
              publisherID: soundcast.publisherID,
              stripe_user_id,
              soundcastID,
              planID,
              description: `${soundcast.title}: ${paymentPlan || billingCycle}`,
              statement_descriptor: `${soundcast.title}: ${paymentPlan}`,
            })
              .then(response => {
                const paid = response.data.res.paid; //boolean
                if (paid) {
                  // if payment made, push course to user data, and redirect to a thank you page
                  localStorage.setItem('paymentPaidOneTimeRental', Date.now());
                  that.setState({ paid, startPaymentSubmission: false });
                  if (userInfo && userInfo.email) {
                    // logged in
                    that.addSoundcastToUser(response.data.res, null, soundcastID);
                  } else {
                    handleStripeId(response.data.res, that.state);
                  }
                }
              })
              .catch(error => {
                console.log('error from stripe (handleOnetimeCharge): ', error);
                that.setState({
                  paymentError:
                    'Your payment is declined :( Please check your credit card information.',
                  startPaymentSubmission: false,
                });
              });
          } else {
            //if subscription, post to api/recurring_charge
            Axios.post('/api/recurring_charge', {
              source: response.id,
              receipt_email,
              platformCustomer: stripe_id,
              stripe_account: stripe_user_id,
              planID,
              publisherID: soundcast.publisherID,
              soundcastID,
              coupon,
              isTrial,
            })
              .then(response => {
                console.log('recurring_charge response: ', response);
                const subscription = response.data;
                if (subscription.plan) {
                  // if payment made, push course to user data, and redirect to a thank you page
                  localStorage.setItem('paymentPaidRecurring', Date.now());
                  that.setState({ paid: true, startPaymentSubmission: false });
                  if (userInfo && userInfo.email) {
                    // logged in
                    that.addSoundcastToUser(subscription, null, soundcastID);
                  } else {
                    handleStripeId(subscription, that.state);
                  }
                }
              })
              .catch(error => {
                console.log('error from stripe (recurring_charge): ', error);
                that.setState({
                  paymentError:
                    'Your payment is declined :( Please check your credit card information.',
                  startPaymentSubmission: false,
                });
              });
          }
        } else {
          this.setState({
            paymentError: 'Unable to process this payment. Sorry!',
            submitDisabled: false,
            startPaymentSubmission: false,
          });
        }
      });
  }

  renderProgressBar() {
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '1em',
        }}
      >
        <Dots style={{ display: 'flex' }} color="#727981" size={32} speed={1} />
      </div>
    );
  }

  render() {
    if (this.state.isFreeSoundcast) {
      return this.renderProgressBar();
    }

    const { totalPrice, hideCardInputs } = this.props;
    const showInputs = !(this.props.userInfo && this.props.userInfo.firstName);

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
                    <div style={styles.totalPriceText}>{`$${Number(totalPrice).toFixed(2)}`}</div>
                  </div>
                </div>
                <form onSubmit={this.onSubmit}>
                  {/* lastName, firstName, email, card number*/}
                  <div style={styles.relativeBlock}>
                    {showInputs && (
                      <div className="col-md-6 col-sm-12 inputFirstName">
                        <input
                          onChange={this.handleChange}
                          required
                          className="border-radius-4"
                          type="text"
                          name="firstName"
                          placeholder="First Name"
                          style={{ ...styles.input, margin: '20px 0 0 0' }}
                        />
                      </div>
                    )}
                    {showInputs && (
                      <div className="col-md-6 col-sm-12 inputLastName">
                        <input
                          onChange={this.handleChange}
                          required
                          className="border-radius-4"
                          type="text"
                          name="lastName"
                          placeholder="Last Name"
                          style={{ ...styles.input, margin: '20px 0 0 0' }}
                        />
                      </div>
                    )}
                    {showInputs && (
                      <input
                        onChange={this.handleChange}
                        required
                        className="border-radius-4 col-md-12"
                        type="email"
                        name="email"
                        placeholder="Email"
                        style={{ ...styles.input, margin: '20px 0 0 0' }}
                      />
                    )}
                    {!hideCardInputs && (
                      <input
                        onChange={this.handleChange}
                        required
                        className="border-radius-4"
                        size="20"
                        type="text"
                        name="number"
                        placeholder="Card Number"
                        autoComplete="new-password"
                        style={styles.input}
                      />
                    )}
                    {!hideCardInputs && (
                      <img src="../../../images/card_types.png" style={styles.cardsImage} />
                    )}
                  </div>

                  {/*Expiration*/}
                  {!hideCardInputs && (
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
                  )}

                  {/*button*/}
                  {(hideCardInputs && (
                    <div style={styles.buttonWrapper}>
                      <button
                        type="submit"
                        className="contact-submit btn propClone btn-3d text-white width-100 builder-bg tz-text"
                        style={{ ...styles.button, marginTop: 20 }}
                      >
                        SUBMIT
                      </button>
                    </div>
                  )) || (
                    <div style={styles.buttonWrapper}>
                      {this.state.paymentError && (
                        <span style={{ color: 'red' }}>{this.state.paymentError}</span>
                      )}
                      <button
                        id="paymentPayNowBtnTest"
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
                        <img
                          src="../../../images/powered_by_stripe.png"
                          style={styles.stripeImage}
                        />
                      </div>
                      {this.state.startPaymentSubmission && this.renderProgressBar()}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { isEmailSent: state.user.isEmailSent };
};
const mapDispatchToProps = dispatch => bindActionCreators({ sendEmail, signinUser }, dispatch);
const Payment = connect(
  mapStateToProps,
  mapDispatchToProps
)(_Payment);
export default Payment;

const styles = {
  totalRow: {
    borderTop: `1px solid ${Colors.mainGrey}`,
    height: 22,
  },
  totalWrapper: {
    float: 'right',
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.fontBlack,
  },
  totalText: {
    width: 40,
    marginRight: 50,
    float: 'left',
  },
  totalPriceText: {
    width: 53,
    float: 'right',
    textAlign: 'right',
  },
  cardsImage: {
    position: 'absolute',
    right: 4,
    marginTop: 10,
    width: 179,
    height: 26,
  },
  input: {
    height: 46,
    fontSize: 14,
    margin: '40px 0 0 0',
  },
  input2: {
    height: 46,
    fontSize: 14,
    margin: '10px 0 0 0',
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
    width: 138,
    height: 32,
    margin: '10px 10px',
    float: 'left',
    borderRadius: 5,
  },
  stripeImage: {
    width: 138,
    height: 32,
    position: 'relative',
    bottom: 0,
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
