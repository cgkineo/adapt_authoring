// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Origin = require('coreJS/app/origin');

  var ServerLogModel = Backbone.Model.extend({
    initialize: function() {
      var self = this;
      $.ajax({
        url: '/log',
        success: function(data) {
          // we want reverse-chronological so the newest appear at the top
          self.set('logs', data.logs.reverse());
        },
        error: function(jqXHR, textStatus, errorThrown) {
          Origin.Notify.alert({
            type: 'error',
            text: errorThrown
          });
        }
      });
    }
  });

  return ServerLogModel;
});
