import React, { Component } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Levels from 'react-activity/lib/Levels';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class LessonPlayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      isInitialized: false,
    };

    this.interval = null;
    this.references = {};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isPlaying === false && this.state.isPlaying) {
      this.handlePlayOrPause();
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.references.audio.addEventListener('ended', () => {
        this.setState({
          isPlaying: false,
          isInitialized: false,
        });
      });
    }, 1000);
  }

  handlePlayOrPause() {
    const that = this;
    const { audio, audioSource } = this.references;
    if (this.state.isPlaying) {
      audio.pause();

      this.setState({
        isPlaying: false,
      });

      clearInterval(this.interval);
    } else {
      this.props.playingCb(this.props.section.section_id); // call this method for all lesson_players who is playing
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

  render() {
    const { section, showDialogCb } = this.props;
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
    if (section.preview) {
      if (isPlaying) {
        iconClass = 'fa-pause-circle';
      } else {
        iconClass = 'fa-play-circle';
      }
    } else {
      iconClass = 'fa-play-circle-o';
    }

    return (
      <div
        onClick={(section.preview && this.handlePlayOrPause.bind(this)) || showDialogCb}
        style={styles.wrapper}
      >
        <audio preload="auto" ref={audio => (this.references.audio = audio)}>
          <source
            src={section.section_url}
            ref={audioSource => (this.references.audioSource = audioSource)}
          />
        </audio>
        <Card key={this.props.index}>
          <div style={{ paddingLeft: '20px' }} className="table-row">
            <i
              className={`fa ${iconClass} table-cell`}
              style={{
                fontSize: '38px',
                color: (section.preview && '#61E1FB') || '#ccc',
              }}
              aria-hidden="true"
            />
            <CardHeader
              title={`Lesson ${section.section_number}: ${section.title}`}
              style={styles.sectionTitle}
              className="table-cell"
            />
            {(isPlaying && (
              <div style={styles.timer}>
                <Levels color="#F76B1C" size={12} speed={1} />
                <span style={{ paddingLeft: '0.5em' }}>{`${remainingMin}:${remaingingSec}`}</span>
              </div>
            )) || (
              <div style={styles.timer}>
                <span style={{ paddingLeft: '0.5em' }}>{section.run_time}</span>
              </div>
            )}
          </div>
          {section.content && <CardText>{section.content}</CardText>}
        </Card>
      </div>
    );
  }
}

// LessonPlayer.propTypes = {
//     index: PropTypes.number,
//     section: PropTypes.object,
//     showDialogCb: PropTypes.func,
//     playingCb: PropTypes.func,
//     isPlaying: PropTypes.bool,
// };

const styles = {
  sectionTitle: {
    fontSize: '32px',
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
  },
};
