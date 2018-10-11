// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var Origin = require('core/origin');
  var Helpers = require('core/helpers');
  var ConfigurationSubView = require('modules/configuration/views/configurationSubView');

  var TotaraConnectView = ConfigurationSubView.extend({
    className: 'totaraconnect',
    title: Origin.l10n.t('app.totaraconnecttitle'),
    prevTokens: [],
    events: {
      'click button[name=generateToken]': 'generateToken',
      'click button[name=copy]': 'copyToken',
      'click button[name=delete]': 'deleteToken'
    },

    postRender: function() {
      this.renderTokens();
    },

    renderTokens: function() {
      $.get('totaraconnect/tokens', _.bind(function(data) {
        this.$('.tokens').empty();
        if(!data || data.length === 0) {
          this.$('.tokensContainer').addClass('display-none');
          return;
        }
        this.model.set('tokens', data);
        for(var i = 0, count = data.length; i < count; i++) {
          data[i].number = (i+1);
          this.renderToken(data[i]);
        }
        this.$('.tokensContainer').removeClass('display-none');
        this.prevTokens = _.map(data, function(item) { return item._id; });
      }, this)).fail(function(jqXhr) {
        Origin.Notify.alert({
          type: 'error',
          text: jqXhr.responseText
        });
      });
    },

    renderToken: function(data) {
      var $token = $(Handlebars.partials.part_totaraconnectToken(data));
      if(this.prevTokens.length && this.prevTokens.indexOf(data._id) === -1) {
        $token.addClass('new');
      }
      this.$('.tokens').append($token);
    },

    generateToken: function(event) {
      if($(event.currentTarget).hasClass('pending')) {
        return;
      }
      $(event.currentTarget).addClass('pending');
      $.get('totaraconnect/generatetoken', _.bind(function(data) {
        $(event.currentTarget).removeClass('pending');
        $('.newToken').attr('data-id', data._id);
        $('.newToken .tokenString').html(data.token);
        this.showToken();
        this.renderTokens();
      }, this)).fail(function(jqXhr) {
        Origin.Notify.alert({
          type: 'error',
          text: jqXhr.responseText
        });
      });
    },

    showToken: function() {
      $('.newToken').removeClass('display-none');
    },

    hideToken: function() {
      $('.newToken').addClass('display-none');
    },

    copyToken: function(event) {
      if(Helpers.copyStringToClipboard($('.newToken .tokenString').html())) {
        Origin.Notify.alert({ type: 'success', text: Origin.l10n.t('app.copytokensuccess') });
      }
    },

    deleteToken: function(event) {
      Origin.Notify.confirm({
        text: Origin.l10n.t('app.deletetokenconfirm'),
        callback: _.bind(function(isConfirmed) {
          var id = $(event.currentTarget).parent('.token').attr('data-id');
          $.ajax({
            method: 'delete',
            url: 'totaraconnect/token/' + id,
            success: _.bind(function() {
              Origin.Notify.alert({
                type: 'success',
                text: Origin.l10n.t('app.deletetokensuccess')
              });
              if($('.newToken').attr('data-id') === id) this.hideToken();
              this.renderTokens();
            }, this),
            error: function() {
              Origin.Notify.alert({
                type: 'error',
                text: jqXhr.responseText
              });
            }
          })
        }, this)
      });
    }
  }, {
    template: 'totaraconnect'
  });

  return TotaraConnectView;
});
