// ** not in use
import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import { cyanA200, lime50, orange50, deepOrange800, grey50 } from 'material-ui/styles/colors';

import Instructor from './instructor';
import { Curriculum } from './curriculum';
import { Reviews } from '../containers/reviews';
import Resources from './resources';

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  slide: {
    padding: 10,
  },
  tabs: {
    color: deepOrange800,
    backgroundColor: 'white',
    fontSize: 20,
    // fontFamily: 'lato'
  },
  active_tab: {
    color: deepOrange800,
    backgroundColor: orange50,
    fontSize: 20,
    // fontFamily: 'lato'
  },
};

export default class CourseBodyPurchased extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      slideIndex: 0,
      course: {
        runtime: '',
        price: '',
        name: '',
        description: '',
        modules: [],
        resources: [],
      },
    };
    this.handleChange = this.handleChange.bind(this);

    // console.log('this.props.course: ', this.props.course)
  }

  componentDidMount() {
    this.setState({
      course: this.props.course,
    });
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log('nextprops.course: ', nextProps.course)
  //   this.setState({
  //     course: nextProps.course
  //   })
  // }

  handleChange(value) {
    this.setState({
      slideIndex: value,
    });
  }

  render() {
    styles.tab = [];
    styles.tab[0] = styles.tabs;
    styles.tab[1] = styles.tabs;
    // styles.tab[2] = styles.tabs
    styles.tab[this.state.slideIndex] = Object.assign(
      {},
      styles.tab[this.state.slideIndex],
      styles.active_tab
    );

    // const course = this.props.course.name.length > 0 ? this.props.course : this.state.course
    const course = this.state.course;

    return (
      <div className="vbox">
        <div className="">
          <div style={{}}>
            <Curriculum
              course={course}
              userCourse={this.props.userCourse}
              openReviewbox={this.props.openReviewbox}
            />
          </div>
        </div>
      </div>
    );
  }
}
