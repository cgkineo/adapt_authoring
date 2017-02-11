// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('coreJS/app/origin');
  var DashboardView = require('coreJS/dashboard/views/dashboardView');
  var DashboardSidebarView = require('coreJS/dashboard/views/dashboardSidebarView');
  var ProjectCollection = require('coreJS/project/collections/ProjectCollection');
  var MyProjectCollection = require('coreJS/project/collections/myProjectCollection');
  var SharedProjectCollection = require('coreJS/project/collections/sharedProjectCollection');
  var TagsCollection = require('coreJS/tags/collections/tagsCollection');

  Origin.on('router:dashboard', onRouterDashboard);
  Origin.on('dashboard:loaded', onDashboardLoaded);
  Origin.on('globalMenu:dashboard:open', onOpenDashboard);
  Origin.on('app:dataReady login:changed', onNewSession);

  function onRouterDashboard(location, subLocation, action) {
    Origin.tap('dashboard', onDashboardTap);
  }

  function onDashboardTap() {
    Origin.trigger('editor:resetData');
    updateTitle();
    addOptionsItems();
    initialiseTags();
  }

  function onNewSession() {
    Origin.globalMenu.addItem({
      "location": "global",
      "text": "Dashboard",
      "icon": "fa-home",
      "callbackEvent": "dashboard:open",
      "sortOrder": 1
    });
  }

  function onOpenDashboard() {
    Origin.router.navigateToDashboard();
  }

  function onDashboardLoaded(options) {
    switch (options.type) {
      case 'shared':
        Origin.trigger('location:title:update', {
          breadcrumbs: ['dashboard'],
          title: window.polyglot.t('app.sharedprojects')
        });
        Origin.router.createView(DashboardView, {collection: new SharedProjectCollection});
        break;
      case 'all':
        Origin.trigger('location:title:update', {
          breadcrumbs: ['dashboard'],
          title: window.polyglot.t('app.projects')
        });
        // Origin.router.createView(DashboardView, {collection: new ProjectCollection});
        // Origin.router.createView(DashboardView, {collection: new MyProjectCollection});
        var Backbone = require('backbone');
        var M = require('coreJS/project/models/projectModel');
        var P = Backbone.Collection.extend({ model: M, url: 'api/all/course' });
        Origin.router.createView(DashboardView, { collection: new P });
        break;
      default:
        console.error('Cannot load dashboard location \'' + options.type + '\'');
        break;
    }
  }

  function onTagFetchSuccess(collection) {
    Origin.sidebar.addView(new DashboardSidebarView({ collection: collection }).$el);
    var dashboardType = Origin.location.route1 || 'all';
    Origin.trigger('dashboard:loaded', { type: dashboardType });
  }

  function onTagFetchError() {
    Origin.router.navigateToDashboard();
    Origin.Notify.alert({
      type: 'error',
      text: window.polyglot.t('app.errorfetchingtags')
    });
    return;
  }

  function updateTitle() {
    Origin.trigger('location:title:update', {
      breadcrumbs: ['dashboard'],
      title: window.polyglot.t('app.myprojects')
    });
  }

  function addOptionsItems() {
    Origin.options.addItems([
      {
        title: window.polyglot.t('app.thumb'),
        icon: 'th',
        callbackEvent: 'dashboard:layout:thumb',
        value: 'thumb',
        group: 'layout'
      },
      {
        title: window.polyglot.t('app.grid'),
        icon: 'th-large',
        callbackEvent: 'dashboard:layout:grid',
        value: 'grid',
        group: 'layout'
      },
      {
        title: window.polyglot.t('app.list'),
        icon: 'list',
        callbackEvent: 'dashboard:layout:list',
        value: 'list',
        group: 'layout'
      },
      {
        title: window.polyglot.t('app.ascending'),
        icon: 'sort-alpha-asc',
        callbackEvent: 'dashboard:sort:asc',
        value: 'asc',
        group: 'sort'
      },
      {
        title: window.polyglot.t('app.descending'),
        icon: 'sort-alpha-desc',
        callbackEvent: 'dashboard:sort:desc',
        value: 'desc',
        group: 'sort'
      },
      {
        title: window.polyglot.t('app.recent'),
        icon: 'edit',
        callbackEvent: 'dashboard:sort:updated',
        value: 'updated',
        group: 'sort'
      }
    ]);
  }

  function initialiseTags() {
    (new TagsCollection()).fetch({
      success: onTagFetchSuccess,
      error: onTagFetchError
    });
  }
});
