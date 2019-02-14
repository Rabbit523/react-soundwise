import Axios from 'axios';

export function sendMarketingEmails(
  listIds,
  subject,
  content,
  publisherName,
  publisherImage,
  publisherEmail,
  unsubscribeGroup
) {
  return Axios.post('/api/send_marketing_emails', {
    listIds,
    subject,
    content,
    publisherName,
    publisherImage,
    publisherEmail,
    unsubscribeGroup,
  })
    .then(res => {
      // console.log('compaignId: ', res.data.compaignId);
      return res.data.campaignId;
    })
    .catch(err => {
      console.log('ERROR send emails to subscribers: ', err);
    });
}
