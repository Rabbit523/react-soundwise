// ** not in use
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';

import { SoundwiseHeader } from '../components/soundwise_header';
import CourseCard from '../components/course_card';
import { loadCourses } from '../actions/index';
import { Course } from './course_page';

class _Courses extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    firebase
      .database()
      .ref('courses')
      .once('value')
      .then(snapshot => {
        this.props.loadCourses(snapshot.val());
      });
  }

  render() {
    const courses = this.props.courses;
    let courseArr = [];
    for (var key in courses) {
      courseArr.push(courses[key]);
    }

    return (
      <div>
        <SoundwiseHeader showIcon={true} />
        <section
          className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb"
          id="feature-section14"
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                  COURSES
                </h2>
                <div className="text-medium width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-thirteen-bottom xs-margin-nineteen-bottom">
                  Audio programs tailored to your active lifestyle and helping you achieve your
                  highest potential wherever you go.
                </div>
              </div>
              {courseArr.map(course => (
                <CourseCard course={course} key={course.id} match={this.props.match} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ loadCourses }, dispatch);
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  const { courses } = state.setCourses;
  return {
    userInfo,
    isLoggedIn,
    courses,
  };
};

export const Courses = connect(
  mapStateToProps,
  mapDispatchToProps
)(_Courses);
