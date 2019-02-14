'use strict';

module.exports = function(Soundcast) {
  Soundcast.beforeRemote('find', function(context, _, next) {
    if (process.env.NODE_SC === 'onlyFree') {
      const filter = context.args.filter;
      filter
        ? Object.assign(filter.where, { forSale: false })
        : Object.assign(context.args, { filter: { where: { forSale: false } } });
    }
    next();
  });
};
