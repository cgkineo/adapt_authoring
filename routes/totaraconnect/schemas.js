var fs = require('fs-extra');
var path = require('path');
var origin = require('../../lib/application')();

module.exports = function() {
  addSchema('publishedcourse');
  addSchema('token');

  // HACK couldn't find what this func was supposed to return, so assumption made about results
  origin.contentmanager.addContentHook('destroy', 'course', { when: 'pre' }, function(results, next) {
    origin.db.destroy('publishedcourse', { course: results[0]._id }, next);
  });

  origin.on('user:delete', function(data) {
    origin.db.destroy('token', { user: data._id }, next);
  });
};

function addSchema(schemaName) {
  fs.readFile(path.join(__dirname, `${schemaName}.schema`), function(error, buffer) {
    if(error) {
      return console.log(error);
    }
    try {
      var schema = JSON.parse(buffer.toString());
    } catch(e) {
      return console.log(e);
    }
    origin.db.addModel(schemaName, schema, function(error, schema) {
      if(error) console.log(error);
    });
  });
}
