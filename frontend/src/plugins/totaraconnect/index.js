// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Helpers = require('core/helpers');
  var Origin = require('core/origin');
  var TotaraConnectView = require('./views/totaraConnectView');

  Origin.on('origin:dataReady', function() {
    Origin.trigger('configuration:registerView', 'totaraconnect', TotaraConnectView);
  });

  Origin.on('editor:contentObject', function(data) {
    if(data.action === 'edit') {
      return;
    }
    var viewEventName = 'editor' + data.type[0].toUpperCase() + data.type.slice(1);
    Origin.once(viewEventName + ':postRender', function() {
      var $btn = $(Handlebars.partials.part_totaraconnectPublishButton());
      var enabledExtensions = Origin.editor.data.config.get('_enabledExtensions');
      if(!enabledExtensions || !enabledExtensions.spoor) {
        $btn.addClass('disabled');
      }
      $('.editor-common-sidebar-download').after($btn);
      $btn.click(handlePublish);
    });
  });

  function handlePublish(event) {
    $(event.currentTarget).blur();
    if($(event.currentTarget).hasClass('disabled')) {
      return Origin.Notify.alert({
        type: 'error',
        text: Origin.l10n.t('app.publishdisabled')
      });
    }
    if(Origin.editor.isDownloadPending) {
      return;
    }
    Helpers.validateCourseContent(Origin.editor.data.course, function(error, isValid) {
      if(!isValid) {
        Origin.Notify.alert({ type: 'error', text: error.message });
        return;
      }
      $('.editor-sidebar-publish .publish').addClass('display-none');
      $('.editor-sidebar-publish .publishing').removeClass('display-none');

      $.get('/totaraconnect/publish/' + Origin.editor.data.course.get('_id'), function(jqXHR, textStatus, errorThrown) {
        $('.editor-sidebar-publish .publishing').addClass('display-none');
        $('.editor-sidebar-publish .publish').removeClass('display-none');
        Origin.Notify.alert({
          type: 'success',
          text: Origin.l10n.t('app.publishsuccess')
        });
      }).fail(function (jqXHR, textStatus, errorThrown) {
        Origin.Notify.alert({
          type: 'error',
          text: jqXHR.responseText
        });
      });
    });
  }
});
