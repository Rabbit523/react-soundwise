import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card, CardMedia } from 'material-ui/Card';
import { Link } from 'react-router-dom';
import ReactStars from 'react-stars';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

export default class RelatedCourseCard extends Component {
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
    const { cardHeight, course, index } = this.props;
    const _style = JSON.parse(JSON.stringify(style));
    _style.bottomShadowed.height = cardHeight;

    return (
      <div className="col-md-12 col-sm-12 col-xs-12">
        <MuiThemeProvider>
          <Card>
            <Link to={`/courses/${course.id}`}>
              <div className="float-left width-100 bottom-shadowed" style={_style.bottomShadowed}>
                <div ref={image => (this.references.image = image)} className="feature-box-image">
                  <CardMedia>
                    <img
                      alt=""
                      src={course.img_url_mobile}
                      data-img-size="(W)800px X (H)533px"
                      style={{ objectFit: 'cover' }}
                    />
                  </CardMedia>
                </div>
                <div
                  ref={content => (this.references.content = content)}
                  style={course.reviews && _style.cardContent}
                >
                  <div style={_style.title}>{course.name}</div>
                  <div style={_style.author}>
                    <img
                      alt={''}
                      src={course.teachers[0].teacher_thumbnail}
                      style={_style.authorThumbNail}
                    />
                    <div>
                      <div style={_style.teacherName}>{course.teachers[0].teacher}</div>
                      <div className="one-line" style={_style.teacherRrofession}>
                        {course.teachers[0].teacher_profession}
                      </div>
                    </div>
                  </div>
                  <div style={_style.courseDescription}>{course.description}</div>
                  <div style={_style.cardFooter} ref={footer => (this.references.footer = footer)}>
                    <div className="stars-wrapper" style={_style.starsWrapper}>
                      {course.reviews && (
                        <ReactStars
                          count={5}
                          value={_.meanBy(_.values(course.reviews), review => review.rating)}
                          size={30}
                          edit={false}
                          color2={'#ffd700'}
                        />
                      )}
                    </div>
                    <div style={_style.priceBlock}>
                      {(course.price && `$${course.price}`) || 'Free'}
                    </div>
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

RelatedCourseCard.propTypes = {
  cardHeight: PropTypes.number,
  course: PropTypes.object,
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
    paddingBottom: 30,
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
    fontSize: '10px',
    lineHeight: '14px',
  },
  cardFooter: {
    position: 'absolute',
    bottom: '24px',
    paddingLeft: '15px',
    paddingRight: '15px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  starsWrapper: {
    float: 'left',
    width: '180px',
    minWidth: '136px',
  },
  priceBlock: {
    float: 'right',
    fontSize: '20px',
    marginTop: '12px',
    paddingRight: '2em',
    paddingBottom: '1em',
  },
};
