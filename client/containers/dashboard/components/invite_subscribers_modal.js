import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';
import firebase from 'firebase';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import draftToHtml from 'draftjs-to-html';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Papa from 'papaparse';
import { Editor } from 'react-draft-wysiwyg';
import { convertFromRaw, convertToRaw, EditorState, convertFromHTML, ContentState } from 'draft-js';

import { minLengthValidator, maxLengthValidator } from '../../../helpers/validators';
import { inviteListeners } from '../../../helpers/invite_listeners';
import { addToEmailList } from '../../../helpers/addToEmailList';
import { sendMarketingEmails } from '../../../helpers/sendMarketingEmails';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';

export default class InviteSubscribersModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inviteeList: '',
      submitted: false,
      invitation: EditorState.createEmpty(),
    };

    this.closeModal = this.closeModal.bind(this);
    this.inviteListeners = this.inviteListeners.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { soundcast, userInfo } = nextProps;
    let editorState;
    if (userInfo.publisher && soundcast && nextProps != this.props) {
      if (soundcast.invitationEmail) {
        let contentState = convertFromRaw(JSON.parse(soundcast.invitationEmail));
        editorState = EditorState.createWithContent(contentState);
      } else {
        const content = `<p>Hi there!</p><p></p><p>${
          userInfo.publisher.name
        } has invited you to subscribe to <a href="${
          soundcast.landingPage ? 'https://mysoundwise.com/soundcasts/' + soundcast.id : ''
        }" target="_blank">${
          soundcast.title
        }</a> on Soundwise.</p><p>You can access it <a href="https://mysoundwise.com/signup/soundcast_user/${
          soundcast.id
        }">here.</a></p><p>Alternatively, you can access the soundcast directly from your phone. If you don't already have the Soundwise app on your phone--</p><p><strong>iPhone user: </strong>Download the app <strong><a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8">here</a>.</strong></p><p><strong>Android user: </strong>Download the app <strong><a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android">here</a>.</strong></p><p></p><p>Once you have the app, simply log in using the email address that this email was sent to. Your new soundcast will be loaded automatically.</p>`;
        const invitationEmail = convertFromHTML(content);
        const invitation = ContentState.createFromBlockArray(
          invitationEmail.contentBlocks,
          invitationEmail.entityMap
        );
        editorState = EditorState.createWithContent(invitation);
      }
      this.setState({
        invitation: editorState,
      });
    }
  }

  async inviteListeners() {
    const inviteeArr = this.state.inviteeList.split(',');
    const that = this;
    const { soundcast, userInfo } = this.props;
    const { invitation } = this.state;
    for (var i = inviteeArr.length - 1; i >= 0; i--) {
      if (inviteeArr[i].indexOf('@') == -1) {
        inviteeArr.splice(i, 1);
      }
    }
    const content = draftToHtml(convertToRaw(invitation.getCurrentContent()));
    // send email invitations to invited listeners
    const subject = `${userInfo.publisher.name} invites you to subscribe to ${soundcast.title}`;

    addToEmailList(soundcast.id, inviteeArr, 'inviteeEmailList', soundcast.inviteeEmailList).then(
      () => {
        inviteListeners(
          inviteeArr,
          subject,
          content,
          userInfo.publisher.name,
          userInfo.publisher.imageUrl,
          userInfo.publisher.email
        ); // use transactional email for this
      }
    );

    Axios.post('/api/invite', {
      soundcastId: soundcast.id,
      inviteeArr,
      invitation: invitation.getCurrentContent(),
    })
      .then(res => res)
      .catch(err => {
        console.log('ERROR send emails to subscribers: ', err);
      });

    this.setState({
      submitted: true,
    });
  }

  closeModal() {
    this.setState({
      submitted: false,
      inviteeList: '',
    });

    this.props.onClose();
  }

  onInvitationStateChange(editorState) {
    this.setState({
      invitation: editorState,
    });
  }

  setFileName(e) {
    const that = this;
    const emailList = [];
    if (e.target.value) {
      const file = document.getElementById('upload_csv').files[0];
      if (file.name.slice(-3) == 'csv') {
        Papa.parse(file, {
          complete: function(results) {
            if (results.data) {
              let targetCol = prompt(
                'Which column is the emails stored in? (Enter the column number)'
              );
              if (Number.isInteger(Number(targetCol)) && Number(targetCol) > 0) {
                results.data.forEach(row => {
                  let email = row[targetCol - 1] ? row[targetCol - 1] : '';
                  if (email.indexOf('@') > 0) {
                    email = email.toLowerCase().trim();
                    emailList.push(email);
                  }
                });
                that.setState({
                  inviteeList: emailList.join(','),
                });
              } else {
                alert('Please enter a valid column number.');
              }
            }
          },
        });
      } else {
        alert('Please upload a valid csv file.');
      }
    }
  }

  render() {
    const { soundcast, userInfo } = this.props;
    const actions = [
      <FlatButton
        label="Submit"
        labelStyle={{ color: Colors.link }}
        onClick={this.inviteListeners}
      />,
      <FlatButton label="Cancel" onClick={this.closeModal} />,
    ];
    const actionsSubmitted = [
      <FlatButton label="OK" labelStyle={{ color: Colors.link }} onClick={this.closeModal} />,
    ];
    if (!this.props.isShown) {
      return null;
    }

    if (this.state.submitted) {
      return (
        <div>
          <MuiThemeProvider>
            <Dialog
              title="Your invitations have been sent"
              titleStyle={{ borderBottom: '0px' }}
              actions={actionsSubmitted}
              modal={false}
              open={this.props.isShown}
            />
          </MuiThemeProvider>
        </div>
      );
    }

    return (
      <div>
        <MuiThemeProvider>
          <Dialog
            title={`Invite subscribers to ${soundcast.title}`}
            titleStyle={{ borderBottom: '0px' }}
            actions={actions}
            modal={false}
            open={this.props.isShown}
            contentStyle={{
              width: '80%',
              maxWidth: 'none',
              height: 700,
              maxHeight: 'none',
            }}
            autoScrollBodyContent={true}
          >
            <div className="col-md-12" style={{ height: 100 }}>
              <textarea
                style={styles.inputDescription}
                placeholder={'Enter listener email addresses, separated by commas'}
                onChange={e => {
                  this.setState({ inviteeList: e.target.value });
                }}
                value={this.state.inviteeList}
              />
            </div>
            <div className="col-md-12" style={{}}>
              <div
                className="text-medium col-md-12"
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <span>OR</span>
              </div>
              <div className="col-md-6 center-col">
                <input
                  type="file"
                  name="upload"
                  id="upload_csv"
                  onChange={this.setFileName.bind(this)}
                  style={styles.inputFileHidden}
                />
                <div
                  className="btn"
                  style={{ ...styles.draftButton }}
                  onClick={() => {
                    document.getElementById('upload_csv').click();
                  }}
                >
                  <span>Upload invitee email list in CSV file</span>
                </div>
              </div>
            </div>
            {/*Confirmation email*/}
            <div className="col-md-12" style={{ paddingTop: 25, paddingBottom: 25 }}>
              <div>
                <span style={styles.titleText}>Invitation Message</span>
                <Editor
                  editorState={this.state.invitation}
                  editorStyle={styles.editorStyle}
                  wrapperStyle={styles.wrapperStyle}
                  onEditorStateChange={this.onInvitationStateChange.bind(this)}
                />
              </div>
            </div>
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }
}

const styles = {
  inputFileHidden: { ...commonStyles.inputFileHidden },
  modal: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: '95%',
    height: '60%',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999',
    background: '#fff',
  },
  successText: {
    height: '50%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButtonWrap: {
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    marginTop: 30,
    marginBottom: 20,
    // marginLeft: 20,
    fontSize: 18,
    fontWeight: 600,
  },
  editorStyle: {
    padding: '5px',
    fontSize: 16,
    borderRadius: 4,
    height: '250px',
    width: '100%',
    backgroundColor: Colors.mainWhite,
  },
  wrapperStyle: {
    borderRadius: 4,
    marginBottom: 25,
    marginTop: 15,
  },
  inputDescription: {
    height: '100%',
    // width: '90%',
    paddingLeft: 20,
    marginBottom: 20,
    // padding: '10px 10px',
    fontSize: 16,
    borderRadius: 4,
  },
  buttonsWrap: {},
  button: {
    height: 35,
    display: 'inline-block',
    float: 'right',
    borderRadius: 23,
    overflow: 'hidden',
    // margin: '40px auto',
    fontSize: 14,
    letterSpacing: 2.5,
    wordSpacing: 5,
    marginRight: 20,
    paddingTop: 6,
    paddingRight: 20,
    paddingBottom: 4,
    paddingLeft: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: Colors.darkGrey,
    borderColor: Colors.darkGrey,
  },
  submitButton: {
    backgroundColor: Colors.mainOrange,
    color: Colors.mainWhite,
    borderColor: Colors.mainOrange,
  },
  draftButton: {
    // backgroundColor: Colors.link,
    color: Colors.fontBlack,
    borderColor: Colors.fontBlack,
    borderWidth: 1.5,
    borderStyle: 'solid',
    fontSize: 16,
    height: '40px',
    lineHeight: '40px',
    borderRadius: 10,
    marginTop: 15,
    marginRight: 'auto',
    marginBottom: 20,
    marginLeft: 'auto',
    // textAlign: 'center',
    paddingTop: 5,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};
