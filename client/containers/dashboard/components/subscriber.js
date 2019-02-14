import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Bar } from 'react-chartjs-2';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import { getDateArray } from '../../../helpers/get_date_array';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';

export default class Subscriber extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment()
        .subtract(3, 'months')
        .format()
        .slice(0, 10),
      endDate: moment()
        .format()
        .slice(0, 10),
      episodes: {},
      soundcastArr: [],
      minutesToday: 0,
      minutesThisMonth: 0,
      minutesAllTime: 0,
      data: {
        labels: [],
        datasets: [
          {
            label: 'Total minutes listened',
            backgroundColor: 'rgba(97, 225, 251, 0.2)',
            borderColor: 'rgba(97, 225, 251, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(97, 225, 251, 0.4)',
            hoverBorderColor: 'rgba(97, 225, 251, 1)',
            data: [],
          },
        ],
      },
    };
    this.getListeningStats = this.getListeningStats.bind(this);
  }

  componentDidMount() {
    const { subscriber, soundcast } = this.props.history.location.state;
    this.getListeningStats(subscriber.id, soundcast.publisherID);
  }

  getListeningStats(userId, publisherId) {
    Axios.get(
      `/api/stats_by_user_publisher?userId=${userId}&publisherId=${publisherId}&startDate='${
        this.state.startDate
      }'&endDate='${this.state.endDate}'`
    ).then(res => {
      this.countListenings(res.data);
    });
  }

  countListenings(rawDataArr) {
    const labels = getDateArray(this.state.startDate, this.state.endDate, 1);
    let episodes = {};
    const statsByDate = Array(labels.length).fill({
      listens: 0,
      length: 0,
    });
    rawDataArr.forEach(session => {
      //calculate episodes
      if (!episodes[session.episodeId]) {
        episodes[session.episodeId] = {
          soundcastId: session.soundcastId,
          date: session.date,
          percentCompleted: session.percentCompleted,
        };
      } else if (episodes[session.episodeId]) {
        const { date, percentCompleted } = episodes[session.episodeId];
        episodes[session.episodeId] = {
          soundcastId: session.soundcastId,
          date: date >= session.date ? date : session.date,
          percentCompleted: Math.max(percentCompleted, session.percentCompleted),
        };
      }

      //calculate stats by date
      const { listens, length } = statsByDate[labels.indexOf(session.date)];
      statsByDate[labels.indexOf(session.date)] = {
        listens: listens + 1,
        length: length + session.sessionDuration,
      };
    });

    let minutesAllTime = 0;
    let minutesThisMonth = 0;
    const dayOfMonth = new Date().getDate();

    let statsByDate_length = statsByDate.map((obj, i) => {
      if (obj.listens == undefined) {
        return obj;
      } else {
        minutesAllTime += Math.floor(obj.length / 60);
        if (i > statsByDate.length - 1 - dayOfMonth) {
          minutesThisMonth += Math.floor(obj.length / 60);
        }
        return Math.floor(obj.length / 60);
      }
    });

    this.setState({
      minutesToday: statsByDate_length[statsByDate_length.length - 1],
      minutesAllTime,
      minutesThisMonth,
      episodes,
      data: {
        labels,
        datasets: [
          {
            label: 'Total minutes listened',
            backgroundColor: 'rgba(97, 225, 251, 0.2)',
            borderColor: 'rgba(97, 225, 251, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(97, 225, 251, 0.4)',
            hoverBorderColor: 'rgba(97, 225, 251, 1)',
            data: statsByDate_length,
          },
        ],
      },
    });

    this.compileEpisodeList(this.state.episodes);
  }

  compileEpisodeList(episodes) {
    const that = this;
    const { subscriber } = this.props.history.location.state;
    const { userInfo } = this.props;
    const soundcastIDs = Object.keys(subscriber.soundcasts);
    let soundcastObj = {};
    let episodeArr = [];

    const promises1 = soundcastIDs.map(id => {
      return firebase
        .database()
        .ref(`soundcasts/${id}`)
        .once('value')
        .then(snapshot => {
          if (userInfo.publisherID == snapshot.val().publisherID) {
            //make sure admin only sees the user's soundcasts from the current publisher
            soundcastObj[id] = {
              title: snapshot.val().title,
              episodes: {},
            };
            if (snapshot.val().episodes) {
              const episodeIds = Object.keys(snapshot.val().episodes);
              episodeArr = episodeArr.concat(episodeIds);
            }
          } else {
            soundcastObj = soundcastObj;
          }
        })
        .then(res => res, err => console.log(err));
    });
    // promises1.push(124);

    Promise.all(promises1).then(
      res => {
        const promises2 = episodeArr.map(episodeId => {
          return firebase
            .database()
            .ref(`episodes/${episodeId}`)
            .once('value')
            .then(snapshot => {
              const soundcastId = snapshot.val().soundcastID;
              soundcastObj[soundcastId].episodes[episodeId] = {
                title: snapshot.val().title,
                date_created: snapshot.val().date_created,
                percentCompleted: 0,
                lastListen: '',
                episodeId,
              };
            })
            .then(res => res, err => console.log(err));
        });
        Promise.all(promises2).then(
          res => {
            that.matchEpisodes(soundcastObj, that.state.episodes);
          },
          err => {
            console.log('promise error: ', err);
          }
        );
      },
      err => {
        console.log('promise error: ', err);
      }
    );
  }

  matchEpisodes(soundcastObj, episodes) {
    for (var id in episodes) {
      if (soundcastObj[episodes[id].soundcastId]['episodes'][id]) {
        soundcastObj[episodes[id].soundcastId]['episodes'][id]['percentCompleted'] =
          episodes[id].percentCompleted;
        soundcastObj[episodes[id].soundcastId]['episodes'][id]['lastListen'] = episodes[id].date;
      }
    }
    for (var id in soundcastObj) {
      soundcastObj[id].episodeArr = Object.values(soundcastObj[id].episodes);
    }
    const soundcastArr = Object.values(soundcastObj);

    this.setState({
      soundcastArr,
    });
  }

  render() {
    const { data, soundcastArr, minutesToday, minutesThisMonth, minutesAllTime } = this.state;
    const { subscriber } = this.props.history.location.state;

    return (
      <div className="padding-30px-tb">
        <div>
          <div className="padding-bottom-20px">
            <span className="title-medium ">Subscriber Stats</span>
          </div>
          <div style={styles.userWrapper}>
            <div
              style={{
                ...styles.userImage,
                backgroundImage: `url(${subscriber.pic_url})`,
              }}
            />
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {`${subscriber.firstName} ${subscriber.lastName}`}
            </div>
          </div>
          <div
            style={{
              marginTop: 20,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={{ marginBottom: 10, display: 'inline-block' }}>
              <span style={styles.statsTitle}>Today: </span>
              <span style={styles.statsText}>{`${minutesToday} minutes`}</span>
            </div>
            <div style={styles.verticalLine} />
            <div style={{ marginBottom: 10, display: 'inline-block' }}>
              <span style={styles.statsTitle}>This month: </span>
              <span style={styles.statsText}>{`${minutesThisMonth} minutes`}</span>
            </div>
            <div style={styles.verticalLine} />
            <div style={{ marginBottom: 10, display: 'inline-block' }}>
              <span style={styles.statsTitle}>All time: </span>
              <span style={styles.statsText}>{`${minutesAllTime} minutes`}</span>
            </div>
          </div>
          <div style={styles.chartWrapper}>
            <Bar
              data={data}
              width={100}
              height={400}
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
          <div>
            <div style={{ marginTop: 25, marginBottom: 15 }}>
              <span className="title-small">Subscriptions</span>
            </div>
            {soundcastArr.map((soundcast, i) => {
              return (
                <MuiThemeProvider key={i}>
                  <Card key={i}>
                    <CardHeader
                      title={soundcast.title}
                      actAsExpander={true}
                      showExpandableButton={true}
                    />
                    <CardText expandable={true}>
                      <div style={{ marginLeft: 30, marginRight: 30 }}>
                        <table>
                          <tr style={styles.tr}>
                            <th style={{ ...styles.th, width: 500 }}>EPISODE</th>
                            <th style={{ ...styles.th, width: 350 }}>% COMPLETED</th>
                            <th style={{ ...styles.th, width: 300 }}>LAST LISTENED ON</th>
                          </tr>
                          {soundcast.episodeArr.map((episode, i) => {
                            return (
                              <tr key={i} style={styles.tr}>
                                <td style={{ ...styles.td, width: 500 }}>{episode.title}</td>
                                <td style={{ ...styles.td, width: 350 }}>
                                  {episode.percentCompleted}
                                </td>
                                <td style={{ ...styles.td, width: 300 }}>{episode.lastListen}</td>
                              </tr>
                            );
                          })}
                        </table>
                      </div>
                    </CardText>
                  </Card>
                </MuiThemeProvider>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  userWrapper: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartWrapper: {
    backgroundColor: Colors.mainWhite,
    // marginTop: 20,
    padding: 20,
  },
  userImage: {
    width: 45,
    height: 45,
    float: 'left',
    marginRight: 10,
    borderRadius: '50%',
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
  verticalLine: {
    width: 1,
    backgroundColor: 'black',
    // position: 'absolute',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    height: 25,
    display: 'inline-block',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 600,
  },
  statsText: {
    fontSize: 16,
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
    vAlign: 'middle',
  },
  td: {
    color: Colors.fontDarkGrey,
    fontSize: 14,
    height: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
