import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Dialog from 'material-ui/Dialog';
import { Header } from './header';
import Banner from './banner';
import Feature_section from './feature_section';
import Testimonial from './testimonial';
import Media_mention from './media_mention';
import Callto_action from './callto_action';
import Footer from './footer';
import Pricing from './pricing';
import Video from './video';

const customContentStyle = {
  width: '100%',
  maxWidth: 'none',
};

const bannerProps = {
  title: 'A Better Way for Real Estate Agent Training',
  tagline: 'Let your agents take the training wherever they go. ',
  subtitle1: 'Asynchronous training',
  description1: 'Audio training is flexible and can be consumed anytime, anywhere.',
  subtitle2: 'Easy Dissemination',
  description2:
    "Easily record and send audios of your sales meetings and training classes and compliance updates to agents' phone.",
  subtitle3: 'Reference & Repeat',
  description3: 'Audio files are organized and searchable for easy reference and re-listening.',
  subtitle4: 'Tracking & Analytics',
  description4: "Track who's listened to what and review listening statistics.",
  image: 'images/section_img_2.png',
};

const headerProps = {
  title: 'Train, engage and retain your agents with audio',
  tagline:
    'Soundwise allows real estate brokers and trainers to easily disseminate training materials and updates in audio to help their agents stay productive and engaged.',
  logoImage: 'images/soundwiselogo_white.svg',
  backgroundImage: 'images/header_img_bg_2.png',
  gradient1: 'rgba(0,0,0,0.1)',
  gradient2: 'rgba(0,0,0,0.1)',
};

const featureProps = {
  description:
    'Less time sitting in meetings/classrooms is more time for your agents to work on their business. Use Soundwise to make your agents more productive and better trained.',
  featureTitle1: 'Record / Upload',
  feature1:
    'Record or upload your training classes or sales meetings through Soundwise web interface.',
  featureTitle2: 'Notify / Remind',
  feature2:
    'Your agents will be notified on their phone when new audios are available and be reminded to listen to them.',
  featureTitle3: 'Listen / Comment',
  feature3:
    'Agents listen to your materials at a time convenient to them. They can also give comments/raise questions from their phones.',
  featureTitle4: 'Track / Analyze',
  feature4:
    "Listening stats and tracking provide proof of who's listened to what, and help you analyze what kinds of materials are more popular.",
};

class PageRealEstate extends Component {
  constructor() {
    super();
    this.state = {
      open: false,
    };
  }

  componentDidMount() {
    window.prerenderReady = true;
  }

  render() {
    return (
      <div id="page" className="page ao-font-lato">
        <Header content={headerProps} />
        <Banner content={bannerProps} />
        <Feature_section content={featureProps} />
        <Video />
        <Pricing />
        <Callto_action />
        <Footer />
      </div>
    );
  }
}

// <Testimonial></Testimonial>

export default PageRealEstate;

// { /* Popup block start <subscribe8> */ }
// <Popup></Popup>
// {  Window fake: takes content full size; used for animation, elements with 'window', 'document' position is moved to it  }
// <div className="ao-window-fake" data-ao-animaze-resize="windowSize:min 100%" />
// <div id="fb-root" />
// { /* Popup block end */ }
