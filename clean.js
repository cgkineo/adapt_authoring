const async = require('async');
const chalk = require('chalk');
const fs = require('fs-extra');
const logger = require('./lib/logger');
const origin = require('./lib/application');
const path = require('path');

var app;

// needed as we don't have a user
function resolveAssetPath(dir) {
  return path.join(app.configuration.getConfig('masterTenantName'), dir);
}

function init(cb) {
  logger.level('console','error');
  app = origin();
  app.on('serverStarted', () => {
    setTimeout(cb, 0);
  });
  app.run({ skipVersionCheck: true });
}

function assets(cb) {
  console.log(`Cleaning assets:`);
  app.db.retrieve('asset', { _isDeleted: true }, (error, results) => {
    if(error) return cb(error);
    if(!results.length) {
      console.log('.. No assets need purging');
      return cb();
    }
    async.each(results, (record, doneEach) => {
      async.applyEachSeries([
        removeAssetFiles,
        removeAssetDir,
        removeAssetRecord
      ], record, doneEach);
    }, (error) => {
      if(error) return cb(error);
      console.log(`.. Removed ${results.length} assets successfully!`);
      cb();
    });
  });
}

// delete asset and thumbnail files
function removeAssetFiles(record, cb) {
  app.filestorage.getStorage(record.repository, (error, storage) => {
    if(error) return cb(error);
    async.each([record.path, record.thumbnailPath], (filepath, doneEach) => {
      const globalPath = storage.resolvePath(resolveAssetPath(filepath));
      fs.pathExists(globalPath, (error, exists) => {
        if(error) return doneEach(`Failed to find file '${filepath}' ${error}`);
        if(!exists) { // not a show-stopper
          console.log(chalk.yellow(`Specified file doesn't exist '${filepath}'`));
          return doneEach();
        }
        storage.deleteFile(globalPath, (error) => {
          if(error) return doneEach(`Failed to remove file '${filepath}' ${error}`);
          doneEach();
        });
      });
    }, cb);
  });
}

function removeAssetDir(record, cb) {
  app.filestorage.getStorage(record.repository, (error, storage) => {
    if(error) return cb(error);
    const globalPath = resolveAssetPath(record.directory);
    storage.getDirectoryListing(globalPath, (error, contents) => {
      if(error) {
        if(error.code === 'ENOENT') return cb();
        return cb(error);
      }
      if(contents.length) {
        return cb();
      }
      storage.removeDirectory(globalPath, cb);
    });
  });
}

// remove asset record from DB
function removeAssetRecord(record, cb) {
  app.db.destroy('asset', { _id: record._id }, cb);
}

function run() {
  async.series([
    init,
    assets
  ], function(error) {
    if(error) {
      console.log(chalk.red(`\nClean failed. ${error}\n`));
      process.exit(1);
    }
    console.log(chalk.green('\nClean completed successfully!\n'));
    process.exit(0);
  });
}

module.exports = run();
