'use strict';
const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');
const uploader = require('express-fileuploader');

// Fix to prevent setting uid as a filename
// https://github.com/heroicyang/express-fileuploader/blob/master/lib/index.js#L78-L118
uploader.upload = function(strategy, files, callback) {
  var name = strategy;
  strategy = this._strategies[name];
  if (!strategy) {
    return callback(new Error('no upload strategy: ' + name));
  }
  if (!Array.isArray(files)) {
    files = [files];
  }
  var fileCount = files.length;
  files.forEach(function(file) {
    // removing uid setting
    strategy.upload(file, function(err, fileUploaded) {
      if (err) {
        file.error = err;
      }
      if (fileUploaded) {
        Object.keys(fileUploaded).forEach(function(key) {
          if (!file[key]) {
            file[key] = fileUploaded[key];
          }
        });
      }
      fs.unlink(file.path, function(err) {
        /* jshint unused:false */
        fileCount -= 1;
        if (fileCount === 0) {
          callback(null, files);
        }
      });
    });
  });
};

const setAudioTags = (file, imgPath, title, track, artist = 'Unknown') => {
  // from https://stackoverflow.com/questions/18710992/how-to-add-album-art-with-ffmpeg
  // ffmpeg -i in.mp3 -i test.jpeg -map 0:0 -map 1:0 -c copy -id3v2_version 3 -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" out.mp3
  imgPath && file.addCommand('-i', imgPath);
  file.addCommand('-map', '0:0');
  imgPath && file.addCommand('-map', '1:0');
  file.addCommand('-codec', 'copy');
  file.addCommand('-id3v2_version', '3');
  file.addCommand('-metadata:s:v', `title="Album cover"`);
  file.addCommand('-metadata:s:v', `comment="Cover (front)"`);
  const titleEscaped = title
    .replace(/"/g, "'\\\\\\\\\\\\\"'")
    .replace(/%/g, '\\\\\\\\\\\\%')
    .replace(':', '\\\\\\\\\\\\:');
  const artistEscaped = artist
    .replace(/"/g, '\\\\\\\\\\\\"')
    .replace(/%/g, '\\\\\\\\\\\\%')
    .replace(':', '\\\\\\\\\\\\:');
  file.addCommand('-metadata', `title="${titleEscaped}"`);
  if (typeof track === 'number') {
    file.addCommand('-metadata', `track="${track}"`);
  }
  file.addCommand('-metadata', `artist="${artistEscaped}"`);
  file.addCommand('-metadata', `album="${titleEscaped}"`);
  file.addCommand('-metadata', `year="${new Date().getFullYear()}"`);
  file.addCommand('-metadata', `genre="Podcast"`);
};

/* parseSilenceDetect
  example input: (String)
    ...
    Metadata:
      encoder         : Lavc57.107.100 pcm_s16le
    Side data:
      replaygain: track gain - -4.500000, track peak - unknown, album gain - unknown, album peak - unknown,
    size=N/A time=00:02:48.51 bitrate=N/A speed= 337x    [silencedetect @ 0x55e8040] silence_start: 335.262
    [silencedetect @ 0x55e8040] silence_end: 336.249 | silence_duration: 0.987347
    size=N/A time=00:05:37.00 bitrate=N/A speed= 337x
    [silencedetect @ 0x55e8040] silence_start: 459.03
    [silencedetect @ 0x55e8040] silence_end: 460.148 | silence_duration: 1.11796
    size=N/A time=00:08:16.09 bitrate=N/A speed= 337x
    video:0kB audio:85460kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: unknown

  example output: (Array)
    [ ["silence_start"   , "-0.0150208"],
      ["silence_end"     , "5.08898"   ],
      ["silence_duration", "5.104"     ],
      ["silence_start"   , "10.041"    ],
      ["silence_end"     , "15.553"    ],
      ["silence_duration", "5.512"     ],
      ["silence_start"   , "17.481"    ] ]
*/
const parseSilenceDetect = s =>
  s
    .replace(/\[silencedetect/g, '\n[silencedetect')
    .split('\n')
    .filter(i => i.slice(0, 14) === '[silencedetect')
    .map(i => i.split('] ')[1])
    .join(' | ')
    .split(' | ')
    .map(i => i.split(': ')); // *

const logErr = prefix => (msg, response, resolve, reject) => {
  console.error(`Error: ${prefix} ${msg}`);
  response && !response.headersSent && response.status(400).send(`Error: ${prefix} ${msg}`);
  resolve && resolve();
  reject && reject(`Error: ${prefix} ${msg}`);
};

const podcastCategories = {
  '1301': {
    name: 'Arts',
    subCategories: {
      '1306': { name: 'Food', id: '1306' },
      '1401': { name: 'Literature', id: '1401' },
      '1402': { name: 'Design', id: '1402' },
      '1405': { name: 'Performing Arts', id: '1405' },
      '1406': { name: 'Visual Arts', id: '1406' },
      '1459': { name: 'Fashion & Beauty', id: '1459' },
    },
    id: '1301',
  },
  '1303': { name: 'Comedy', subCategories: {}, id: '1303' },
  '1304': {
    name: 'Education',
    subCategories: {
      '1415': { name: 'K-12', id: '1415' },
      '1416': { name: 'Higher Education', id: '1416' },
      '1468': { name: 'Educational Technology', id: '1468' },
      '1469': { name: 'Language Courses', id: '1469' },
      '1470': { name: 'Training', id: '1470' },
    },
    id: '1304',
  },
  '1305': { name: 'Kids & Family', subCategories: {}, id: '1305' },
  '1307': {
    name: 'Health',
    subCategories: {
      '1417': { name: 'Fitness & Nutrition', id: '1417' },
      '1420': { name: 'Self-Help', id: '1420' },
      '1421': { name: 'Sexuality', id: '1421' },
      '1481': { name: 'Alternative Health', id: '1481' },
    },
    id: '1307',
  },
  '1309': { name: 'TV & Film', subCategories: {}, id: '1309' },
  '1310': { name: 'Music', subCategories: {}, id: '1310' },
  '1311': { name: 'News & Politics', subCategories: {}, id: '1311' },
  '1314': {
    name: 'Religion & Spirituality',
    subCategories: {
      '1438': { name: 'Buddhism', id: '1438' },
      '1439': { name: 'Christianity', id: '1439' },
      '1440': { name: 'Islam', id: '1440' },
      '1441': { name: 'Judaism', id: '1441' },
      '1444': { name: 'Spirituality', id: '1444' },
      '1463': { name: 'Hinduism', id: '1463' },
      '1464': { name: 'Other', id: '1464' },
    },
    id: '1314',
  },
  '1315': {
    name: 'Science & Medicine',
    subCategories: {
      '1477': { name: 'Natural Sciences', id: '1477' },
      '1478': { name: 'Medicine', id: '1478' },
      '1479': { name: 'Social Sciences', id: '1479' },
    },
    id: '1315',
  },
  '1316': {
    name: 'Sports & Recreation',
    subCategories: {
      '1456': { name: 'Outdoor', id: '1456' },
      '1465': { name: 'Professional', id: '1465' },
      '1466': { name: 'College & High School', id: '1466' },
      '1467': { name: 'Amateur', id: '1467' },
    },
    id: '1316',
  },
  '1318': {
    name: 'Technology',
    subCategories: {
      '1446': { name: 'Gadgets', id: '1446' },
      '1448': { name: 'Tech News', id: '1448' },
      '1450': { name: 'Podcasting', id: '1450' },
      '1480': { name: 'Software How-To', id: '1480' },
    },
    id: '1318',
  },
  '1321': {
    name: 'Business',
    subCategories: {
      '1410': { name: 'Careers', id: '1410' },
      '1412': { name: 'Investing', id: '1412' },
      '1413': { name: 'Management & Marketing', id: '1413' },
      '1471': { name: 'Business News', id: '1471' },
      '1472': { name: 'Shopping', id: '1472' },
    },
    id: '1321',
  },
  '1323': {
    name: 'Games & Hobbies',
    subCategories: {
      '1404': { name: 'Video Games', id: '1404' },
      '1454': { name: 'Automotive', id: '1454' },
      '1455': { name: 'Aviation', id: '1455' },
      '1460': { name: 'Hobbies', id: '1460' },
      '1461': { name: 'Other Games', id: '1461' },
    },
    id: '1323',
  },
  '1324': {
    name: 'Society & Culture',
    subCategories: {
      '1302': { name: 'Personal Journals', id: '1302' },
      '1320': { name: 'Places & Travel', id: '1320' },
      '1443': { name: 'Philosophy', id: '1443' },
      '1462': { name: 'History', id: '1462' },
    },
    id: '1324',
  },
  '1325': {
    name: 'Government & Organizations',
    subCategories: {
      '1473': { name: 'National', id: '1473' },
      '1474': { name: 'Regional', id: '1474' },
      '1475': { name: 'Local', id: '1475' },
      '1476': { name: 'Non-Profit', id: '1476' },
    },
    id: '1325',
  },
}; // podcastCategories

const createContentPush = (type, announcementId, soundcastId, title, body) => {
  return {
    data: { type, announcementId, soundcastId },
    notification: { title, body },
  };
};

const getContentPush = entity => {
  const soundcastId = entity.soundcastId;
  if (entity.likeId === undefined) {
    return entity.announcementId
      ? createContentPush(
          'COMMENT_MESSAGE',
          entity.announcementId,
          soundcastId,
          'Comment message',
          'text'
        )
      : createContentPush(
          'COMMENT_EPISODE',
          entity.episodeId,
          soundcastId,
          'Comment episode',
          entity.content
        );
  } else {
    return entity.announcementId
      ? createContentPush(
          'LIKE_MESSAGE',
          entity.announcementId,
          soundcastId,
          'Like message',
          'text'
        )
      : entity.episodeId
      ? createContentPush('LIKE_EPISODE', entity.episodeId, soundcastId, 'Like episode', 'text')
      : createContentPush('LIKE_COMMENT', entity.commentId, soundcastId, 'Like comment', 'text');
  }
};

const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const EventTypes = Object.freeze({
  EPISODE_LIKED: 'episode_liked',
  MESSAGE_LIKED: 'message_liked',
  EP_COMMENT_LIKED: 'episode_comment_liked',
  MSG_COMMENT_LIKED: 'message_comment_liked',
  COMMENT_LIKED: 'comment_liked',
  EPISODE_COMMENTED: 'episode_commented',
  MESSAGE_COMMENTED: 'message_commented',
  EP_COMMENT_REPLIED: 'ep_comment_replied',
  MSG_COMMENT_REPLIED: 'msg_comment_replied',
  NEW_EPISODE_PUBLISHED: 'new_episode_published',
  NEW_MESSAGE_POSTED: 'new_message_posted',
});

const isFreeAccount = userInfo => {
  const curTime = moment().format('X');
  if (
    userInfo &&
    userInfo.publisher &&
    userInfo.publisher.plan &&
    userInfo.publisher.current_period_end > curTime
  ) {
    return false;
  }
  return true;
};

module.exports = prefix => ({
  EventTypes,
  getContentPush,
  uploader,
  setAudioTags,
  parseSilenceDetect,
  podcastCategories,
  getRandomColor,
  isFreeAccount,
  logErr: logErr(prefix), // set prefix
});
