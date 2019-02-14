module.exports = function(options) {
  return function logError(err, req, res, next) {
    if (
      err &&
      err.status === 404 &&
      req.method === 'GET' &&
      req.originalUrl.slice(0, 11) === '/api/likes/' &&
      err.message.slice(0, 18) === `Unknown "like" id `
    ) {
      err.stack = err.message; // remove stack trace
    }
    next(err, req, res, next);
  };
};
