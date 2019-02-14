import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import firebase from 'firebase';
import moment from 'moment';
import Axios from 'axios';
import Dots from 'react-activity/lib/Dots';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';

import { SoundwiseHeader } from '../../components/soundwise_header';
import CreateEpisode from './components/create_episode';
import SoundcastsManaged from './components/soundcasts_managed';
import AddSoundcast from './components/add_soundcast';
import CreateBundle from './components/create_bundle';
import Subscribers from './components/subscribers';
import Subscriber from './components/subscriber';
import Announcements from './components/announcements';
import Analytics from './components/analytics';
import EditSoundcast from './components/edit_soundcast';
import Publisher from './components/publisher';
import EditEpisode from './components/edit_episode';
import Soundcast from './components/soundcast';
import { handleContentSaving, setFeedVerified, setChargeState } from '../../actions/index';
import Colors from '../../styles/colors';
import { OrangeSubmitButton } from '../../components/buttons/buttons';
const { isFreeAccount } = require('../../../server/scripts/utils.js')();

const verticalMenuItems = [
  {
    path: 'soundcasts',
    label: 'Soundcasts',
    iconClass: 'headset',
    isMenuItemVisible: true,
    Component: SoundcastsManaged,
  },
  {
    path: 'edit',
    label: 'edit',
    isMenuItemVisible: false,
    Component: EditSoundcast,
  },
  {
    path: 'soundcast',
    label: 'edit',
    isMenuItemVisible: false,
    Component: Soundcast,
  },
  {
    path: 'add_episode',
    label: 'Add Episode',
    iconClass: 'settings_voice',
    isMenuItemVisible: true,
    Component: CreateEpisode,
  },
  {
    path: 'add_soundcast',
    isMenuItemVisible: false,
    Component: AddSoundcast,
  },
  {
    path: 'create_bundle',
    isMenuItemVisible: false,
    Component: CreateBundle,
  },
  {
    path: 'edit_bundle',
    isMenuItemVisible: false,
    Component: CreateBundle,
  },
  {
    path: 'analytics',
    label: 'Analytics',
    pro: true,
    iconClass: 'assessment',
    isMenuItemVisible: true,
    Component: Analytics,
  },
  {
    path: 'subscribers',
    label: 'Subscribers',
    pro: true,
    iconClass: 'people',
    isMenuItemVisible: true,
    Component: Subscribers,
  },
  {
    path: 'subscriber',
    isMenuItemVisible: false,
    Component: Subscriber,
  },
  {
    path: 'messages',
    label: 'Messages',
    pro: true,
    iconClass: 'message',
    isMenuItemVisible: true,
    Component: Announcements,
  },
  {
    path: 'publisher',
    label: 'Publisher',
    iconClass: 'work',
    isMenuItemVisible: true,
    Component: Publisher,
  },
  {
    path: 'edit_episode',
    label: 'edit_episode',
    isMenuItemVisible: false,
    Component: EditEpisode,
  },
];

class _Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      upgradeModal: false,
      upgradeModalTitle: '',
    };
    this.checkProps = this.checkProps.bind(this);
    this.closeUpgradeModal = this.closeUpgradeModal.bind(this);
    this.handleAddNewEpisode = this.handleAddNewEpisode.bind(this);
  }

  closeUpgradeModal() {
    this.setState({ upgradeModal: false });
  }

  handleAddNewEpisode(path) {
    const { userInfo } = this.props;
    if (userInfo.soundcasts_managed && userInfo.publisher) {
      const is_free_account = isFreeAccount(userInfo);
      // if plus plan and has already 10 soundcast then limit
      let currentSoundcastCount = 0;
      let currentEpisodeCount = 0;
      Object.keys(userInfo.soundcasts_managed).forEach(soundcastId => {
        if (userInfo.soundcasts_managed[soundcastId].title) {
          currentSoundcastCount += 1;
          if (userInfo.soundcasts_managed[soundcastId].episodes) {
            currentEpisodeCount += Object.keys(userInfo.soundcasts_managed[soundcastId].episodes)
              .length;
          }
        }
      });

      if (
        currentSoundcastCount >= 10 &&
        currentEpisodeCount >= 500 &&
        !is_free_account &&
        userInfo.publisher.plan === 'plus'
      ) {
        return this.setState({
          upgradeModal: true,
          upgradeModalTitle: 'Please upgrade to create more episodes',
        });
      }
      // if basic plan or end current plan then limit to 1 soundcast
      if (currentSoundcastCount >= 1 && currentEpisodeCount >= 1 && is_free_account) {
        return this.setState({
          upgradeModal: true,
          upgradeModalTitle: 'Please upgrade to create more episodes',
        });
      }
      // allow
      this.props.history.push(path);
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        if (this.props.userInfo.admin) {
          this.setState({ userInfo: this.props.userInfo });
        }
        return this.checkProps(this.props);
      }
      this.props.history.push('/signin');
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.userInfo.admin || !nextProps.isLoggedIn) {
      nextProps.history.push('/signin');
    }
    if (nextProps.userInfo.admin) {
      this.setState({ userInfo: nextProps.userInfo });
    }
    this.checkProps(nextProps);
  }

  checkProps(nextProps = {}) {
    const that = this;
    const { userInfo, feedVerified, chargeState } = this.props;
    const { publisherID, id } = this.props.userInfo;
    if (!this.runningParseFeedRequest && feedVerified && publisherID && id) {
      console.log('runningParseFeedRequest');
      this.runningParseFeedRequest = true;
      const { feedUrl } = feedVerified;
      const reqObj = {
        feedUrl,
        userId: id,
        publisherId: publisherID,
        importFeedUrl: true, // run import or claim
      };
      Axios.post('/api/parse_feed', reqObj)
        .then(res => {
          // if (res.data === 'Success_import' || res.data === 'Success_claim') {
          that.props.setFeedVerified(false);
          // }
        })
        .catch(err => {
          console.log('import feed request failed', err, err && err.response && err.response.data);
          alert('Hmm...there is a problem importing feed. Please try again later.');
          that.props.setFeedVerified(false);
        });
    }
    if (!this.runningChargeStateRequest && publisherID && chargeState) {
      console.log('runningChargeStateRequest');
      // set already paid data (same block from soundwise_checkout.js:handlePaymentSuccess)
      this.runningChargeStateRequest = true;
      const { plan, frequency, promoCodeError, promoCode, trialPeriod, charge } = chargeState;
      firebase
        .database()
        .ref(`publishers/${publisherID}/plan`)
        .set(plan);
      firebase
        .database()
        .ref(`publishers/${publisherID}/frequency`)
        .set(frequency);
      firebase
        .database()
        .ref(`publishers/${publisherID}/current_period_end`)
        .set(charge.data.current_period_end);
      firebase
        .database()
        .ref(`publishers/${publisherID}/auto_renewal`)
        .set(true);
      firebase
        .database()
        .ref(`publishers/${publisherID}/subscriptionID`)
        .set(charge.data.id);
      if (trialPeriod) {
        firebase
          .database()
          .ref(`publishers/${publisherID}/trialEnd`)
          .set(
            moment()
              .add(trialPeriod, 'days')
              .format('X')
          );
      }
      firebase
        .database()
        .ref(`publishers/${publisherID}/stripe_customer_id`)
        .set(charge.data.customer);
      if (promoCode && !promoCodeError && !trialPeriod) {
        firebase
          .database()
          .ref(`publishers/${publisherID}/coupon`)
          .set({
            code: promoCode,
            expires_on: charge.data.current_period_end,
          });
      }
      Axios.post('/api/update_subscription', { publisherID })
        .then(res => {
          console.log('Success update_subscription request');
        })
        .catch(err => {
          const errMsg = 'Error: dashboard.js update_subscription';
          console.log(errMsg, err, err && err.response && err.response.data);
          alert('Hmm...there is a problem updating subpscription.');
        });
      that.props.setChargeState(null);
    }
  }

  render() {
    const {
      history,
      match,
      isLoggedIn,
      handleContentSaving,
      content_saved,
      feedVerified,
    } = this.props;
    let userInfo = this.state.userInfo;
    let plan, proUser;
    if (userInfo.publisher && userInfo.publisher.plan) {
      plan = userInfo.publisher.plan;
      proUser = userInfo.publisher.current_period_end > moment().format('X') ? true : false;
    }
    if (userInfo.publisher && userInfo.publisher.beta) {
      proUser = true;
    }

    const currentTab = _.find(verticalMenuItems, { path: match.params.tab });

    return (
      <div className="">
        <SoundwiseHeader showIcon={true} />
        {feedVerified && (
          <div className="importing-feed-overlay">
            <div>Importing feed... Please wait</div>
            <div style={{ marginTop: 20 }}>
              <Dots style={{}} color={Colors.mainOrange} size={22} speed={1} />
            </div>
          </div>
        )}
        <div className="" style={{ minHeight: '100%', width: '100%' }}>
          <div className="col-lg-2 col-md-3 col-sm-3 col-xs-3" style={styles.verticalMenu}>
            {verticalMenuItems.map((item, i) => {
              if (item.isMenuItemVisible) {
                return (
                  <div
                    id={item.path === 'add_episode' ? 'dashboardMenuAddEpisodeTestBtn' : null}
                    className="col-md-12"
                    style={
                      (match.params.tab === item.path && styles.activeVerticalMenuItem) ||
                      styles.verticalMenuItem
                    }
                    key={i}
                    onClick={() => {
                      if (match.params.tab !== item.path) {
                        if (item.path === 'add_episode') {
                          this.handleAddNewEpisode(`/dashboard/${item.path}`);
                        } else {
                          history.push(`/dashboard/${item.path}`);
                        }
                      }
                    }}
                  >
                    <div className="col-md-1 col-sm-2 col-xs-12">
                      {(match.params.tab === item.path && (
                        <i className="material-icons" style={styles.activeVerticalMenuItemIcon}>
                          {item.iconClass}
                        </i>
                      )) || (
                        <i className="material-icons" style={styles.verticalMenuItemIcon}>
                          {item.iconClass}
                        </i>
                      )}
                    </div>
                    <div className="col-md-9 col-sm-9 hidden-xs">
                      <span>{item.label}</span>
                      {(item.pro && !proUser && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: 'red',
                            marginLeft: 5,
                          }}
                        >
                          PLUS
                        </span>
                      )) || <span />}
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>
          <div className="col-lg-10 col-md-9 col-sm-9 col-xs-9" style={styles.contentWrapper}>
            {(currentTab && (
              <currentTab.Component
                {...this.props}
                userInfo={userInfo}
                history={history}
                id={match.params.id}
                handleContentSaving={handleContentSaving}
                content_saved={content_saved}
              />
            )) ||
              null}
          </div>
        </div>

        <MuiThemeProvider>
          <Dialog modal={true} open={this.state.upgradeModal}>
            <div
              style={{ cursor: 'pointer', float: 'right', fontSize: 29 }}
              onClick={() => this.closeUpgradeModal()}
            >
              &#10799; {/* Close button (X) */}
            </div>

            <div>
              <div style={{ ...styles.dialogTitle }}>{this.state.upgradeModalTitle}</div>
              <OrangeSubmitButton
                styles={{
                  borderColor: Colors.link,
                  backgroundColor: Colors.link,
                  color: '#464646',
                  width: 400,
                }}
                label="Change Plan"
                onClick={() =>
                  this.props.history.push({
                    pathname: '/pricing',
                  })
                }
              />
            </div>
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }
}

const styles = {
  verticalMenu: {
    backgroundColor: '#fff',
    paddingRight: 0,
  },
  verticalMenuItem: {
    width: '100%',
    height: 75,
    color: '#687178',
    fontSize: 16,
    paddingTop: 25,
    // paddingLeft: 19,
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  activeVerticalMenuItem: {
    width: '100%',
    height: 75,
    fontSize: 16,
    paddingTop: 25,
    // paddingLeft: 19,
    backgroundColor: '#f5f5f5',
    color: '#F76B1C',
    borderLeft: '3px solid #F76B1C',
    fontWeight: 'bold',
  },
  verticalMenuItemIcon: {
    fontSize: '20px',
    color: '#687178',
    marginRight: 5,
    width: 25,
  },
  activeVerticalMenuItemIcon: {
    fontSize: '20px',
    color: '#F76B1C',
    marginRight: 5,
    width: 25,
  },
  contentWrapper: {
    backgroundColor: '#f5f5f5',
    minHeight: '950',
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    marginBottom: 0,
  },
  dialogTitle: {
    marginTop: 47,
    marginBottom: 49,
    textAlign: 'center',
    fontSize: 22,
  },
};

const mapStateToProps = state => {
  const { userInfo, isLoggedIn, content_saved } = state.user;
  return {
    userInfo,
    isLoggedIn,
    content_saved,
    feedVerified: state.setFeedVerified.feedVerified,
    chargeState: state.setChargeState.chargeState,
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ handleContentSaving, setFeedVerified, setChargeState }, dispatch);
}

export const Dashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(_Dashboard);
