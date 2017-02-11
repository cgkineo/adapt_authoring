// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Backbone = require('backbone');
  var Origin = require('core/origin');

  var Router = Backbone.Router.extend({
    routes: {
      "": "handleIndex",
      "_=_": "handleIndex",
      ":module(/*route1)(/*route2)(/*route3)(/*route4)": "handleRoute"
    },
    homeRoute: "",

    initialize: function() {
      this.$loading = $('.loading');
      this.addListeners();
    },

    addListeners: function() {
      Origin.on('router:hideLoading', this.hideLoading, this);
      Origin.on('router:showLoading', this.showLoading, this);

      Origin.on('router:denyAccess', this.denyAccess, this);
    },

    isUserAuthd: function() {
      return Origin.sessionModel.get('isAuthenticated');
    },

    denyAccess: function() {
      // TODO localise
      Origin.Notify.alert({
        type: 'error',
        text: 'You don\'t have permission to access this area.',
        callback: this.navigateToDashboard.bind(this)
      });
    },

    navigateTo: function(route, options) {
      options = options || { trigger: true };
      this.navigate('#/' + route, options);
    },

    navigateToLogin: function() {
      this.navigateTo('user/login');
    },

    navigateToHome: function() {
      if(!this.homeRoute) {
        return console.error('No home route has been set');
      }
      this.navigateTo(this.homeRoute);
    },

    handleIndex: function() {
      this.showLoading();
      this.isUserAuthd() ? this.navigateToHome() : this.navigateToLogin();
    },

    handleRoute: function(module, route1, route2, route3, route4) {
      this.showLoading();
      this.removeViews();

      if (!Origin.permissions.checkRoute(Backbone.history.fragment)) {
        return this.denyAccess();
      }
      if (!this.isUserAuthd() && (module !== 'user' && route1 !== 'login')) {
        this.navigateToLogin();
        Origin.Notify.alert({
          type: 'error',
          text: window.polyglot.t('app.errorsessionexpired')
        });
        return;
      }
      this.updateCurrentLocation(arguments);

      Origin.trigger('router:' + module, route1, route2, route3, route4);
    },

    setHomeRoute: function(route) {
      this.homeRoute = route;
    },

    updateCurrentLocation: function(routeArguments) {
      Origin.previousLocation = Origin.location;

      Origin.location = {};
      _.each(['module', 'route1', 'route2', 'route3', 'route4'], function(locationKey, index) {
        Origin.location[locationKey] = routeArguments[index];
      });

      this.addLocationClasses();

      Origin.trigger('location:change', Origin.location);
    },

    /**
    * View stuff
    */

    addLocationClasses: function() {
      var locationClass = 'module-' + Origin.location.module;
      if (Origin.location.route1) {
        locationClass += ' location-' + Origin.location.route1
      }
      $('body').removeClass().addClass(locationClass);
    },

    showLoading: function(shouldHideTopBar) {
      this.$loading.removeClass('display-none fade-out');
      // Sometimes you might want to disable the top bar too
      if(shouldHideTopBar) this.$loading.addClass('cover-top-bar');
    },

    hideLoading: function() {
      this.$loading.addClass('fade-out');
      _.delay(_.bind(function() {
        this.$loading.addClass('display-none').removeClass('cover-top-bar');
      }, this), 300);
    },

    createView: function(View, viewOptions, settings) {
      var viewOptions = (viewOptions || {});
      var settings = (settings || {});

      if (!this.isUserAuthd() && settings.authenticate !== false) {
        return this.navigateToLogin();
      }

      $('.app-inner').append(new View(viewOptions).$el);
    },

    removeViews: function() {
      Origin.trigger('remove:views');
    },
  });

  return Router;
});
