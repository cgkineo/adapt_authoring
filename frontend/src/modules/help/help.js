// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  
  Origin.on('navigation:help', function() {
    switch (Origin.location.module) {
      case 'courses':
        switch (Origin.location.route1) {
          case 'shared':
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#shared-courses");
          return;
        default:
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#the-dashboard");
          return;
      }
      case 'project':
        window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#course-details");
        return;
      case 'editor':
        switch (Origin.location.route2) {
          case 'menu':
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#editing-course-details");
            return;
          case 'block':
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#adding-content-to-the-course");
            return;
          case 'edit':
             window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#sectionpage-settings");
            return;
          case 'page':
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#adding-content-to-the-course");
            return;
          case 'config':
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#course-settings");
            return;
          case 'theme':
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#course-settings");
            return;
          case 'extensions':
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#course-settings");
            return;
          default:
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/");
            return;
        }
        switch (Origin.location.route3) {
          case 'edit':
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Creating-a-Course#adding-content-to-the-course");
            return;
          default:
            window.open("https://github.com/adaptlearning/adapt_authoring/wiki/");
            return;
        }
        return;
      case 'pluginManagement':
        window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager");
        return;
      case 'assetManagement':
        window.open("https://github.com/adaptlearning/adapt_authoring/wiki/Asset-Manager");
        return;
      default:
        window.open("https://github.com/adaptlearning/adapt_authoring/wiki/");
        return;
    }
  });
});
