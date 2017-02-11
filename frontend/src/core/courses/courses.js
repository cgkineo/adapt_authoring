// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('coreJS/app/origin');
  var CoursesView = require('coreJS/courses/views/coursesView');
  var CoursesSidebarView = require('coreJS/courses/views/coursesSidebarView');
  var ProjectCollection = require('coreJS/project/collections/ProjectCollection');
  var MyProjectCollection = require('coreJS/project/collections/myProjectCollection');
  var SharedProjectCollection = require('coreJS/project/collections/sharedProjectCollection');
  var TagsCollection = require('coreJS/tags/collections/tagsCollection');

  Origin.on('router:courses', onRouterCourses);
  Origin.on('courses:loaded', onCoursesLoaded);
  Origin.on('globalMenu:courses:open', onOpenCourses);
  Origin.on('app:dataReady login:changed', onNewSession);

  function onRouterCourses(location, subLocation, action) {
    Origin.tap('courses', onCoursesTap);
  }

  function onCoursesTap() {
    Origin.trigger('editor:resetData');
    updateTitle();
    addOptionsItems();
    initialiseTags();
  }

  function onNewSession() {
    Origin.globalMenu.addItem({
      "location": "global",
      "text": "Courses",
      "icon": "fa-book",
      "callbackEvent": "courses:open",
      "sortOrder": 1
    });
  }

  function onOpenCourses() {
    Origin.router.navigateTo('courses');
  }

  function onCoursesLoaded(options) {
    switch (options.type) {
      case 'shared':
        Origin.trigger('location:title:update', {
          breadcrumbs: ['courses'],
          title: window.polyglot.t('app.sharedprojects')
        });
        Origin.router.createView(CoursesView, {collection: new SharedProjectCollection});
        break;
      case 'all':
        Origin.trigger('location:title:update', {
          breadcrumbs: ['courses'],
          title: window.polyglot.t('app.projects')
        });
        // Origin.router.createView(DashboardView, {collection: new ProjectCollection});
        // Origin.router.createView(DashboardView, {collection: new MyProjectCollection});
        var Backbone = require('backbone');
        var M = require('coreJS/project/models/projectModel');
        var P = Backbone.Collection.extend({ model: M, url: 'api/all/course' });
        Origin.router.createView(CoursesView, { collection: new P });
        break;
      default:
        console.error('Cannot load courses location \'' + options.type + '\'');
        break;
    }
  }

  function onTagFetchSuccess(collection) {
    Origin.sidebar.addView(new CoursesSidebarView({ collection: collection }).$el);
    var coursesType = Origin.location.route1 || 'all';
    Origin.trigger('courses:loaded', { type: coursesType });
  }

  function onTagFetchError() {
    Origin.router.navigateToHome();
    Origin.Notify.alert({
      type: 'error',
      text: window.polyglot.t('app.errorfetchingtags')
    });
    return;
  }

  function updateTitle() {
    Origin.trigger('location:title:update', {
      breadcrumbs: ['courses'],
      title: window.polyglot.t('app.myprojects')
    });
  }

  function addOptionsItems() {
    Origin.options.addItems([
      {
        title: window.polyglot.t('app.thumb'),
        icon: 'th',
        callbackEvent: 'courses:layout:thumb',
        value: 'thumb',
        group: 'layout'
      },
      {
        title: window.polyglot.t('app.grid'),
        icon: 'th-large',
        callbackEvent: 'courses:layout:grid',
        value: 'grid',
        group: 'layout'
      },
      {
        title: window.polyglot.t('app.list'),
        icon: 'list',
        callbackEvent: 'courses:layout:list',
        value: 'list',
        group: 'layout'
      },
      {
        title: window.polyglot.t('app.ascending'),
        icon: 'sort-alpha-asc',
        callbackEvent: 'courses:sort:asc',
        value: 'asc',
        group: 'sort'
      },
      {
        title: window.polyglot.t('app.descending'),
        icon: 'sort-alpha-desc',
        callbackEvent: 'courses:sort:desc',
        value: 'desc',
        group: 'sort'
      },
      {
        title: window.polyglot.t('app.recent'),
        icon: 'edit',
        callbackEvent: 'courses:sort:updated',
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
