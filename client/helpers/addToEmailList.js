import Axios from 'axios';

export function addToEmailList(soundcastId, emailAddressArr, listName, emailListId) {
  return Axios.post('/api/add_emails', {
    soundcastId,
    emailAddressArr,
    listName,
    emailListId,
  })
    .then(res => {
      return res.data.emailListId;
    })
    .catch(err => {
      console.log('ERROR adding to email list: ', err);
    });
}
