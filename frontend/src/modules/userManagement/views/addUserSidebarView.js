// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var SidebarItemView = require('modules/sidebar/views/sidebarItemView');

  var AddUserSidebarView = SidebarItemView.extend({
    events: {
      'click button.save': 'saveUser',
      'click button.cancel': 'goBack'
    },

    saveUser: function(e) {
      e && e.preventDefault();
      this.updateButton('button.save', window.polyglot.t('app.saving'));
      Origin.trigger('userManagement:saveUser');
    },

    goBack: function(e) {
      e && e.preventDefault();
      Origin.router.navigateTo('userManagement');
    }
  }, {
    template: 'addUserSidebar'
  });
  return AddUserSidebarView;
});
