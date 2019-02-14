import React, { Component } from 'react';
import firebase from 'firebase';
import Slider from 'react-slick';
import SoundcastCard from './SoundcastCard';

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

export default class BundleContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      soundcasts: [],
    };

    this.settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: true,
      autoplay: false,
      swipe: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: this.state.soundcasts.length > 2,
            infinite: this.state.soundcasts.length > 2,
            dots: true,
            autoplay: false,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: this.state.soundcasts.length > 1,
            infinite: this.state.soundcasts.length > 1,
            dots: true,
            autoplay: false,
          },
        },
      ],
      nextArrow: <SliderNextArrow />,
      prevArrow: <SliderPrevArrow />,
    };
  }

  componentDidMount() {
    let tempSoundcasts = [];
    const { soundcastsIds } = this.props;

    const promises = soundcastsIds.map(id => {
      const ref = firebase.database().ref(`soundcasts/${id}`);
      const promise = this.sleep(1000).then(() => ref.once('value'));

      return promise.then(snapshot => {
        const soundcast = { id: snapshot.key, ...snapshot.val() };
        tempSoundcasts.push(soundcast);
      });
    });

    Promise.all(promises).then(() => {
      console.log(tempSoundcasts);
      this.setState({ soundcasts: tempSoundcasts });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
          <div className="padding-30px-tb xs-padding-30px-tb">
            <div className="row ">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2
                  className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                  id="tz-slider-text125"
                >
                  {this.props.title}
                </h2>
              </div>
            </div>
            <div style={style.sliderWrapper} className="row ">
              {this.state.soundcasts.length < 4 ? (
                <div
                  className="col-md-12 center-col slick-slide"
                  style={{ display: 'flex', justifyContent: 'space-evenly' }}
                >
                  {this.state.soundcasts.map((soundcast, i) => {
                    return (
                      <div key={i} className="col-md-4 col-sm-4 col-xs-12 ">
                        <SoundcastCard
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
              ) : (
                <Slider {...this.settings}>
                  {this.state.soundcasts.map((soundcast, i) => {
                    return (
                      <div key={i}>
                        <SoundcastCard
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

const style = {
  sliderWrapper: {
    paddingTop: '55px',
    width: '90%',
    margin: '0 auto',
  },
};
