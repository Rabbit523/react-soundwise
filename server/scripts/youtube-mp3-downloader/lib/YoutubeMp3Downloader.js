"use strict";
var os = require("os");
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var ffmpeg = require("fluent-ffmpeg");
var ytdl = require("ytdl-core");
// var async = require("async");
var progress = require("progress-stream");
var sanitize = require("sanitize-filename");

var taskQueue = [];
var maxThreads = 3;
var runningCount = 0;

function YoutubeMp3Downloader(options) {
    var self = this;
    self.youtubeBaseUrl = "http://www.youtube.com/watch?v=";
    self.youtubeVideoQuality = (options && options.youtubeVideoQuality ? options.youtubeVideoQuality : "highest");
    self.outputPath = (options && options.outputPath ? options.outputPath : (os.platform() === "win32" ? "C:/Windows/Temp" : "/tmp"));
    self.queueParallelism = (options && options.queueParallelism ? options.queueParallelism : 1);
    self.progressTimeout = (options && options.progressTimeout ? options.progressTimeout : 1000);
    self.fileNameReplacements = [[/"/g, ""], [/'/g, ""], [/\//g, ""], [/\?/g, ""], [/:/g, ""], [/;/g, ""]];
    self.requestOptions = (options && options.requestOptions ? options.requestOptions : { maxRedirects: 5 });
    self.outputOptions = (options && options.outputOptions ? options.outputOptions : []);

    if (options && options.ffmpegPath) {
        ffmpeg.setFfmpegPath(options.ffmpegPath);
    }

    // //Async download/transcode queue
    // self.downloadQueue = async.queue(function (task, callback) {
    //
    //     self.emit("queueSize", self.downloadQueue.running() + self.downloadQueue.length());
    //
    //     self.performDownload(task, function(err, result) {
    //         callback(err, result);
    //     });
    //
    // }, self.queueParallelism);

}

util.inherits(YoutubeMp3Downloader, EventEmitter);

YoutubeMp3Downloader.prototype.cleanFileName = function(fileName) {
    var self = this;

    self.fileNameReplacements.forEach(function(replacement) {
        fileName = fileName.replace(replacement[0], replacement[1]);
    });

    return fileName;
};

YoutubeMp3Downloader.prototype.download = function(videoId, fileName) {

    var self = this;
    var task = {
        videoId: videoId,
        fileName: fileName
    };

    /////// // - Old async queue usage -
    // self.downloadQueue.push(task, function (err, data) {
    //
    //     self.emit("queueSize", self.downloadQueue.running() + self.downloadQueue.length());
    ///////

    // call performDownload directly
    self.performDownload(task, function (err, data) {
        if (err) {
            self.emit("error", err, data);
        } else {
            self.emit("finished", err, data);
        }
    });

};

YoutubeMp3Downloader.prototype.performDownload = function(task, callback) {
  var self = this;

  const item = [task, (err, data) => {
    if (taskQueue.length) { // have items to run
      const item = taskQueue.shift();
      item.contextSaved.performDownloadOriginal.call(item.contextSaved, item);
    } else {
      runningCount--;
    }
    callback(err, data); // return value
  }];
  item.contextSaved = this; // save context
  if (runningCount < maxThreads) {
    runningCount++;
    item.contextSaved.performDownloadOriginal.call(item.contextSaved, item);
  } else {
    taskQueue.push(item);
  }
};

YoutubeMp3Downloader.prototype.performDownloadOriginal = function(item) {
    var [task, callback] = item;
    var self = this;
    var videoUrl = self.youtubeBaseUrl+task.videoId;
    var resultObj = {
        videoId: task.videoId
    };

    ytdl.getInfo(videoUrl, function(err, info){

        if (err) {
            callback(err.message, resultObj);
        } else {
            var videoTitle = self.cleanFileName(info.title);
            var artist = "Unknown";
            var title = "Unknown";
            var thumbnail = info.iurlhq || null;

            if (videoTitle.indexOf("-") > -1) {
                var temp = videoTitle.split("-");
                if (temp.length >= 2) {
                    artist = temp[0].trim();
                    title = temp[1].trim();
                }
            } else {
                title = videoTitle;
            }

            //Derive file name, if given, use it, if not, from video title
            var fileName = (task.fileName ? self.outputPath + "/" + task.fileName : self.outputPath + "/" + (sanitize(videoTitle) || info.video_id) + ".mp3");

            ytdl.getInfo(videoUrl, { quality: self.youtubeVideoQuality }, function(err, info) {
                if (err || !info) {
                  callback(`Empty video info ${videoUrl} ${err}`);
                }

                //Stream setup
                var stream = ytdl.downloadFromInfo(info, {
                    quality: self.youtubeVideoQuality,
                    requestOptions: self.requestOptions
                });

                stream.on("response", function(httpResponse) {

                    //Setup of progress module
                    var str = progress({
                        length: parseInt(httpResponse.headers["content-length"]),
                        time: self.progressTimeout
                    });

                    //Add progress event listener
                    str.on("progress", function(progress) {
                        if (progress.percentage === 100) {
                            resultObj.stats= {
                                transferredBytes: progress.transferred,
                                runtime: progress.runtime,
                                averageSpeed: parseFloat(progress.speed.toFixed(2))
                            }
                        }
                        self.emit("progress", {videoId: task.videoId, progress: progress})
                    });
                    var outputOptions = [
                      "-q:a", "3",
                    	// "-id3v2_version", "4",
                    	// "-metadata", "title=" + title,
                    	// "-metadata", "artist=" + artist
                    ];
                    if (self.outputOptions) {
                    	outputOptions = outputOptions.concat(self.outputOptions);
                    }
                    
                    //Start encoding
                    var proc = new ffmpeg({
                        source: stream.pipe(str)
                    })
                    .audioBitrate(64) // .audioBitrate(info.formats[0].audioBitrate)
                    .withAudioCodec("libmp3lame")
                    .toFormat("mp3")
                    .outputOptions(outputOptions)
                    .on("error", function(err) {
                        if (callback.wasCalled) {
                          const errMsg = `Warning: callback was already called; "error" handler`;
                          return console.log(`${errMsg} ${videoUrl} ${err}`);
                        }
                        callback.wasCalled = true;
                        callback(err.message, null);
                    })
                    .on("end", function() {
                        resultObj.file =  fileName;
                        resultObj.youtubeUrl = videoUrl;
                        resultObj.videoTitle = videoTitle;
                        resultObj.artist = artist;
                        resultObj.title = title;
                        resultObj.thumbnail = thumbnail;
                        if (callback.wasCalled) {
                          const errMsg = `Warning: callback was already called; "end" handler`;
                          return console.log(`${errMsg} ${JSON.stringify(resultObj)}`);
                        }
                        callback.wasCalled = true;
                        callback(null, resultObj);
                    })
                    .saveToFile(fileName);

                });

            });
        }

    });

};

module.exports = YoutubeMp3Downloader;
