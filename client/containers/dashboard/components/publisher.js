import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Colors from '../../../styles/colors';

import Profile from './profile';
import Transactions from './transactions';
import Payouts from './payouts';
import Settings from './settings';
import Promotions from './promotions';
import Integrations from './integrations';

const publisherTabs = [
  ['/dashboard/publisher', 'Profile'],
  ['/dashboard/publisher/transactions', 'Transactions'],
  ['/dashboard/publisher/payouts', 'Payouts'],
  ['/dashboard/publisher/promotions', 'Promotions'],
  ['/dashboard/publisher/settings', 'Settings'],
  ['/dashboard/publisher/integrations', 'Integration'],
];

export default class Publisher extends Component {
  constructor(props) {
    super(props);
  }

  renderBody() {
    const { userInfo } = this.props;
    const paramsId = this.props.match.params.id;

    if (paramsId == 'transactions') {
      return <Transactions {...this.props} userInfo={userInfo} id={paramsId} />;
    } else if (paramsId === 'payouts') {
      return <Payouts {...this.props} userInfo={userInfo} id={paramsId} />;
    } else if (paramsId === 'settings') {
      return <Settings {...this.props} userInfo={userInfo} id={paramsId} />;
    } else if (paramsId === 'promotions') {
      return <Promotions {...this.props} userInfo={userInfo} id={paramsId} />;
    } else if (paramsId === 'integrations') {
      return <Integrations {...this.props} userInfo={userInfo} id={paramsId} />;
    } else {
      return <Profile {...this.props} userInfo={userInfo} id={paramsId} />;
    }
  }

  render() {
    const { userInfo } = this.props;

    return (
      <div className="padding-30px-tb">
        <div className="padding-bottom-20px">
          <span className="title-medium ">Publisher</span>
          <Link to={`/publishers/${userInfo.publisherID}`}>
            <span className="text-medium" style={{ marginLeft: 15, color: Colors.mainOrange }}>
              <strong>View Publisher Page</strong>
            </span>
          </Link>
        </div>
        <ul className="nav nav-pills">
          {publisherTabs.map(i => {
            return this.props.history.location.pathname === i[0] ? (
              <li role="presentation" className="active">
                <Link to={i[0]} style={{ backgroundColor: 'transparent' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: Colors.mainOrange }}>
                    {i[1]}
                  </span>
                </Link>
              </li>
            ) : (
              <li role="presentation">
                <Link to={i[0]}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{i[1]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        {this.renderBody()}
      </div>
    );
  }
}
