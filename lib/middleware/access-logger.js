'use strict';

const debug = require('debug')('loopback:component:access:logger');
const loopback = require('loopback');
const logger = require('../accessComponentLogger')();
const chalk = require('chalk');
const util = require('util');

module.exports = function accessLoggerMiddleware() {
  debug('initializing access logger middleware');
  return function accessLogger(req, res, next) {
    if (req.accessToken) {
      logger.debug(`${chalk.green('Start Request')} - accessToken ${util.inspect(req.accessToken)} ${req.method} ${req.originalUrl}`);
    }
    else {
      debug('req', req.method, req.originalUrl);
    }

    let loopbackContext = loopback.getCurrentContext();
    let token = loopbackContext.get('accessToken');
    let user = loopbackContext.get('currentUser');
    let group = loopbackContext.get('currentUserGroups');

    logger.debug(`access-logger - start - accessToken ${token && util.inspect(token)}`);
    logger.debug(`access-logger - start - currentUser ${user && user.id}`);
    logger.debug(`access-logger - start - currentUserGroups ${group && util.inspect(group)}`);

    const start = new Date();

    if (res._responseTime) {
      return next();
    }
    res._responseTime = true;

    // install a listener for when the response is finished
    res.on('finish', () => {
      // the request was handled, print the log entry
      const duration = new Date() - start;

      logger.debug(`${chalk.cyan('Finish Request')} - accessToken ${util.inspect(req.accessToken)} ${req.method} ${req.originalUrl} lbHttpMethod: ${req.method} lbUrl ${req.originalUrl} lbStatusCode ${res.statusCode} lbResponseTime  ${duration} lbResponseTimeUnit: 'ms'`);

      let loopbackContext = loopback.getCurrentContext();
      let token = loopbackContext.get('accessToken');
      let user = loopbackContext.get('currentUser');
      let group = loopbackContext.get('currentUserGroups');

      logger.debug(`access-logger - finish - accessToken ${token && util.inspect(token)}`);
      logger.debug(`access-logger - finish - currentUser ${user && user.id}`);
      logger.debug(`access-logger - finish - currentUserGroups ${group && util.inspect(group)}`);
    });

    return next();
  };
};
