// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {

    var Origin = require('core/origin');
    var SidebarItemView = require('modules/sidebar/views/sidebarItemView');
    var Backbone = require('backbone');

    var EditorExtensionsEditSidebarView = SidebarItemView.extend({}, {
        template: 'editorExtensionsEditSidebar'
    });

    return EditorExtensionsEditSidebarView;

});
