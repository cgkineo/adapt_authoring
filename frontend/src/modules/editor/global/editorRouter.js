// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var _ = require('underscore');

  var Origin = require('core/origin');

  var EditorView = require('modules/editor/global/views/editorView');
  var EditorModel = require('modules/editor/global/models/editorModel');

  var ProjectModel = require('core/models/projectModel');
  var ProjectDetailView = require('modules/editor/course/views/projectDetailView');
  var ProjectDetailEditSidebarView = require('modules/editor/course/views/projectDetailEditSidebarView');

  var EditorConfigModel = require('modules/editor/config/models/editorConfigModel');
  var EditorCourseModel = require('modules/editor/course/models/editorCourseModel');
  var EditorContentObjectModel = require('modules/editor/menu/models/editorContentObjectModel');

  var EditorPageSidebarView = require('modules/editor/page/views/editorPageSidebarView');
  var EditorPageEditView = require('modules/editor/page/views/editorPageEditView');
  var EditorPageEditSidebarView = require('modules/editor/page/views/editorPageEditSidebarView');

  var EditorArticleModel = require('modules/editor/page/models/editorArticleModel');
  var EditorArticleEditView = require('modules/editor/page/views/editorArticleEditView');
  var EditorArticleEditSidebarView = require('modules/editor/page/views/editorArticleEditSidebarView');

  var EditorBlockModel = require('modules/editor/page/models/editorBlockModel');
  var EditorBlockEditView = require('modules/editor/page/views/editorBlockEditView');
  var EditorBlockEditSidebarView = require('modules/editor/page/views/editorBlockEditSidebarView');

  var EditorComponentModel = require('modules/editor/page/models/editorComponentModel');
  var EditorComponentEditView = require('modules/editor/page/views/editorComponentEditView');
  var EditorComponentEditSidebarView = require('modules/editor/page/views/editorComponentEditSidebarView');
  var EditorComponentListView = require('modules/editor/page/views/editorComponentListView');
  var EditorComponentListSidebarView = require('modules/editor/page/views/editorComponentListSidebarView');

  var EditorExtensionsEditView = require('modules/editor/extensions/views/editorExtensionsEditView');
  var EditorExtensionsEditSidebarView = require('modules/editor/extensions/views/editorExtensionsEditSidebarView');

  var EditorConfigEditView = require('modules/editor/config/views/editorConfigEditView');
  var EditorConfigEditSidebarView = require('modules/editor/config/views/editorConfigEditSidebarView');
  var EditorConfigModel = require('modules/editor/config/models/editorConfigModel');
  var EditorConfigCollection = require('modules/editor/config/collections/editorConfigCollection');

  var EditorThemeTypeModel = require('modules/editor/theme/models/editorThemeTypeModel');
  var EditorThemeCollectionView = require('modules/editor/theme/views/editorThemeCollectionView');
  var EditorThemeCollectionSidebarView = require('modules/editor/theme/views/editorThemeCollectionSidebarView');

  var EditorMenuSidebarView = require('modules/editor/menu/views/editorMenuSidebarView');
  var EditorMenuSettingsEditView = require('modules/editor/menuSettings/views/editorMenuSettingsEditView');
  var EditorMenuSettingsEditSidebarView = require('modules/editor/menuSettings/views/editorMenuSettingsEditSidebarView');

  /**
  * Current location
  * Has the structure:
  * {
  *   course: course ID
  *   type: content type (e.g. block)
  *   id: content ID
  *   action: page action (e.g. edit)
  * }
  */
  var loc;

  function route(location) {
    loc = location

    var course = Origin.editor.data.course;
    var sharing = course.get('_sharing');

    var isMyCourse = course.get('createdBy') === Origin.sessionModel.get('id');
    if(isMyCourse && !sharing._isEditable || !isMyCourse && !sharing._isEditableByOthers) {
      return Origin.trigger('router:denyAccess');
    }

    switch (loc.type) {
      case 'article':
        if (loc.action === 'edit') {
          handleArticleEditRoute();
        }
        break;

      case 'block':
        if (loc.action === 'add') {
          handleBlockAddRoute();
        }
        if (loc.action === 'edit') {
          handleBlockEditRoute();
        }
        break;

      case 'component':
        handleComponentRoute();
        break;

      case 'settings':
        handleSettingsRoute();
        break;

      case 'config':
        handleConfigRoute();
        break;

      case 'selecttheme':
        handleThemeSelectRoute();
        break;

      case 'extensions':
        handleExtensionsRoute();
        break;

      case 'menusettings':
        handleMenuSettingsRoute();
        break;

      case 'menu':
        if(loc.action === 'edit') {
          handleMenuEditRoute();
        } else {
          handleMenuRoute();
        }
        break;

      case 'page':
        if(loc.action === 'edit') {
          handlePageEditRoute();
        } else {
          handlePageRoute();
        }
        break;
    }
  }

  // set the page title based on location
  // accepts backbone model, or object like so { title: '' }
  function updatePageTitle(model) {
    var titleKey;

    switch(loc.type) {
      case 'page':
        if(loc.action === 'edit') {
          titleKey = 'editor' + loc.type + 'settings';
          break;
        }
        // else fall to default
      default:
        titleKey = 'editor' + loc.type;
    }
    var modelTitle = model && model.get && model.get('title');
    var langString = window.polyglot.t('app.' + titleKey);

    var crumbs = ['courses'];
    if(loc.type !== 'menu') crumbs.push('course');
    if(loc.action === 'edit') {
      var page = getNearestPage(model);
      crumbs.push({
        title: window.polyglot.t('app.editorpage'),
        url: '#/editor/' + page.get('_courseId') + '/page/' + page.get('_id')
      });
    }
    crumbs.push({ title: langString });

    Origin.trigger('location:title:update', {
      breadcrumbs: crumbs,
      title: modelTitle || langString
    });
  }

  getNearestPage = function(model) {
    var map = {
      'component': 'components',
      'block': 'blocks',
      'article': 'articles',
      'page': 'contentObjects'
    };
    var mapKeys = Object.keys(map);
    while(model.get('_type') !== 'page') {
      var parentType = mapKeys[_.indexOf(mapKeys, model.get('_type')) + 1];
      var parentCollection = Origin.editor.data[map[parentType]];
      model = parentCollection.findWhere({ _id: model.get('_parentId') });
    }
    return model;
  }

  /*
  TODO localise all labels
  TODO look at refactoring this
  Common tasks:
    Model
    Model.fetch
      Update title(title)
      Create form(model)
      Sidebar(form, back button)
      View(model, form)

    Move the following into helpers:
    var project = new ProjectModel({_id: loc.course});
    var configModel = new EditorConfigModel({_courseId: loc.course});
  */

  function handleArticleEditRoute() {
    var articleModel = new EditorArticleModel({_id: loc.id});
    articleModel.fetch({
      success: function() {
        var form = Origin.scaffold.buildForm({ model: articleModel });
        updatePageTitle(articleModel);
        Origin.sidebar.addView(new EditorArticleEditSidebarView({model: articleModel, form: form}).$el);
        Origin.editingOverlay.addView(new EditorArticleEditView({model: articleModel, form: form}).$el);
      }
    });
  }

  function handleBlockAddRoute() {
    // If adding a new component
    // Find block so we can get layout options
    var containingBlock = Origin.editor.data.blocks.findWhere({_id: loc.id});

    var layoutOptions = containingBlock.get('layoutOptions');

    var componentSelectModel = new Backbone.Model({
      title: window.polyglot.t('app.addcomponent'),
      body: window.polyglot.t('app.pleaseselectcomponent'),
      _parentId: loc.id,
      componentTypes: Origin.editor.data.componentTypes.toJSON(),
      layoutOptions: layoutOptions
    });

    Origin.sidebar.addView(new EditorComponentListSidebarView({ model: componentSelectModel }).$el);
    Origin.editingOverlay.addView(new EditorComponentListView({ model: componentSelectModel }).$el);
  }

  function handleBlockEditRoute() {
    var blockModel = new EditorBlockModel({_id: loc.id});
    blockModel.fetch({
      success: function() {
        var form = Origin.scaffold.buildForm({ model: blockModel });
        updatePageTitle(blockModel);
        Origin.sidebar.addView(new EditorBlockEditSidebarView({model: blockModel, form: form}).$el);
        Origin.editingOverlay.addView(new EditorBlockEditView({model: blockModel, form: form}).$el);
      }
    });
  }

  function handleComponentRoute() {
    // Display editing a component
    var componentModel = new EditorComponentModel({_id: loc.id});
    componentModel.fetch({
      success: function() {
        var form = Origin.scaffold.buildForm({ model: componentModel });
        var componentType = _.find(Origin.editor.data.componentTypes.models, function(componentTypeModel) {
          return componentTypeModel.get('_id') == componentModel.get('_componentType');
        });
        var componentDisplayName = (componentType) ? componentType.get('displayName').toLowerCase() : '';
        updatePageTitle(componentModel);
        Origin.sidebar.addView(new EditorComponentEditSidebarView({ model: componentModel, form: form }).$el);
        Origin.editingOverlay.addView(new EditorComponentEditView({ model: componentModel, form: form }).$el);
      }
    });
  }

  function handleSettingsRoute() {
    var project = new ProjectModel({_id: loc.course});
    project.fetch({
      success: function() {
        var form = Origin.scaffold.buildForm({ model: project });
        updatePageTitle({ title: window.polyglot.t('app.editorsettingstitle') });
        Origin.editingOverlay.addView(new ProjectDetailView({ model: project, form: form }).$el);
        Origin.sidebar.addView(new ProjectDetailEditSidebarView({ form: form }).$el);
      }
    });
  }

  function handleConfigRoute() {
    var configModel = new EditorConfigModel({_courseId: loc.course});
    configModel.fetch({
      success: function() {
        var form = Origin.scaffold.buildForm({ model: configModel });
        updatePageTitle({ title: window.polyglot.t('app.editorconfigtitle') });
        Origin.sidebar.addView(new EditorConfigEditSidebarView({ form: form }).$el);
        Origin.editingOverlay.addView(new EditorConfigEditView({ model: configModel, form: form }).$el);
      }
    });
  }

  function handleThemeSelectRoute() {
    var configModel = new EditorConfigModel({ _courseId: loc.course });
    var backButtonRoute = "/#/editor/" + loc.course + "/menu";
    var backButtonText = "Back to menu";
    if (Origin.previousLocation.route2 === "page") {
      backButtonRoute = "/#/editor/" + loc.course + "/page/" + Origin.previousLocation.route3;
      backButtonText = "Back to page";
    }
    configModel.fetch({
      success: function() {
        updatePageTitle(configModel);
        Origin.sidebar.addView(new EditorThemeCollectionSidebarView().$el, {
          "backButtonText": backButtonText,
          "backButtonRoute": backButtonRoute
        });
        Origin.editingOverlay.addView(new EditorThemeCollectionView({ model: configModel }).$el);
      }
    });
  }

  function handleExtensionsRoute() {
    var extensionsModel = new Backbone.Model({ _id: loc.course });
    var backButtonRoute = "/#/editor/" + loc.course + "/menu";
    var backButtonText = "Back to menu";
    if (Origin.previousLocation.route2 === "page") {
      backButtonRoute = "/#/editor/" + loc.course + "/page/" + Origin.previousLocation.route3;
      backButtonText = "Back to page";
    }
    updatePageTitle({ title: window.polyglot.t('app.editorextensionstitle') });
    Origin.sidebar.addView(new EditorExtensionsEditSidebarView().$el, {
      "backButtonText": backButtonText,
      "backButtonRoute": backButtonRoute
    });
    Origin.editingOverlay.addView(new EditorExtensionsEditView({ model: extensionsModel }).$el);
  }

  function handleMenuSettingsRoute() {
    var configModel = new EditorConfigModel({_courseId: loc.course});
    configModel.fetch({
      success: function() {
        var backButtonRoute = "/#/editor/" + loc.course + "/menu";
        var backButtonText = "Back to menu";
        if (Origin.previousLocation.route2 === "page") {
          backButtonRoute = "/#/editor/" + loc.course + "/page/" + Origin.previousLocation.route3;
          backButtonText = "Back to page";
        }
        updatePageTitle({ title: window.polyglot.t('app.editormenusettingstitle') });
        Origin.sidebar.addView(new EditorMenuSettingsEditSidebarView().$el, {
          "backButtonText": backButtonText,
          "backButtonRoute": backButtonRoute
        });
        Origin.editingOverlay.addView(new EditorMenuSettingsEditView({ model: configModel }).$el);
      }
    });
  }

  function handleMenuRoute() {
    // If loc.id is an id set it to the currentContentObjectId
    Origin.editor.currentContentObjectId = (loc.id) ? loc.id : undefined;
    Origin.editor.scrollTo = 0;

    var courseModel = new EditorCourseModel({ _id: loc.course });
    courseModel.fetch({
      success: function() {
        updatePageTitle(courseModel);
        Origin.router.createView(EditorView, {
          currentCourseId: loc.course,
          currentView: 'menu',
          currentPageId: (loc.id || null)
        });
        Origin.sidebar.addView(new EditorMenuSidebarView().$el, {
          "backButtonText": "Back to courses",
          "backButtonRoute": '/#/courses'
        });
      }
    });
  }

  function handleMenuEditRoute() {
    var contentObjectModel = new EditorContentObjectModel({_id: loc.id});
    contentObjectModel.fetch({
      success: function() {
        var form = Origin.scaffold.buildForm({ model: contentObjectModel });
        updatePageTitle(contentObjectModel);
        Origin.sidebar.addView(new EditorPageEditSidebarView().$el);
        Origin.editingOverlay.addView(new EditorPageEditView({ model: contentObjectModel, form: form }).$el);
      }
    });
  }

  function handlePageRoute() {
    var contentObjectModel = new EditorContentObjectModel({_id: loc.id});
    contentObjectModel.fetch({
      success: function() {
        updatePageTitle(contentObjectModel);
        Origin.router.createView(EditorView, {
          currentCourseId: loc.course,
          currentView: 'page',
          currentPageId: (loc.id || null)
        });
        Origin.sidebar.addView(new EditorPageSidebarView().$el, {
          "backButtonText": "Back to course structure",
          "backButtonRoute": "/#/editor/" + loc.course + "/menu"
        });
      }
    });
  }

  function handlePageEditRoute() {
    var contentObjectModel = new EditorContentObjectModel({_id: loc.id});
    contentObjectModel.fetch({
      success: function() {
        var form = Origin.scaffold.buildForm({ model: contentObjectModel });
        updatePageTitle(contentObjectModel);
        Origin.sidebar.addView(new EditorPageEditSidebarView({ form: form }).$el);
        Origin.editingOverlay.addView(new EditorPageEditView({ model: contentObjectModel, form: form }).$el);
      }
    });
  }

  /**
  * Exports
  */
  return {
    route: route
  };
});
