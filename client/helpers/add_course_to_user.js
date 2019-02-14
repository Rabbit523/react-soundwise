import * as firebase from 'firebase';
import Axios from 'axios';

// uses this of call place
// this need to contain { props: { course, userInfo, history } }
export default function AddCourseToUser() {
  const that = this;
  const userId = firebase.auth().currentUser.uid;

  let sectionProgress = {};
  this.props.course.modules.forEach(module => {
    module.sections.forEach(section => {
      sectionProgress[section.section_id] = {
        playProgress: 0,
        completed: false,
        timesRepeated: 0,
      };
    });
  });

  const updates = {};
  updates['/users/' + userId + '/courses/' + this.props.course.id] = {
    ...this.props.course,
    sectionProgress,
  };

  updates['/courses/' + this.props.course.id + '/users/' + userId] = userId;
  firebase
    .database()
    .ref()
    .update(updates);

  Axios.post('/api/email_signup', {
    // handle mailchimp api call
    firstName: that.props.userInfo.firstName,
    lastName: that.props.userInfo.lastName,
    email: that.props.userInfo.email,
    courseID: this.props.course.id,
  })
    .then(() => {
      that.props.history.push('/confirmation');
    })
    .catch(err => {
      that.props.history.push('/confirmation');
    });
}
