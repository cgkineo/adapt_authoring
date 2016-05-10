// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('coreJS/app/origin');
  var ScaffoldBooleanView = require('coreJS/scaffold/views/scaffoldBooleanView');

  var ScaffoldSelectView = ScaffoldBooleanView.extend({
    getValue: function() {
      return this.$el.val();
    },
  });

  Origin.on('app:dataReady', function() {
    Origin.scaffold.addCustomField('Select', ScaffoldSelectView);
  });

  return ScaffoldBooleanView;
});
