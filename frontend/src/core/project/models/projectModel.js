// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Backbone = require('backbone');
  var Origin = require('coreJS/app/origin');
  var Helpers = require('coreJS/app/helpers');
  var EditorModel = require('editorGlobal/models/editorModel');

  var ProjectModel = EditorModel.extend({
    idAttribute: '_id',
    urlRoot: '/api/content/course',
    defaults: {
      'tags': [],
      _type: 'course',
      customStyle: ''
    },

    initialize: function(options) {
    },

    getHeroImageURI: function() {
      if(Helpers.isAssetExternal(this.get('heroImage'))) {
        return this.get('heroImage');
      } else {
        // return '/api/asset/serve/' + this.get('heroImage');
        return '/api/asset/thumb/' + this.get('heroImage');
      }
    },

    isEditable: function() {
      var userIsMe = this.get('createdBy') === Origin.sessionModel.get('id');
      var isEditableByMe = this.get('_sharing')._isEditable;
      var isEditableByOthers = this.get('_sharing')._isEditableByOthers;

      return userIsMe && isEditableByMe || !userIsMe && isEditableByOthers;
    },

    getDuplicateURI: function() {
      return '/api/duplicatecourse/' + this.get('_id');
    }
  });

  return ProjectModel;
});
