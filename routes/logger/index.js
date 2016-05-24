/**
 * Exposes the log
 * TODO switch this to use the DB rather than a file
 **/
var _ = require('underscore');
var fs = require('fs');
var configuration = require('../../lib/configuration');
var logger = require('../../lib/logger');
var path = require('path');
var server = module.exports = require('express')();
var winston = require('winston');

var LOG_PATH = path.join(configuration.serverRoot, 'log.json');
var LOG_EXPIRY = 1000*60*60*24*2; // 2 days

var firstLog = Date.now();

function initialise() {
  fs.stat(LOG_PATH, function(error, stats) {
    if(error) {
      if(error.code === 'ENOENT') addTransport();
      else logger.log('error', error);
      return;
    }
    fs.unlink(LOG_PATH, addTransport);
  });
};

function addTransport() {
  logger.add(winston.transports.File, { filename: LOG_PATH });
}

server.get('/log', function (req, res, next) {
  fs.readFile(LOG_PATH, 'utf8', function(error, data) {
    if(error) {
      if(error.code === 'ENOENT') return res.status(200).json({ logs:[] });
      else return res.status(500).json(error.toString());
    }

    var logs = data.split('\n');
    var parsedLogs = [];
    _.each(logs, function(item, index) {
      if(!_.isEmpty(item)) {
        var logObj = JSON.parse(item);
        logObj.message = logObj.message.replace(/\[.+\]\s/, ''),
        parsedLogs.push(logObj);
      }
    });
    return res.json({
      logs: parsedLogs
    });
  });
});

logger.on('logging', function (transport, level, msg, meta) {
  if(Date.now()-firstLog >= LOG_EXPIRY) {
    try {
      fs.writeFileSync(LOG_PATH);
      firstLog = Date.now();
    } catch (e) {
      console.log(e);
    }
  }
});

initialise();
