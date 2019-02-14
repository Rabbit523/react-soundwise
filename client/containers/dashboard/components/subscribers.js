import React, { Component } from 'react';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { CSVLink } from 'react-csv';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import deburr from 'lodash/deburr';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Need to start migrating to latest material ui, for now new components can co-exist with older.
// https://material-ui.com/guides/migration-v0x/

import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import { OrangeSubmitButton } from '../../../components/buttons/buttons';
import InviteSubscribersModal from './invite_subscribers_modal';
import PendingInviteModal from './pending_invite_modal';
import EmailListModal from './email_list_modal';

function matchEmail(emails, inputLength, inputValue) {
  if (typeof emails != 'undefined') {
    for (var i = 0; i < emails.length; i++) {
      if (emails[i].slice(0, inputLength).toLowerCase() === inputValue) {
        return true;
      }
    }
  }
  return false;
}

function getSuggestions(value, subscribers) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : subscribers.filter(subscriber => {
        if (typeof subscriber.firstName != 'undefined') {
          const keep =
            count < 5 &&
            (subscriber.firstName.slice(0, inputLength).toLowerCase() === inputValue ||
              subscriber.lastName.slice(0, inputLength).toLowerCase() === inputValue ||
              matchEmail(subscriber.email, inputLength, inputValue));

          if (keep) {
            count += 1;
          }
          return keep;
        }
        return false;
      });
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  let matches = match(suggestion.firstName, query);
  let name = `${suggestion.firstName} ${suggestion.lastName}`;
  if (matches.length === 0) {
    matches = match(suggestion.lastName, query);
    name = `${suggestion.lastName} ${suggestion.firstName} `;
  }
  const parts = parse(name, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div style={{ fontSize: 16 }}>
        {parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          );
        })}
      </div>
    </MenuItem>
  );
}

function renderInputComponent(inputProps) {
  return (
    <div>
      <input
        {...inputProps}
        type="text"
        style={styles.searchTerm}
        placeholder="Search subscribers"
      />
      <button type="submit" style={styles.searchButton}>
        <i className="fa fa-search" />
      </button>
    </div>
  );
}

class Subscribers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSoundcastID: null,
      currentSoundcast: { invited: {}, title: '' },
      soundcasts_managed: [],
      subscribers: [{}],
      checked: false,
      toBeUnsubscribed: [],
      showModal: false,
      showPendingInvite: false,
      showEmailList: false,
      modalOpen: false,
      suggestions: [],
      value: '',
    };

    this.subscribers = [];
    this.allSubscribers = [];
    this.mailChimp = false;

    this.retrieveSubscriberInfo = this.retrieveSubscriberInfo.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.deleteSubscriber = this.deleteSubscriber.bind(this);
    this.handleModal = this.handleModal.bind(this);
    this.handlePendingInvite = this.handlePendingInvite.bind(this);
    this.handleSuggestionsFetchRequested = this.handleSuggestionsFetchRequested.bind(this);
    this.handleSuggestionsClearRequested = this.handleSuggestionsClearRequested.bind(this);
    this.handleSuggestionSelected = this.handleSuggestionSelected.bind(this);
    this.onMountOrReceiveProps = this.onMountOrReceiveProps.bind(this);
    this.retrieveSubscribers = this.retrieveSubscribers.bind(this);
    this.handleEmailList = this.handleEmailList.bind(this);
  }

  componentDidMount() {
    this.onMountOrReceiveProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.onMountOrReceiveProps(nextProps);
  }

  onMountOrReceiveProps(props) {
    const { userInfo } = props;
    if (userInfo.publisher) {
      if (
        (!userInfo.publisher.plan && !userInfo.publisher.beta) ||
        (userInfo.publisher.plan && userInfo.publisher.current_period_end < moment().format('X'))
      ) {
        this.setState({
          modalOpen: true,
        });
      }
    }
    if (userInfo.soundcasts_managed && userInfo.publisher) {
      this.mailChimp = userInfo.publisher.mailChimp ? true : false;
      if (typeof Object.values(userInfo.soundcasts_managed)[0] == 'object') {
        const _soundcasts_managed = [];

        for (let id in userInfo.soundcasts_managed) {
          const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
          if (_soundcast.title) {
            _soundcast.id = id;
            _soundcasts_managed.push(_soundcast);
          }
        }
        this.setState({
          soundcasts_managed: _soundcasts_managed,
        });

        if (!this.state.currentSoundcastID) {
          this.retrieveSubscribers(_soundcasts_managed[0]);
        }
      }
    }
  }

  handleModal() {
    if (!this.state.showModal) {
      this.setState({
        showModal: true,
      });
    } else {
      this.setState({
        showModal: false,
      });
    }
  }

  handlePendingInvite() {
    if (!this.state.showPendingInvite) {
      this.setState({
        showPendingInvite: true,
      });
    } else {
      this.setState({
        showPendingInvite: false,
      });
    }
  }

  retrieveSubscribers(currentSoundcast) {
    const promises = [];
    for (let userId in currentSoundcast.subscribed) {
      promises.push(this.retrieveSubscriberInfo(userId));
    }

    Promise.all(promises).then(
      res => {
        let filteredList = res.filter(a => a.soundcasts && a.soundcasts[currentSoundcast.id]);

        filteredList.sort((a, b) => {
          if (
            a.soundcasts &&
            b.soundcasts &&
            b.soundcasts[currentSoundcast.id] &&
            a.soundcasts[currentSoundcast.id]
          ) {
            return (
              b.soundcasts[currentSoundcast.id].date_subscribed -
              a.soundcasts[currentSoundcast.id].date_subscribed
            );
          } else {
            return -1;
          }
        });
        this.allSubscribers = filteredList;
        this.setState({
          currentSoundcastID: currentSoundcast.id,
          currentSoundcast: currentSoundcast,
          subscribers: filteredList,
        });
      },
      err => {
        console.log('promise error: ', err);
      }
    );
  }

  handleEmailList() {
    if (!this.state.showEmailList) {
      this.setState({
        showEmailList: true,
      });
    } else {
      this.setState({
        showEmailList: false,
      });
    }
  }

  retrieveSubscriberInfo(userId) {
    return firebase
      .database()
      .ref('users/' + userId)
      .once('value')
      .then(snapshot => {
        // that.subscribers.push({...JSON.parse(JSON.stringify(snapshot.val())), id: userId});
        return { ...JSON.parse(JSON.stringify(snapshot.val())), id: userId };
      })
      .then(res => res, err => console.log(err));
  }

  changeSoundcastId(e) {
    const currentSoundcastID = e.target.value;
    this.setState({
      currentSoundcastID,
      toBeUnsubscribed: [],
    });

    const { soundcasts_managed } = this.state;
    let currentSoundcast;

    soundcasts_managed.forEach(soundcast => {
      if (soundcast.id == e.target.value) {
        currentSoundcast = soundcast;
      }
    });
    this.retrieveSubscribers(currentSoundcast);
  }

  handleCheck(e) {
    this.setState({
      checked: e.target.checked,
    });
    const id = e.target.name.split('-')[0];
    const toBeUnsubscribed = this.state.toBeUnsubscribed.slice(0);
    if (e.target.checked) {
      toBeUnsubscribed.push(id);
    } else {
      const position = toBeUnsubscribed.indexOf(id);
      if (position > -1) {
        toBeUnsubscribed.splice(position, 1);
      }
    }
    // console.log('toBeUnsubscribed: ', toBeUnsubscribed);
    this.setState({
      toBeUnsubscribed: toBeUnsubscribed,
    });
  }

  deleteSubscriber() {
    const { currentSoundcastID, currentSoundcast } = this.state;
    const { userInfo } = this.props;
    const publisherID = userInfo.publisherID;
    if (this.state.toBeUnsubscribed.length === 0) {
      confirm(`Please select the listeners to unsubscribe`);
      return;
    }

    this.subscribers = this.allSubscribers.slice(0);
    if (
      confirm(
        `Are you sure you want to unsubscribe these listeners from ${
          this.state.currentSoundcast.title
        }? There is no going back!`
      )
    ) {
      // remove user-soundcast from both soundcast node and user node
      this.state.toBeUnsubscribed.forEach(listenerID => {
        firebase
          .database()
          .ref('soundcasts/' + this.state.currentSoundcastID + '/subscribed/' + listenerID)
          .remove();

        firebase
          .database()
          .ref(
            'users/' + listenerID + '/soundcasts/' + this.state.currentSoundcastID + '/subscribed'
          )
          .set(false);

        firebase
          .database()
          .ref(
            'users/' +
              listenerID +
              '/soundcasts/' +
              this.state.currentSoundcastID +
              '/current_period_end'
          )
          .set(moment().format('X'));

        firebase
          .database()
          .ref(
            `publishers/${publisherID}/freeSubscribers/${listenerID}/${
              this.state.currentSoundcastID
            }`
          )
          .remove();

        firebase
          .database()
          .ref(`publishers/${publisherID}/freeSubscribers/${listenerID}`)
          .once('value')
          .then(snapshot => {
            if (!snapshot.val()) {
              firebase
                .database()
                .ref(`publishers/${publisherID}/freeSubscriberCount`)
                .once('value')
                .then(snapshot => {
                  if (snapshot.val()) {
                    const count = snapshot.val();
                    // console.log('free subscriber count: ', count);
                    firebase
                      .database()
                      .ref(`publishers/${publisherID}/freeSubscriberCount`)
                      .set(count - 1);
                    console.log('subscriber count reduced by 1');
                  }
                });
            }
          });

        if (currentSoundcast.subscriberEmailList) {
          // delete email from email list
          firebase
            .database()
            .ref(`users/${listenerID}`)
            .once('value')
            .then(snapshot => {
              Axios.post('/api/delete_emails', {
                emails: [snapshot.val().email[0]],
                emailListId: currentSoundcast.subscriberEmailList,
              });
            });
        }

        for (var i = this.subscribers.length - 1; i >= 0; i -= 1) {
          if (this.subscribers[i].id == listenerID) {
            this.subscribers.splice(i, 1);
          }
        }
        this.subscribers.sort((a, b) => {
          if (
            a.soundcasts &&
            b.soundcasts &&
            b.soundcasts[currentSoundcastID] &&
            a.soundcasts[currentSoundcastID]
          ) {
            return (
              b.soundcasts[currentSoundcastID].date_subscribed -
              a.soundcasts[currentSoundcastID].date_subscribed
            );
          } else {
            return -1;
          }
        });
        this.allSubscribers = this.subscribers.slice(0);
        this.setState({
          subscribers: this.subscribers,
          checked: false,
          currentSoundcast,
          currentSoundcastID,
          toBeUnsubscribed: [],
        });
      });
    }
  }

  handleSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: getSuggestions(value, this.allSubscribers),
    });
    //Perform setState with updater function, as it depends on previous state.
    this.setState((state, props) => ({
      subscribers: state.suggestions,
    }));
  }

  handleSuggestionSelected(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) {
    this.setState({
      subscribers: [suggestion],
    });
  }
  handleSuggestionsClearRequested(value) {
    this.setState({
      suggestions: [],
    });
  }

  handleChange = name => (event, prop) => {
    const { newValue } = prop;
    let selectedSubscriber = this.allSubscribers.filter(
      subscriber => subscriber.firstName === newValue
    );
    if (selectedSubscriber.length === 0) {
      selectedSubscriber = this.allSubscribers;
    }
    this.setState({
      [name]: newValue,
      subscribers: selectedSubscriber,
    });
  };

  getSuggestionValue(suggestion) {
    return suggestion.firstName;
  }

  render() {
    const {
      soundcasts_managed,
      subscribers,
      checked,
      currentSoundcast,
      currentSoundcastID,
      modalOpen,
      value,
      suggestions,
    } = this.state;
    const that = this;
    const { history } = this.props;

    let csvData = [['First Name', 'Last Name', 'Email']];

    const autosuggestProps = {
      renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionSelected: this.handleSuggestionSelected,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue: this.getSuggestionValue,
      renderSuggestion,
    };

    this.allSubscribers.forEach(subscriber => {
      if (subscriber.email && subscriber.email[0]) {
        csvData.push([subscriber.firstName, subscriber.lastName, subscriber.email[0]]);
      }
    });

    return (
      <div className="padding-30px-tb">
        <InviteSubscribersModal
          isShown={this.state.showModal}
          soundcast={this.state.currentSoundcast}
          onClose={this.handleModal}
          userInfo={this.props.userInfo}
        />
        <PendingInviteModal
          isShown={this.state.showPendingInvite}
          soundcast={this.state.currentSoundcast}
          userInfo={this.props.userInfo}
          onClose={this.handlePendingInvite}
        />
        <EmailListModal
          isShown={this.state.showEmailList}
          currentSoundcastID={this.state.currentSoundcastID}
          userInfo={this.props.userInfo}
          onClose={this.handleEmailList}
          soundcasts={soundcasts_managed}
        />

        <div
          style={{
            display: modalOpen ? '' : 'none',
            background: 'rgba(0, 0, 0, 0.7)',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            position: 'absolute',
            zIndex: 100,
          }}
        >
          <div
            style={{
              transform: 'translate(-50%)',
              backgroundColor: 'white',
              top: 150,
              left: '50%',
              position: 'absolute',
              width: '70%',
              zIndex: 103,
            }}
          >
            <div className="title-medium" style={{ margin: 25, fontWeight: 800 }}>
              Upgrade to view subscribers
            </div>
            <div className="title-small" style={{ margin: 25 }}>
              Subscriber data is available on PLUS and PRO plans. Please upgrade to access the
              feature.
            </div>
            <div className="center-col">
              <OrangeSubmitButton
                label="Upgrade"
                onClick={() => that.props.history.push({ pathname: '/pricing' })}
                styles={{ width: '60%' }}
              />
            </div>
          </div>
        </div>
        <div style={{}}>
          <row className="padding-bottom-20px ">
            <div className="col-md-2 col-sm-4 col-xs-12">
              <span className="title-medium ">Subscribers</span>
            </div>
            <div className="col-md-6 col-sm-8 col-xs-12" style={styles.soundcastSelectWrapper}>
              <select
                style={styles.soundcastSelect}
                value={currentSoundcastID}
                onChange={e => {
                  this.changeSoundcastId(e);
                }}
              >
                {soundcasts_managed.map((souncast, i) => {
                  return (
                    <option style={styles.option} value={souncast.id} key={i}>
                      {souncast.title}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-md-4 col-sm-12 col-xs-12" style={styles.searchWrap}>
              <MuiThemeProvider>
                <Autosuggest
                  {...autosuggestProps}
                  inputProps={{
                    value: this.state.value,
                    onChange: this.handleChange('value'),
                    placeholder: 'Search subscribers',
                  }}
                  theme={{
                    container: autosuggestStyles.container,
                    suggestionsContainerOpen: autosuggestStyles.suggestionsContainerOpen,
                    suggestionsList: autosuggestStyles.suggestionsList,
                    suggestion: autosuggestStyles.suggestion,
                  }}
                  renderSuggestionsContainer={options => (
                    <Paper {...options.containerProps} square>
                      {options.children}
                    </Paper>
                  )}
                />
              </MuiThemeProvider>
            </div>
          </row>
          <row style={{ marginBottom: 25 }}>
            <div
              className={
                this.mailChimp ? `col-md-2 col-sm-6 col-xs-12` : `col-md-3 col-sm-6 col-xs-12`
              }
              style={styles.button}
            >
              <span style={{ color: Colors.mainOrange }} onClick={this.handleModal}>
                Invite Subscribers
              </span>
            </div>
            <div
              className={
                this.mailChimp ? `col-md-2 col-sm-6 col-xs-12` : `col-md-3 col-sm-6 col-xs-12`
              }
              style={styles.button}
            >
              <span style={{ color: Colors.link }} onClick={this.handlePendingInvite}>
                See Pending Invites
              </span>
            </div>
            <div
              className={
                this.mailChimp ? `col-md-2 col-sm-6 col-xs-12` : `col-md-3 col-sm-6 col-xs-12`
              }
              style={styles.button}
            >
              <CSVLink data={csvData} filename={`${currentSoundcast.title} subscribers.csv`}>
                <span>Download Subscribers</span>
              </CSVLink>
            </div>
            {this.mailChimp && (
              <div className="col-md-2 col-sm-6 col-xs-12" style={styles.button}>
                <span style={{ color: Colors.link }} onClick={this.handleEmailList}>
                  Connect Email List
                </span>
              </div>
            )}
            <div
              className={
                this.mailChimp ? `col-md-2 col-sm-6 col-xs-12` : `col-md-3 col-sm-6 col-xs-12`
              }
            >
              <div
                style={{
                  ...styles.button,
                  color: this.state.toBeUnsubscribed.length > 0 ? 'red' : Colors.fontDarkGrey,
                }}
                onClick={this.deleteSubscriber}
              >
                Unsubscribe
              </div>
            </div>
          </row>
          <row>
            <div
              className="col-md-12 col-sm-12 col-xs-12 table-responsive"
              style={styles.tableWrapper}
            >
              <table className="table table-condensed">
                <thead>
                  <tr style={styles.tr}>
                    <th style={{ ...styles.th }} />
                    <th style={{ ...styles.th }}>NAME</th>
                    <th style={{ ...styles.th }}>EMAIL</th>
                    <th style={{ ...styles.th }}>SUBSCRIBED ON</th>
                    <th style={{ ...styles.th }}>STATS</th>
                    <th style={{ ...styles.th }} />
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber, i) => {
                    if (subscriber.email) {
                      return (
                        <tr key={subscriber.id} style={styles.tr}>
                          <td style={{ ...styles.td }} />
                          <td style={{ ...styles.td }}>{`${subscriber.firstName} ${
                            subscriber.lastName
                          }`}</td>
                          <td style={{ ...styles.td }}>
                            <a
                              style={{
                                color: 'blue',
                                textDecoration: 'underline',
                              }}
                              href={`mailto:${subscriber.email[0]}`}
                            >
                              {subscriber.email[0]}
                            </a>
                          </td>
                          <td style={{ ...styles.td }}>
                            {(subscriber.soundcasts &&
                              subscriber.soundcasts[currentSoundcastID] &&
                              subscriber.soundcasts[currentSoundcastID].date_subscribed &&
                              moment(
                                subscriber.soundcasts[currentSoundcastID].date_subscribed * 1000
                              ).format('YYYY-MM-DD')) ||
                              '__'}
                          </td>
                          <td style={{ ...styles.td }}>
                            <span
                              onClick={() => {
                                history.push({
                                  pathname: `/dashboard/subscriber/${subscriber.id}`,
                                  state: {
                                    subscriber,
                                    soundcast: currentSoundcast,
                                  },
                                });
                              }}
                            >
                              <i className="far fa-chart-bar" style={styles.itemChartIcon} />
                            </span>
                          </td>
                          <td style={{ ...styles.td }}>
                            <input
                              type="checkbox"
                              id={`${subscriber.id}-${currentSoundcastID}`}
                              value={`${subscriber.id}-${currentSoundcastID}`}
                              name={`${subscriber.id}-${currentSoundcastID}`}
                              onClick={this.handleCheck}
                              style={styles.itemCheckbox}
                            />
                          </td>
                        </tr>
                      );
                    } else {
                      return null;
                    }
                  })}
                </tbody>
              </table>
            </div>
          </row>
        </div>
      </div>
    );
  }
}

const styles = {
  titleRow: {
    marginBottom: 20,
  },
  soundcastSelectWrapper: {
    height: 40,
    // width: 300,
    // backgroundColor: Colors.mainWhite,
    marginTop: 0,
    // marginLeft: 30,
    // marginRight: 30,
    // display: 'inline-block'
  },
  soundcastSelect: {
    backgroundColor: Colors.mainWhite,
    width: 'calc(100% - 20px)',
    height: 40,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 0,
    fontSize: 16,
  },
  invite: {
    color: Colors.mainOrange,
    fontSize: 18,
    // marginRight: 60,
    cursor: 'pointer',
  },
  option: {
    fontSize: 16,
  },
  searchWrap: {
    // width: '30%',
    // position: 'absolute',
    // float: 'right',
    // display: 'inline-block',
    marginTop: 0,
  },
  search: {
    width: '100%',
    position: 'relative',
  },
  searchTerm: {
    position: 'relative',
    // marginTop: '2px',
    border: '1px solid ',
    borderColor: Colors.link,
    height: '35px',
    marginBottom: '0px',
    // marginTop: '2px',
    borderRadius: '5px',
    outline: 'none',
    fontSize: 16,
    // color: Colors.link
  },
  searchButton: {
    position: 'absolute',
    right: '-0px',
    // width: '40px',
    height: '35px',
    border: '1px solid',
    borderColor: Colors.link,
    background: Colors.link,
    textAlign: 'center',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'pointer',
    // marginTop: '2px',
    fontSize: '20px',
  },
  pendingInviteWrap: {
    marginTop: 30,
    marginBottom: 25,
    // height: 35
  },
  pendingInvites: {
    fontSize: 16,
    fontStyle: 'italic',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  deleteButtonWrap: {
    height: 35,
    marginLeft: 25,
    // display: 'inline-block',
    verticalAlign: 'middle',
  },
  unsubscribe: {
    height: 35,
    borderRadius: 23,
    overflow: 'hidden',
    // margin: '40px auto',
    fontSize: 16,
    letterSpacing: 2.5,
    wordSpacing: 5,
    paddingTop: 6,
    paddingRight: 20,
    paddingBottom: 4,
    paddingLeft: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: Colors.darkGrey,
    borderColor: Colors.darkGrey,
    textAlign: 'center',
  },
  tableWrapper: { ...commonStyles.tableWrapper, height: 550 },
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
  itemCheckbox: {
    marginTop: 0,
    height: 40,
    width: 50,
    // transform: 'scale(1.5)'
  },
  itemChartIcon: {
    fontSize: 16,
    color: Colors.fontBlack,
    cursor: 'pointer',
  },
  button: {
    // height: 35,
    borderRadius: 5,
    fontSize: 16,
    letterSpacing: 1.5,
    fontWeight: 'bold',
    wordSpacing: 4,
    // display: 'inline-block',
    // paddingTop: 5,
    // paddingRight: 15,
    paddingBottom: 5,
    // paddingLeft: 15,
    borderWidth: 0,
    marginTop: 10,
    // marginRight: 7,
    // marginLeft: 7,
    borderStyle: 'solid',
    cursor: 'pointer',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
};

const autosuggestStyles = {
  root: {
    height: 250,
    flexGrow: 1,
  },
  container: {
    position: 'relative',
    float: 'left',
    width: '100%',
    marginBottom: '20px',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: '8px',
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  divider: {
    height: 8 * 2,
  },
};

export default Subscribers;
