// ** not in use
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Link, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import ReactStars from 'react-stars';

import { openReviewbox } from '../actions/index';

const styles = {
  modal: {
    width: '100%',
    maxWidth: 'none',
  },
};

class _ReviewModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rating: 5,
      review: 'Excellent course!',
    };

    this.ratingChanged = this.ratingChanged.bind(this);
    this.handleReviewChange = this.handleReviewChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  ratingChanged(newRating) {
    this.setState({
      rating: newRating,
    });
  }

  handleReviewChange(e) {
    e.preventDefault();

    this.setState({
      review: e.target.value,
    });
  }

  handleSubmit() {
    const { rating, review } = this.state;
    const { course, userInfo } = this.props;
    const time = new Date();
    const date = time.toDateString();
    const pic =
      userInfo.pic_url !== undefined && userInfo.pic_url.length > 0
        ? userInfo.pic_url
        : '../images/smiley_face.jpg';
    const reviewer = `${userInfo.firstName} ${userInfo.lastName.slice(0, 1)}.`;

    firebase
      .database()
      .ref('courses/' + course.id)
      .child('reviews')
      .push({ date, reviewer, rating, review, pic });
    const userId = firebase.auth().currentUser.uid;
    firebase
      .database()
      .ref(`users/${userId}/courses/${course.id}/isRated`)
      .set(true)
      .then(
        snapshot => {
          this.props.openReviewbox(false);
        },
        err => {
          // TODO: show error
        }
      );
  }

  reviewForm() {
    return (
      <section
        className="padding-110px-tb xs-padding-60px-tb bg-gray builder-bg contact-form-style6 border-none"
        id="contact-section12"
      >
        <div className="">
          <div className="row">
            <div className="col-md-8 col-sm-12 col-xs-12 center-col text-center">
              <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-six-bottom xs-margin-fifteen-bottom tz-text">
                How would you rate this course?
              </h2>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2em',
                }}
              >
                <ReactStars
                  count={5}
                  value={this.state.rating}
                  size={28}
                  onChange={this.ratingChanged}
                  color2={'#ffd700'}
                  style={{ float: 'left', display: 'inline' }}
                />
              </div>
              <div className="text-medium width-90 sm-width-100 center-col tz-text margin-thirteen-bottom xs-margin-nineteen-bottom">
                Tell us what you think of the course. Your review will help other people decide if
                this class is right for them. (Optional)
              </div>
            </div>
            <div className="col-md-6 col-sm-12 col-xs-12 center-col text-center">
              <div className="width-100">
                <textarea
                  name="review"
                  id="review"
                  placeholder="Your review"
                  className="medium-input border-radius-4"
                  onChange={this.handleReviewChange}
                  value={this.state.review}
                />
                <button
                  onClick={this.handleSubmit}
                  type="submit"
                  className="contact-submit btn btn-large propClone bg-sky-blue btn-3d text-white tz-text"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  render() {
    return (
      <MuiThemeProvider>
        <Dialog
          // title="Get Started"
          modal={false}
          open={this.props.reviewFormOpen}
          contentStyle={styles.modal}
          autoScrollBodyContent={true}
          onRequestClose={() => this.props.openReviewbox(false)}
        >
          {this.reviewForm()}
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user;
  const { reviewFormOpen } = state.reviewBox;
  return {
    userInfo,
    isLoggedIn,
    reviewFormOpen,
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ openReviewbox }, dispatch);
}

export const ReviewModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(_ReviewModal);
