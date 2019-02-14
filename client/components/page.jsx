import React, {Component} from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Dialog from 'material-ui/Dialog'
import {Header} from './header'
import Banner from './banner'
import Feature_section from './feature_section'
import Testimonial from './testimonial'
import Media_mention from './media_mention'
import Callto_action from './callto_action'
import Footer from './footer'
import Pricing from './pricing'
import Video from './video'
import Problems from './problems'
import PodcasterBlock from './podcaster_block'
import AudioCourseCreator from './audio_course_creator'
import TeamTrainingBlock from './team_training_block'
import GetStartedSteps from './get_started_steps'
import FAQs from './faqs'

const customContentStyle = {
  width: '100%',
  maxWidth: 'none',
}

const headerProps = {
  title: 'SPREAD YOUR KNOWLEDGE FAST WITH AUDIO',
  tagline: 'The easiest way to sell and deliver your on-demand audio content.',
  logoImage: "images/soundwiselogo_white.svg",
  backgroundImage: 'images/header_img_3.jpg',
  gradient1: 'rgba(247,107,28,0.4)',
  gradient2: 'rgba(97,225,251,0.8)',
  // gradient1: 'rgba(0,0,0,0.1)',
  // gradient2: 'rgba(0,0,0,0.1)',
}

const bannerProps = {
    title: 'A BETTER WAY TO DELIVER & MONETIZE YOUR AUDIOS',
    tagline: 'Soundwise offers everything you need to make the most out of your audio content.',
    subtitle1: 'Use audio content to build an audience and expand your email list.',
    description1: '',
    subtitle2: 'Flexible ways to package your audios for sale.',
    description2: "",
    subtitle3: 'Control who can access your content and know exactly who listened to what.',
    description3: '',
    subtitle4: 'Clean, distraction-free mobile app that delivers content to your audience on-the-go ',
    description4: '',
    image: 'images/section_img_2.png',
}

const featureProps = {
  description: 'Use Soundwise to make your audience more productive and better educated.',
  featureTitle1: 'Record / Upload',
  feature1: 'Upload your audio recordings to Soundwise or directly record from your dashboard.',
  featureTitle2: 'Send / Notify',
  feature2: 'New content will immediately show up on your audience\'s phone, with push notification sent to them.',
  featureTitle3: 'Listen / Engage',
  feature3: 'Audience listen to your materials at a time convenient for them. They can comment on your content or ask you questions from their phone.',
  featureTitle4: 'Track / Analyze',
  feature4: "Listening record of each individual is tracked, helping you analyze and improve your content.",
}

class Page extends Component {
    constructor() {
        super()
        this.state={
            open: false
        }

    }

    componentDidMount() {
        window.prerenderReady = true;
    }


    render() {
        return (
          <div id="page" className="page ao-font-lato">
            <Header content={headerProps}></Header>
            <Problems />
            <Banner content={bannerProps}></Banner>
            <PodcasterBlock />
            <AudioCourseCreator />
            <TeamTrainingBlock />
            <GetStartedSteps />
            <FAQs />
            <Media_mention></Media_mention>
            <Callto_action></Callto_action>
            <Footer
              showPricing={true}
            ></Footer>
          </div>
        )
    }
}

            // <Testimonial></Testimonial>

export default Page;

    // { /* Popup block start <subscribe8> */ }
    // <Popup></Popup>
    // {  Window fake: takes content full size; used for animation, elements with 'window', 'document' position is moved to it  }
    // <div className="ao-window-fake" data-ao-animaze-resize="windowSize:min 100%" />
    // <div id="fb-root" />
    // { /* Popup block end */ }