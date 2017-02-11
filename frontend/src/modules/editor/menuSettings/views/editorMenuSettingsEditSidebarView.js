// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var SidebarItemView = require('modules/sidebar/views/sidebarItemView');
  var Backbone = require('backbone');

  var EditorMenuSettingsEditSidebarView = SidebarItemView.extend({
    events: {
      'click .editor-menusettings-edit-sidebar-save': 'saveEditing'
    },

    saveEditing: function(event) {
      event.preventDefault();
      this.updateButton('.editor-menusettings-edit-sidebar-save', window.polyglot.t('app.saving'));
      Origin.trigger('editorMenuSettingsEditSidebar:views:save');
    }

  }, {
    template: 'editorMenuSettingsEditSidebar'
  });

  return EditorMenuSettingsEditSidebarView;

});
