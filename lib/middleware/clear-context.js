'use strict';

const debug = require('debug')('loopback:component:access:context');
const loopback = require('loopback');
const Promise = require('bluebird');
const logger = require('../accessComponentLogger')();
const _ = require('lodash');
const util = require('util');

module.exports = function clearContextMiddleware() {
  debug('Cleaning middleware');

  // set current user to enable user access for remote methods
  return function clearContext(req, res, next) {
    logger.error("AHASDHJKASDH");

    let loopbackContext = loopback.getCurrentContext();
    let reqToken = loopbackContext.get('req.accessToken');
    let reqUrl = loopbackContext.get('req.originalUrl');
    let token = loopbackContext.get('accessToken');
    let user = loopbackContext.get('currentUser');
    let group = loopbackContext.get('currentUserGroups');

    logger.debug(`clear-middleware - reqToken ${reqToken && reqToken.id}`);
    logger.debug(`clear-middleware - reqUrl ${reqUrl && reqUrl.id}`);
    logger.debug(`clear-middleware - currentUser ${user && user.id}`);
    logger.debug(`clear-middleware - currentUserGroups ${group && util.inspect(group)}`);
    logger.debug(`clear-middleware - accessToken ${util.inspect(token)}`);


    loopbackContext.set('req.accessToken', null);
    loopbackContext.set('req.originalUrl', null);
    loopbackContext.set('accessToken', null);
    loopbackContext.set('currentUser', null);
    loopbackContext.set('currentUserGroups', null);
    return next();
  };
};
