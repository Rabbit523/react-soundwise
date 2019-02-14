import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import axios from 'axios';
import firebase from 'firebase';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';

import { OrangeSubmitButton } from '../../../components/buttons/buttons';
import EpisodeStatsModal from './episode_stats_modal';
import Colors from '../../../styles/colors';
const { isFreeAccount } = require('../../../../server/scripts/utils.js')();

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// using some little inline style helpers to make the app look okay
const grid = 8;
const getItemStyle = (draggableStyle, isDragging) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? Colors.link : '#f5f5f5',

  // styles we need to apply on draggables
  ...draggableStyle,
  borderBottom: '0.3px solid lightgrey',
});
const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightgrey' : 'white',
  padding: 20,
  maxHeight: 700,
  overflowY: 'scroll',
  // width: 250,
});

export default class Soundcast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showStatsModal: false,
      currentEpisode: null,
      userInfo: { soundcasts_managed: {} },
      episodes: [],
      soundcast: {},
      upgradeModal: false,
      upgradeModalTitle: '',
    };
    this.handleStatsModal = this.handleStatsModal.bind(this);
    this.loadEpisodes = this.loadEpisodes.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.closeUpgradeModal = this.closeUpgradeModal.bind(this);
    this.handleAddNewEpisode = this.handleAddNewEpisode.bind(this);
  }

  componentDidMount() {
    if (this.props.userInfo) {
      const { userInfo } = this.props;
      this.setState({
        userInfo,
      });
      this.loadEpisodes(userInfo);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userInfo && nextProps.userInfo != this.props.userInfo) {
      const { userInfo } = nextProps;
      this.setState({
        userInfo,
      });
      this.loadEpisodes(userInfo);
    }
  }

  closeUpgradeModal() {
    this.setState({ upgradeModal: false });
  }

  handleAddNewEpisode() {
    const { userInfo, id, history } = this.props;
    if (userInfo.publisher) {
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
        this.setState({
          upgradeModal: true,
          upgradeModalTitle: 'Please upgrade to create more episodes',
        });
        return;
      }
      // if basic plan or end current plan then limit to 1 soundcast
      if (currentSoundcastCount >= 1 && currentEpisodeCount >= 1 && is_free_account) {
        this.setState({
          upgradeModal: true,
          upgradeModalTitle: 'Please upgrade to create more episodes',
        });
        return;
      }
      // allow
      history.push({
        pathname: '/dashboard/add_episode',
        state: { soundcastID: id },
      });
    }
  }

  loadEpisodes(userInfo) {
    const { history, id } = this.props;
    let _soundcast = {};
    if (userInfo.soundcasts_managed && userInfo.soundcasts_managed[id]) {
      _soundcast = userInfo.soundcasts_managed[id];
      const _episodes = [];
      const episodeIdCount = {};
      if (_soundcast.episodes) {
        for (let id in _soundcast.episodes) {
          const _episode = _soundcast.episodes[id];
          if (typeof _episode === 'object' && !episodeIdCount[id]) {
            // prevent duplicate episodes
            _episode.id = id;
            _episodes.push(_episode);
            episodeIdCount[id] = 1;
          }
        }
        _episodes.sort((a, b) => {
          return b.index - a.index;
        });
        this.setState({
          episodes: _episodes,
        });
      }
      this.setState({
        soundcast: _soundcast,
      });
    }
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const episodes = reorder(this.state.episodes, result.source.index, result.destination.index);

    this.setState({
      episodes,
    });
    const total = episodes.length;
    const promises = episodes.map((episode, i) => {
      return firebase
        .database()
        .ref(`episodes/${episode.id}/index`)
        .set(total - i);
    });
    Promise.all(promises);
  }

  handleStatsModal() {
    if (!this.state.showStatsModal) {
      this.setState({
        showStatsModal: true,
      });
    } else {
      this.setState({
        showStatsModal: false,
      });
    }
  }

  setCurrentEpisode(episode) {
    this.setState({
      currentEpisode: episode,
    });
    this.handleStatsModal();
  }

  editEpisode(episode) {
    const { userInfo, history, id } = this.props;
    history.push({
      pathname: `/dashboard/edit_episode/${episode.id}`,
      state: {
        id: episode.id,
        episode,
      },
    });
  }

  async deleteEpisode(episode) {
    const title = episode.title;
    if (confirm(`Are you sure you want to delete ${title}? You won't be able to go back.`)) {
      await firebase
        .database()
        .ref(`soundcasts/${episode.soundcastID}/episodes/${episode.id}`)
        .remove();
      // firebase.database().ref(`episodes/${episode.id}/isPublished`).set(false);
      await firebase
        .database()
        .ref(`episodes/${episode.id}`)
        .remove();
      const episodes = await firebase
        .database()
        .ref(`soundcasts/${episode.soundcastID}/episodes`)
        .once('value');
      const episodesKeys = Object.keys(episodes.val() || {});
      let episodesArr = [],
        episodeIndex;
      for (var i = 0; i < episodesKeys.length; i++) {
        episodeIndex = await firebase
          .database()
          .ref(`episodes/${episodesKeys[i]}/index`)
          .once('value');
        episodesArr.push({
          id: episodesKeys[i],
          index: episodeIndex.val(),
        });
      }
      episodesArr.sort((a, b) => {
        // sort in ascending order
        return a.index - b.index;
      });
      for (var j = 0; j < episodesArr.length; j++) {
        await firebase
          .database()
          .ref(`episodes/${episodesArr[j].id}/index`)
          .set(j + 1);
      }
      if (!episodesKeys.length) {
        this.setState({ episodes: [] });
      }
      alert(`${title} has been deleted`);
      return;
    }
  }

  render() {
    const { userInfo, episodes, soundcast } = this.state;
    const { history, id } = this.props;
    const that = this;
    return (
      <div className="" style={styles.itemContainer}>
        <EpisodeStatsModal
          isShown={this.state.showStatsModal}
          episode={this.state.currentEpisode}
          onClose={this.handleStatsModal}
          userInfo={this.props.userInfo}
        />
        <div className="row " style={styles.itemHeader}>
          <div className="col-lg-9 col-md-9 col-sm-8 col-xs-12" style={styles.itemTitle}>
            {soundcast.title} - Episodes
          </div>
          <div
            className="col-lg-2 col-md-2 col-sm-3 col-xs-12 text-center"
            style={{ ...styles.button }}
            onClick={this.handleAddNewEpisode}
          >
            Add episode
          </div>
        </div>
        <div className="row" style={{ ...styles.tr, margin: 0 }}>
          <div className="col-md-12" style={{ padding: 20 }}>
            <div style={{ padding: grid * 2, margin: `0 0 ${grid}px 0` }}>
              <div className="col-md-6" style={{ ...styles.th }}>
                TITLE
              </div>
              <div className="col-md-2" style={{ ...styles.th, textAlign: 'center' }}>
                PUBLISHED ON
              </div>
              <div className="col-md-2" style={{ ...styles.th, textAlign: 'center' }}>
                LENGTH
              </div>
              <div className="col-md-2" style={{ ...styles.th, textAlign: 'center' }}>
                ANALYTICS
              </div>
            </div>
          </div>
        </div>
        <div>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                  {this.state.episodes.map(episode => {
                    episode.creator = userInfo.publisher.administrators[episode.creatorID];
                    return (
                      <Draggable key={episode.index} draggableId={episode.index}>
                        {(provided, snapshot) => (
                          <div
                            className=""
                            style={{ cursor: 'move' }}
                            datatoggle="tooltip"
                            dataplacement="top"
                            title="drag to reorder"
                          >
                            <div
                              ref={provided.innerRef}
                              className="col-md-12"
                              style={getItemStyle(provided.draggableStyle, snapshot.isDragging)}
                              {...provided.dragHandleProps}
                            >
                              <div className="col-md-6" style={{ ...styles.td }}>
                                <div style={{ marginRight: 20 }}>
                                  <div style={{ marginTop: 0, cursor: 'move' }}>
                                    {episode.title}
                                  </div>
                                  <div style={{ marginBottom: 5 }}>
                                    <span
                                      style={{
                                        marginRight: 10,
                                        cursor: 'pointer',
                                        fontSize: 15,
                                        color: 'red',
                                      }}
                                      onClick={() => this.deleteEpisode(episode)}
                                    >
                                      Delete
                                    </span>
                                    <span
                                      style={{
                                        marginRight: 10,
                                        cursor: 'pointer',
                                        fontSize: 15,
                                        color: Colors.link,
                                      }}
                                      onClick={() => this.editEpisode(episode)}
                                    >
                                      Edit
                                    </span>
                                    {(episode.publicEpisode && (
                                      <a
                                        target="_blank"
                                        href={`https://mysoundwise.com/episodes/${episode.id}`}
                                      >
                                        <span
                                          className="text-dark-gray"
                                          style={{
                                            marginRight: 10,
                                            cursor: 'pointer',
                                            fontSize: 15,
                                          }}
                                        >
                                          View
                                        </span>
                                      </a>
                                    )) ||
                                      null}
                                    {(episode.publicEpisode && (
                                      <CopyToClipboard
                                        text={episode.url}
                                        onCopy={() => {
                                          alert('Audio file URL copied to clipboard.');
                                        }}
                                      >
                                        <span
                                          style={{
                                            cursor: 'pointer',
                                            fontSize: 15,
                                            color: Colors.mainGreen,
                                          }}
                                        >
                                          Copy audio file URL
                                        </span>
                                      </CopyToClipboard>
                                    )) ||
                                      null}
                                  </div>
                                </div>
                              </div>
                              <div
                                className="col-md-2"
                                style={{
                                  ...styles.td,
                                  textAlign: 'center',
                                  cursor: 'move',
                                }}
                              >
                                {(episode.isPublished &&
                                  moment(episode.date_created * 1000).format('MMM DD YYYY')) ||
                                  'draft'}
                              </div>
                              <div
                                className="col-md-2"
                                style={{
                                  ...styles.td,
                                  textAlign: 'center',
                                  cursor: 'move',
                                }}
                              >
                                {(episode.duration &&
                                  `${Math.round(episode.duration / 60)} minutes`) ||
                                  '-'}
                              </div>
                              <div
                                onClick={() => that.setCurrentEpisode(episode)}
                                className="col-md-2"
                                style={{ ...styles.td, textAlign: 'center' }}
                                datatoggle="tooltip"
                                dataplacement="top"
                                title="episode analytics"
                              >
                                <i
                                  className="fas fa-2x fa-chart-bar"
                                  style={styles.itemChartIcon}
                                />
                              </div>
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
                  that.props.history.push({
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
  titleText: {
    fontSize: 12,
  },
  row: {
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 0,
    backgroundColor: Colors.mainWhite,
  },
  soundcastInfo: {
    // height: 96,
    backgroundColor: Colors.mainWhite,
    paddingTop: 15,
    paddingBottom: 15,
  },
  soundcastImage: {
    width: '100%',
    height: '100%',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    // marginRight: 30,
    // float: 'left',
  },
  soundcastDescription: {
    // height: 46,
    // float: 'left',
    // width: '65%',
  },
  soundcastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // display: 'block',
  },
  soundcastUpdated: {
    fontSize: 16,
  },
  edit: {
    height: 30,
    display: 'inline-block',
  },
  editLink: {
    paddingTop: 15,
    paddingLeft: 20,
    fontSize: 16,
    color: Colors.link,
    float: 'right',
    cursor: 'pointer',
    // display: 'block'
  },
  subscribers: {
    paddingTop: 10,
    // float: 'right',
    fontSize: 15,
    display: 'block',
  },
  addLink: {
    color: Colors.link,
    fontSize: 15,
    display: 'block',
    // height: 11,
    // lineHeight: '11px',
    position: 'relative',
    bottom: 5,
    // width: 17,
    margin: '0 auto',
    paddingTop: 6,
    cursor: 'pointer',
  },
  button: {
    height: 30,
    textAlign: 'center',
    color: Colors.mainWhite,
    fontWeight: 'bold',
    borderRadius: 14,
    fontSize: 12,
    letterSpacing: 2,
    wordSpacing: 4,
    display: 'inline-block',
    paddingTop: 5,
    paddingRight: 15,
    paddingBottom: 5,
    paddingLeft: 15,
    borderWidth: 0,
    marginTop: 10,
    marginRight: 15,
    borderStyle: 'solid',
    cursor: 'pointer',
    backgroundColor: Colors.mainOrange,
  },
  itemContainer: {
    marginTop: 30,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 15,
    backgroundColor: Colors.mainWhite,
    paddingTop: 10,
    paddingRight: 0,
    paddingBottom: 10,
    paddingLeft: 0,
  },
  itemHeader: {
    // height: 22,
    marginLeft: 15,
    marginTop: 10,
    // marginBottom: 25,
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 24,
    // float: 'left',
    // height: 22,
    lineHeight: '30px',
  },
  addEpisodeLink: {
    // float: 'left',
    fontSize: 16,
    color: Colors.mainOrange,
    // marginLeft: 20,
    // height: 22,
    // lineHeight: '22px',
    cursor: 'pointer',
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 17,
    color: Colors.fontGrey,
    height: 35,
    fontWeight: 'regular',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
  td: {
    color: Colors.fontDarkGrey,
    fontSize: 17,
    color: 'black',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    // whiteSpace: 'nowrap',
    wordWrap: 'break-word',
    verticalAlign: 'middle',
  },
  itemCheckbox: {
    marginTop: 7,
  },
  itemChartIcon: {
    // fontSize: 12,
    color: Colors.fontBlack,
    cursor: 'pointer',
  },
  dialogTitle: {
    marginTop: 47,
    marginBottom: 49,
    textAlign: 'center',
    fontSize: 22,
  },
};
