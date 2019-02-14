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

export default class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [
        {
          date: '',
          type: 'charge',
          amount: 0,
          description: '',
        },
      ],
    };
  }

  componentDidMount() {
    if (this.props.userInfo.publisher) {
      this.retrieveTransactions(this.props.userInfo.publisher.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.userInfo.publisher &&
      nextProps.userInfo.publisher !== this.props.userInfo.publisher
    ) {
      this.retrieveTransactions(nextProps.userInfo.publisher.id);
    }
  }

  retrieveTransactions(publisherId) {
    const that = this;
    const filter = {
      params: {
        filter: {
          where: {
            publisherId,
            // date: {
            //     lte: moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
            // },
          },
        },
      },
    };

    Axios.get('/api/transactions', filter)
      .then(res => {
        // console.log('transactions: ', res);
        const transactions = res.data;
        transactions.sort((a, b) => {
          return moment(b.createdAt).format('X') - moment(a.createdAt).format('X');
        });
        that.setState({
          transactions,
        });
      })
      .catch(err => {
        console.log('error retrieving transactions: ', err);
      });
  }

  render() {
    const { userInfo } = this.props;
    const plan = userInfo.publisher.plan;
    return (
      <div>
        {(this.state.transactions.length > 0 && (
          <row>
            <div
              className="col-md-12 col-sm-12 col-xs-12 table-responsive"
              style={styles.tableWrapper}
            >
              <table className="table table-hover">
                <thead>
                  <tr style={styles.tr}>
                    <th style={{ ...styles.th }}>DATE</th>
                    <th style={{ ...styles.th }}>TYPE</th>
                    <th style={{ ...styles.th }}>DESCRIPTION</th>
                    <th style={{ ...styles.th }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.transactions.map((transaction, i) => {
                    const type = transaction.type == 'charge' ? 'Sale' : 'Refund';
                    const price = Number(transaction.amount).toFixed(2);
                    const creditCardCharge = (price * 0.029 + 0.3).toFixed(2); // Stripe charge
                    let soundwiseFee;
                    if (plan == 'plus') {
                      soundwiseFee = (0.05 * price).toFixed(2);
                    } else if (plan == 'basic' || !plan) {
                      soundwiseFee = (0.1 * price).toFixed(2);
                    } else if (plan == 'pro') {
                      soundwiseFee = 0.0;
                    }
                    const amount =
                      transaction.type == 'charge'
                        ? (price - creditCardCharge - soundwiseFee).toFixed(2)
                        : (+price).toFixed(2);
                    return (
                      <tr key={i} style={styles.tr}>
                        <td style={{ ...styles.td }}>
                          {transaction.type == 'charge'
                            ? transaction.date.slice(0, 10)
                            : transaction.refund_date.slice(0, 10)}
                        </td>
                        <td style={{ ...styles.td }}>{type}</td>
                        <td style={{ ...styles.td }}>{transaction.description}</td>
                        <td style={{ ...styles.td }}>
                          <div style={{ fontWeight: 600 }}>
                            {`${transaction.type == 'charge' ? '' : '-'}$${amount}`}
                          </div>
                          <div style={{ fontSize: 12, color: Colors.fontGrey }}>
                            {`(Price: ${transaction.type == 'charge' ? '' : '-'}$${price}${
                              transaction.type == 'charge' ? '' : ')'
                            }`}
                          </div>
                          <div style={{ fontSize: 12, color: Colors.fontGrey }}>
                            {(transaction.type == 'charge' &&
                              `Credit card processing fee: ${
                                transaction.type == 'charge' ? '-' : ''
                              }$${creditCardCharge}`) ||
                              null}
                          </div>
                          <div style={{ fontSize: 12, color: Colors.fontGrey }}>
                            {(transaction.type == 'charge' &&
                              `Soundwise fee: ${
                                transaction.type == 'charge' ? '-' : ''
                              }$${soundwiseFee})`) ||
                              null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </row>
        )) || (
          <row>
            <div className="col-md-12 " style={{ marginTop: 40 }}>
              <div
                className="title-small padding-40px-tb"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.mainWhite,
                }}
              >
                <span>There're no transactions to show.</span>
              </div>
            </div>
          </row>
        )}
      </div>
    );
  }
}

const styles = {
  tableWrapper: { ...commonStyles.tableWrapper },
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
