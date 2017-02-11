// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var SidebarItemView = require('modules/sidebar/views/sidebarItemView');
  var SystemInfoSidebarView = SidebarItemView.extend({
    events: {
      'click button.sidebar-button-serverLog': 'onServerLogClicked'
    },

    preRender: function() {
      this.model = new Backbone.Model({
        button: {
          label: window.polyglot.t('app.serverlog'),
          className: 'sidebar-button-serverLog'
        }
      });
    },

    onServerLogClicked: function(e) {
      e && e.preventDefault();
      Origin.router.navigate('#/serverLog', { trigger: true });
    }
  }, {
    template: 'systemInfoSidebar'
  });
  return SystemInfoSidebarView;
});
