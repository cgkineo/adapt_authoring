// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {

    var Origin = require('core/origin');
    var SidebarItemView = require('modules/sidebar/views/sidebarItemView');
    var Backbone = require('backbone');

    var EditorPageEditSidebarView = SidebarItemView.extend({

        events: {
            'click .editor-page-edit-sidebar-save': 'saveEditing',
            'click .editor-page-edit-sidebar-cancel': 'cancelEditing'
        },

        saveEditing: function(event) {
            event.preventDefault();
            this.updateButton('.editor-page-edit-sidebar-save', window.polyglot.t('app.saving'))
            Origin.trigger('editorPageEditSidebar:views:save');
        },

        cancelEditing: function(event) {
            event.preventDefault();
            Backbone.history.history.back();
            Origin.trigger('editingOverlay:views:hide');
        }

    }, {
        template: 'editorPageEditSidebar'
    });

    return EditorPageEditSidebarView;

});
