// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var Helpers = require('core/helpers');
  var ConfigurationView = require('../views/configurationView');
  var ConfigurationSidebarView = require('../views/configurationSidebarView');

  var Controller = {
    ROUTE: 'configuration',
    FEATURE_PERMISSIONS: ["*/*:create","*/*:read","*/*:update","*/*:delete"],

    initialise: function() {
      Origin.permissions.addRoute(Controller.ROUTE, Controller.FEATURE_PERMISSIONS);

    	if(!Origin.permissions.hasPermissions(Controller.FEATURE_PERMISSIONS)) {
        return;
      }
      Origin.globalMenu.addItem({
        "location": "global",
        "text": Origin.l10n.t('app.' + Controller.ROUTE),
        "icon": "fa-cog",
        "sortOrder": 3,
        "callbackEvent": Controller.ROUTE + ":open"
      });
      Origin.trigger('configuration:dataReady');
    },

    open: function() {
      Origin.router.navigateTo(Controller.ROUTE);
    },

    loadViews: function(location, subLocation, action) {
      Origin.contentPane.setView(ConfigurationView);
      Origin.sidebar.addView(new ConfigurationSidebarView().$el);
    },

    registerView: function(viewName, viewClass) {
      if(arguments.length !== 2) {
        return console.error('Cannot register a ' + Controller.ROUTE + ' view without specifying: name and view class');
      }
      if(Origin.configuration.subViews[viewName]) {
        return console.error('Cannot register ' + Controller.ROUTE + ' sub-view "' + viewName + '", it already exists');
      }
      Origin.configuration.subViews[viewName] = viewClass;
    }
  };

  return Controller;
});
