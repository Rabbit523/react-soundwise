'use strict';
const fs = require('fs');
const moment = require('moment');
const request = require('request-promise');
const fileType = require('file-type');
const YoutubeMp3Downloader = require('./youtube-mp3-downloader');
const S3Strategy = require('express-fileuploader-s3');
const { google } = require('googleapis');
const ffmpeg = require('./ffmpeg');
const awsConfig = require('../../config').awsConfig;
const { addFeedEpisode } = require('./parseFeed.js');
const { createFeed } = require('./feed');
const { audioProcessingCommon } = require('./audioProcessing.js');
const { logErr, uploader, setAudioTags } = require('./utils')('importChannelVideos.js');

const maxVideosCount = 50; // videos count to download
const service = google.youtube('v3');
const auth = `AIzaSyCHN-D1qk3MCg5YIGl4NzsoblqC3b6bLHs`; // use API Key

const listPlaylistRecursion = (videoItems, params, reject, resolve) => {
  service.playlistItems.list(params, async (err, response) => {
    if (err) {
      const description =
        err && err.response && err.response.data && err.response.data.error_description;
      return reject(`playlistItems.list ${err} ${description} ${err && err.stack}`);
    }
    await new Promise(resolve2 => {
      let ids = response.data.items.filter(i => !!i.contentDetails.videoId);
      ids = ids.map(i => i.contentDetails.videoId).slice(0, maxVideosCount - videoItems.length);
      const params2 = {
        id: ids.join(','),
        part: `snippet,contentDetails`, // `,statistics`
        maxResults: params.maxResults,
        auth,
      };
      service.videos.list(params2, (err, response2) => {
        if (err) {
          return reject(`videos.list ${err} ${err && err.stack}`);
        }
        response2.data.items.forEach(i => videoItems.push(i));
        resolve2();
      });
    });
    if (videoItems.length < maxVideosCount && response.data.nextPageToken) {
      params.pageToken = response.data.nextPageToken;
      listPlaylistRecursion(videoItems, params, reject, resolve);
    } else {
      resolve(videoItems);
    }
  });
};
const listPlaylist = async playlistId => {
  try {
    const videoItems = [];

    // obtain playlist name
    await new Promise((resolve, reject) => {
      const params = { auth, id: playlistId, part: `snippet` };
      service.playlists.list(params, async (err, response) => {
        if (err) {
          const description =
            err && err.response && err.response.data && err.response.data.error_description;
          return reject(`playlists.list ${err} ${description} ${err && err.stack}`);
        }
        if (!response || !response.data || !response.data.items || !response.data.items.length) {
          return reject(`playlists.list empty response ${playlistId}`);
        }
        videoItems.playlistName = response.data.items[0].snippet.title;
        resolve();
      });
    });

    // obtain videoItems
    await new Promise((resolve, reject) => {
      const params = { auth, playlistId, part: `contentDetails`, maxResults: `50` };
      listPlaylistRecursion(videoItems, params, reject, resolve);
    });
    return videoItems;
  } catch (err) {
    logErr(`listPlaylist ${playlistId} ${err} ${err && err.stack}`);
  }
};

const listChannelRecursion = (videoItems, params, reject, resolve) => {
  service.search.list(params, async (err, response) => {
    if (err) {
      const description =
        err && err.response && err.response.data && err.response.data.error_description;
      return reject(`service.search.list ${err} ${description} ${err && err.stack}`);
    }
    await new Promise(resolve2 => {
      let ids = response.data.items.filter(i => i.id.kind === 'youtube#video');
      ids = ids.map(i => i.id.videoId).slice(0, maxVideosCount - videoItems.length);
      const params2 = {
        id: ids.join(','),
        part: `snippet,contentDetails`, // `,statistics`
        maxResults: params.maxResults,
        auth,
      };
      service.videos.list(params2, (err, response2) => {
        if (err) {
          return reject(`videos.list ${err} ${err && err.stack}`);
        }
        response2.data.items.forEach(i => videoItems.push(i));
        resolve2();
      });
    });
    if (videoItems.length < maxVideosCount && response.data.nextPageToken) {
      params.pageToken = response.data.nextPageToken;
      listChannelRecursion(videoItems, params, reject, resolve);
    } else {
      resolve(videoItems);
    }
  });
};
const listChannel = async channelId => {
  try {
    const videoItems = [];
    await new Promise((resolve, reject) => {
      const params = { auth, channelId, order: 'date', part: `id`, maxResults: `50` };
      listChannelRecursion(videoItems, params, reject, resolve);
    });
    return videoItems;
  } catch (err) {
    logErr(`listChannel ${channelId} ${err} ${err && err.stack}`);
  }
};

const getChannelInfo = async channelId => {
  try {
    const result = {};
    await new Promise((resolve, reject) => {
      const params = { auth, id: channelId, part: `snippet` };
      service.channels.list(params, async (err, response) => {
        if (err) {
          const description =
            err && err.response && err.response.data && err.response.data.error_description;
          return reject(`channels.list ${err} ${description} ${err && err.stack}`);
        }
        if (!response || !response.data || !response.data.items || !response.data.items.length) {
          return reject(`channels.list empty response ${channelId}`);
        }
        result.snippet = response.data.items[0].snippet;
        resolve();
      });
    });
    return result;
  } catch (err) {
    logErr(`getChannelInfo ${channelId} ${err} ${err && err.stack}`);
  }
};

const listSingleVideo = async videoId => {
  try {
    return await new Promise((resolve, reject) => {
      const part = `snippet,contentDetails`; // `,statistics`
      const params2 = { auth, id: videoId, part, maxResults: `1` };
      service.videos.list(params2, (err, response2) => {
        if (err) {
          const description =
            err && err.response && err.response.data && err.response.data.error_description;
          return reject(`videos.list ${err} ${description} ${err && err.stack}`);
        }
        resolve(response2.data.items);
      });
    });
  } catch (err) {
    logErr(`listSingleVideo ${videoId} ${err} ${err && err.stack}`);
  }
};
///// GoogleAuth-End
/////////////////////////

const importChannelVideos = async (
  videoItems,
  audioProcessingOptions,
  soundcast,
  soundcastId,
  publisherId,
  creatorId,
  itunesCategory,
  skipChannelConversion
) => {
  try {
    let episodeIndex = Object.keys(soundcast.episodes || {}).length; // episodes count
    const results = {
      metadata: {
        title: videoItems.metadataTitle,
        author: videoItems.metadataAuthor,
      },
      feedItems: videoItems.map(i => {
        return {
          id: i.id,
          title: i.snippet.title,
          description: i.snippet.description,
          date: new Date(i.snippet.publishedAt),
          image: { url: `https://i.ytimg.com/vi/${i.id}/sddefault.jpg` },
          // image: i.snippet.thumbnails.standard,
          'itunes:duration': {
            '#': moment.duration(i.contentDetails.duration, moment.ISO_8601).asSeconds(),
          },
        };
      }),
    };

    // Sort the list of videos according to timestamp when it was created. Note that when
    // creating episodes in the soundcast, an older episode should have a lower index number.
    results.feedItems.sort((a, b) => {
      return a.date - b.date;
    });

    // 4. Convert videos to MP3 files
    if (!skipChannelConversion) {
      await Promise.all(
        results.feedItems.map(item => {
          const currentEpisodeIndex = episodeIndex;
          episodeIndex++; // increment
          return new Promise((resolve, reject) => {
            const YD = new YoutubeMp3Downloader();
            console.log(`INFO YoutubeMp3Downloader ${publisherId} ${soundcastId} ${item.id}`);
            YD.download(item.id, `${item.id}.mp3`);
            YD.on('error', error => reject(error));
            YD.on('finished', (err, itemResult) => {
              if (err || !itemResult) {
                return reject(err || `empty itemResult ${item.id}`);
              }
              // 4.2. Process audio files
              audioProcessingCommon(itemResult.file, audioProcessingOptions, setTags, reject);
              function setTags(filePath) {
                if (itemResult.file !== filePath) {
                  fs.unlink(itemResult.file, err => 0);
                }
                new ffmpeg(filePath).then(
                  async file => {
                    if (audioProcessingOptions.tagging) {
                      let coverPath;
                      await new Promise(resolve2 => {
                        request
                          .get({ url: item.image.url, encoding: null })
                          .then(body => {
                            const savePath = `/tmp/${item.id}.${fileType(body).ext}`;
                            fs.writeFile(savePath, body, err => {
                              if (err) {
                                const errMsg = `WARN: cannot save cover image file ${savePath}`;
                                console.log(`${errMsg} ${err} ${err && err.stack}`);
                              }
                              coverPath = savePath;
                              resolve2();
                            });
                          })
                          .catch(err => {
                            const errMsg = item.image.url + ' ' + err.toString().slice(0, 100);
                            console.log(`WARN: unable to obtain cover ${errMsg}`);
                            resolve2();
                          });
                      });
                      const author = results.metadata.author;
                      setAudioTags(file, coverPath, item.title, currentEpisodeIndex, author);
                      nextProcessing(filePath, file, coverPath);
                    } else {
                      nextProcessing(filePath, file);
                    }
                  },
                  err => reject(`audioProcessingCommon unable to parse file with ffmpeg ${err}`)
                );
              }
              function nextProcessing(filePath, file, coverPath) {
                const outputPath = `${filePath.slice(0, -4)}_output.mp3`;
                file.save(outputPath, async err => {
                  if (err) {
                    return reject(`output save fails ${outputPath} ${err}`);
                  }
                  fs.unlink(filePath, err => 0); // remove original file
                  coverPath && fs.unlink(coverPath, err => 0); // remove cover

                  // 4.3. Create episode from video metatdata and processed mp3 file
                  // Add the converted audio as a new episode to the soundcast, save episode info in firebase and postgres
                  const episodeId = `${moment().format('x')}e`;
                  const episodeUrl = `https://mysoundwise.com/tracks/${episodeId}.mp3`;
                  item.enclosures = [{ url: episodeUrl }];
                  await addFeedEpisode(
                    item,
                    creatorId,
                    publisherId,
                    soundcastId,
                    soundcast,
                    results.metadata,
                    currentEpisodeIndex,
                    episodeId
                  );

                  const uploaderStrategy = new S3Strategy({
                    uploadPath: 'soundcasts',
                    headers: { 'x-amz-acl': 'public-read' },
                    options: {
                      key: awsConfig.accessKeyId,
                      secret: awsConfig.secretAccessKey,
                      bucket: 'soundwiseinc',
                    },
                  });
                  uploader.use(uploaderStrategy);
                  const fileObj = { path: outputPath, name: `${episodeId}.mp3` };
                  uploader.upload('s3', fileObj, (err, files) => {
                    if (err) {
                      return logErr(`upload ${outputPath} ${episodeId}.mp3 to S3 ${err}`);
                    }
                  });

                  resolve();
                });
              }
            });
          }); // new Promise
        }) // results.feedItems.map
      ); // await Promise.all
    }

    const {
      createChannelFeed,
      itunesExplicit,
      publisherEmail,
      publisherName,
    } = audioProcessingOptions;
    if (createChannelFeed) {
      const itunesImage = soundcast.itunesImage || soundcast.imageURL;
      createFeed(
        {
          body: {
            // req.body
            soundcastId,
            soundcastTitle: soundcast.title,
            itunesImage: itunesImage.replace('dummyimage.com/300.png/', 'dummyimage.com/1400.png/'),
            itunesCategory,
            itunesExplicit,
            autoSubmitPodcast: soundcast.autoSubmitPodcast,
            email: publisherEmail,
            firstName: publisherName,
          },
        },
        {
          // res mocking object
          error: logErr,
          status: status => ({ send: () => 0 }),
        }
      );
    }
  } catch (err) {
    logErr(`catch ${err} ${err && err.stack}`);
    return Promise.reject(err);
  }
};

module.exports = {
  listChannel,
  listPlaylist,
  listSingleVideo,
  getChannelInfo,
  importChannelVideos,
};
