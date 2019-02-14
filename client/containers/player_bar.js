// ** not in use
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import firebase from 'firebase';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Slider from 'material-ui/Slider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import { setCurrentPlaySection, changePlayStatus, changeSpeed } from '../actions/index';

let player, source;

const styles = {
  flex: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

const muiTheme = getMuiTheme({
  slider: {
    selectionColor: '#F76B1C',
    handleFillColor: '#F76B1C',
  },
});

class _PlayerBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      speed: 1,
    };
    this.handlePlayerClick = this.handlePlayerClick.bind(this);
    this.handleForward = this.handleForward.bind(this);
    this.handleRewind = this.handleRewind.bind(this);
    this.handleSkipForward = this.handleSkipForward.bind(this);
    this.handleSkipBackward = this.handleSkipBackward.bind(this);
    this.handleSpeedChange = this.handleSpeedChange.bind(this);
    this.handleSeek = this.handleSeek.bind(this);
  }

  componentDidMount() {
    player = document.getElementById('audio');
    source = document.getElementById('audioSource');
  }

  togglePlayOrPause() {
    if (!this.props.playing) {
      return (
        <div className="col-md-2 col-sm-2 col-xs-2" style={styles.flex}>
          <a className="" onClick={() => this.handlePlayerClick()}>
            <i className="material-icons" style={{ fontSize: '50px' }}>
              play_arrow
            </i>
          </a>
        </div>
      );
    } else {
      return (
        <div className="col-md-2 col-sm-2 col-xs-2" style={styles.flex}>
          <a className="" onClick={() => this.handlePlayerClick()}>
            <i className="material-icons" style={{ fontSize: '50px' }}>
              pause
            </i>
          </a>
        </div>
      );
    }
  }

  handlePlayerClick() {
    player = document.getElementById('audio');

    if (this.props.playing) {
      player.pause();
      this.props.changePlayStatus(false);

      const userId = firebase.auth().currentUser.uid;

      const playProgress = this.props.currentTime / this.props.currentDuration;
      const sectionId = this.props.currentSection.section_id;

      let updates = {};
      updates[
        '/users/' +
          userId +
          '/courses/' +
          this.props.currentCourse.id +
          '/sectionProgress/' +
          sectionId +
          '/playProgress'
      ] = playProgress;

      // console.log('playProgress: ', playProgress)

      firebase
        .database()
        .ref()
        .update(updates);
    } else {
      player.playbackRate = this.props.speed;
      player.play();
      this.props.changePlayStatus(true);
    }
  }

  handleRewind() {
    const previous = this.props.currentPlaylist.indexOf(this.props.currentSection) - 1;
    if (previous >= 0) {
      this.props.setCurrentPlaySection(this.props.currentPlaylist[previous]);
      source.src = this.props.currentPlaylist[previous].section_url;
      player.load();
      player.playbackRate = this.props.speed;
      player.play();
      this.props.changePlayStatus(true);
    }
  }

  handleForward() {
    const next = this.props.currentPlaylist.indexOf(this.props.currentSection) + 1;
    if (next <= this.props.currentPlaylist.length - 1) {
      this.props.setCurrentPlaySection(this.props.currentPlaylist[next]);
      source.src = this.props.currentPlaylist[next].section_url;
      player.load();
      player.playbackRate = this.props.speed;
      player.play();
      this.props.changePlayStatus(true);
    }
  }

  handleSkipForward() {
    if (this.props.currentTime < this.props.currentDuration - 30) {
      const current = player.currentTime + 30;
      player.currentTime = current;
    } else {
      player.currentTime = this.props.currentDuration;
    }
  }

  handleSkipBackward() {
    if (this.props.currentTime > 30) {
      const current = player.currentTime - 30;
      player.currentTime = current;
    } else {
      player.currentTime = 0;
    }
  }

  handleSpeedChange(event, index, value) {
    this.setState({
      speed: value,
    });
    this.props.changeSpeed(value);
    player.playbackRate = value;
  }

  handleSeek(event, value) {
    const seekTo = (this.props.currentDuration * value) / 100;
    player.currentTime = seekTo;
  }

  render() {
    let currentMin = '__',
      currentSec = '__',
      totalMin = '__',
      totalSec = '__';
    if (this.props.currentTime > 0) {
      currentMin = Math.floor(this.props.currentTime / 60);
      currentSec = Math.floor(this.props.currentTime % 60);
    }

    if (this.props.currentDuration > 1) {
      totalMin = Math.floor(this.props.currentDuration / 60);
      totalSec = Math.floor(this.props.currentDuration % 60);
    }

    const currentPercent = (this.props.currentTime / this.props.currentDuration) * 100;
    const displayed = this.props.playerLaunched ? '' : 'none';

    return (
      <footer
        className="footer bg-info player-bar dker"
        style={{ display: displayed, height: '90px' }}
      >
        <div style={{ width: '100%' }}>
          <MuiThemeProvider muiTheme={muiTheme}>
            <Slider
              value={currentPercent}
              min={0}
              max={100}
              onChange={this.handleSeek}
              sliderStyle={{ margin: '0px', padding: '0px', width: '100%' }}
              style={{ width: '100%' }}
            />
          </MuiThemeProvider>
        </div>
        <div className="container" style={{}}>
          <div className="row " style={styles.flex}>
            <div className="col-md-2 col-sm-2 col-xs-2" style={styles.flex}>
              <DropDownMenu value={this.state.speed} onChange={this.handleSpeedChange}>
                <MenuItem value={0.75} primaryText="0.75x" />
                <MenuItem value={1} primaryText="1x" />
                <MenuItem value={1.25} primaryText="1.25x" />
                <MenuItem value={1.5} primaryText="1.5x" />
                <MenuItem value={2} primaryText="2x" />
              </DropDownMenu>
            </div>
            <div className="col-md-2 col-sm-2 col-xs-2" style={styles.flex}>
              <a className="" onClick={() => this.handleSkipBackward()}>
                <i className="material-icons" style={{ fontSize: '42px' }}>
                  replay_30
                </i>
              </a>
            </div>
            {this.togglePlayOrPause()}
            <div className="col-md-2 col-sm-2 col-xs-2" style={styles.flex}>
              <a className="" onClick={() => this.handleSkipForward()}>
                <i className="material-icons" style={{ fontSize: '42px' }}>
                  forward_30
                </i>
              </a>
            </div>
            <div className="col-md-2 col-sm-2 col-xs-2" style={styles.flex}>
              {`${currentMin}:${currentSec}`}
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setCurrentPlaySection, changePlayStatus, changeSpeed }, dispatch);
}

const mapStateToProps = state => {
  const { isLoggedIn } = state.user;
  const { playerLaunched, speed } = state.setPlayer;
  const { playing, currentSection } = state.setCurrentSection;
  const { currentTime, currentDuration, currentPlaylist, currentCourse } = state.setCourses;
  return {
    isLoggedIn,
    currentSection,
    playing,
    playerLaunched,
    speed,
    currentTime,
    currentDuration,
    currentPlaylist,
    currentCourse,
  };
};

export const PlayerBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(_PlayerBar);

// <div className="hidden-xs hidden-sm">
//   <a className="jp-mute" title="mute"><i className="icon-volume-2"></i></a>
//   <a className="jp-unmute hid" title="unmute"><i className="icon-volume-off"></i></a>
// </div>
// <div className="hidden-xs hidden-sm jp-volume">
//   <div className="jp-volume-bar dk">
//     <div className="jp-volume-bar-value lter"></div>
//   </div>
// </div>
