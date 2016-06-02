'use strict';

const debug = require('debug')('loopback:component:access:logger');
const logger = require('../accessComponentLogger')();
const chalk = require('chalk');

module.exports = function accessLoggerMiddleware() {
  debug('initializing access logger middleware');
  return function accessLogger(req, res, next) {
    if (req.accessToken) {
      logger.debug(`${chalk.green('Start Request')} - accessToken ${req.accessToken} ${req.method} ${req.originalUrl}`);
    }
    else {
      debug('req', req.method, req.originalUrl);
    }

    const loopbackContext = loopback.getCurrentContext();

    logger.debug(`access-logger - accessToken ${loopbackContext.get('accessToken')}`);
    logger.debug(`access-logger - currentUser ${loopbackContext.get('currentUser')}`);
    logger.debug(`access-logger - currentUserGroups ${loopbackContext.get('currentUserGroups')}`);

    const start = new Date();

    if (res._responseTime) {
      return next();
    }
    res._responseTime = true;

    // install a listener for when the response is finished
    res.on('finish', () => {
      // the request was handled, print the log entry
      const duration = new Date() - start;

      logger.debug(`${chalk.cyan('Finish Request')} - accessToken ${req.accessToken} ${req.method} ${req.originalUrl} lbHttpMethod: ${req.method} lbUrl ${req.originalUrl} lbStatusCode ${res.statusCode} lbResponseTime  ${duration} lbResponseTimeUnit: 'ms'`);

      logger.debug(`access-logger - accessToken ${loopbackContext.get('accessToken')}`);
      logger.debug(`access-logger - currentUser ${loopbackContext.get('currentUser')}`);
      logger.debug(`access-logger - currentUserGroups ${loopbackContext.get('currentUserGroups')}`);
    });

    return next();
  };
};
