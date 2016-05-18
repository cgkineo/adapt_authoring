// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var SidebarItemView = require('coreJS/sidebar/views/sidebarItemView');
  var ServerLogSidebarView = SidebarItemView.extend({}, { template: 'serverLogSidebar' });
  return ServerLogSidebarView;
});
