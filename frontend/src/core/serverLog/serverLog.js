// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Backbone = require('backbone');
  var Origin = require('coreJS/app/origin');
  var LogCollection = require('coreJS/serverLog/collections/logCollection');
  var ServerLogView = require('coreJS/serverLog/views/serverLogView');
  var ServerLogSidebarView = require('coreJS/serverLog/views/serverLogSidebarView');

  Origin.on('globalMenu:serverLog:open', function() {
    Origin.router.navigate('#/serverLog', {trigger: true});
  });

  Origin.on('app:dataReady login:changed', function() {
    var permissions = ["*/*:create","*/*:read","*/*:update","*/*:delete"];
    Origin.permissions.addRoute('serverLog', permissions);
    if (Origin.permissions.hasPermissions(permissions)) {
      Origin.globalMenu.addItem({
        "location": "global",
        "text": "Server Log",
        "icon": "fa-server",
        "callbackEvent": "serverLog:open"
      });
    }
  });

  Origin.on('router:serverLog', function(location, subLocation, action) {
    Origin.trigger('location:title:update', { title: 'Server Log' });
    Origin.sidebar.addView(new ServerLogSidebarView().$el);
    var logs = new LogCollection();
    logs.fetch({
      success: function() {
        Origin.router.createView(ServerLogView, {
          model: new Backbone.Model({ logs: logs })
        });
      }
    });
  });
});
