import Axios from 'axios';

export function inviteListeners(
  invitees,
  subject,
  content,
  publisherName,
  publisherImage,
  publisherEmail,
  plainEmail,
  bcc
) {
  Axios.post('/api/send_email_invites', {
    invitees,
    subject,
    content,
    publisherName,
    publisherImage,
    publisherEmail,
    plainEmail, // if true, no not apply template
    bcc, // add bcc email address
  })
    .then(res => {
      // console.log(res);
      return res;
    })
    .catch(err => {
      console.log('ERROR send emails to subscribers: ', err);
    });
}
