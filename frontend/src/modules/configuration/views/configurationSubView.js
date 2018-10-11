// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var Origin = require('core/origin');
  var OriginView = require('core/views/originView');

  var ConfigurationSubView = OriginView.extend({
    tagName: 'div',
    model: new Backbone.Model(),

    initialize: function(options) {
      this.model.set('title', this.title || '');
      OriginView.prototype.initialize.apply(this, arguments);
    },

    render: function() {
      var data = this.model ? this.model.toJSON() : null;
      var wrapper = Handlebars.templates.configurationSub(data);
      var subView = Handlebars.templates[this.constructor.template](data);

      this.$el.html(wrapper);

      this.$el.addClass('form-container-style', this.className);
      this.$('.subView').html(subView);

      _.defer(_.bind(this.postRender, this));
      return this;
    },

    postRender: function() {
      this.onReady();
      if (this.constructor.template) {
        Origin.trigger(this.constructor.template + ':postRender', this);
      }
    }
  });

  return ConfigurationSubView;
});
