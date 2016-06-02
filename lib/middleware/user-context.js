'use strict';

const debug = require('debug')('loopback:component:access:context');
const loopback = require('loopback');
const Promise = require('bluebird');
const logger = require('../accessComponentLogger')();
const _ = require('lodash');
const util = require('util');

module.exports = function userContextMiddleware() {
  debug('initializing user context middleware');
  // set current user to enable user access for remote methods
  return function userContext(req, res, next) {
    let loopbackContext = loopback.getCurrentContext();
    let token = loopbackContext.get('accessToken');
    let user = loopbackContext.get('currentUser');
    let group = loopbackContext.get('currentUserGroups');

    logger.debug(`user-context - accessToken ${token && util.inspect(token)}`);
    logger.debug(`user-context - currentUser ${user && user.id}`);
    logger.debug(`user-context - currentUserGroups ${group && util.inspect(group)}`);

    if (!loopbackContext) {
      logger.warning(`No user context (loopback current context not found)`);
      return next();
    }

    if (!req.accessToken) {
      debug('No user context (access token not found)');
      return next();
    }

    loopbackContext.set('accessToken', req.accessToken.id);
    logger.debug(`User Context Middleware - Token Id: ${req.accessToken.id} Token User Id: ${req.accessToken.userId}`)

    const app = req.app;
    const UserModel = app.accessUtils.options.userModel || 'User';

    return Promise.join(
      app.models[UserModel].findById(req.accessToken.userId),
      app.accessUtils.getUserGroups(req.accessToken.userId),
      (user, groups) => {
        if (!user) {
          return next(new Error('No user with this access token was found.'));
        }
        loopbackContext.set('currentUser', user);
        loopbackContext.set('currentUserGroups', groups);

        const userJSON = JSON.stringify({
          id:     user.id,
          email:  user.email,
          orgId:  user.orgId
        });
        const groupsJSON = JSON.stringify(groups);

        logger.debug(`Setting currentUser as ${userJSON}`);
        logger.debug(`Setting currentUserGroup as ${groupsJSON}`);

        debug('currentUser', user);
        debug('currentUserGroups', groups);
        return next();
      })
      .catch(next);
  };
};
