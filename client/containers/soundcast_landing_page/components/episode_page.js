import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import firebase from 'firebase';
import moment from 'moment';
import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Modal from 'react-responsive-modal';
import Axios from 'axios';
import Footer from '../../../components/footer';
import PageHeader from './page_header';
import AudioPlayer from 'react-responsive-audio-player';
import { PublisherHeader } from './publisher_header';

import Colors from '../../../styles/colors';

class _EpisodePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      episodeID: '',
      title: '',
      url: '',
      date_created: 0,
      description: '',
      duration: '',
      likes: '',
      listens: '',
      soundcastID: '',
      soundcastTitle: '',
      subscribable: false,
      soundcastImageURL: '',
      publisherImageURL: '',
      publisherID: '',
      coverArtUrl: '',
      publisherName: '',
      publicEpisode: true,
      liked: false,
      webID: `web-${moment().format('x')}`,
      startPosition: 0,
      endPosition: null,
      showTimeStamps: false,
      open: false,
      modalShown: false,
    };
    this.audio = null;
    this.modalScheduler = null;
    this.onCloseModal = this.onCloseModal.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  async componentDidMount() {
    const that = this;
    const episodeID = this.props.match.params.id;
    await this.fetchData(episodeID);
  }

  async componentWillReceiveProps(nextProps) {
    if (!this.state.publisherName) {
      await this.fetchData(episodeID);
    }
  }

  fetchData = async episodeID => {
    const that = this;
    await firebase
      .database()
      .ref('episodes/' + episodeID)
      .on('value', async episodeSnapshot => {
        if (episodeSnapshot.val()) {
          await this.episodeUpdatedHandler(episodeSnapshot.val(), episodeID, that);
        }
      });
  };

  async episodeUpdatedHandler(episode, episodeID, context) {    
    context.setState({
      episodeID,
      title: episode.title,
      url: episode.url,
      date_created: episode.date_created,
      description: episode.description,
      duration: episode.duration,
      likes: episode.likesCount ? episode.likesCount : 0,
      listens: episode.totalListens ? episode.totalListens : 0,
      publicEpisode: episode.publicEpisode ? true : false,   
      soundcastID: episode.soundcastID,
      publisherID: episode.publisherID,
      coverArtUrl: episode.coverArtUrl ? episode.coverArtUrl : '',
    });

    try {
      const publisherSnapshot = await firebase
        .database()
        .ref('publishers/' + context.state.publisherID)
        .once('value');
      if (publisherSnapshot.val()) {
        context.setState({
          publisherName: publisherSnapshot.val().name,
          publisherImageURL: publisherSnapshot.val().imageUrl,
        });
      }
    } catch (e) {
      console.log('Failed to retrieve publisher', e);
    }

    try {
      const soundcastSnapshot = await firebase
        .database()
        .ref('soundcasts/' + context.state.soundcastID)
        .once('value');
      console.log('');
      if (!soundcastSnapshot.val()) {
        return;
      }

      const soundcast = soundcastSnapshot.val();
      context.setState({
        subscribable: soundcast.landingPage,
        soundcastTitle: soundcast.title,
        soundcastDescription: soundcast.short_description,
        soundcastFeatures: soundcast.features || null,
        soundcastImageURL: soundcast.imageURL,
        showTimeStamps: soundcast.showTimeStamps ? soundcast.showTimeStamps : false,
      });
    } catch (e) {
      console.log('Failed to retrieve soundcasts');
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
    // console.log('recordPlaying fired');
    const that = this;
    const { episodeID, listens, startPosition } = this.state;
    if (this.audio) {
      this.setState({
        startPosition: this.audio.currentTime,
      });
      if (!this.state.duration) {
        this.setState({
          duration: this.audio.duration,
        });
        this.modalScheduler = setTimeout(() => {
          that.setState({
            open: true,
            modalShown: true,
          });
        }, (this.audio.duration / 2) * 1000);
      }
    }
  }

  compoenentWillUnmount() {
    if (this.modalScheduler) {
      clearTimeout(this.modalScheduler);
    }
  }

  sendToDatabase(event) {
    const { soundcastID, publisherID, episodeID, startPosition, listens, modalShown } = this.state;
    const _date = moment().format('YYYY-MM-DD');

    firebase
      .database()
      .ref(`episodes/${episodeID}/totalListens`)
      .set(listens + 1);

    if (event == 'pause') {
      this.setState({
        endPosition: this.audio.currentTime,
      });
    } else if (event == 'ended') {
      this.setState({
        endPosition: this.audio.duration,
      });
    }

    if (!modalShown) {
      this.setState({
        open: true,
        modalShown: true,
      });
      clearTimeout(this.modalScheduler);
    }

    const listeningSession = {
      soundcastId: soundcastID,
      publisherId: publisherID,
      episodeId: episodeID,
      userId: 'guest_listening',
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

  changeLike() {
    console.log('changeLike called');
    const { episodeID, likes, webID, liked, soundcastID } = this.state;

    if (!liked) {
      Axios.post('/api/likes', {
        likeId: `${webID}-${episodeID}`,
        userId: webID,
        fullName: 'Guest',
        episodeId: episodeID,
        soundcastId: soundcastID,
        timeStamp: moment().format('X'),
      })
        .then(() => console.log('success set like'))
        .catch(err => alert('ERROR: like save: ' + err.toString()));
    } else {
      Axios.delete(`/api/likes/${webID}-${episodeID}`)
        .then(() => console.log('success delete like'))
        .catch(err => alert('ERROR: like delete: ' + err.toString()));
    }
    this.setState({
      liked: !liked,
    });
  }

  onCloseModal() {
    this.setState({
      open: false,
    });
  }

  render() {
    const that = this;
    const {
      open,
      episodeID,
      title,
      url,
      date_created,
      description,
      duration,
      likes,
      listens,
      soundcastID,
      soundcastTitle,
      soundcastDescription,
      soundcastFeatures,
      subscribable,
      soundcastImageURL,
      coverArtUrl,
      publisherImageURL,
      publisherID,
      publisherName,
      publicEpisode,
      liked,
      showTimeStamps,
    } = this.state;
    const playlist = [
      {
        url,
        // url: url.replace('https://mysoundwise.com', 'http://localhost:3000'),
        displayText: title,
      },
    ];

    if (!publicEpisode) {
      return (
        <div>
          <PublisherHeader
            soundcastID={soundcastID}
            publisherID={publisherID}
            publisherName={publisherName}
            publisherImg={publisherImageURL}
          />
          <section
            className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb"
            id="feature-section14"
          >
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                  <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                    SORRY, THIS EPISODE IS NOT PUBLIC!
                  </h2>
                </div>
              </div>
            </div>
          </section>
          <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <Footer />
          </div>
        </div>
      );
    }

    return (
      <div>
        <Helmet>
          <title>{`${title} | Soundwise`}</title>
          <meta property="og:url" content={`https://mysoundwise.com/episodes/${episodeID}`} />
          <meta property="fb:app_id" content="1726664310980105" />
          <meta property="og:title" content={`${title} - ${soundcastTitle}`} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={coverArtUrl || soundcastImageURL} />
          <meta name="description" content={description} />
          <meta name="twitter:title" content={`${title} - ${soundcastTitle}`} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={coverArtUrl || soundcastImageURL} />
          <meta name="twitter:card" content={coverArtUrl || soundcastImageURL} />
        </Helmet>
        <MuiThemeProvider>
          <div>
            <PublisherHeader
              soundcastID={soundcastID}
              publisherID={publisherID}
              publisherName={publisherName}
              publisherImg={publisherImageURL}
            />
            <div>
              <Modal
                open={open}
                onClose={this.onCloseModal}
                styles={{ modal: { maxWidth: '100%' } }}
              >
                <div className="padding-five xs-padding-six" style={{ padding: '3em' }}>
                  <div className="col-md-6 col-xs-12">
                    <img src={soundcastImageURL} style={{ width: '100%' }} />
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <div style={{ marginBottom: '2em', marginTop: '2em' }}>
                      <span className="title-large xs-title-large" style={{ fontWeight: 800 }}>
                        {soundcastTitle}
                      </span>
                    </div>
                    <div style={{ marginBottom: '2em' }}>
                      <span className="text-large xc-text-large">{soundcastDescription}</span>
                    </div>
                    {(soundcastFeatures && (
                      <div
                        className=""
                        style={{
                          paddingBottom: '2em',
                          display: 'flex',
                          flexWrap: 'wrap',
                        }}
                      >
                        {soundcastFeatures.map((feature, i) => {
                          return (
                            <div
                              key={i}
                              className=" text-dark-gray text-large xs-text-large margin-lr-auto col-md-12 col-sm-12 col-xs-12 tz-text"
                              style={{
                                paddingLeft: '0em',
                                paddingRight: '1em',
                                paddingTop: '0.2em',
                                paddingBottom: '0.2em',
                                listStyleType: 'none',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <span style={{ paddingRight: 10 }}>⭐</span>
                              {feature}
                            </div>
                          );
                        })}
                      </div>
                    )) ||
                      null}
                    <div style={{ textAlign: 'center', marginBottom: 25 }}>
                      <a
                        href={`https://mysoundwise.com/soundcasts/${soundcastID}`}
                        target="_blank"
                        className="btn-extra-large2 btn btn-circle text-white no-letter-spacing"
                        style={{ backgroundColor: Colors.mainGreen }}
                      >
                        <span className="text-extra-large xs-text-extra-large tz-text">
                          ACCESS ENTIRE SERIES
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </Modal>
              <section
                className="padding-30px-tb bg-white builder-bg xs-padding-60px-tb"
                id="feature-section14"
              >
                <div className="container">
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                      <h2 className="section-title-medium sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                        {title}
                      </h2>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center margin-three-bottom xs-margin-fifteen-bottom">
                      {(subscribable && (
                        <div>
                          <a
                            target="_blank"
                            href={`https://mysoundwise.com/soundcasts/${soundcastID}`}
                          >
                            <span
                              className="section-title-small sm-section-title-small xs-section-title-medium  font-weight-400 alt-font  tz-text"
                              style={{ color: '#F76B1C' }}
                            >
                              {`${soundcastTitle} `}
                            </span>
                          </a>
                          <span className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font tz-text">{`by `}</span>
                          <a
                            target="_blank"
                            href={`https://mysoundwise.com/publishers/${publisherID}`}
                          >
                            <span
                              className="section-title-small sm-section-title-small xs-section-title-medium font-weight-400 alt-font  tz-text"
                              style={{ color: Colors.mainGreen }}
                            >{`${publisherName}`}</span>
                          </a>
                        </div>
                      )) || (
                        <div>
                          <span className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font tz-text">
                            {`${soundcastTitle} by `}
                          </span>
                          <span
                            className="section-title-small sm-section-title-small xs-section-title-medium font-weight-400 alt-font  tz-text"
                            style={{ color: Colors.mainGreen }}
                          >
                            {`${publisherName}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3 col-sm-5 col-xs-12 text-center center-col" style={{}}>
                      <a target="_blank" href={`https://mysoundwise.com/soundcasts/${soundcastID}`}>
                        <img
                          src={coverArtUrl || soundcastImageURL}
                          alt={soundcastTitle}
                          style={{}}
                        />
                      </a>
                    </div>
                  </div>
                  <div className="row">
                    <div
                      className="col-md-12 col-sm-12 col-xs-12 text-center center-col "
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 20,
                      }}
                    >
                      <a
                        href={`https://mysoundwise.com/soundcasts/${soundcastID}`}
                        target="_blank"
                        className="btn-extra-large2 btn btn-circle text-white no-letter-spacing"
                        style={{ backgroundColor: Colors.mainGreen }}
                      >
                        <span className="text-extra-large sm-text-extra-large tz-text">
                          ACCESS ENTIRE SERIES
                        </span>
                      </a>
                    </div>
                  </div>
                  <div className="row">
                    <div
                      className="col-md-12 col-sm-12 col-xs-12 text-center center-col"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 20,
                        marginBottom: 10,
                      }}
                    >
                      <AudioPlayer
                        playlist={playlist}
                        hideBackSkip={true}
                        hideForwardSkip={true}
                        audioElementRef={elem => (that.audio = elem)}
                        onMediaEvent={{
                          play: this.recordPlaying.bind(this),
                          pause: this.sendToDatabase.bind(this, 'pause'),
                          ended: this.sendToDatabase.bind(this, 'ended'),
                        }}
                        style={{ width: '70%' }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div
                      className="col-md-12 col-sm-12 col-xs-12 text-center center-col"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 20,
                      }}
                    >
                      <h2 className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                        {(showTimeStamps &&
                          `${moment(date_created * 1000).format(
                            'MMM DD YYYY'
                          )} ${String.fromCharCode(183)} ${this.getTime_hoursMins(duration)}`) ||
                          `${this.getTime_hoursMins(duration)}`}
                      </h2>
                    </div>
                  </div>
                  <div className="row">
                    <div
                      className="col-md-12 col-sm-12 col-xs-12 text-center center-col"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 10,
                      }}
                    >
                      {
                        <span
                          onClick={this.changeLike.bind(this)}
                          className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                          style={{ marginRight: 35, cursor: 'pointer' }}
                        >
                          <i
                            className="fas fa-heart"
                            aria-hidden="true"
                            style={{ color: liked ? 'red' : 'black' }}
                          />
                          {` ${likes || 0} ${likes && likes > 1 ? 'likes' : 'like'}`}
                        </span>
                      }
                      {
                        <span className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                          <i className="fa fa-headphones" aria-hidden="true" />
                          {` ${listens || 0} ${listens && listens > 1 ? 'listens' : 'listen'}`}
                        </span>
                      }
                    </div>
                  </div>
                  <div className="row">
                    <div
                      className="col-md-9 col-sm-9 col-xs-12  center-col text-large text-dark-gray"
                      style={{
                        marginTop: 20,
                        marginBottom: 10,
                        whiteSpace: 'pre-wrap',
                        textAligh: 'left',
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: description }} />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

// const EP_worouter = connect(mapStateToProps, null)(_EpisodePage)

export const EpisodePage = withRouter(_EpisodePage);
