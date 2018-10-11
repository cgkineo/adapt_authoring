var async = require('async');
var jwt = require('jsonwebtoken');
var configuration = require('../../lib/configuration');
var errors = require('./errors');
var ErrorConsts = require('./constants').Messages.Fail;
var origin = require('../../lib/application')();
var permissions = require('../../lib/permissions');
var usermanager = require('../../lib/usermanager');
// only allow certain attributes to be added to a jwt
var whitelistedAttributes = [
  "user",
  "_tenantId",
];

var exports = module.exports = {
  generate: function(data, cb) {
    var _handleError = function(error) {
      cb(errors.ServerError(`${ErrorConsts.TokenGen}, ${error}`));
    };
    if(!data) {
      return cb(ErrorConsts.TokenNoData);
    }
    // generate a valid jwt
    jwt.sign(_.pick(data, whitelistedAttributes), configuration.getConfig('jwtSecret'), function(error, token) {
      if(error) return _handleError(error);
      origin.db.create('token', data, function(error, doc) {
        cb(error, { _id: doc._id, token: token });
      });
    });
  },
  authenticate: function(token, permissionData, cb) {
    if(!token) {
      return cb(errors.AuthorisationError(`${ErrorConsts.UnexpectedToken}${token}`));
    }
    jwt.verify(token, configuration.getConfig('jwtSecret'), function(error, decodedData) {
      if(error) {
        return cb(errors.AuthorisationError(`${ErrorConsts.TokenInvalid}, ${error.message}`));
      }
      if(!decodedData.user || !decodedData._tenantId) {
        return cb(errors.AuthorisationError(ErrorConsts.TokenInvalid));
      }
      var resource = permissions.buildResourceString(decodedData._tenantId, permissionData.route);
      permissions.hasPermission(decodedData.user, permissionData.action, resource, function(error, hasPermission) {
        if(error || !hasPermission) {
          return cb(errors.AuthorisationError(ErrorConsts.PermissionsCheck));
        }
        cb(null, decodedData);
      });
    });
  }
};
