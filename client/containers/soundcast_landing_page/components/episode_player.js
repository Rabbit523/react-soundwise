import React, { Component } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Levels from 'react-activity/lib/Levels';
import PropTypes from 'prop-types';
import moment from 'moment';

import { getTime_mmss } from '../../../helpers/formatTime';

export default class EpisodePlayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      isInitialized: false,
    };

    this.interval = null;
    // this.references = {};
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.playingEpisode == this.props.episode &&
      nextProps.playingEpisode !== this.props.episode &&
      this.state.isPlaying
    ) {
      this.handlePlayOrPause(true);
    }
    if (nextProps.references.audio && !this.props.references.audio) {
      setTimeout(() => {
        nextProps.references.audio.addEventListener('ended', () => {
          this.setState({
            isPlaying: false,
            isInitialized: false,
          });
        });
      }, 1000);
    }
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.props.references.audio) {
        this.props.references.audio.addEventListener('ended', () => {
          this.setState({
            isPlaying: false,
            isInitialized: false,
          });
        });
      }
    }, 1000);
  }

  handlePlayOrPause(episodeChanged) {
    console.log('changed: ', episodeChanged);
    const that = this;
    const { playingEpisode, episode } = this.props;
    const { audio, audioSource } = this.props.references;
    if (this.state.isPlaying && !episodeChanged) {
      audio.pause();
      audio.currentTime = 0;
      this.setState({
        isPlaying: false,
        isInitialized: false,
        duration: 0,
        currentTime: 0,
      });

      clearInterval(this.interval);
    } else if (this.state.isPlaying && episodeChanged) {
      this.setState({
        isPlaying: false,
        isInitialized: false,
        duration: 0,
        currentTime: 0,
      });
      // audio.pause();
      clearInterval(this.interval);
    } else if (!this.state.isPlaying) {
      this.props.playingCb(this.props.episode); // call this method for all lesson_players who is playing
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        audioSource.src = this.props.episode.url;
      }
      if (this.state.isInitialized && audioSource.src) {
        audio.play();
      } else {
        audio.load();
        audio.play();
        this.setState({
          isInitialized: true,
        });
      }

      this.setState({
        isPlaying: true,
        duration: audio.duration,
      });

      this.interval = setInterval(() => {
        that.setState({
          currentTime: audio.currentTime,
          duration: audio.duration,
        });
      }, 1000);
    }
  }

  showAlert() {
    alert('You need to purchase this soundcast first to listen to this part.');
  }

  render() {
    const { episode, showDialogCb } = this.props;
    const { duration, currentTime, isPlaying } = this.state;
    const remainingTime = duration - currentTime;
    let remainingMin = remainingTime > 0 ? Math.floor(remainingTime / 60) : '00';
    let remaingingSec = remainingTime > 0 ? Math.floor(remainingTime % 60) : '00';
    remainingMin = moment()
      .minutes(remainingMin)
      .format('mm');
    remaingingSec = moment()
      .seconds(remaingingSec)
      .format('ss');
    let iconClass = '';
    if (episode.publicEpisode) {
      if (isPlaying && this.props.isPlaying) {
        iconClass = 'pause_circle_filled';
      } else {
        iconClass = 'play_circle_filled';
      }
    } else {
      iconClass = 'play_circle_outline';
    }

    return (
      <tr
        onClick={
          (episode.publicEpisode && this.handlePlayOrPause.bind(this, null)) ||
          this.showAlert.bind(this)
        }
        style={styles.wrapper}
      >
        <td>
          <i
            className={`material-icons table-cell`}
            style={{
              fontSize: '38px',
              color: (episode.publicEpisode && '#61E1FB') || '#ccc',
            }}
            aria-hidden="true"
          >
            {iconClass}
          </i>
        </td>
        <td style={{ verticalAlign: 'middle' }}>
          <span style={styles.sectionTitle}>{episode.title}</span>
        </td>
        <td style={{ verticalAlign: 'middle' }}>
          {(isPlaying && this.props.isPlaying && (
            <span>
              <Levels color="#F76B1C" size={12} speed={1} />
              <span style={{ paddingLeft: '0.5em', fontSize: 16 }}>
                {`${remainingMin}:${remaingingSec}`}
              </span>
            </span>
          )) || (
            <span style={{ paddingLeft: '0.5em', fontSize: 16 }}>
              {getTime_mmss(episode.duration)}
            </span>
          )}
        </td>
      </tr>
    );
  }
}

EpisodePlayer.propTypes = {
  index: PropTypes.number,
  episode: PropTypes.object,
  showDialogCb: PropTypes.func,
  playingCb: PropTypes.func,
  isPlaying: PropTypes.bool,
};

const styles = {
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
  },
  timer: {
    position: 'absolute',
    top: '0',
    bottom: '0',
    right: '15px',
    margin: 'auto 0',
    display: 'inline-table',
  },
  wrapper: {
    position: 'relative',
    cursor: 'pointer',
  },
};
