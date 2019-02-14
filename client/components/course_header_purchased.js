// ** not in use
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactStars from 'react-stars';

import { CourseSignup } from '../containers/course_signup';
import { ReviewModal } from '../containers/review_modal';
import SocialShare from './socialshare';
import { openReviewbox } from '../actions/index';

class _CourseHeaderPurchased extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let run_time = '';
    if (this.props.course.run_time) {
      const rt_hour = Math.floor(this.props.course.run_time / 3600);
      const rt_min = Math.floor(this.props.course.run_time / 60 - rt_hour * 60);
      const rt_sec = this.props.course.run_time % 60;
      run_time = rt_hour > 0 ? `${rt_hour}h ${rt_min}m` : `${rt_min}m ${rt_sec}s`;
    }

    let average_rating = 0,
      ratings = [];

    const reviews = [];
    for (var key in this.props.course.reviews) {
      reviews.push(this.props.course.reviews[key]);
    }

    ratings = reviews.map(review => review.rating);
    const total = ratings.reduce((sum, cur) => sum + cur, 0);
    average_rating = Math.floor((total / ratings.length) * 10) / 10;

    const courseName = this.props.course.name.split(' ').join('%20');

    return (
      <div>
        <section className=" bg-white" id="content-section23" style={{ paddingBottom: '15px' }}>
          <div className="container">
            <div className="row equalize sm-equalize-auto equalize-display-inherit">
              <div
                className="col-md-12 col-sm-12 col-xs-12 display-table sm-no-margin"
                style={{ height: '378px' }}
              >
                <div className="display-table-cell-vertical-middle">
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12" style={{ textAlign: 'center' }}>
                      <h2 className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">
                        {this.props.course.name}
                      </h2>
                      <div
                        className="row"
                        style={{
                          margin: '0.5em',
                          marginBottom: '2em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ReactStars
                          count={5}
                          value={average_rating}
                          size={28}
                          edit={false}
                          color2={'#ffd700'}
                        />
                        <span style={{ marginLeft: '5px', fontSize: '18px' }}>{`(${
                          ratings.length
                        })`}</span>
                      </div>
                      <div
                        className="col-md-12 col-sm-12 col-xs-12"
                        style={{
                          margin: '0.5em',
                          marginBottom: '1.5em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <a
                          className="btn-medium btn btn-circle bg-bitter-sweet text-white no-letter-spacing"
                          onClick={() => this.props.openReviewbox(true)}
                          style={{}}
                        >
                          <span className="text-extra-large sm-text-extra-large tz-text">
                            Rate this course
                          </span>
                        </a>
                      </div>

                      <div className="social social-icon-color title-small">
                        <span className="margin-eight-right text-extra-large sm-text-extra-large">
                          Share the course:
                        </span>
                        <a
                          target="_blank"
                          href={`http://www.facebook.com/sharer/sharer.php?u=https://mysoundwise.com/courses/${
                            this.props.course.id
                          }`}
                          className="margin-eight-right"
                        >
                          <i className="icon-large sm-icon-extra-small fa fa-facebook tz-icon-color" />
                        </a>
                        <a
                          target="_blank"
                          href={`https://twitter.com/intent/tweet?text=${courseName}. https://mysoundwise.com/courses/${
                            this.props.course.id
                          }`}
                          className="margin-eight-right"
                        >
                          <i className="icon-large sm-icon-extra-small fa fa-twitter tz-icon-color" />
                        </a>
                        <a
                          target="_blank"
                          href={`https://plus.google.com/share?url=https://mysoundwise.com/courses/${
                            this.props.course.id
                          }`}
                          className="margin-eight-right"
                        >
                          <i className="icon-large sm-icon-extra-small fa fa-google-plus tz-icon-color" />
                        </a>
                        <a
                          target="_blank"
                          href={`https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A//mysoundwise.com/courses/${
                            this.props.course.id
                          }&amp;title=${courseName}&amp;source=`}
                          className="margin-eight-right"
                        >
                          <i className="icon-large sm-icon-extra-small fa fa-linkedin tz-icon-color" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <ReviewModal course={this.props.course} />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ openReviewbox }, dispatch);
}

export const CourseHeaderPurchased = connect(
  null,
  mapDispatchToProps
)(_CourseHeaderPurchased);
