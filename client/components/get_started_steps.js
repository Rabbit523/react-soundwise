import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Step, Stepper, StepButton, StepContent, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

class GetStartedSteps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stepIndex: 0,
    };
  }

  handleNext() {
    const { stepIndex } = this.state;
    if (stepIndex < 2) {
      this.setState({ stepIndex: stepIndex + 1 });
    }
  }

  handlePrev() {
    const { stepIndex } = this.state;
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 });
    }
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return 'Think of a soundcast as an ablum, podcast, audio course, or training series. You may want to create a free soundcast to generate lead and collect emails, even if most of your series are paid ones. Once you fill in the content info and set your pricing, we will automatically generate a landing page for each of your soundcasts that is optimized to get listeners to sign up. You can also bundle several or all of your soundcasts together and create your own on-demand audio streaming library.';
      case 1:
        return "Upload audio files to your soundcasts or directly record from your dashboard. For your free soundcasts, we can publish them to iTunes and Google Play automaticaly as a podcast. Your updated soundcast content will immediately show up in the Soundwise app on your audience's phones. Audience will receive push notification whenever you publish new content.";
      case 2:
        return 'Grab your soundcast signup url link from dashboard. Share it on your website and social media to encourage signups. Audience can also find your soundcasts by searching for your soundcast title or your name on the Soundwise mobile app. Additionally, we feature your free soundcasts on the app to attract new audience for you.';
      case 3:
        return 'Engage your audience by posting comments and responses on the Soundwise mobile app, send group text messages to your listeners with additional support information, and email your audience about updates and new offers. You can email your listeners directly from your dashboard, or export listener email addresses to your own email management system.';
      default:
        return '';
    }
  }

  render() {
    const { stepIndex } = this.state;
    const contentStyle = { margin: '0 16px' };

    return (
      <section
        className="padding-110px-tb feature-style4 bg-white builder-bg xs-padding-50px-tb border-none"
        id="feature-section6"
        style={{
          background: `linear-gradient( #f7f7f7, rgba(97,225,251,0.3))`,
        }}
      >
        <MuiThemeProvider>
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center" style={{}}>
                <div className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                  HOW IT WORKS
                </div>
              </div>
            </div>
            <div className="row hidden-xs hidden-sm">
              <div style={{ width: '100%', margin: 'auto' }}>
                <Stepper linear={false} activeStep={stepIndex}>
                  <Step>
                    <StepButton onClick={() => this.setState({ stepIndex: 0 })}>
                      <span style={{ fontSize: 18 }}>Create Soundcasts</span>
                    </StepButton>
                  </Step>
                  <Step>
                    <StepButton onClick={() => this.setState({ stepIndex: 1 })}>
                      <span style={{ fontSize: 18 }}>Upload or record</span>
                    </StepButton>
                  </Step>
                  <Step>
                    <StepButton onClick={() => this.setState({ stepIndex: 2 })}>
                      <span style={{ fontSize: 18 }}>Share soundcast landing page</span>
                    </StepButton>
                  </Step>
                  <Step>
                    <StepButton onClick={() => this.setState({ stepIndex: 3 })}>
                      <span style={{ fontSize: 18 }}>Engage audience</span>
                    </StepButton>
                  </Step>
                </Stepper>
                <div style={contentStyle}>
                  <div className="text-dark-gray text-extra-large">
                    {this.getStepContent(stepIndex)}
                  </div>
                </div>
              </div>
            </div>
            <div className="row hidden-md hidden-lg" style={{ maxWidth: 380, margin: 'auto' }}>
              <Stepper activeStep={stepIndex} linear={false} orientation="vertical">
                <Step>
                  <StepButton onClick={() => this.setState({ stepIndex: 0 })}>
                    Create Soundcasts
                  </StepButton>
                  <StepContent>
                    <div className="text-dark-gray">
                      Think of a soundcast as an ablum, course, or training series. You may want to
                      create a free soundcast to generate lead and collect emails, along with paid
                      ones. Once you fill in the content info and set your pricing, we will
                      automatically generate a landing page for each of your soundcasts. You can
                      also bundle several or all of your soundcasts together and create your own
                      on-demand audio streaming library.
                    </div>
                  </StepContent>
                </Step>
                <Step>
                  <StepButton onClick={() => this.setState({ stepIndex: 1 })}>
                    Upload or record
                  </StepButton>
                  <StepContent>
                    <div className="text-dark-gray">
                      Upload audio files to your soundcasts or directly record from your dashboard.
                      Your updated soundcast content will immediately show up in the Soundwise app
                      on your audience\'s phones. Audience will receive push notification whenever
                      you publish new content.
                    </div>
                  </StepContent>
                </Step>
                <Step>
                  <StepButton onClick={() => this.setState({ stepIndex: 2 })}>
                    Share soundcast landing page
                  </StepButton>
                  <StepContent>
                    <div className="text-dark-gray">
                      Grab your soundcast signup url link from dashboard. Share it on your website
                      and social media to encourage signups. Audience can also find your soundcasts
                      by searching for your soundcast title or your name on the Soundwise mobile
                      app. Additionally, we feature your free soundcasts on the app to attract new
                      audience for you.
                    </div>
                  </StepContent>
                </Step>
                <Step>
                  <StepButton onClick={() => this.setState({ stepIndex: 3 })}>
                    Engage audience
                  </StepButton>
                  <StepContent>
                    <div className="text-dark-gray">
                      Engage your audience by posting comments and responses on the Soundwise mobile
                      app, send group text messages to your listeners with additional support
                      information, and email your audience about updates and new offers. You can
                      email your listeners directly from your dashboard, or export listener email
                      addresses to your own email management system.
                    </div>
                  </StepContent>
                </Step>
              </Stepper>
            </div>
          </div>
        </MuiThemeProvider>
      </section>
    );
  }
}

export default GetStartedSteps;
