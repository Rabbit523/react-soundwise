import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';
import firebase from 'firebase';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import { Bar } from 'react-chartjs-2';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Link } from 'react-router-dom';

import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import { inviteListeners } from '../../../helpers/invite_listeners';
import { getDateArray } from '../../../helpers/get_date_array';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';

export default class EpisodeStatsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: '2017-01-01',
      endDate: new Date().toISOString().slice(0, 10),
      listenersArr: [],
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
    };

    this.getListeningStats = this.getListeningStats.bind(this);
  }

  componentDidMount() {
    if (this.props.episode) {
      const { id } = this.props.episode;
      this.getListeningStats(id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.episode) {
      const { id } = nextProps.episode;
      this.getListeningStats(id);
    }
  }

  closeModal() {
    this.props.onClose();
  }

  getListeningStats(episodeId) {
    Axios.get('/api/stats_by_episode', {
      params: {
        episodeId,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
      },
    }).then(res => {
      this.countListenings(res.data);
    });
  }

  countListenings(rawDataArr) {
    const labels = getDateArray(this.state.startDate, this.state.endDate, 1);
    const listeners = [];
    const statsByDate = Array(labels.length).fill({
      listens: 0,
      length: 0,
    });
    rawDataArr.forEach(session => {
      //calculate listeners
      if (listeners.indexOf(session.userId) == -1) {
        listeners.push(session.userId);
      }

      //calculate stats by date
      const { listens, length } = statsByDate[labels.indexOf(session.date)];
      statsByDate[labels.indexOf(session.date)] = {
        listens: listens + 1,
        length: length + session.sessionDuration,
      };
    });

    const statsByDate_listens = statsByDate.map(obj => {
      if (obj.listens == undefined) {
        return obj;
      } else {
        return obj.listens;
      }
    });

    this.fetchListenersInfo(listeners);

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

  fetchListenersInfo(listeners) {
    const listenersArr = Array(listeners.length);
    const promises = listeners.map((listener, i) => {
      return firebase
        .database()
        .ref(`users/${listener}`)
        .once('value')
        .then(snapshot => {
          listenersArr[i] = {
            firstName: snapshot.val().firstName,
            lastName: snapshot.val().lastName,
            pic_url: snapshot.val().pic_url,
            id: listener,
          };
        })
        .then(res => res, err => console.log(err));
    });

    Promise.all(promises).then(
      res => {
        this.setState({
          listenersArr,
        });
      },
      err => {
        console.log('promise error: ', err);
      }
    );
  }

  render() {
    const { data, listenersArr } = this.state;
    if (!this.props.isShown) {
      return null;
    }

    return (
      <div>
        <div style={styles.backDrop} onClick={this.closeModal.bind(this)} />
        <div style={styles.modal}>
          <div className="row">
            <div className="title-medium" style={styles.headingText}>
              {`Listener Stats: ${this.props.episode.title}`}
            </div>
            <div style={styles.closeButtonWrap}>
              <div style={{ cursor: 'pointer' }} onClick={this.closeModal.bind(this)}>
                <i className="fa fa-times fa-2x" style={{ color: 'red' }} />
              </div>
            </div>
          </div>
          <div style={styles.chartWrapper}>
            <Bar
              data={data}
              width={100}
              height={300}
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
          <div style={{ margin: 20 }}>
            <div className="title-small" style={{ marginBottom: 5 }}>
              Listeners
            </div>
            {listenersArr.map((listener, i) => {
              let pic_url;
              if (listener.pic_url) {
                pic_url = listener.pic_url;
              } else {
                pic_url = '../../../images/profile_pic.png';
              }
              return (
                <div style={{ display: 'inline-block', margin: 4 }} key={i}>
                  <MuiThemeProvider key={i}>
                    <Chip key={i} style={styles.chip}>
                      <Avatar src={pic_url} style={styles.userImage} />
                      {`${listener.firstName} ${listener.lastName}`}
                    </Chip>
                  </MuiThemeProvider>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  backDrop: { ...commonStyles.backDrop },
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '75%',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999',
    background: '#fff',
    margin: 20,
  },
  headingText: {
    width: '89%',
    margin: 20,
    paddingLeft: 20,
    float: 'left',
    display: 'inline-block',
  },
  closeButtonWrap: {
    display: 'inline-block',
    float: 'right',
    cursor: 'pointer',
  },
  titleText: {
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 20,
  },
  closeButtonWrap: {
    marginTop: 20,
  },
  button: {
    height: 35,
    display: 'inline-block',
    float: 'right',
    borderRadius: 23,
    overflow: 'hidden',
    // margin: '40px auto',
    fontSize: 14,
    letterSpacing: 2.5,
    wordSpacing: 5,
    marginRight: 20,
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
  },
  chartWrapper: {
    backgroundColor: Colors.mainWhite,
    // marginTop: 20,
    padding: 20,
  },
  chip: {
    // margin: 4,
    display: 'inline-block',
  },
  submitButton: {
    backgroundColor: Colors.mainOrange,
    color: Colors.mainWhite,
    borderColor: Colors.mainOrange,
  },
  userImage: {
    // width: 26,
    // height: 26,
    // float: 'left',
    // marginLeft: 10,
    // borderRadius: '50%',
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
};
