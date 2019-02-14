import React, { Component } from 'react';
import RelatedCourseCard from './related_course_card';
import Slider from 'react-slick';
import PropTypes from 'prop-types';

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

export default class RelatedCourses extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cardHeight: 0,
    };

    this.settings = {
      dots: true,
      infinite: props.courses.length > 3,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: props.courses.length > 3,
      autoplay: false,
      // autoplaySpeed: 3000,
      swipe: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: props.courses.length > 2,
            infinite: props.courses.length > 2,
            dots: true,
            autoplay: false,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: props.courses.length > 1,
            infinite: props.courses.length > 1,
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
      <section className="padding-40px-tb xs-padding-40px-tb bg-white builder-bg border-none related-courses">
        <div className="row padding-40px-tb">
          <div className="col-md-12 col-sm-12 col-xs-12 text-center">
            <h2
              className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
              id="tz-slider-text125"
            >
              {this.props.title}
            </h2>
          </div>
        </div>
        <div style={style.sliderWrapper} className="row">
          <Slider {...this.settings}>
            {this.props.courses.map((course, i) => {
              return (
                <div key={i}>
                  <RelatedCourseCard
                    course={course}
                    cb={this.setMaxCardHeight.bind(this)}
                    index={i}
                    blockIndex={this.props.index}
                    cardHeight={this.state.cardHeight}
                  />
                </div>
              );
            })}
          </Slider>
        </div>
      </section>
    );
  }
}

RelatedCourses.propTypes = {
  courses: PropTypes.array,
  title: PropTypes.string,
  index: PropTypes.number,
};

const style = {
  sliderWrapper: {
    width: '90%',
    margin: '0 auto',
  },
};
