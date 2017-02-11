// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Backbone = require('backbone');
  var Origin = require('core/origin');
  var EditorOriginView = require('modules/editor/global/views/editorOriginView');

  var EditorPageEditView = EditorOriginView.extend({
    tagName: "div",
    className: "page-edit",

    preRender: function() {
      this.listenTo(Origin, 'editorPageEditSidebar:views:save', this.save);
    }
  },
  {
    template: 'editorPageEdit'
  });

  return EditorPageEditView;
});
