var logger = require('../../lib/logger');
var Constants = require('./constants');

module.exports = {
  AuthorisationError: function(error, statusCode) {
    return createError('AuthorisationError', error, statusCode || 401);
  },
  RequestError: function(error, statusCode) {
    return createError('RequestError', error, statusCode || 400);
  },
  ServerError: function(error, statusCode) {
    return createError('ServerError', error, statusCode || 500);
  },
  handler: function(error, req, res, next) {
    if(!error.status) {
      error.status = 500;
    }
    logger.log('error', `totaraconnect: ${error.name}[${error.status}] ${error.message}`);
    if(error.status === 500) console.log(error.stack);
    /**
    * Return the error's message for 400-range client errors (except 401s...for security reasons)
    */
    var isClientError = error.status.toString()[0] === '4' && error.status !== 401;
    res.status(error.status).send((isClientError) ? error.message : Constants.Messages.HttpStatuses[error.status]);
  }
};

// error param can be an Error or just a String
var createError = function(name, error, statusCode) {
  if(_.isString(error)) error = new Error(error);
  if(name) error.name = name;
  if(statusCode) error.status = statusCode;

  return error;
};
