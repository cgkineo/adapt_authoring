// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var OriginView = require('coreJS/app/views/originView');

  var ServerLogView = OriginView.extend({
    tagName: 'div',
    className: 'serverLog',

    postRender: function() {
      this.setHeight();
      this.setViewToReady();
    },

    setHeight: function() {
      var newHeight = $(window).height()-$('.' + this.className).offset().top;
      $('.' + this.className).height(newHeight);
    }

  }, {
    template: 'serverLog'
  });

  return ServerLogView;
});
