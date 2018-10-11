// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var Controller = require('./controllers/configurationController');

  Origin.configuration = { subViews: {} };

  Origin.on('origin:dataReady login:changed', Controller.initialise);
  Origin.on('globalMenu:' + Controller.ROUTE + ':open', Controller.open);
  Origin.on('router:' + Controller.ROUTE, Controller.loadViews);
  Origin.on(Controller.ROUTE + ':registerView', Controller.registerView);
});
