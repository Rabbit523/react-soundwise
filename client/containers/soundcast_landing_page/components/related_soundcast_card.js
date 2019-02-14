import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card, CardMedia } from 'material-ui/Card';
import { Link } from 'react-router-dom';
import ReactStars from 'react-stars';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

export default class RelatedSoundcastCard extends Component {
  constructor(props) {
    super(props);

    this.references = {
      image: {},
      content: {},
    };
  }

  componentDidMount() {
    const { cardHeight, cb } = this.props;
    // recalculate card height
    setTimeout(() => {
      let _cardHeight =
        this.references.image.clientWidth +
        this.references.content.clientHeight +
        this.references.footer.clientHeight -
        30;
      if (!cardHeight || cardHeight < _cardHeight) {
        cb(_cardHeight);
      }
    });
  }

  render() {
    const { cardHeight, soundcast, index } = this.props;
    const _style = JSON.parse(JSON.stringify(style));
    _style.bottomShadowed.height = cardHeight;
    // _style.bottomShadowed.height = 470;

    let short_description = soundcast.short_description || '';
    if (short_description.length > 120) {
      short_description = short_description.slice(0, 120) + '...';
    }

    return (
      <div className="col-md-12 col-sm-12 col-xs-12">
        <MuiThemeProvider>
          <Card>
            <Link to={`/soundcasts/${soundcast.id}`}>
              <div className="float-left width-100 bottom-shadowed" style={_style.bottomShadowed}>
                <div
                  ref={image => (this.references.image = image)}
                  className="feature-box-image"
                  style={{
                    width: '100%',
                    height: this.references.image.offsetWidth,
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
                <div
                  ref={content => (this.references.content = content)}
                  style={_style.cardContent}
                >
                  <div style={_style.title}>{soundcast.title.slice(0, 43) + '...'}</div>
                  <div style={_style.courseDescription}>{short_description}</div>
                  <div style={_style.cardFooter} ref={footer => (this.references.footer = footer)}>
                    <div className="stars-wrapper" style={_style.starsWrapper}>
                      {<ReactStars count={5} value={5} size={20} edit={false} color2={'#ffd700'} />}
                    </div>
                    <div style={_style.priceBlock}>{(!soundcast.forSale && 'Free') || null}</div>
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        </MuiThemeProvider>
      </div>
    );
  }
}

RelatedSoundcastCard.propTypes = {
  cardHeight: PropTypes.number,
  soundcast: PropTypes.object,
  cb: PropTypes.func,
  index: PropTypes.number,
  blockIndex: PropTypes.number,
};

const style = {
  bottomShadowed: {
    height: 0,
  },
  title: {
    fontSize: '18px',
    lineHeight: '22px',
    fontWeight: 'bold',
    padding: '15px',
  },
  cardContent: {
    // paddingBottom: 40,
  },
  author: {
    display: 'flex',
    alignItems: 'center',
    height: '50px',
  },
  authorThumbNail: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    border: '1px solid #555',
    marginLeft: '20px',
    marginRight: '15px',
  },
  teacherName: {
    fontWeight: 'bold',
    fontSize: '14px',
    lineHeight: '14px',
  },
  teacherRrofession: {
    fontSize: '10px',
  },
  courseDescription: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '20px',
    paddingTop: '10px',
    fontSize: '14px',
    lineHeight: '14px',
  },
  cardFooter: {
    // position: 'absolute',
    bottom: '24px',
    paddingBottom: 15,
    paddingLeft: '15px',
    paddingRight: '15px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsWrapper: {
    float: 'left',
    width: '180px',
    minWidth: '136px',
    display: 'flex',
    justifyContent: 'center',
  },
  priceBlock: {
    float: 'right',
    fontSize: '20px',
    // marginTop: '12px',
    paddingRight: '2em',
    // paddingBottom: '1em'
  },
};
