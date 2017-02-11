// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var SidebarItemView = require('modules/sidebar/views/sidebarItemView');

  var CourseImportSidebar = SidebarItemView.extend({
    events: {
      'click button.import': 'onImportClicked',
      'click button.cancel': 'onCancelClicked'
    },

    onImportClicked: function() {
      Origin.trigger('courseImport:import');
    },

    onCancelClicked: function() {
      Origin.router.navigateToHome();
    }
  }, {
    template: 'courseImportSidebar'
  });

  return CourseImportSidebar;
});
