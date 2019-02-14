import React, { Component } from 'react';

// const renderBio = (bio) => {
//   return (
//     <div>
//       {bio.map((para, i) => (
//         <p key={i}>{para}</p>
//       ))}
//     </div>
//   )
// }

const Instructor = props => (
  <section className="about-style3 padding-30px-tb xs-padding-40px-tb bg-white builder-bg border-none">
    <div className="">
      <div className="row padding-40px-tb">
        <div className="col-md-12 col-sm-12 col-xs-12 text-center">
          <h2
            className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
            id="tz-slider-text125"
          >
            YOUR GUIDE
          </h2>
        </div>
      </div>
      <div className="row">
        <div className="">
          <div
            className="col-md-12 col-sm-12 col-xs-12 bg-cream text-left tz-background-color"
            style={{ padding: '5% 8%' }}
          >
            <div
              className="col-md-4 col-sm-6 col-xs-12 xs-padding-bottom-5px"
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <div
                alt={`${props.soundcast.hostName}`}
                className="img-round"
                style={{
                  backgroundImage: `url(${props.soundcast.hostImageURL})`,
                }}
              />
            </div>
            <div
              className="should-have-a-children scroll-me col-md-8 col-sm-6 col-xs-12"
              style={{ paddingTop: 20 }}
            >
              <span
                className="title-medium text-dark-gray alt-font display-block tz-text font-weight-500"
                id="tz-slider-text127"
              >
                {props.soundcast.hostName}
              </span>
              <div
                className="text-dark-gray text-medium margin-twelve no-margin-lr tz-text"
                id="tz-slider-text130"
              >
                <p />
              </div>
              <div
                className="text-dark-gray text-large tz-text"
                id="tz-slider-text129"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {props.soundcast.hostBio}
              </div>
            </div>
          </div>
          {(props.soundcast.hostName2 && (
            <div
              className="col-md-12 col-sm-12 col-xs-12 bg-cream text-left tz-background-color"
              style={{ padding: '0% 8% 5% 8%' }}
            >
              <div
                className="col-md-4 col-sm-6 col-xs-12 xs-padding-bottom-5px"
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <div
                  alt={`${props.soundcast.hostName2}`}
                  className="img-round"
                  style={{
                    backgroundImage: `url(${props.soundcast.hostImageURL2})`,
                  }}
                />
              </div>
              <div
                className="should-have-a-children scroll-me col-md-8 col-sm-6 col-xs-12"
                style={{ paddingTop: 20 }}
              >
                <span
                  className="title-medium text-dark-gray alt-font display-block tz-text font-weight-500"
                  id="tz-slider-text127"
                >
                  {props.soundcast.hostName2}
                </span>
                <div
                  className="text-dark-gray text-medium margin-twelve no-margin-lr tz-text"
                  id="tz-slider-text130"
                >
                  <p />
                </div>
                <div
                  className="text-dark-gray text-large tz-text"
                  id="tz-slider-text129"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {props.soundcast.hostBio2}
                </div>
              </div>
            </div>
          )) ||
            null}
        </div>
      </div>
    </div>
  </section>
);

export default Instructor;
