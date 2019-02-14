import React, { Component } from 'react';
import { CardMedia } from 'material-ui/Card';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default class SoundcastCard extends Component {
  static propTypes = {
    cardHeight: PropTypes.number,
    soundcast: PropTypes.object,
    cb: PropTypes.func,
    index: PropTypes.number,
    blockIndex: PropTypes.number,
  };

  references = {
    image: {},
    content: {},
  };

  componentDidMount() {
    const { cardHeight, cb } = this.props;

    // recalculate card height
    setTimeout(() => {
      let _cardHeight = this.references.image.clientWidth + this.references.content.clientHeight;
      if (!cardHeight || cardHeight < _cardHeight) {
        cb(_cardHeight);
      }
    });
  }

  render() {
    const { cardHeight, soundcast } = this.props;

    return (
      <div className="col-md-12 col-sm-12 col-xs-12">
        {soundcast.landingPage && (
          <Link
            style={{
              position: 'absolute',
              margin: 'auto',
              height: '90%',
              width: '90%',
              zIndex: 1,
            }}
            to={`/soundcasts/${soundcast.id}`}
          />
        )}
        <div className="float-left width-100 bottom-shadowed" style={{ height: cardHeight }}>
          <div
            ref={image => (this.references.image = image)}
            className="feature-box-image"
            style={{
              width: '100%',
              backgroundColor: 'white',
            }}
          >
            <CardMedia>
              <img
                alt=""
                src={soundcast.imageURL}
                data-img-size="(W)800px X (H)533px"
                style={{ objectFit: 'cover' }}
              />
            </CardMedia>
          </div>
          <div ref={content => (this.references.content = content)}>
            <div style={style.title}>{soundcast.title.slice(0, 43) + '...'}</div>
            <div style={style.courseDescription}>
              {soundcast.short_description.slice(0, 120) + '...'}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const style = {
  title: {
    fontSize: '18px',
    lineHeight: '22px',
    fontWeight: 'bold',
    padding: '15px',
  },
  courseDescription: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '20px',
    paddingTop: '10px',
    fontSize: '14px',
    lineHeight: '14px',
  },
};
