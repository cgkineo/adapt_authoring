// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Backbone = require('backbone');
  var ProjectModel = require('core/models/projectModel');

  var ProjectCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: 'api/all/course'
  });

  return ProjectCollection;
});
