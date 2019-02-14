import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Bar } from 'react-chartjs-2';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';

import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import { getDateArray } from '../../../helpers/get_date_array';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';

export default class Analytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSoundcastID: null,
      currentSoundcast: null,
      soundcasts_managed: [],
      startDate: moment()
        .subtract(3, 'months')
        .format()
        .slice(0, 10),
      endDate: moment()
        .format()
        .slice(0, 10),
      data: {
        labels: [],
        datasets: [
          {
            label: 'Total # of listens',
            backgroundColor: 'rgba(97, 225, 251, 0.2)',
            borderColor: 'rgba(97, 225, 251, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(97, 225, 251, 0.4)',
            hoverBorderColor: 'rgba(97, 225, 251, 1)',
            data: [],
          },
        ],
      },
      userArr: [],
      episodeArr: [],
      modalOpen: false,
    };

    this.getListeningStats = this.getListeningStats.bind(this);
    this.loadData = this.loadData.bind(this);
  }

  componentDidMount() {
    const { userInfo } = this.props;
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
    if (userInfo.soundcasts_managed) {
      if (typeof Object.values(userInfo.soundcasts_managed)[0] == 'object') {
        this.loadData(userInfo);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { userInfo } = nextProps;
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
    if (nextProps.userInfo.soundcasts_managed) {
      if (typeof Object.values(nextProps.userInfo.soundcasts_managed)[0] == 'object') {
        this.loadData(nextProps.userInfo);
      }
    }
  }

  loadData(userInfo) {
    const _subscribers = [];
    const _soundcasts_managed = [];
    for (let id in userInfo.soundcasts_managed) {
      const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
      if (_soundcast.title) {
        _soundcast.id = id;
        _soundcasts_managed.push(_soundcast);
      }
    }

    const selectedSoundcastId = this.props.history.location.state
      ? this.props.history.location.state.soundcastId
      : null;

    if (selectedSoundcastId) {
      this.setState({
        soundcasts_managed: _soundcasts_managed,
        currentSoundcastID: selectedSoundcastId,
        currentSoundcast: userInfo.soundcasts_managed[selectedSoundcastId],
      });
      this.getListeningStats(selectedSoundcastId);
    } else {
      this.setState({
        soundcasts_managed: _soundcasts_managed,
        currentSoundcastID: _soundcasts_managed[0].id,
        currentSoundcast: _soundcasts_managed[0],
      });
      this.getListeningStats(_soundcasts_managed[0].id);
    }
  }

  getListeningStats(soundcastId) {
    // console.log('soundcastId: ', soundcastId);
    const that = this;
    Axios.get(
      `/api/stats_by_soundcast?soundcastId=${soundcastId}&startDate='${
        this.state.startDate
      }'&endDate='${this.state.endDate}'`
    ).then(res => {
      this.countListenings(res.data);
      // console.log(that.state.currentSoundcast.title, res.data);
    });
  }

  countListenings(rawDataArr) {
    const { userInfo } = this.props;
    const labels = getDateArray(this.state.startDate, this.state.endDate, 1);
    // console.log('labels: ', labels);
    const statsByDate = Array(labels.length).fill({
      listens: 0,
      length: 0,
    });
    const statsByUser = {},
      statsByEpisode = {};
    rawDataArr.forEach(session => {
      //calculate stats by date
      // console.log('statsByDate: ', statsByDate[labels.indexOf(session.date)], 'session.date: ', session.date);
      if (labels.indexOf(session.date) > -1) {
        const { listens, length } = statsByDate[labels.indexOf(session.date)];
        statsByDate[labels.indexOf(session.date)] = {
          listens: listens + 1,
          length: length + session.sessionDuration,
        };

        //calculate stats by user
        if (statsByUser[session.userId]) {
          statsByUser[session.userId].listens++; //how frequently user listens
          statsByUser[session.userId].length += session.sessionDuration; //how long user listens
        } else if (!statsByUser[session.userId]) {
          statsByUser[session.userId] = {};
          statsByUser[session.userId].listens = 1;
          statsByUser[session.userId].length = session.sessionDuration;
        }

        //calculate stats by episode
        if (statsByEpisode[session.episodeId]) {
          statsByEpisode[session.episodeId].listens++;
          statsByEpisode[session.episodeId].length += session.sessionDuration;
        } else if (!statsByEpisode[session.episodeId]) {
          statsByEpisode[session.episodeId] = {};
          statsByEpisode[session.episodeId].listens = 1;
          statsByEpisode[session.episodeId].length = session.sessionDuration;
        }
      }
    });

    const statsByDate_listens = statsByDate.map(obj => {
      if (obj.listens == undefined) {
        return obj;
      } else {
        return obj.listens;
      }
    });

    const statsByUserArr = [];
    for (var key in statsByUser) {
      if (key != userInfo.id) {
        statsByUserArr.push({
          userId: key,
          listens: statsByUser[key].listens,
          length: statsByUser[key].length,
        });
      }
    }

    statsByUserArr.sort((a, b) => b.listens - a.listens);
    this.compileUserList(statsByUserArr);

    const statsByEpisodeArr = [];
    for (var key in statsByEpisode) {
      statsByEpisodeArr.push({
        episodeId: key,
        listens: statsByEpisode[key].listens,
        length: statsByEpisode[key].length,
      });
    }

    statsByEpisodeArr.sort((a, b) => b.listens - a.listens);
    this.compileEpisodeList(statsByEpisodeArr);

    this.setState({
      data: {
        labels,
        datasets: [
          {
            label: 'Total # of listens',
            backgroundColor: 'rgba(97, 225, 251, 0.2)',
            borderColor: 'rgba(97, 225, 251, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(97, 225, 251, 0.4)',
            hoverBorderColor: 'rgba(97, 225, 251, 1)',
            data: statsByDate_listens,
          },
        ],
      },
    });
  }

  compileUserList(statsByUserArr) {
    const userArr = Array(statsByUserArr.length);

    const promises = statsByUserArr.map((user, i) => {
      return firebase
        .database()
        .ref(`users/${user.userId}`)
        .once('value')
        .then(snapshot => {
          userArr[i] = {
            ...user,
            firstName: snapshot.val().firstName,
            lastName: snapshot.val().lastName,
            pic_url: snapshot.val().pic_url,
          };
        })
        .then(res => res, err => console.log(err));
    });

    Promise.all(promises).then(
      res => {
        this.setState({
          userArr,
        });
      },
      err => {
        console.log('promise error: ', err);
      }
    );
  }

  compileEpisodeList(statsByEpisodeArr) {
    const episodeArr = Array(statsByEpisodeArr.length);
    const promises = statsByEpisodeArr.map((episode, i) => {
      firebase
        .database()
        .ref(`episodes/${episode.episodeId}`)
        .once('value')
        .then(snapshot => {
          episodeArr[i] = {
            ...episode,
            title: snapshot.val().title,
            date_created: new Date(1000 * snapshot.val().date_created).toISOString().slice(0, 10),
          };
        })
        .then(res => res, err => console.log(err));
    });

    Promise.all(promises).then(
      res => {
        this.setState({
          episodeArr,
        });
      },
      err => {
        console.log('promise error: ', err);
      }
    );
  }

  changeSoundcastId(e) {
    this.setState({
      currentSoundcastID: e.target.value,
    });

    const { soundcasts_managed, currentSoundcastID } = this.state;
    let currentSoundcast;

    soundcasts_managed.forEach(soundcast => {
      if (soundcast.id == e.target.value) {
        currentSoundcast = soundcast;
      }
    });

    this.setState({
      currentSoundcast,
    });
    this.getListeningStats(e.target.value);
  }

  render() {
    const { soundcasts_managed, data, currentSoundcastID, modalOpen } = this.state;
    const that = this;
    return (
      <div className="padding-30px-tb">
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
              Upgrade to view analytics
            </div>
            <div className="title-small" style={{ margin: 25 }}>
              Listening analytics is available on PLUS and PRO plans. Please upgrade to access the
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
        <div className="padding-bottom-20px">
          <div className="row" style={{ marginLeft: 10 }}>
            <span className="title-medium ">Analytics</span>
            <div className="" style={styles.soundcastSelectWrapper}>
              <select
                style={styles.soundcastSelect}
                onChange={e => {
                  this.changeSoundcastId(e);
                }}
                value={currentSoundcastID}
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
          </div>
          <div className="row" style={{ marginRight: 25, marginLeft: 5 }}>
            <div className="col-md-12" style={styles.chartWrapper}>
              <Bar
                data={data}
                width={100}
                height={450}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    xAxes: [
                      {
                        gridLines: {
                          display: false,
                        },
                      },
                    ],
                  },
                }}
              />
            </div>
          </div>
          <div className="row" style={{ marginLeft: 5, marginRight: 5 }}>
            <div className="col-md-6 col-sm-12 col-xs-12" style={{ ...styles.tableWrapper }}>
              <div style={styles.sectionTitleWrapper}>TOP EPISODES</div>
              <table className="table">
                <thead>
                  <tr style={styles.tr}>
                    <th style={{ ...styles.th }}>TITLE</th>
                    <th style={{ ...styles.th }}>PUBLISHED ON</th>
                    <th style={{ ...styles.th }}>TOTAL LISTENS</th>
                    <th style={{ ...styles.th }}>AVE. DURATION (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.episodeArr.map((episode, i) => {
                    const ave_duration = Math.floor(episode.length / episode.listens / 60);
                    return (
                      <tr key={i} style={styles.tr}>
                        <td style={{ ...styles.td }}>{`${episode.title}`}</td>
                        <td style={{ ...styles.td }}>{episode.date_created}</td>
                        <td style={{ ...styles.td }}>{episode.listens}</td>
                        <td style={{ ...styles.td }}>{ave_duration}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              className="col-md-5 col-sm-12 col-xs-12"
              style={{ ...styles.tableWrapper, marginLeft: 20 }}
            >
              <div style={styles.sectionTitleWrapper}>TOP SUBSCRIBERS</div>
              <table className="table">
                <thead>
                  <tr style={styles.tr}>
                    <th style={{ ...styles.th, width: '10%' }} />
                    <th style={{ ...styles.th, width: '40%' }}>NAME</th>
                    <th style={{ ...styles.th, width: '25%' }}># OF LISTENS</th>
                    <th style={{ ...styles.th, width: '25%' }}>TOTAL MINUTES</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.userArr.map((user, i) => {
                    return (
                      <tr key={i} style={styles.tr}>
                        <td style={{ ...styles.td, width: '10%' }}>
                          <div
                            style={{
                              ...styles.userImage,
                              backgroundImage: `url(${user.pic_url})`,
                            }}
                          />
                        </td>
                        <td style={{ ...styles.td, width: '40%' }}>{`${user.firstName} ${
                          user.lastName
                        }`}</td>
                        <td style={{ ...styles.td, width: '25%' }}>{user.listens}</td>
                        <td style={{ ...styles.td, width: '25%' }}>
                          {Math.floor(user.length / 60)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  soundcastSelectWrapper: {
    height: 40,
    width: 300,
    marginTop: 0,
    marginLeft: 30,
    marginRight: 30,
    display: 'inline-block',
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
  sectionTitleWrapper: {
    marginBottom: 10,
    paddingBottom: 5,
    fontSize: 16,
    fontWeight: 600,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBorder,
    borderBottomStyle: 'solid',
  },
  option: {
    fontSize: 16,
  },
  chartWrapper: {
    backgroundColor: Colors.mainWhite,
    marginTop: 20,
    marginLeft: 5,
    marginRight: 5,
    padding: 20,
  },
  tableWrapper: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    padding: 20,
    display: 'inline-block',
    backgroundColor: Colors.mainWhite,
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 14,
    color: Colors.fontGrey,
    height: 35,
    fontWeight: 'regular',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
  td: {
    color: Colors.softBlack,
    fontSize: 14,
    height: 45,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    // whiteSpace: 'nowrap',
    wordWrap: 'break-word',
  },
  userImage: {
    width: 26,
    height: 26,
    float: 'left',
    marginLeft: 10,
    marginRight: 5,
    borderRadius: '50%',
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
};
