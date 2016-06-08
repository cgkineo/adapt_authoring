// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var OriginView = require('coreJS/app/views/originView');

  var ServerLogView = OriginView.extend({
    tagName: 'div',
    className: 'serverLog',

    postRender: function() {
      this.setViewToReady();
    }
  }, {
    template: 'serverLog'
  });

  return ServerLogView;
});
