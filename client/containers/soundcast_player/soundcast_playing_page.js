import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import firebase from 'firebase';
import moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Axios from 'axios';
import Footer from '../../components/footer';
import { SoundwiseHeader } from '../../components/soundwise_header';
import PageHeader from '../soundcast_landing_page/components/page_header';
import AudioPlayer from 'react-responsive-audio-player';
import { getTime_mmss } from '../../helpers/formatTime';
import EpisodePreview from './components/episode_preview';

class _SoundcastPlayingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      soundcast: {},
      soundcastID: '',
      noAccess: false,
      playlist: [],
      episodes: [],
      likedEpisodes: [],
      currentEpisode: null,
      playing: false,
      paused: true,
      playerLaunched: false,
      startPosition: 0,
      endPosition: 0,
      userID: null,
    };
    this.audio = null;
    this.handlePlayClicked = this.handlePlayClicked.bind(this);
  }

  componentDidMount() {
    const that = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        that.setState({
          userID: user.uid,
        });
        if (that.props.userInfo.firstName) {
          that.setState({
            userInfo: that.props.userInfo,
          });

          that.loadSoundcast(that.props, user.uid);
        }
      } else {
        that.props.history.push('/signin');
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.loadSoundcast(nextProps, this.state.userID);
  }

  setLikedEpisodes(userId, soundcastId) {
    const that = this;
    console.log(`User ID ${userId}, SoundcastID ${soundcastId}`);
    const response = Axios.get('/api/likes', {
      filter: { where: { userId, soundcastId } },
    })
      .then(res => {
        let likedEpisodes = res.data;
        likedEpisodes = likedEpisodes.map((like, index) => {
          return like.episodeId;
        });
        console.log('Response');
        console.log(likedEpisodes);
        that.setState({ likedEpisodes });
      })
      .catch(e => console.log('Failed to load episodes likes', e));
  }

  loadSoundcast(props, userID) {
    const that = this;
    const soundcastID = props.match.params.soundcastId;
    const { userInfo, history } = props;
    firebase
      .database()
      .ref(`users/${userID}/soundcasts/${soundcastID}`)
      .once('value')
      .then(snapshot => {
        if (snapshot.val().current_period_end < moment().format('X')) {
          that.setState({
            noAccess: true,
          });
        } else {
          if (props.userInfo.firstName) {
            if (props.userInfo.soundcasts) {
              if (typeof userInfo.soundcasts[soundcastID] == 'object') {
                if (userInfo.soundcasts[soundcastID].title) {
                  that.setState({
                    soundcast: userInfo.soundcasts[soundcastID],
                    soundcastID,
                    noAccess: false,
                  });
                  that.setEpisodes(userInfo.soundcasts[soundcastID]);
                }
              } else if (
                userInfo.soundcasts[soundcastID] == true &&
                typeof userInfo.soundcasts_managed[soundcastID] == 'object'
              ) {
                this.setState({
                  soundcast: userInfo.soundcasts_managed[soundcastID],
                  soundcastID,
                  noAccess: false,
                });
                this.setEpisodes(userInfo.soundcasts_managed[soundcastID]);
              } else {
                this.setState({
                  noAccess: true,
                });
              }
            } else {
              this.setState({
                noAccess: true,
              });
            }
          }
        }
      });
    this.setLikedEpisodes(userID, soundcastID);
  }

  setEpisodes(soundcast) {
    const episodes = [];
    let episode;
    for (var key in soundcast.episodes) {
      if (
        typeof soundcast.episodes[key] == 'object' &&
        soundcast.episodes[key].title &&
        soundcast.episodes[key].isPublished
      ) {
        episode = soundcast.episodes[key];
        episode.id = key;
        episodes.push(episode);
      }
      episodes.sort((a, b) => {
        return b.index - a.index;
      });
      this.setState({
        episodes,
      });
    }
  }

  sendToDatabase(event, currentEpisode) {
    const { soundcastID, soundcast, startPosition, userID } = this.state;
    const _date = moment().format('YYYY-MM-DD');
    let totalListens = currentEpisode.totalListens ? currentEpisode.totalListens : 0;
    firebase
      .database()
      .ref(`episodes/${currentEpisode.id}/totalListens`)
      .set(totalListens + 1);

    if (event == 'pause') {
      this.setState({
        endPosition: this.audio.currentTime,
      });
    } else if (event == 'ended') {
      this.setState({
        endPosition: this.audio.duration,
      });
    }

    const listeningSession = {
      soundcastId: soundcastID,
      publisherId: soundcast.publisherID,
      episodeId: currentEpisode.id,
      userId: userID,
      date: _date,
      startPosition: Math.floor(startPosition),
      endPosition: Math.floor(
        this.state.endPosition >= startPosition ? this.state.endPosition : startPosition
      ),
      percentCompleted: Math.round((this.state.endPosition / this.audio.duration) * 100 || 100),
      sessionDuration: this.state.endPosition - startPosition,
      createdAt: _date,
      updatedAt: _date,
    };

    if (this.state.endPosition - startPosition > 0) {
      // save only with positive duration
      Axios.post('/api/listening_session', listeningSession)
        .then(res => {
          // console.log('success save listeningSessions: ', res)
        })
        .catch(err => console.log(err));
    }
  }

  getTime_hoursMins(seconds) {
    if (seconds > 0) {
      const _hours = Math.floor(seconds / 3600);
      const _minutes = Math.floor((seconds - _hours * 3600) / 60);
      return `${(_hours && `${_hours} hour`) || ''}${(_hours > 1 && 's') || ''} ${(_minutes < 10 &&
        `0${_minutes} min`) ||
        `${_minutes} min`}${(_minutes > 1 && 's') || ''}`;
    } else {
      return '0 mins';
    }
  }

  recordPlaying() {
    const { startPosition } = this.state;
    if (this.audio) {
      this.setState({
        startPosition: this.audio.currentTime,
        playing: true,
        paused: false,
      });
    }
  }

  handlePlayClicked(episode) {
    const that = this;
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (this.state.playing) {
      this.audio.pause();
      this.setState({
        playing: false,
        paused: true,
        endPosition: this.audio.currentTime,
      });
      this.sendToDatabase('pause', this.state.currentEpisode);
    }
    const startingIndex = this.state.episodes.indexOf(episode);
    this.setState({
      playlist: [
        {
          url: episode.url,
          displayText: episode.title,
        },
      ],
      currentEpisode: episode,
    });
    this.audio.preload = 'auto';
    this.audio.src = episode.url;
    if (iOS) {
      // canplay event is not supported on iOS devices
      this.audio.play();
      this.setState({
        playing: true,
        paused: false,
        playerLaunched: true,
      });
    } else {
      this.audio.oncanplay = () => {
        console.log('soundcast_playing_page: canplay callback');
        that.audio.play();
        that.setState({
          playing: true,
          paused: false,
          playerLaunched: true,
        });
      };
    }
  }

  handleEpisodeEnd() {
    const currentIndex = this.state.currentEpisode.index;
    this.sendToDatabase('ended', this.state.currentEpisode);
    const that = this;
    this.setState({
      playing: false,
      paused: true,
    });
    if (currentIndex == 0) {
      // reached the last episode in soundcast
      return;
    } else {
      this.state.episodes.forEach(episode => {
        if (episode.index == currentIndex - 1) {
          that.handlePlayClicked(episode);
        }
      });
    }
  }

  handlePause() {
    this.sendToDatabase('pause', this.state.currentEpisode);
    this.setState({
      playing: false,
      paused: true,
    });
  }

  render() {
    const that = this;
    console.log('Render soundcast');
    console.log(this.state);
    const {
      soundcast,
      soundcastID,
      noAccess,
      playlist,
      episodes,
      currentEpisode,
      playing,
      paused,
      playerLaunched,
    } = this.state;
    return (
      <div>
        <SoundwiseHeader />
        {(noAccess && (
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                  Oops, it looks like you don't have access to this page :(
                </h2>
              </div>
            </div>
          </div>
        )) || (
          <section
            className="padding-40px-tb bg-white builder-bg xs-padding-60px-tb"
            id="feature-section14"
          >
            <MuiThemeProvider>
              <div className="container ">
                <div className="">
                  <div
                    className=" col-md-12 col-sm-12 col-xs-12 text-center"
                    style={{ paddingBottom: 30, textAlign: 'center' }}
                  >
                    <div className="col-md-offset-2 col-md-2 col-sm-3 col-xs-12 margin-three-bottom">
                      <img src={soundcast.imageURL} alt={soundcast.title} style={{}} />
                    </div>
                    <div className="col-md-6 col-sm-7 col-xs-12">
                      <h2 className="title-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray  tz-text">
                        {soundcast.title}
                      </h2>
                    </div>
                  </div>
                  <div
                    className="col-md-12"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 20,
                    }}
                  >
                    <div className="list-group col-md-12">
                      {(episodes.length > 0 &&
                        episodes.map((episode, i) => {
                          const liked = this.state.likedEpisodes.includes(episode.id);
                          console.log('Liked episodes', this.state.likedEpisodes);
                          console.log('Episode id', episode.id);
                          // console.log(`Episode ${episode.id} liked ${liked}`);
                          return (
                            <EpisodePreview
                              key={i}
                              episode={episode}
                              liked={liked}
                              userInfo={this.state.userInfo}
                              userID={this.state.userID}
                              handlePlayClicked={this.handlePlayClicked}
                              currentEpisode={currentEpisode}
                              playing={playing}
                              paused={paused}
                              soundcast={soundcast}
                              soundcastID={soundcastID}
                            />
                          );
                        })) ||
                        null}
                    </div>
                  </div>
                </div>
              </div>
            </MuiThemeProvider>
          </section>
        )}
        <AudioPlayer
          playlist={playlist}
          audioElementRef={elem => (that.audio = elem)}
          hideBackSkip={true}
          hideForwardSkip={true}
          onMediaEvent={{
            play: this.recordPlaying.bind(this),
            pause: this.handlePause.bind(this),
            ended: this.handleEpisodeEnd.bind(this),
          }}
          style={{
            display: playerLaunched ? '' : 'none',
            width: '100%',
            bottom: 0,
            position: 'fixed',
            zIndex: 1000,
          }}
        />
        <div
          style={{
            bottom: 0,
            width: '100%',
            position: episodes.length > 0 ? 'static' : 'absolute',
          }}
        >
          <Footer soundcastID={soundcastID} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  return { userInfo, isLoggedIn };
};

export const SoundcastPlayingPage = connect(
  mapStateToProps,
  null
)(_SoundcastPlayingPage);
