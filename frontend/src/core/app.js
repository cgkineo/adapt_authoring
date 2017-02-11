// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
require([
    'templates',
    'polyglot',
    'sweetalert',
    'core/origin',
    'core/router',
    'core/permissions',
    'modules/user/user',
    'modules/help/help',
    'modules/courses/courses',
    'modules/courseImport/courseImport',
    'modules/editor/editor',
    'modules/assetManagement/assetManagement',
    'modules/pluginManagement/pluginManagement',
    'modules/user/models/sessionModel',
    'modules/navigation/views/navigationView',
    'modules/globalMenu/globalMenu',
    'modules/sidebar/sidebar',
    'core/helpers',
    'core/contextMenu',
    'modules/location/location',
    'plugins/plugins',
    'modules/notify/notify',
    'modules/editingOverlay/editingOverlay',
    'modules/options/options',
    'modules/scaffold/scaffold',
    'modules/modal/modal',
    'modules/filters/filters',
    'modules/actions/actions',
    'jquery-ui',
    'jquery-form',
    'inview',
    'imageReady',
    'mediaelement',
    'velocity',
    'scrollTo',
    'ace/ace'
], function (
    Templates,
    Polyglot,
    SweetAlert,
    Origin,
    Router,
    Permissions,
    User,
    Project,
    Courses,
    CourseImport,
    Editor,
    AssetManagement,
    PluginManagement,
    SessionModel,
    NavigationView,
    GlobalMenu,
    Sidebar,
    Helpers,
    ContextMenu,
    Location,
    Notify,
    EditingOverlay,
    Options,
    Scaffold,
    Modal,
    JQueryUI,
    JQueryForm,
    Inview,
    ImageReady,
    MediaElement
) {
  // Read in the configuration values/constants
  $.getJSON('config/config.json', function(configData) {
    Origin.constants = configData;

    // Get the language file
    var locale = localStorage.getItem('lang') || 'en';
    $.getJSON('lang/' + locale, function(data) {
      // Instantiate Polyglot with phrases
      window.polyglot = new Polyglot({phrases: data});

      Origin.router = new Router();

      Origin.sessionModel = new SessionModel();
      Origin.sessionModel.fetch();
      Origin.on('sessionModel:initialised', function() {
        // This callback is called from the schemasModel.js in scaffold as the schemas
        // need to load before the app loads
        Origin.trigger('app:userCreated', function() {
          $('#app').before(new NavigationView({ model: Origin.sessionModel }).$el);
          Origin.trigger('app:dataReady');
          // Defer here is good - give anything tapping in app:dataReady event
          // time to do their thang!
          _.defer(Origin.initialize);
        });
      });
    });
  });
});
