import React, { Component } from 'react';
import '!style-loader!css-loader!video.js/dist/video-js.min.css';
import '!style-loader!css-loader!videojs-record/dist/css/videojs.record.css';
import 'videojs-record';
import 'videojs-record/dist/plugins/videojs.record.lamejs.min.js';
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.min.js';
WaveSurfer.microphone = MicrophonePlugin;
import 'videojs-wavesurfer'; // depends on video.js and wavesurfer.js

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class AudiojsRecordPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.audioId = 'myAudio' + Date.now(); // random id
  }
  componentDidMount() {
    // instantiate Video.js
    this.mediaObject = videojs(
      this.audioId,
      {
        controls: false,
        width: 138,
        height: 30,
        fluid: false,
        plugins: {
          wavesurfer: {
            src: 'live',
            waveColor: 'white',
            progressColor: 'white',
            debug: true,
            cursorWidth: 1,
            cursorColor: 'white',
            msDisplayMax: 20,
            hideScrollbar: true,
          },
          record: {
            audio: true,
            video: false,
            maxLength: 7200, // in seconds, = max 2 hrs
            debug: false,
            audioEngine: 'lamejs',
            audioWorkerURL: '/js/lamejs/worker-example/worker-realtime.js',
            audioSampleRate: 44100,
            audioBitRate: 64,
          },
        },
      },
      function() {
        // print version information at startup
        videojs.log(
          'Using video.js',
          videojs.VERSION,
          'with videojs-record',
          videojs.getPluginVersion('record'),
          '+ videojs-wavesurfer',
          videojs.getPluginVersion('wavesurfer'),
          'and recordrtc',
          RecordRTC.version
        );
      }
    );
    this.props.setMediaObject(this.mediaObject);
  }
  componentWillUnmount() {
    if (this.mediaObject) {
      this.mediaObject.dispose(); // destroy on unmount
    }
  }
  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div>
        <div data-vjs-player>
          <audio
            id={this.audioId}
            ref={node => (this.videoNode = node)}
            className="video-js vjs-default-skin video-js-audio-custom"
          />
        </div>
      </div>
    );
  }
}

export default AudiojsRecordPlayer;
