import React, { Component } from 'react';
import moment from 'moment';
import firebase from 'firebase';

import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import { sendMarketingEmails } from '../../../helpers/sendMarketingEmails';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';

export default class PendingInviteModal extends Component {
  constructor(props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
    this.sendInviteReminder = this.sendInviteReminder.bind(this);
  }

  closeModal() {
    this.props.onClose();
  }

  sendInviteReminder() {
    const invitees = [];
    const { invited } = this.props.soundcast;
    let email;
    for (var key in invited) {
      if (invited[key]) {
        email = key.replace(/\(dot\)/g, '.');
        invitees.push(email);
      }
    }
    const that = this;
    const { soundcast, userInfo } = this.props;

    // send email invitations to invited listeners
    const subject = `[Reminder] ${userInfo.publisher.name} invited you to subscribe to ${
      soundcast.title
    }`;
    const content = `<p>Hi there!</p><p></p><p>This is to remind you that you've got an invitation from ${
      userInfo.publisher.name
    } to subscribe to <a href="${
      soundcast.landingPage ? 'https://mysoundwise.com/soundcasts/' + soundcast.id : ''
    }" target="_blank">${
      soundcast.title
    }</a> on Soundwise. </p><p> If you don't have the Soundwise app on your phone--</p><p><strong>iPhone user: <strong>Download the app <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8">here</a>.</p><p><strong>Android user: <strong>Download the app <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android">here</a>.</p><p></p><p>Once you have the app, simply log in using the email address that this email was sent to. Your new soundcast will be loaded automatically.</p><p>The Soundwise Team</p>`;
    // inviteListeners(invitees, subject, content, userInfo.publisher.name, userInfo.publisher.imageUrl, userInfo.publisher.email);

    sendMarketingEmails(
      [soundcast.inviteeEmailList],
      subject,
      content,
      userInfo.publisher.name,
      userInfo.publisher.imageUrl,
      userInfo.publisher.email,
      4381
    );

    var invitationPromise = invitees.map(email => {
      let _email = email.replace(/\./g, '(dot)');
      _email = _email.trim().toLowerCase();
      if (_email) {
        return firebase
          .database()
          .ref(`soundcasts/${this.props.soundcast.id}/invited/${_email}`)
          .set(moment().format('X')); //invited listeners are different from subscribers. Subscribers are invited listeners who've accepted the invitation and signed up via mobile app
      } else {
        return null;
      }
    });

    Promise.all(invitationPromise).then(
      res => {
        alert('Invitation reminder has been sent');
        return res;
      },
      err => {
        console.log('failed to complete adding invitees: ', err);
      }
    );
  }

  render() {
    const invitees = [];
    const { invited } = this.props.soundcast;
    let email;
    for (var key in invited) {
      if (invited[key]) {
        email = key.replace(/\(dot\)/g, '.');
        invitees.push({
          email,
          date: invited[key],
        });
      }
    }

    if (!this.props.isShown) {
      return null;
    } else {
      return (
        <div>
          <div style={styles.backDrop} onClick={this.closeModal} />
          <div style={styles.modal}>
            <div style={{ padding: 25, height: '100%' }}>
              <div className="row">
                <div className="title-small" style={styles.headingText}>
                  {`Pending Invite List for ${this.props.soundcast.title}`}
                </div>
                <div style={styles.closeButtonWrap}>
                  <div style={{ cursor: 'pointer' }} onClick={this.closeModal.bind(this)}>
                    <i className="fa fa-times fa-2x" style={{ color: 'red' }} />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12" style={styles.button}>
                  <span style={{ color: Colors.link }} onClick={this.sendInviteReminder}>
                    Send Invite Reminder
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: '100%',
                  paddingLeft: 20,
                  height: '70%',
                  overflow: 'auto',
                }}
              >
                <table className="table table-condensed">
                  <thead>
                    <tr style={styles.tr}>
                      <th style={{ ...styles.th, width: 37 }} />
                      <th style={{ ...styles.th, width: 350 }}>EMAIL</th>
                      <th style={{ ...styles.th, width: 150 }}>INVITED ON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitees.map((invitee, i) => {
                      return (
                        <tr key={i} style={styles.tr}>
                          <td style={{ ...styles.td, width: 37 }} />
                          <td style={{ ...styles.td, width: 350 }}>{invitee.email}</td>
                          <td style={{ ...styles.td, width: 150 }}>
                            {typeof invitee.date == 'boolean'
                              ? '__'
                              : moment.unix(invitee.date).format('MMM DD YYYY')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

const styles = {
  backDrop: { ...commonStyles.backDrop },
  modal: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: '60%',
    height: '70vh',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999',
    background: '#fff',
  },
  table: {
    height: '80%',
  },
  headingText: {
    width: '89%',
    margin: 20,
    paddingLeft: 20,
    float: 'left',
    display: 'inline-block',
  },
  closeButtonWrap: {
    // marginTop: 20,
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 14,
    color: Colors.fontGrey,
    height: 35,
    fontWeight: 'regular',
    vAlign: 'middle',
  },
  td: {
    color: Colors.fontDarkGrey,
    fontSize: 14,
    height: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  button: {
    // height: 35,
    borderRadius: 5,
    fontSize: 16,
    letterSpacing: 1.5,
    fontWeight: 'bold',
    wordSpacing: 4,
    // display: 'inline-block',
    // paddingTop: 5,
    // paddingRight: 15,
    paddingBottom: 20,
    // paddingLeft: 15,
    borderWidth: 0,
    // marginTop: 10,
    // marginRight: 7,
    // marginLeft: 7,
    borderStyle: 'solid',
    cursor: 'pointer',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
};
