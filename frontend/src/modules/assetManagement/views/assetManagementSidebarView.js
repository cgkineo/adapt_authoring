// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var SidebarItemView = require('modules/sidebar/views/sidebarItemView');
  var AssetManagementRefineView = require('./assetManagementRefineView');

  var AssetManagementSidebarView = SidebarItemView.extend({
    events: {
      'click .asset-management-sidebar-new': 'onAddNewAssetClicked'
    },

    render: function() {
      SidebarItemView.prototype.render.apply(this, arguments);
      this.$el.append(new AssetManagementRefineView().$el);
    },

    onAddNewAssetClicked: function() {
      Origin.router.navigateTo('assetManagement/new');
    }
  }, {
    template: 'assetManagementSidebar'
  });

  return AssetManagementSidebarView;
});
