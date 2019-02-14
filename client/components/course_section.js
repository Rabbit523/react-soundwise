// ** not in use
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import firebase from 'firebase';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import Checkbox from 'material-ui/Checkbox';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import Slider from 'material-ui/Slider';
import Subheader from 'material-ui/Subheader';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import { orange50, greenA200, blue500, grey500, orange500 } from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Levels from 'react-activity/lib/Levels';
import Spinner from 'react-activity/lib/Spinner';
// import CircularProgressbar from 'react-circular-progressbar';
import ProgressLabel from 'react-progress-label';
import PDF from 'react-pdf-js';
import { IoChevronLeft, IoChevronRight } from 'react-icons/lib/io';

import { setCurrentPlaySection, changePlayStatus, launchPlayer } from '../actions/index';

let player = {
  currentTime: 0,
  duration: 1,
};

let source,
  currentTime = 0,
  duration = 1;

const muiTheme = getMuiTheme({
  slider: {
    selectionColor: orange500,
    rippleColor: orange50,
  },
});

const paddingTop = window.innerHeight * 0.8;
const totalWidth = window.innerWidth;
const styles = {
  player: {
    width: '75%',
    maxWidth: 'none',
    bottom: '0%',
    paddingTop: '30%',
  },
  sectionTitle: {
    backgroundColor: orange50,
  },
  playerContainer: {
    bottom: '0%',
    top: '20%',
  },
  playerBackground: {
    backgroundColor: 'transparent',
    color: 'transparent',
  },
  slider: {
    width: totalWidth * 0.5,
    paddingTop: 25,
    selectionColor: orange500,
  },
  sliderBar: {
    selectionColor: orange500,
  },
  label: {
    fontSize: 18,
  },
  navIcon: {
    position: 'absolute',
    top: '50%',
    fontSize: '40px',
  },
};

class _CourseSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openPlayer: false,
      playing: false,
      loading: false,
      currentTime: 0,
      duration: 1,
      cached: false,
      expanded: false,
      expandedItem: '',
      page: 1,
      pages: [],
      mimeType: null,
    };
    this.playFile = this.playFile.bind(this);
    this.handleTap = this.handleTap.bind(this);
    this.renderPlayButton = this.renderPlayButton.bind(this);
    this.handleCacheAudio = this.handleCacheAudio.bind(this);
    this.renderCacheButton = this.renderCacheButton.bind(this);
    this.handleExpand = this.handleExpand.bind(this);
    this.renderCheatsheet = this.renderCheatsheet.bind(this);
    this.renderResources = this.renderResources.bind(this);

    // check mime-type of the file
    const _self = this;
    const xhttp = new XMLHttpRequest();
    xhttp.open('HEAD', this.props.section.notes_url);
    xhttp.onreadystatechange = function() {
      if (this.readyState == this.DONE) {
        _self.setState({ mimeType: this.getResponseHeader('Content-Type') });
      }
    };
    xhttp.send();
  }

  componentDidMount() {
    const that = this;
    player = document.getElementById('audio');
    source = document.getElementById('audioSource');
    if (this.props.currentSection.section_id == this.props.section.section_id) {
      this.setState({
        currentTime: this.props.currentTime,
        duration: this.props.currentDuration,
      });
    }

    // let headers = new Headers()
    // headers.append('access-control-allow-origin', '*')
    // headers.append('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS')
    // headers.append('access-control-allow-headers', 'content-type, accept')
    // headers.append('Content-Type', "audio/mpeg3;audio/x-mpeg-3;video/mpeg;video/x-mpeg;text/xml")

    // let request = new Request(this.props.section.section_url, {headers})

    // fetch(request)
    // .then(response => {
    //   console.log(response.status)
    // })

    if ('caches' in window) {
      caches.open('audio-cache').then(cache => {
        cache.keys().then(keys => {
          keys.forEach(key => {
            // console.log('key: ', key)
            if (key.url === that.props.section.section_url) {
              that.setState({
                cached: true,
              });
            }
          });
        });
      });
    }
  }

  handleTap() {
    if (
      !this.props.playing ||
      (this.props.playing && this.props.currentSection.section_id !== this.props.section.section_id)
    ) {
      this.playFile();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentSection.section_id == this.props.section.section_id) {
      // setTimeout(() => {
      this.setState({
        currentTime: nextProps.currentTime,
        duration: nextProps.currentDuration,
      });
      // }, 1000)
    }
  }

  playFile() {
    const that = this;

    if (!this.props.currentSection.section_id) {
      //if this is the first file being played, i.e. there's no "current section"
      console.log('no current section');
      this.setState({
        loading: true,
      });
      this.props.changePlayStatus(false);
      // console.log(this.props.currentSection)
      source.src = this.props.section.section_url;
      player.load();

      this.props.setCurrentPlaySection(this.props.section);

      const waitingForDataLoad = setInterval(() => {
        //check if player is ready after update
        if (player.readyState === 4) {
          console.log('data loaded');
          player.currentTime =
            that.props.course.sectionProgress[that.props.section.section_id].playProgress *
            player.duration; //jump to the position previously left off

          player.playbackRate = this.props.speed;

          player.play();

          that.props.changePlayStatus(true);
          that.setState({ loading: false });

          if (!that.props.playerLaunched) {
            that.props.launchPlayer(true);
          }
          clearInterval(waitingForDataLoad);
        }
      }, 100);
    } else if (
      this.props.currentSection.section_id &&
      this.props.currentSection.section_id !== this.props.section.section_id
    ) {
      //if another section is the "current section"

      this.setState({
        loading: true,
      });

      if (this.props.playing) {
        //if switching to another section, store the progress data for the current section first
        player.pause();

        const sectionId = this.props.currentSection.section_id;
        const playProgress = this.props.currentTime / this.props.currentDuration;

        let updates = {};

        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            const userId = user.uid;
            updates[
              '/users/' +
                userId +
                '/courses/' +
                that.props.course.id +
                '/sectionProgress/' +
                sectionId +
                '/playProgress'
            ] = playProgress;

            firebase
              .database()
              .ref()
              .update(updates);
          }
        });
      }

      this.props.changePlayStatus(false);

      // console.log(this.props.currentSection)
      source.src = this.props.section.section_url;
      player.load();

      this.props.setCurrentPlaySection(that.props.section);

      const waitingForDataLoad = setInterval(() => {
        //check if player is ready after update
        if (player.readyState === 4) {
          console.log('data loaded');
          player.currentTime =
            that.props.course.sectionProgress[that.props.section.section_id].playProgress *
            player.duration; //jump to the position previously left off

          player.playbackRate = this.props.speed;

          player.play();

          that.props.changePlayStatus(true);
          that.setState({ loading: false });

          if (!that.props.playerLaunched) {
            that.props.launchPlayer(true);
          }
          clearInterval(waitingForDataLoad);
        }
      }, 100);
    } else if (
      this.props.currentSection.section_id === this.props.section.section_id &&
      !this.props.playing
    ) {
      //if this section is the "current section" and it's not playing
      console.log('current section is this section');
      this.setState({
        loading: true,
      });
      // this.props.setCurrentPlaySection(this.props.section)

      // source.src = this.props.section.section_url
      // player.load()

      // player.addEventListener('loadeddata', () => {
      //   player.currentTime = that.props.course.sectionProgress[that.props.section.section_id].playProgress * player.duration  //jump to the position previously left off
      //   setTimeout(() => {
      //     player.play()
      //   }, 150)

      //   this.props.changePlayStatus(true)
      //   this.setState({loading: false})
      // })
      player.playbackRate = this.props.speed;
      player.play();
      this.props.changePlayStatus(true);
      this.setState({ loading: false });
    }
  }

  renderPlayButton() {
    if (this.state.loading) {
      return <Spinner size={12} speed={1} />;
    } else if (
      this.props.playing &&
      this.props.currentSection.section_id == this.props.section.section_id
    ) {
      return <Levels color="#F76B1C" size={16} speed={1} />;
    } else {
      return (
        <i
          className="fa fa-play-circle"
          style={{ fontSize: '38px', color: '#61E1FB' }}
          aria-hidden="true"
        />
      );
    }
  }

  renderCacheButton() {
    if (this.state.cached === true) {
      return <span style={{ color: '#F76B1C' }}>remove download</span>;
    } else if (this.state.cached === false) {
      return <span style={{ color: '#F76B1C' }}>enable offline</span>;
    } else if (this.state.cached === 'processing') {
      return <Spinner size={12} speed={1} />;
    }
  }

  handleCacheAudio() {
    const that = this;

    if (this.state.cached === false) {
      this.setState({
        cached: 'processing',
      });

      let headers = new Headers();
      // headers.append('access-control-allow-origin', '*')
      headers.append('access-control-allow-methods', 'GET');
      headers.append('access-control-allow-headers', 'content-type, accept');
      headers.append('Content-Type', 'audio/mpeg3;audio/x-mpeg-3;video/mpeg;video/x-mpeg;text/xml');

      var myInit = {
        method: 'GET',
        headers: headers,
        mode: 'no-cors',
        cache: 'default',
      };

      let request = new Request(this.props.section.section_url, myInit);

      fetch(request)
        .then(response => {
          // if(!response.ok) {
          //   throw new TypeError('bad response status')
          // }
          // console.log('response header (size): ', response)

          return caches.open('audio-cache').then(cache => {
            cache.put(that.props.section.section_url, response);
          });
        })
        .then(() => {
          that.setState({
            cached: true,
          });
        })
        .catch(err => {
          console.log('error in caching: ', err);
          alert(
            'Oops! Looks like your storage is full. To store this section, clear the cached images and files in your browser history to free up some space.'
          );
        });
    } else if (this.state.cached === true) {
      caches.open('audio-cache').then(cache => {
        cache
          .keys()
          .then(keys => {
            keys.forEach(key => {
              // console.log('key: ', key)
              if (key.url === that.props.section.section_url) {
                cache.delete(key);
              }
            });
          })
          .then(() => {
            that.setState({
              cached: false,
            });
          });
      });
    }
  }

  // <FontIcon
  //         className="material-icons"
  //         color={grey500}
  //         hoverColor={orange500}
  //       >pause</FontIcon>

  handleExpand(item) {
    // console.log('expandedItem: ', item)
    if (this.state.expanded && this.state.expandedItem == item) {
      this.setState({
        expanded: false,
      });
    } else {
      this.setState({
        expanded: true,
        expandedItem: item,
      });
    }
  }

  renderCheatsheet() {
    const icon =
      this.state.expanded && this.state.expandedItem == 'notes' ? (
        <i className="fa fa-angle-up" aria-hidden="true" />
      ) : (
        <i className="fa fa-angle-down" aria-hidden="true" />
      );

    if (this.props.section.notes_url) {
      return (
        <RaisedButton
          style={{ marginTop: '0.5em', marginBottom: '0.5em' }}
          label="Notes"
          icon={icon}
          onTouchTap={() => this.handleExpand('notes')}
        />
      );
    }
  }

  renderResources() {
    const icon =
      this.state.expanded && this.state.expandedItem == 'resources' ? (
        <i className="fa fa-angle-up" aria-hidden="true" />
      ) : (
        <i className="fa fa-angle-down" aria-hidden="true" />
      );

    if (this.props.section.resources) {
      return (
        <RaisedButton
          style={{ marginTop: '0.5em', marginBottom: '0.5em' }}
          label="Resources"
          icon={icon}
          onTouchTap={() => this.handleExpand('resources')}
        />
      );
    }
  }

  renderTranscript() {
    if (this.props.section.transcript_url) {
      return (
        <a href={this.props.section.transcript_url} target="_blank">
          <RaisedButton label="Transcript" style={{ marginTop: '0.5em', marginBottom: '0.5em' }} />
        </a>
      );
    }
  }

  renderActions() {
    const icon =
      this.state.expanded && this.state.expandedItem == 'actions' ? (
        <i className="fa fa-angle-up" aria-hidden="true" />
      ) : (
        <i className="fa fa-angle-down" aria-hidden="true" />
      );

    if (this.props.section.actions) {
      return (
        <RaisedButton
          style={{ marginTop: '0.5em', marginBottom: '0.5em' }}
          label="Action Step"
          icon={icon}
          onTouchTap={() => this.handleExpand('actions')}
        />
      );
    }
  }

  handleCheck() {}

  renderActionItems(actions) {
    if (Array.isArray(actions)) {
      return (
        <div>
          <div
            style={{
              fontSize: '14px',
              marginBottom: '1em',
              marginTop: '1.5em',
            }}
          >
            <span>Mark as completed</span>
          </div>
          {actions.map(action => (
            <MuiThemeProvider>
              <Checkbox
                label={action}
                labelStyle={{
                  fontSize: '18px',
                  color: '#696969',
                  fontWeight: 400,
                }}
                style={styles.checkbox}
                onCheck={this.handleCheck}
              />
            </MuiThemeProvider>
          ))}
        </div>
      );
    } else {
      return (
        <div>
          <div
            style={{
              fontSize: '14px',
              marginBottom: '1em',
              marginTop: '1.5em',
            }}
          >
            <span>Mark as completed</span>
          </div>
          <MuiThemeProvider>
            <Checkbox
              label={actions}
              labelStyle={{
                fontSize: '18px',
                color: '#696969',
                fontWeight: 400,
              }}
              style={styles.checkbox}
              onCheck={this.handleCheck}
            />
          </MuiThemeProvider>
        </div>
      );
    }
  }

  onDocumentComplete(pages) {
    this.setState({ page: 1, pages });
  }

  onPageComplete(page) {
    this.setState({ page });
  }

  handlePrevious() {
    this.setState({ page: this.state.page - 1 });
  }

  handleNext() {
    this.setState({ page: this.state.page + 1 });
  }

  renderExpandedItem() {
    if (this.state.expandedItem == 'actions') {
      return (
        <Paper className="" style={{ padding: '1em' }}>
          {this.renderActionItems(this.props.section.actions)}
        </Paper>
      );
    } else if (this.state.expandedItem == 'notes') {
      const _name = this.props.section.notes_url;
      const _nameParts = _name.split('.');
      const _extension = _nameParts[_nameParts.length - 1];
      return (
        <Paper
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <a href={this.props.section.notes_url} target="_blank" className="notesWrapper">
            {((this.state.mimeType === 'application/pdf' || _extension === 'pdf') && (
              <div style={{ position: 'relative' }}>
                {(this.state.pages > 1 && (
                  <IoChevronLeft style={styles.navIcon} onClick={this.handlePrevious.bind(this)} />
                )) ||
                  null}
                <PDF
                  file={this.props.section.notes_url}
                  onDocumentComplete={this.onDocumentComplete.bind(this)}
                  onPageComplete={this.onPageComplete.bind(this)}
                  page={this.state.page}
                />
                {(this.state.pages > 1 && (
                  <IoChevronRight
                    style={{ ...styles.navIcon, right: 0 }}
                    onClick={this.handleNext.bind(this)}
                  />
                )) ||
                  null}
              </div>
            )) || <img src={this.props.section.notes_url} />}
          </a>
        </Paper>
      );
    } else if (this.state.expandedItem == 'resources') {
      return (
        <Paper style={{ padding: '1em', paddingTop: '2em', paddingBottom: '2em' }}>
          <ul>
            {this.props.section.resources.map(resource => {
              return (
                <li style={{ fontSize: '18px', padding: '1em' }}>
                  {`${resource.description}: `}
                  <a style={{ color: '#61E1FB' }} href={resource.link} target="_blank">
                    {resource.link_text}
                  </a>
                </li>
              );
            })}
          </ul>
        </Paper>
      );
    }
  }

  render() {
    // const sectionNumber = this.props.currentPlaylist.indexOf(this.props.section) + 1
    const completed =
      this.props.course.sectionProgress &&
      this.props.course.sectionProgress[this.props.section.section_id].completed;

    const run_time = this.props.section.run_time.split(':');

    let progress = 0;
    if (completed) {
      progress = 100;
    } else if (!this.props.course.sectionProgress) {
      progress = 0;
    } else {
      progress = Math.floor(
        this.props.course.sectionProgress[this.props.section.section_id].playProgress * 100
      );
    }

    const displayDownload = 'caches' in window ? 'flex' : 'none';

    return (
      <div>
        <Card expanded={this.state.expanded}>
          <CardText>
            <div className="row" style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className=""
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  width: '8%',
                  paddingLeft: '0.5em',
                }}
              >
                <ProgressLabel
                  progress={progress}
                  startDegree={60}
                  progressWidth={4}
                  trackWidth={5}
                  cornersWidth={2}
                  size={23}
                  fillColor="white"
                  trackColor="#D3D3D3"
                  progressColor="#F76B1C"
                />
              </div>
              <div
                className="row"
                style={{
                  paddingLeft: '1em',
                  display: 'flex',
                  alignItems: 'center',
                  width: '75%',
                }}
              >
                <div
                  className="col-md-1 col-sm-2 col-xs-3"
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <a onClick={this.handleTap}>{this.renderPlayButton()}</a>
                </div>
                <div className="col-md-11, col-sm-10 col-xs-9">
                  <a onClick={this.handleTap} style={{ padding: '0em' }}>
                    <div style={{ fontSize: '16px' }}>
                      {`Lesson ${this.props.section.section_number} (${run_time[0]}m ${
                        run_time[1]
                      }s)`}
                    </div>
                    <div style={{ fontSize: '20px' }}>{this.props.section.title}</div>
                  </a>
                </div>
              </div>
              <div style={{ display: displayDownload, alignItems: 'center' }} className="">
                <a onClick={this.handleCacheAudio}>{this.renderCacheButton()}</a>
              </div>
            </div>
          </CardText>
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: '1em',
            }}
          >
            <CardActions>
              {this.renderCheatsheet()}
              {this.renderTranscript()}
              {this.renderActions()}
              {this.renderResources()}
            </CardActions>
          </div>
          <CardText expandable={true}>{this.renderExpandedItem()}</CardText>
        </Card>
      </div>
    );
  }
}

// <Checkbox
//   uncheckedIcon={this.renderPlayButton()}
//   checkedIcon={this.renderPlayButton()}
//   label={this.props.section.title}
//   labelStyle={styles.label}
//   onCheck={this.handleTap}
// />
function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setCurrentPlaySection, changePlayStatus, launchPlayer }, dispatch);
}

const mapStateToProps = state => {
  const { isLoggedIn } = state.user;
  const { playing, currentSection } = state.setCurrentSection;
  const { playerLaunched, speed } = state.setPlayer;
  const { currentPlaylist, currentTime, currentDuration } = state.setCourses;
  return {
    isLoggedIn,
    currentSection,
    playing,
    playerLaunched,
    speed,
    currentPlaylist,
    currentTime,
    currentDuration,
  };
};

export const CourseSection = connect(
  mapStateToProps,
  mapDispatchToProps
)(_CourseSection);

// <Toolbar>
// <ToolbarGroup>
// <IconButton style={{display: 'inline-block'}}
// onTouchTap = { this.playFile }>
// { this.renderPlayButton() }
// </IconButton>
// <MuiThemeProvider muiTheme = {muiTheme}>
// <Slider style={{display: 'inline-block'}}
// style = {styles.slider}
// sliderStyle = {styles.sliderBar}
// min={0}
// max={1}
// defaultValue={0}
// value={this.state.currentTime / this.state.duration}
// onChange={this.handleSecondSlider}
// />
// </MuiThemeProvider>
// </ToolbarGroup>
// </Toolbar>

// <Dialog
//       open = { this.state.openPlayer }
//       title = {this.props.section.title}
//       modal = {false}
//       contentStyle = {styles.player}
//       overlayStyle = {styles.playerBackground}
//       style = {styles.playerContainer}
//     >
//       {player}
//     </Dialog>
