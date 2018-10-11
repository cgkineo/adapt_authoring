// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var SidebarItemView = require('modules/sidebar/views/sidebarItemView');

  var ConfigurationSidebarView = SidebarItemView.extend({
    events: {
      'click button': 'onButtonClicked'
    },

    render: function() {
      // bit of a HACK, but less overhead than creating a Backbone.Model
      this.model = {
        toJSON: function() {
          return {
            subViews: Object.keys(Origin.configuration.subViews)
          };
        }
      };
      SidebarItemView.prototype.render.apply(this, arguments);
    },

    onButtonClicked: function(event) {
      event && event.preventDefault();
      Origin.trigger('configuration:navigateTo', $(event.currentTarget).attr('data-id'));
    }
  }, {
    template: 'configurationSidebar'
  });
  return ConfigurationSidebarView;
});
