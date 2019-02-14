const moment = require('moment');
const firebase = require('firebase-admin');

var stripe_key = require('../../config').stripe_key;
var stripe = require('stripe')(stripe_key);

module.exports.handlePayment = (req, res) => {
  // create customer: to be used in real version
  if (!req.body.customer) {
    stripe.customers
      .create({
        email: req.body.receipt_email,
        source: req.body.source,
      })
      .then(customer => {
        return stripe.charges.create(
          {
            amount: req.body.amount,
            currency: 'usd',
            customer: customer.id,
            description: req.body.description,
            statement_descriptor: req.body.statement_descriptor,
          },
          (err, charge) => {
            if (err) {
              console.log(err);
              return res.status(err.raw.statusCode).send(err.raw.message);
            }
            res.send(charge);
          }
        );
      });
  } else {
    console.log('customer: ', req.body.customer);
    stripe.charges.create(
      {
        amount: req.body.amount,
        currency: 'usd',
        customer: req.body.customer,
        description: req.body.description,
        statement_descriptor: req.body.statement_descriptor,
      },
      (err, charge) => {
        if (err) {
          console.log(err);
          return res.status(err.raw.statusCode).send(err.raw.message);
        }
        res.send(charge);
      }
    );
  }
};

module.exports.createUpdatePlans = async (req, res) => {
  const { publisherID, soundcastID, stripe_account, title, prices, couponsToRemove } = req.body;

  if (couponsToRemove) {
    // old coupons removal
    for (const code of couponsToRemove) {
      await new Promise(resolve => stripe.coupons.del(code, { stripe_account }, () => resolve()));
    }
  }

  // Remove all old plans with this particular publisherID-soundcastID key
  await new Promise(resolve =>
    stripe.plans.list({ stripe_account }, (err, list) => {
      if (err || !list) {
        err && console.log(`Error: payment.js plans list ${err}`, req.body);
        return resolve();
      }
      Promise.all(
        list.data.map(
          i =>
            new Promise(resolve2 => {
              const [publisher, soundcast] = i.id.split('-'); // planID split
              if (publisher === publisherID && soundcast === soundcastID) {
                stripe.plans.del(i.id, { stripe_account }, () => resolve2()); // delete plan
              } else {
                resolve2();
              }
            })
        )
      ).then(() => resolve());
    })
  );

  // Create new plans
  Promise.all(
    prices.map(
      item =>
        new Promise((resolve, reject) => {
          const { billingCycle, paymentPlan, price, coupons } = item;
          if (!['monthly', 'quarterly', 'annual'].includes(billingCycle)) {
            return resolve(); // ignore if it isn't subscription (one time charge)
          }
          const planID = `${publisherID}-${soundcastID}-${title}-${billingCycle}-${price}`;
          // amount from soundcast_checkout.js > setSoundcastData:
          //  totalPrice = Number(soundcast.prices[checked].price);
          const amount = Number(price).toFixed(2) * 100; // in cents
          let interval_count = 1;
          if (billingCycle == 'quarterly') {
            interval_count = 3;
          }
          if (billingCycle == 'annual') {
            interval_count = 12;
          }
          stripe.plans.create(
            {
              // create a plan on connected account
              id: planID,
              name: paymentPlan ? `${title}: ${paymentPlan}` : `${title}`,
              amount: Number(amount).toFixed(),
              interval_count,
              interval: 'month',
              currency: 'usd',
            },
            { stripe_account },
            (err, plan) => {
              if (err || !plan) {
                console.log(`Error: payment.js plan creation ${planID} ${err}`, req.body);
                return reject(`${planID} ${err}`);
              }
              console.log(`New plan ${planID} successfully created:`, plan);
              if (!coupons || !coupons.length) {
                return resolve(); // no coupons
              }
              Promise.all(
                coupons.map(
                  coupon =>
                    new Promise(resolve2 => {
                      stripe.coupons.del(coupon.code, { stripe_account }, () => {
                        if (
                          coupon.couponType === 'trial_period' ||
                          coupon.expiration - 10 < Date.now() / 1000
                        ) {
                          // trial period or outdated
                          resolve2();
                        } else {
                          stripe.coupons.create(
                            {
                              percent_off: Number(coupon.percentOff),
                              duration: 'forever',
                              redeem_by: coupon.expiration,
                              id: coupon.code,
                            },
                            { stripe_account },
                            (err, result) => {
                              if (err) {
                                console.log(
                                  `Error: payment.js coupon creation ${planID} ${err}`,
                                  coupon
                                );
                                return reject(`${planID} coupon ${JSON.stringify(coupon)} ${err}`);
                              }
                              resolve2(); // coupon creation success
                            }
                          );
                        }
                      });
                    })
                )
              ).then(() => resolve());
            }
          );
        })
    )
  )
    .then(result => res.end(`Success`))
    .catch(err => res.status(500).end(`Error: ${err}`));
};

module.exports.handleRecurringPayment = async (req, res) => {
  recurringPayment(req.body).then(result => {
    if (result && result.errMsg) {
      res.status(500).send(result.errMsg);
    } else {
      res.send(result);
    }
  });
};

const recurringPayment = async body => {
  const {
    source,
    receipt_email,
    platformCustomer,
    stripe_account,
    planID,
    publisherID,
    soundcastID,
    coupon,
    isTrial,
  } = body;
  if (coupon) {
    // Checking coupon
    const snapshot = await firebase
      .database()
      .ref(`soundcasts/${soundcastID}/prices`)
      .once('value');
    const prices = snapshot.val();
    let errMsg = `Error cannot obtain soundcast prices ${soundcastID}`;
    if (!prices || !prices.length) {
      return { errMsg };
    }
    const allCoupons = [];
    prices.forEach(i => {
      if (i.coupons && i.coupons.length) {
        i.coupons.forEach(j => allCoupons.push(j));
      }
    });
    const usedCoupon = allCoupons.find(i => i.code === coupon);
    if (!usedCoupon) {
      errMsg = `Error cannot obtain soundcast used coupon ${soundcastID} ${coupon}`;
      return { errMsg };
    }
    if (isTrial && usedCoupon.couponType !== 'trial_period') {
      errMsg = `Error coupon incorrect trial property ${soundcastID} ${coupon} ${isTrial}`;
      return { errMsg };
    }
  }

  const publisherObj = await firebase
    .database()
    .ref(`publishers/${publisherID}`)
    .once('value');
  const publisher = publisherObj.val();

  let soundwiseFeePercent = 0;
  if (publisher.plan == 'basic' && publisher.current_period_end > moment().format('X')) {
    soundwiseFeePercent = 10;
  } else if (publisher.plan == 'plus' && publisher.current_period_end > moment().format('X')) {
    soundwiseFeePercent = 5;
  } else if (
    (publisher.plan == 'pro' && publisher.current_period_end > moment().format('X')) ||
    (publisher.plan == 'platinum' && publisher.current_period_end > moment().format('X'))
  ) {
    soundwiseFeePercent = 0;
  } else {
    soundwiseFeePercent = 10;
  }

  // first create customer on connected account
  try {
    const customers = await new Promise((resolve, reject) => {
      console.log('req.body.platformCustomer: ', platformCustomer);
      const email = platformCustomer ? platformCustomer.receipt_email : receipt_email;
      if (platformCustomer) {
        // if customer exists on platform
        createCustomer(platformCustomer, email, stripe_account, resolve, reject);
      } else {
        stripe.customers.create(
          {
            // create customer on platform
            email,
            source,
            description: `platform customer from ${email}`,
          },
          (err, customer) => {
            if (err) {
              return reject(err);
            }
            console.log('new platformCustomer: ', customer.id);
            createCustomer(customer.id, email, stripe_account, resolve, reject);
          }
        );
      }
    });
    console.log('customers: ', customers);
    const newSub = {
      customer: customers.connectedCustomer,
      metadata: { platformCustomer: customers.platformCustomer },
      application_fee_percent: soundwiseFeePercent,
      items: [{ plan: planID }],
    };
    if (!isTrial && coupon) {
      newSub.coupon = coupon;
    }
    if (isTrial) {
      newSub.trial_end = moment()
        .add(isTrial, 'days')
        .unix();
    }
    const result = await new Promise((resolve, reject) => {
      stripe.subscriptions.create(newSub, { stripe_account }, (err, subscription) => {
        if (err) {
          console.log(err);
          return reject({ errMsg: err && err.raw && err.raw.message });
        }
        return resolve(Object.assign({}, subscription, customers));
      });
    });
    return result;
  } catch (err) {
    console.log(err);
    return { errMsg: err.toString() };
  }
};
module.exports.recurringPayment = recurringPayment;

function createCustomer(platformCustomer, description, stripe_account, resolve, reject) {
  // create token from platform customer
  stripe.tokens.create({ customer: platformCustomer }, { stripe_account }, (err, token) => {
    if (err) {
      return reject(err);
    }
    console.log('token: ', token.id);
    stripe.customers.create(
      {
        // then create customer using token on connected account
        description,
        source: token.id,
      },
      { stripe_account },
      (err, customer) => {
        if (err) {
          return reject(err);
        }
        console.log('Success: payment.js customer', platformCustomer, customer.id);
        return resolve({
          platformCustomer,
          connectedCustomer: customer.id,
        });
      }
    );
  });
}

module.exports.retrieveCustomer = (req, res) => {
  // console.log('stripe_id: ', req);
  stripe.customers.retrieve(req.query.stripe_id, (err, customer) => {
    if (err) {
      console.log(err);
      return res.status(err.raw.statusCode).send(err.raw.message);
    }
    // console.log('customer: ', customer);
    res.send({ customer });
  });
};

module.exports.updateCreditCard = (req, res) => {
  const { source, customer, email } = req.body;
  // console.log('source: ', source);
  if (customer) {
    // if it's existing customer
    stripe.customers
      .update(customer, {
        source,
      })
      .then(response => {
        // console.log(response);
        res.send(response);
      })
      .catch(err => {
        console.log('err: ', err);
        return res.status(500).send(err.message);
      });
  } else if (email) {
    // if it's a new customer
    stripe.customers
      .create({
        email,
        source,
        description: `platform customer from ${email}`,
      })
      .then(response => {
        res.send(response);
      })
      .catch(err => {
        console.log('err: ', err);
        return res.status(500).send(err.message);
      });
  }
};
