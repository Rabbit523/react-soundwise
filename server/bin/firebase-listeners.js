'use strict';

// **** listening for firebase data changes for users, soundcasts,
// **** comments, likes, and make changes in postgres accordingly ****

var firebase = require('firebase-admin');
const database = require('../../database/index');

module.exports.transferLikes = () => {
  // add or delete data from likes node in firebase according to changes to likes in announcements and episodes
  const soundcastsRef = firebase.database().ref('/soundcasts');
  const episodesRef = firebase.database().ref('/episodes');
  const likesRef = firebase.database().ref('/likes');
  // soundcastsRef.limitToLast(1).on('child_added', soundcast => {
  //   const soundcastObj = soundcast.val();
  //   const soundcastId = soundcast.key;
  //   if(soundcastObj.announcements) {
  //     for(const key in soundcastObj.announcements) {
  //       if(soundcastObj.announcements[key].likes) {
  //         for(var userId in soundcastObj.announcements[key].likes) {
  //           const newLikeId = `${userId}-${key}`;
  //           firebase.database().ref(`/likes/${newLikeId}`).once('value', snapshot => {
  //             if(!snapshot.val()) { // if data doesn't already exist
  //               firebase.database().ref(`/likes/${newLikeId}`).set({
  //                 announcementId: key,
  //                 userId,
  //                 soundcastId,
  //                 timeStamp: soundcastObj.announcements[key].likes[userId]
  //               });
  //             }
  //           })
  //         }
  //       }
  //     }
  //   }
  // });
  episodesRef.limitToLast(1).on('child_added', episode => {
    const episodeObj = episode.val();
    const episodeId = episode.key;
    if (episodeObj.likes) {
      for (const key in episodeObj.likes) {
        const newLikeId = `${key}-${episodeId}`;
        firebase
          .database()
          .ref(`/likes/${newLikeId}`)
          .once('value', snapshot => {
            if (!snapshot.val()) {
              firebase
                .database()
                .ref(`/likes/${newLikeId}`)
                .set({
                  episodeId,
                  userId: key,
                  soundcastId: episodeObj.soundcastID,
                  timeStamp: episodeObj.likes[key],
                });
            }
          });
      }
    }
  });
};

module.exports.transferMessages = () => {
  // add or delete data from messages node and likes node in firebase according to changes to 'announcements' under soundcast node
  const soundcastsRef = firebase.database().ref('/soundcasts');
  const messagesRef = firebase.database().ref('/messages');
  soundcastsRef.limitToLast(1).on('child_added', soundcast => {
    const soundcastObj = soundcast.val();
    const soundcastId = soundcast.key;
    if (soundcastObj.announcements) {
      // console.log(Object.keys(soundcastObj.announcements));
      for (const key in soundcastObj.announcements) {
        const {
          content,
          creatorID,
          date_created,
          id,
          isPublished,
          publisherID,
          soundcastID,
        } = soundcastObj.announcements[key];
        firebase
          .database()
          .ref(`/messages/${key}`)
          .once('value', snapshot => {
            if (!snapshot.val()) {
              // if data doesn't already exist
              firebase
                .database()
                .ref(`/messages/${key}`)
                .set({
                  content,
                  creatorID,
                  date_created,
                  id,
                  isPublished,
                  publisherID,
                  soundcastID,
                });
            }
          });
        if (soundcastObj.announcements[key].likes) {
          for (const userId in soundcastObj.announcements[key].likes) {
            const newLikeId = `${userId}-${key}`;
            firebase
              .database()
              .ref(`/likes/${newLikeId}`)
              .once('value', snapshot => {
                if (!snapshot.val()) {
                  // if data doesn't already exist
                  firebase
                    .database()
                    .ref(`/likes/${newLikeId}`)
                    .set({
                      announcementId: key,
                      userId,
                      soundcastId,
                      timeStamp: soundcastObj.announcements[key].likes[userId],
                    });
                }
              });
          }
        }
      }
    }
  });
};

module.exports.firebaseListeners = () => {
  // sync firebase with postgres
  const usersRef = firebase.database().ref('/users');
  const commentsRef = firebase.database().ref('/comments');
  const likesRef = firebase.database().ref('/likes');
  const soundcastsRef = firebase.database().ref('/soundcasts');
  const episodesRef = firebase.database().ref('/episodes');
  const messagesRef = firebase.database().ref('/messages');

  usersRef.on('child_added', addOrUpdateUserRecord);
  usersRef.on('child_changed', addOrUpdateUserRecord);
  usersRef.on('child_removed', deleteUserRecord);

  commentsRef.on('child_added', addOrUpdateCommentRecord);
  commentsRef.on('child_changed', addOrUpdateCommentRecord);
  commentsRef.on('child_removed', deleteCommentRecord);

  likesRef.on('child_added', addOrUpdateLikeRecord);
  likesRef.on('child_removed', deleteLikeRecord);

  soundcastsRef.on('child_added', addOrUpdateSoundcastRecord);
  soundcastsRef.on('child_changed', addOrUpdateSoundcastRecord);
  soundcastsRef.on('child_removed', deleteSoundcastRecord);

  // Events table
  episodesRef.on('child_added', addEpisodeEvent);
  episodesRef.on('child_removed', removeEpisodeEvent);
  likesRef.on('child_added', addLikeEvent);
  likesRef.on('child_removed', removeLikeEvent);
  commentsRef.on('child_added', addCommentOrReplyEvent);
  commentsRef.on('child_removed', removeCommentOrReplyEvent);
  messagesRef.on('child_added', addMessageEvent);
  messagesRef.on('child_removed', removeMessageEvents);
};

function clearRelatedEntities(path, id, field, relatedPath) {
  firebase
    .database()
    .ref(`${path}/${id}/${field}`)
    .once('value')
    .then(
      snapshot =>
        snapshot &&
        Object.keys(snapshot.val()).forEach(id => {
          firebase
            .database()
            .ref(`${relatedPath}/${id}`)
            .remove();
        })
    );
}

function addOrUpdateUserRecord(user) {
  // Get Firebase object
  if (user.val()) {
    const { firstName, lastName, pic_url, email, token } = user.val();
    const userId = user.key;
    const userObj = {
      userId,
      token,
      email,
      firstName,
      lastName,
      picURL: pic_url,
    };

    // Add or update object
    database.User.findOne({
      where: { userId },
    })
      .then(userData => {
        if (userData) {
          // update
          return userData.update(userObj);
        } else {
          // create
          subsctibeOnSoundcast(userObj);
          return database.User.create(userObj);
        }
      })
      .catch(err => {
        console.log('error saving user data: ', err);
      });
  }
}

function subsctibeOnSoundcast(user) {
  firebase
    .database()
    .ref(`invitations/${user.email}`)
    .once('value')
    .then(snapshot => {
      console.log(snapshot);
      console.log(snapshot.val());
      snapshot &&
        Object.keys(snapshot.val()).forEach(soundcastId => {
          console.log(soundcastId);
          firebase
            .database()
            .ref(`soundcasts/${soundcastId}/subscribed`)
            .set({ [user.userId]: { 0: user.token } });
          firebase
            .database()
            .ref(`soundcasts/${soundcastId}`)
            .once('value')
            .then(snapshot => {
              if (snapshot === 'undefined') return;
              const moment = require('moment');
              const soundcast = snapshot.val();
              const current_period_end = soundcast.rentalPeriod
                ? moment()
                    .add(Number(soundcast.rentalPeriod), 'days')
                    .format('X')
                : 4638902400;
              firebase
                .database()
                .ref(`user/${user.userId}/soundcasts`)
                .set({
                  [soundcastId]: {
                    billingCycle: soundcast.prices[0].billingCycle || 'free',
                    current_period_end,
                    date_subscribed: Date.now(),
                    subscribed: true,
                  },
                });
            });
          firebase
            .database()
            .ref(`invitations/${user.email}`)
            .remove();
        });
    });
}

function deleteUserRecord(user) {
  const userId = user.key;
  database.User.findOne({
    where: { userId },
  })
    .then(userData => {
      if (userData) {
        return userData.destroy();
      }
    })
    .catch(err => {
      console.log('error deleting user data: ', err);
    });
}

function addOrUpdateCommentRecord(comment) {
  // Get Firebase object
  if (comment.val()) {
    const { episodeID, announcementID, soundcastId, userID, content, timestamp } = comment.val();
    const commentId = comment.key;
    // const parsedIDs = commentId.split('-');
    // let parentId;
    // if(parsedIDs.length == 3) {
    //   parentId = parsedIDs[1];
    // }
    const commentObj = {
      commentId,
      userId: userID,
      soundcastId,
      // parentId,
      episodeId: episodeID || null,
      announcementId: announcementID || null,
      content,
      timeStamp: Number(timestamp),
    };

    // Add or update object
    database.Comment.findOne({
      where: { commentId },
    })
      .then(commentData => {
        if (commentData) {
          // update
          return commentData.update(commentObj);
        } else {
          // create
          return database.Comment.create(commentObj);
        }
      })
      .catch(err => {
        console.log('error saving comment data: ', err);
      });
  }
}

function deleteCommentRecord(comment) {
  const commentId = comment.key;
  database.Comment.findOne({
    where: { commentId },
  })
    .then(data => {
      if (data) {
        clearRelatedEntities('comments', commentId, 'children', 'comments');
        return data.destroy();
      }
    })
    .catch(err => {
      console.log('error deleting comment data: ', err);
    });
}

function addOrUpdateLikeRecord(like) {
  // Get Firebase object
  if (like.val()) {
    const { episodeId, announcementId, commentId, soundcastId, userId, timeStamp } = like.val();
    const likeId = like.key;
    const likeObj = {
      likeId,
      userId,
      soundcastId,
      episodeId: episodeId || null,
      announcementId: announcementId || null,
      commentId: commentId || null,
      timeStamp: Number(timeStamp),
    };

    // Add or update object
    database.Like.findOne({
      where: { likeId },
    })
      .then(likeData => {
        if (likeData) {
          // update
          return likeData.update(likeObj);
        } else {
          // create
          return database.Like.create(likeObj);
        }
      })
      .catch(err => {
        console.log('error saving like data: ', err);
      });
  }
}

function deleteLikeRecord(like) {
  const likeId = like.key;
  database.Like.findOne({
    where: { likeId },
  })
    .then(data => {
      if (data) {
        return data.destroy();
      }
    })
    .catch(err => {
      console.log('error deleting like data: ', err);
    });
}

function addOrUpdateSoundcastRecord(soundcast) {
  // Get Firebase object
  if (soundcast.val()) {
    const {
      publisherID,
      title,
      imageURL,
      itunesId,
      category,
      rank,
      last_update,
      published,
      landingPage,
    } = soundcast.val();
    const soundcastId = soundcast.key;
    const soundcastObj = {
      soundcastId,
      publisherId: publisherID,
      title,
      imageUrl: imageURL,
      itunesId,
      category,
      updateDate: last_update,
      published,
      landingPage,
    };

    // Add or update object
    database.Soundcast.findOne({
      where: { soundcastId },
    })
      .then(soundcastData => {
        if (soundcastData) {
          // update
          return soundcastData.update(soundcastObj);
        } else {
          // create
          return database.Soundcast.create(soundcastObj);
        }
      })
      .catch(err => {
        console.log('error saving soundcast data: ', err);
      });
  }
}

function deleteSoundcastRecord(soundcast) {
  const soundcastId = soundcast.key;
  database.Soundcast.findOne({
    where: { soundcastId },
  })
    .then(soundcastData => {
      if (soundcastData) {
        return soundcastData.destroy();
      }
    })
    .catch(err => {
      console.log('error deleting soundcast data: ', err);
    });
}

// functions for the Events table
function getFirebaseUserById(userId) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref(`/users/${userId}`)
      .once('value', snapshot => {
        const user = snapshot.val();
        if (user) {
          return resolve(user);
        } else {
          return resolve({});
        }
      });
  });
}

function getSoundcastById(soundcastID) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref(`/soundcasts/${soundcastID}`)
      .once('value', snapshot => {
        const soundcast = snapshot.val();
        if (soundcast) {
          return resolve(soundcast);
        } else {
          return resolve({});
        }
      });
  });
}

function getEpisodeById(episodeId) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref(`/episodes/${episodeId}`)
      .once('value', snapshot => {
        const episode = snapshot.val();
        if (soundcast) {
          return resolve(episode);
        } else {
          return resolve({});
        }
      });
  });
}

function getParentComment(parentId) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref(`/comments/${parentId}`)
      .once('value', snapshot => {
        const parentComment = snapshot.val();
        if (parentComment) {
          return resolve(parentComment);
        } else {
          return resolve({});
        }
      });
  });
}

async function addEpisodeEvent(episode) {
  if (episode.val()) {
    const { creatorID, soundcastID, publisherID, title } = episode.val();
    const episodeId = episode.key;
    const user = await getFirebaseUserById(creatorID);
    const soundcast = await getSoundcastById(soundcastID);
    const eventObj = {
      type: 'episode',
      story: `${soundcast.title} published ${title}`,
      userId: creatorID,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: soundcast.imageURL,
      episodeId,
      soundcastId: soundcastID,
      publisherId: publisherID,
    };

    // Add event
    return database.Event.create(eventObj).catch(err => {
      console.log('error creating episode event: ', err);
    });
  }
}

function removeEpisodeEvent(episode) {
  const episodeId = episode.key;
  database.Event.findOne({
    where: { type: 'episode', episodeId },
  })
    .then(eventData => {
      if (eventData) {
        clearRelatedEntities('episodes', episodeId, 'likes', 'likes');
        return eventData.destroy();
      }
    })
    .catch(err => {
      console.log('error deleting episode event: ', err);
    });
}

async function addLikeEvent(like) {
  if (like.val()) {
    const { userId, episodeId, soundcastId, announcementId, commentId, commentUserId } = like.val();
    const likeId = like.key;
    const user = await getFirebaseUserById(userId);
    const episode = await getEpisodeById(episodeId);
    const eventObj = {
      type: 'like',
      story: `${user.firstName} ${user.lastName} liked ${episode.title}`,
      likeId,
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.pic_url,
      episodeId,
      soundcastId,
      messageId: announcementId,
      commentId,
      commentUserId,
    };

    // Add event
    return database.Event.create(eventObj).catch(err => {
      console.log('error creating like event: ', err);
    });
  }
}

function removeLikeEvent(like) {
  const likeId = like.key;
  database.Event.findOne({
    where: { type: 'like', likeId },
  })
    .then(eventData => {
      if (eventData) {
        return eventData.destroy();
      }
    })
    .catch(err => {
      console.log('error deleting like event: ', err);
    });
}

async function addCommentOrReplyEvent(comment) {
  if (comment.val()) {
    const commentId = comment.key;
    const nHyphens = (commentId.match(/-/g) || []).length;
    let type = '';
    if (nHyphens === 1) type = 'comment';
    if (nHyphens === 2) type = 'reply';
    if (!type) return;
    let parentId = null;
    if (type === 'reply') {
      parentId = `${commentId.split('-', 2)[1]}-${commentId.split('-', 3)[2]}`;
    }
    const { userID, episodeID, soundcastId, announcementID } = comment.val();
    const user = await getFirebaseUserById(userID);
    let episode, soundcast;
    if (episodeID) {
      episode = await getEpisodeById(episodeID);
    } else {
      soundcast = await getSoundcastById(soundcastId);
    }
    const parentComment = await getParentComment(parentId);
    const story = episodeID
      ? `${user.firstName} ${user.lastName} commented on ${episode.title}`
      : `${user.firstName} ${user.lastName} commented on ${soundcast.title}'s message`;
    const eventObj = {
      type,
      story,
      userId: userID,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.pic_url,
      episodeId: episodeID,
      soundcastId,
      messageId: announcementID,
      commentId,
      parentId,
      parentUserId: parentComment.userID,
    };

    // Add event
    return database.Event.create(eventObj).catch(err => {
      console.log('error creating comment or reply event: ', err);
    });
  }
}

function removeCommentOrReplyEvent(comment) {
  const commentId = comment.key;
  const nHyphens = (commentId.match(/-/g) || []).length;
  let type = '';
  if (nHyphens === 1) type = 'comment';
  if (nHyphens === 2) type = 'reply';
  if (!type) return;
  database.Event.findOne({
    where: { type, commentId },
  })
    .then(eventData => {
      if (eventData) {
        return eventData.destroy();
      }
    })
    .catch(err => {
      console.log('error deleting comment or reply event: ', err);
    });
}

async function addMessageEvent(message) {
  if (message.val()) {
    const { creatorID, soundcastID, publisherID } = message.val();
    const messageId = message.key;
    const user = await getFirebaseUserById(creatorID);
    const eventObj = {
      type: 'message',
      story: `${user.firstName} ${user.lastName} sent you a message`,
      userId: creatorID,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.pic_url,
      soundcastId,
      messageId,
      publisherId,
    };

    // Add event
    return database.Event.create(eventObj).catch(err => {
      console.log('error creating message event: ', err);
    });
  }
}

function removeMessageEvents(message) {
  const messageId = message.key;
  database.Event.findOne({
    where: { type: 'message', messageId },
  })
    .then(eventData => {
      if (eventData) {
        return eventData.destroy();
      }
    })
    .catch(err => {
      console.log('error deleting message event: ', err);
    });
}
