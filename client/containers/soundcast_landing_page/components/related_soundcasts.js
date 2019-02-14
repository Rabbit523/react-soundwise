import React, { Component } from 'react';
import RelatedSoundcastCard from './related_soundcast_card';
import Slider from 'react-slick';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function SliderNextArrow(props) {
  const { onClick } = props;
  return (
    <div className="slick-override-arrow -next-arrow" onClick={onClick}>
      <i className="ti-angle-right" />
    </div>
  );
}

function SliderPrevArrow(props) {
  const { onClick } = props;
  return (
    <div className="slick-override-arrow -prev-arrow" onClick={onClick}>
      <i className="ti-angle-left" />
    </div>
  );
}

export default class RelatedSoundcasts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cardHeight: 0,
    };

    this.settings = {
      dots: true,
      infinite: props.soundcasts.length > 3,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: props.soundcasts.length > 3,
      autoplay: false,
      // autoplaySpeed: 3000,
      swipe: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: props.soundcasts.length > 2,
            infinite: props.soundcasts.length > 2,
            dots: true,
            autoplay: false,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: props.soundcasts.length > 1,
            infinite: props.soundcasts.length > 1,
            dots: true,
            autoplay: false,
          },
        },
      ],
      nextArrow: <SliderNextArrow />,
      prevArrow: <SliderPrevArrow />,
    };
  }

  setMaxCardHeight(height) {
    if (!this.state.cardHeight || height > this.state.cardHeight) {
      this.setState({ cardHeight: height });
    }
  }

  render() {
    return (
      <section className=" bg-white related-courses">
        <div className="container">
          <div
            className="padding-30px-tb xs-padding-30px-tb"
            style={{ borderBottom: '0.5px solid lightgrey' }}
          >
            <div className="row ">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  id="tz-slider-text125"
                >
                  {this.props.title}
                </h2>
              </div>
              <div
                className="col-md-12"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 30,
                }}
              >
                <Link
                  to={`/publishers/${this.props.publisherID}`}
                  className="btn-medium btn btn-circle text-white no-letter-spacing"
                  onClick={this.props.openModal}
                  style={{ backgroundColor: '#61e1fb' }}
                >
                  <span className="text-extra-large sm-text-extra-large tz-text">
                    VIEW PUBLISHER
                  </span>
                </Link>
              </div>
            </div>
            <div style={style.sliderWrapper} className="row ">
              {(this.props.soundcasts.length <= 2 && (
                <div
                  className="col-md-12 center-col slick-slide"
                  style={{ display: 'flex', justifyContent: 'space-evenly' }}
                >
                  {this.props.soundcasts.map((soundcast, i) => {
                    return (
                      <div key={i} className="col-md-4 col-sm-4 col-xs-12 ">
                        <RelatedSoundcastCard
                          soundcast={soundcast}
                          cb={this.setMaxCardHeight.bind(this)}
                          index={i}
                          blockIndex={this.props.index}
                          cardHeight={this.state.cardHeight}
                        />
                      </div>
                    );
                  })}
                </div>
              )) || (
                <Slider {...this.settings}>
                  {this.props.soundcasts.map((soundcast, i) => {
                    return (
                      <div key={i}>
                        <RelatedSoundcastCard
                          soundcast={soundcast}
                          cb={this.setMaxCardHeight.bind(this)}
                          index={i}
                          blockIndex={this.props.index}
                          cardHeight={this.state.cardHeight}
                        />
                      </div>
                    );
                  })}
                </Slider>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

RelatedSoundcasts.propTypes = {
  soundcasts: PropTypes.array,
  title: PropTypes.string,
  index: PropTypes.number,
};

const style = {
  sliderWrapper: {
    width: '90%',
    margin: '0 auto',
  },
};
