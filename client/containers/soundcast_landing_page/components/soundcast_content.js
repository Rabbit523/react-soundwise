import React, { Component } from 'react';
import firebase from 'firebase';

import SoundcastSignup from '../soundcast_signup';
import EpisodePlayer from './episode_player';

export default class SoundcastContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      episodes: [],
      playingEpisode: '',
    };

    this.references = {};
    this.setPlayingEpisode = this.setPlayingEpisode.bind(this);
  }

  componentDidMount() {
    if (Object.keys(this.props.soundcast.episodes).length > 0) {
      this.retrieveEpisodes(this.props.soundcast.episodes);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.soundcast.episodes != this.props.soundcast.episodes &&
      Object.keys(nextProps.soundcast.episodes).length > 0
    ) {
      this.retrieveEpisodes(nextProps.soundcast.episodes);
    }
  }

  retrieveEpisodes(episodes) {
    const episodeIDs = Object.keys(episodes);
    const episodesArr = [];
    const that = this;
    const promises = episodeIDs.map(id => {
      return firebase
        .database()
        .ref(`episodes/${id}`)
        .once('value')
        .then(snapshot => {
          // console.log(snapshot);
          // console.log(snapshot.val());
          if (snapshot.val()) {
            const episode = snapshot.val();
            if (episode.isPublished) {
              episode.id = id;
              episodesArr.push(episode);
            }
          }
        });
    });
    Promise.all(promises).then(() => {
      if (episodesArr[0].index) {
        episodesArr.sort((a, b) => {
          return b.index - a.index;
        });
      } else {
        episodesArr.sort((a, b) => {
          return b.date_created - a.date_created;
        });
      }

      that.setState({
        episodes: episodesArr,
      });
    });
  }

  setPlayingEpisode(episode) {
    if (!this.references.audio.paused) {
      this.references.audio.pause();
      this.references.audio.currentTime = 0;
    }
    this.setState({ playingEpisode: episode });
    this.references.audioSource = episode.url;
  }

  render() {
    return (
      <div>
        <SoundcastSignup soundcast={this.props.soundcast} />
        <audio preload="auto" ref={audio => (this.references.audio = audio)}>
          <source
            src={this.state.playingEpisode.url}
            ref={audioSource => (this.references.audioSource = audioSource)}
          />
        </audio>
        <section className=" feature-style4 bg-white builder-bg  border-none" id="feature-section6">
          <div
            className="container padding-30px-tb xs-padding-30px-tb"
            style={{ borderBottom: '0.5px solid lightgrey' }}
          >
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center padding-40px-tb">
                <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                  CONTENT
                </h2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="table-responsive" style={{ maxHeight: 450 }}>
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ fontSize: 16 }} />
                        <th style={{ fontSize: 16 }}>TITLE</th>
                        <th style={{ fontSize: 16 }}>DURATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.episodes.map((episode, i) => {
                        if (episode.title) {
                          return (
                            <EpisodePlayer
                              episode={episode}
                              playingEpisode={this.state.playingEpisode}
                              references={this.references}
                              key={i}
                              showDialogCb={this.props.openModal}
                              playingCb={this.setPlayingEpisode}
                              isPlaying={episode == this.state.playingEpisode}
                            />
                          );
                        } else {
                          return null;
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
