// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var Origin = require('core/origin');
  var OriginView = require('core/views/originView');

  var ConfigurationView = OriginView.extend({
    tagName: 'div',
    className: 'configuration',

    initialize: function() {
      Origin.trigger('location:title:update', { title: Origin.l10n.t('app.configurationtitle') });
      this.listenTo(Origin, 'configuration:navigateTo', this.navigateToSubView);

      OriginView.prototype.initialize.apply(this, arguments);
    },

    render: function() {
      OriginView.prototype.render.apply(this, arguments);
      if(Origin.configuration.subViews) {
        this.renderSubViews();
      }
      _.defer(this.setViewToReady);
    },

    renderSubViews: function() {
      for(var i = 0, keys = Object.keys(Origin.configuration.subViews), count = keys.length; i < count; i++) {
        this.renderSubView(keys[i]);
      }
    },

    renderSubView: function(viewName) {
      var view = new Origin.configuration.subViews[viewName]();
      $('.subViews', this.$el).append(view.$el);
    },

    navigateToSubView: function(viewName) {
      $('.contentPane').scrollTop(
        this.$('.subViews .' + viewName).offset().top +
        $('.location-title').outerHeight()
      );
    }
  }, {
    template: 'configuration'
  });

  return ConfigurationView;
});
