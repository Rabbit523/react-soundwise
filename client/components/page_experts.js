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
import ExpertPricing from './expert_pricing';
import Video from './video';

const customContentStyle = {
  width: '100%',
  maxWidth: 'none',
};

const headerProps = {
  title: 'MONETIZE YOUR EXPERTISE WITH AUDIO',
  tagline: 'Create and sell audio courses and subscription programs. Build a loyal following.',
  logoImage: 'images/soundwiselogo_white.svg',
  backgroundImage: 'images/expert_bg2.jpg',
  gradient2: 'rgba(247,107,28,0.6)',
  // gradient2: 'rgba(97,225,251,0.8)',
  gradient1: 'rgba(0,0,0,0.1)',
  // gradient2: 'rgba(0,0,0,0.1)',
};

const bannerProps = {
  title: 'A Most Accessible Educational Product',
  tagline:
    'We make it easy for audience to sign up for your training program and engage with your content.',
  subtitle1: 'Asynchronous Delivery',
  description1: 'Audio training is flexible and can be taken anytime, anywhere.',
  subtitle3: 'Easy Dissemination',
  description3:
    "Record and send audios of your educational content directly to your audience's phones",
  subtitle2: 'Effortless Signup',
  description2:
    'Easily create landing pages for your program from our optimized template and start selling.',
  subtitle4: 'Tracking & Analytics',
  description4: "Track who's listened to what and review listening statistics.",
  image: 'images/section_img_2.png',
};

const featureProps = {
  description:
    'Use Soundwise to create and sell your audio training products and subscription programs.',
  featureTitle1: 'Build / Upload',
  feature1: 'Create a sales page, upload your content and start selling.',
  featureTitle2: 'Update / Download',
  feature2: "Any new materials you upload are immediately available on your audience's phones.",
  featureTitle3: 'Listen / Engage',
  feature3:
    'Audience listen to your materials at a time convenient to them. You can engage with your audience via comments & group text messages',
  featureTitle4: 'Track / Analyze',
  feature4:
    "Listening records down to each individual tells you who's listened to what, helping you analyze and improve your training content.",
};

class PageExperts extends Component {
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
      <div className="page ao-font-lato">
        <Header content={headerProps} />
        <Banner content={bannerProps} />
        <Feature_section content={featureProps} />

        <Media_mention />
        <Callto_action />
        <Footer />
      </div>
    );
  }
}

export default PageExperts;
