import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import firebase from 'firebase';
import moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Axios from 'axios';
import Levels from 'react-activity/lib/Levels';
import Tappable from 'react-tappable/lib/Tappable';
import { getTime_mmss } from '../../../helpers/formatTime';

export default class EpisodePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      episode: { id: '' },
      liked: props.liked,
      descriptionShown: false,
      notesShown: false,
      actionsShown: false,
    };
  }

  componentDidMount() {
    if (this.props.episode && this.props.episode.title) {
      const { userID, episode, liked } = this.props;

      this.setState({
        episode,
        liked,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.episode && nextProps.episode.title) {
      this.setState({
        episode: nextProps.episode,
      });
    }
  }

  changeLike() {
    const { episode } = this.state;
    const { userID, userInfo, liked } = this.props;
    const likeId = `${userID}-${episode.id}`;
    console.log(`Like id ${likeId}`);
    console.log('Liked ', liked);
    if (!liked) {
      Axios.post('/api/likes', {
        likeId,
        userId: userID,
        fullName: `${userInfo.firstName} ${userInfo.lastName}`,
        episodeId: episode.id,
        soundcastId: episode.soundcastID,
        timeStamp: moment().format('X'),
      })
        .then(() => console.log('success set like'))
        .catch(err => alert('ERROR: like save: ' + err.toString()));
    } else {
      Axios.delete(`/api/likes/${likeId}`)
        .then(() => console.log('success delete like'))
        .catch(err => alert('ERROR: like delete: ' + err.toString()));
    }

    this.setState({
      liked: !liked,
    });
  }

  handlePlay(episode) {
    this.props.handlePlayClicked(episode);
  }

  handleMaterials(material) {
    const currentState = this.state[material + 'Shown'];
    this.setState({
      descriptionShown: false,
      notesShown: false,
      actionsShown: false,
    });
    this.setState({
      [material + 'Shown']: !currentState,
    });
  }

  render() {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    console.log('Episode render', this.props);
    const { episode, descriptionShown, notesShown, actionsShown } = this.state;
    const { liked, handlePlayClicked, playing, paused, currentEpisode } = this.props;
    const likes = episode.likesCount ? episode.likesCount : 0;
    const listens = episode.totalListens || 0;

    if (currentEpisode && episode.id == currentEpisode.id) {
      console.log('current episode: ', episode.id);
    }
    return (
      <div className="list-group-item col-md-12" style={{ display: 'flex' }}>
        <div
          className="col-md-1 col-sm-1 col-xs-2"
          style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}
        >
          {(playing && currentEpisode && episode.id == currentEpisode.id && (
            <Levels color="#F76B1C" size={mobile ? 13 : 16} speed={1} />
          )) || (
            <div onClick={this.handlePlay.bind(this, episode)} style={{ cursor: 'pointer' }}>
              <i
                className="material-icons"
                aria-hidden="true"
                style={{ color: '#61E1FB', cursor: 'pointer', fontSize: '3em' }}
              >
                play_circle_filled
              </i>
            </div>
          )}
        </div>
        <div className="col-md-10 col-sm-10 col-xs-10" style={{ padding: 5 }}>
          <div
            className="col-md-12 title-small sm-title-medium xs-title-medium"
            style={{ paddingRight: 0 }}
          >
            {episode.title}
          </div>
          <div className="col-md-12" style={{ marginTop: 10 }}>
            <div
              className="col-md-6 text-large sm-text-large xs-text-large font-weight-400 alt-font margin-three-bottom margin-three-top tz-text"
              style={{ paddingLeft: 0 }}
            >
              {`${moment(episode.date_created * 1000).format('ddd MMM DD')}`}
            </div>
            <div
              className="col-md-6 margin-three-top margin-three-bottom"
              style={{ paddingLeft: 0 }}
            >
              {
                <span
                  onClick={this.changeLike.bind(this)}
                  className="text-large sm-text-large xs-text-large text-dark-gray font-weight-400 alt-font margin-three-bottom margin-three-top tz-text"
                  style={{ marginRight: 35 }}
                >
                  <i
                    className="material-icons"
                    aria-hidden="true"
                    style={{
                      fontSize: 16,
                      color: liked ? 'red' : 'black',
                      cursor: 'pointer',
                    }}
                  >
                    favorite
                  </i>
                  {` ${likes} ${likes > 1 ? 'likes' : 'like'} `}
                </span>
              }
              {
                <span className="text-large sm-text-large xs-text-large text-dark-gray font-weight-400 alt-font margin-three-bottom margin-three-top tz-text">
                  <i className="fa fa-headphones" aria-hidden="true" />
                  {` ${listens} ${listens > 1 ? 'listens' : 'listen'}`}
                </span>
              }
            </div>
          </div>
          <div className="col-md-12">
            <div className="col-md-6" style={{ paddingLeft: 0 }}>
              {(episode.description && (
                <FlatButton
                  label="Description"
                  labelPosition="before"
                  icon={
                    (descriptionShown && <i className="fa fa-chevron-up" aria-hidden="true" />) || (
                      <i className="fa fa-chevron-down" aria-hidden="true" />
                    )
                  }
                  onClick={this.handleMaterials.bind(this, 'description')}
                />
              )) ||
                null}
              {(episode.notes && (
                <FlatButton
                  label="Notes"
                  labelPosition="before"
                  icon={
                    (notesShown && <i className="fa fa-chevron-up" aria-hidden="true" />) || (
                      <i className="fa fa-chevron-down" aria-hidden="true" />
                    )
                  }
                  onClick={this.handleMaterials.bind(this, 'notes')}
                />
              )) ||
                null}
              {(episode.actionstep && (
                <FlatButton
                  label="Actions"
                  labelPosition="before"
                  icon={
                    (actionsShown && <i className="fa fa-chevron-up" aria-hidden="true" />) || (
                      <i className="fa fa-chevron-down" aria-hidden="true" />
                    )
                  }
                  onClick={this.handleMaterials.bind(this, 'actions')}
                />
              )) ||
                null}
            </div>
          </div>
          <div className="col-md-12 margin-three-top margin-three-bottom" style={{}}>
            {(descriptionShown && (
              <div
                className="text-large text-dark-gray sm-text-large xs-text-large"
                style={{
                  whiteSpace: 'pre-wrap',
                  textAligh: 'left',
                  maxHeight: '400',
                  overflowY: 'auto',
                }}
              >
                {episode.description}
              </div>
            )) ||
              (actionsShown && (
                <div
                  className="text-large text-dark-gray sm-text-large xs-text-large"
                  style={{
                    whiteSpace: 'pre-wrap',
                    textAligh: 'left',
                    maxHeight: '400',
                    overflowY: 'auto',
                  }}
                >
                  {episode.actionstep}
                </div>
              )) ||
              null}
          </div>
        </div>
        <div
          className="col-md-1 col-sm-1 hidden-xs"
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}
        >
          {(episode.duration && (
            <span style={{ fontSize: 16 }}>{getTime_mmss(episode.duration)}</span>
          )) ||
            null}
        </div>
      </div>
    );
  }
}
