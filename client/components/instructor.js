import React from 'react';
// import ScrollArea from 'react-scrollbar'
// import GeminiScrollbar from 'react-gemini-scrollbar'
// import ReactScrollbar from 'react-scrollbar-js'

const renderBio = bio => {
  return (
    <div>
      {bio.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
};

const renderWebsite = website => {
  if (website) {
    return (
      <div className="col-md-3 col-sm-4 xs-margin-nineteen-bottom">
        <a target="_blank" href={website} className=" text-medium tz-text">
          <i
            className="fa fa-link icon-large margin-six-bottom xs-margin-three-bottom tz-icon-color"
            aria-hidden="true"
          />
          <br />
          Website
        </a>
      </div>
    );
  }
};

const renderFacebook = facebook => {
  if (facebook) {
    return (
      <div className="col-md-3 col-sm-4 xs-margin-nineteen-bottom">
        <a target="_blank" href={facebook} className=" text-medium tz-text">
          <i className="fa fa-facebook icon-large margin-six-bottom xs-margin-three-bottom tz-icon-color" />
          <br />
          Facebook
        </a>
      </div>
    );
  }
};

const renderTwitter = twitter => {
  if (twitter) {
    return (
      <div className="col-md-3 col-sm-4 xs-margin-nineteen-bottom">
        <a target="_blank" href={twitter} className=" text-medium tz-text">
          <i className="fa fa-twitter icon-large margin-six-bottom xs-margin-three-bottom tz-icon-color" />
          <br />
          Twitter
        </a>
      </div>
    );
  }
};

const renderLinkedin = linkedin => {
  if (linkedin) {
    return (
      <div className="col-md-3 col-sm-4 xs-margin-nineteen-bottom">
        <a target="_blank" href={linkedin} className=" text-medium tz-text">
          <i className="fa fa-linkedin icon-large margin-six-bottom xs-margin-three-bottom tz-icon-color" />
          <br />
          LinkedIn
        </a>
      </div>
    );
  }
};

const Instructor = props => (
  <section className="about-style3 padding-40px-tb xs-padding-40px-tb bg-white builder-bg border-none">
    <div className="container">
      <div className="row padding-40px-tb">
        <div className="col-md-12 col-sm-12 col-xs-12 text-center">
          <h2
            className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
            id="tz-slider-text125"
          >
            YOUR INSTRUCTOR
          </h2>
        </div>
      </div>
      <div className="row">
        <div className="item">
          <div
            className="col-md-6 col-sm-6 about-img cover-background tz-builder-bg-image"
            id="tz-bg-45"
            data-img-size="(W)800px X (H)800px"
            style={{
              height: '600px',
              background: `linear-gradient(rgba(0,0,0,0.01), rgba(0,0,0,0.01)), url(${
                props.course.teachers[0].teacher_img
              })`,
            }}
          />
          <div
            className="col-md-6 col-sm-6 about-text bg-cream text-left tz-background-color"
            id="tz-bg-color-7"
            style={{ overflowY: 'auto', height: '600px' }}
          >
            <div className="should-have-a-children scroll-me">
              <span
                className="title-medium text-dark-gray alt-font display-block tz-text font-weight-500"
                id="tz-slider-text127"
              >
                {props.course.teachers[0].teacher}
              </span>
              <div
                className="text-dark-gray text-medium margin-twelve no-margin-lr tz-text"
                id="tz-slider-text130"
              >
                <p />
              </div>
              <div className="text-dark-gray text-large tz-text" id="tz-slider-text129">
                {renderBio(props.course.teachers[0].teacher_bio)}
              </div>
              <div className="row">
                <div className="col-md-10 col-md-offset-1 col-sm-12 text-center">
                  {renderWebsite(props.course.teachers[0].teacher_website)}
                  {renderTwitter(props.course.teachers[0].teacher_twitter)}
                  {renderFacebook(props.course.teachers[0].teacher_facebook)}
                  {renderLinkedin(props.course.teachers[0].teacher_linkedin)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Instructor;

// <div className="text-medium width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-thirteen-bottom xs-margin-nineteen-bottom" id="tz-slider-text126">{props.course.teacher}</div>
