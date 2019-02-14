import React, { Component } from 'react';
import moment from 'moment';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import Colors from '../../../styles/colors';

export default class Promotions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coupons: [],
    };
  }

  componentDidMount() {
    if (this.props.userInfo.publisher) {
      const publisherId = this.props.userInfo.publisher.id;
      this.retrieveCoupons(publisherId);
    }
  }

  retrieveCoupons(publisherId) {
    Axios.get('/api/coupon', {
      params: { filter: { publisherId: publisherId } },
    })
      .then(res => {
        this.setState({ coupons: res.data });
      })
      .catch(err => {
        console.log('error retrieving: ', err);
      });
  }

  render() {
    const { userInfo } = this.props;
    return (
      <div>
        {(this.state.coupons.length > 0 && (
          <row>
            <div
              className="col-md-12 col-sm-12 col-xs-12 table-responsive"
              style={styles.tableWrapper}
            >
              <table className="table table-hover">
                <thead>
                  <tr style={styles.tr}>
                    <th style={{ ...styles.th }}>DATE</th>
                    <th style={{ ...styles.th }}>COUPON CODE</th>
                    <th style={{ ...styles.th }}>SOUNDCAST TITLE</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.coupons.map((coupon, i) => {
                    return (
                      <tr key={i} style={styles.tr}>
                        <td style={{ ...styles.td }}>
                          {moment.unix(Number(coupon.timeStamp)).format('YYYY-MM-DD')}
                        </td>
                        <td style={{ ...styles.td }}>{coupon.coupon}</td>
                        <td style={{ ...styles.td }}>{`${coupon.soundcastTitle}`}</td>
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
                <span>There're no coupon usage records to show.</span>
              </div>
            </div>
          </row>
        )}
      </div>
    );
  }
}

const styles = {
  tableWrapper: {
    marginTop: 25,
    backgroundColor: Colors.mainWhite,
    padding: 25,
    overflow: 'auto',
    maxHeight: 650,
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 16,
    color: Colors.fontGrey,
    fontWeight: 'regular',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
  td: {
    color: Colors.softBlack,
    fontSize: 16,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
};
