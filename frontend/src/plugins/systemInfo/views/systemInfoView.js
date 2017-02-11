// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var _ = require('underscore');
  var Origin = require('core/origin');
  var OriginView = require('core/views/originView');

  var SystemInfoView = OriginView.extend({
    tagName: 'div',
    className: 'systemInfo',

    postRender: function() {
      this.setViewToReady();
    }
  }, {
    template: 'systemInfo'
  });

  return SystemInfoView;
});
