// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var SidebarItemView = require('modules/sidebar/views/sidebarItemView');

  var CoursesSidebarView = SidebarItemView.extend({
    settings: {
      autoRender: true
    },

    events: {
      'click .courses-sidebar-add-course': 'addCourse',

      'keyup .courses-sidebar-filter-search-input': 'filterProjectsByTitle',

      'click .sidebar-filter-clear': 'clearFilterInput',

      'click .courses-sidebar-tag': 'onFilterButtonClicked',
      'click .courses-sidebar-add-tag': 'onAddTagClicked',
      'click .courses-sidebar-row-filter': 'onFilterRemovedClicked',

      'click .course-filter': 'onCourseFilterClicked'
    },

    addCourse: function() {
      Origin.router.navigateTo('project/new');
    },

    gotoMyCourses: function() {
      Origin.router.navigateTo('courses');
    },

    gotoSharedCourses: function() {
      Origin.router.navigateTo('courses/shared');
    },

    postRender: function() {
      this.listenTo(Origin, 'sidebarFilter:filterByTags', this.filterProjectsByTags);
      this.listenTo(Origin, 'sidebarFilter:addTagToSidebar', this.addTagToSidebar);
      this.listenTo(Origin, 'sidebar:update:ui', this.updateUI);
      this.tags = [];
      this.usedTags = [];
    },

    highlightSearchBox: function() {
      var $input = this.$('.courses-sidebar-filter-search-input');
      $input.removeClass('search-highlight')
      if ($input.val()) {
        $input.addClass('search-highlight')
      }
    },

    updateUI: function(userPreferences) {
      if (userPreferences.search) {
        this.$('.courses-sidebar-filter-search-input').val(userPreferences.search);
      }
      this.highlightSearchBox();

      if (userPreferences.tags) {
        this.tags = userPreferences.tags;
        _.each(this.tags, this.addTagToSidebar, this);
      }
    },

    filterProjectsByTitle: function(event, filter) {
      event && event.preventDefault();

      var filterText = $(event.currentTarget).val().trim();
      Origin.trigger('courses:coursesSidebarView:filterBySearch', filterText);

      this.highlightSearchBox();
    },

    clearFilterInput: function(event) {
      event && event.preventDefault();
      var $currentTarget = $(event.currentTarget);
      $currentTarget.prev('.courses-sidebar-filter-input').val('').trigger('keyup', [true]);
      this.highlightSearchBox();
    },

    onFilterButtonClicked: function(event) {
      event && event.preventDefault();
      $currentTarget = $(event.currentTarget);
      var filterType = $currentTarget.attr('data-tag');
      // toggle filter
      if ($currentTarget.hasClass('selected')) {
        $currentTarget.removeClass('selected');
        Origin.trigger('courses:sidebarFilter:remove', filterType);
      } else {
        $currentTarget.addClass('selected');
        Origin.trigger('courses:sidebarFilter:add', filterType);
      }
    },

    onAddTagClicked: function(event) {
      event && event.preventDefault();
      var availableTags = [];
      // generate a unique set of tag
      this.collection.each(function(tag) {
        var availableTagsTitles = _.pluck(availableTags, 'title');
        var usedTagTitles = _.pluck(this.usedTags, 'title');
        var isTagAvailable = _.contains(availableTagsTitles, tag.get('title'));
        var isTagUsed = !_.contains(usedTagTitles, tag.get('title'));

        if (!isTagAvailable && !isTagUsed) availableTags.push(tag.attributes);
      }, this);

      Origin.trigger('sidebar:sidebarFilter:add', {
        title: window.polyglot.t('app.filterbytags'),
        items: availableTags
      });
    },

    onTagClicked: function(event) {
      event && event.preventDefault();
      var tag = $(event.currentTarget).toggleClass('selected').attr('data-tag');
      this.filterProjectsByTags(tag);
    },

    filterProjectsByTags: function(tag) {
      // Check if the tag is already being filtered and remove it
      if(_.findWhere(this.tags, { id: tag.id })) {
        this.tags = _.reject(this.tags, function(tagItem) { return tagItem.id === tag.id; });
      } else {
        // Else add it to array
        this.tags.push(tag);
      }
      Origin.trigger('courses:coursesSidebarView:filterByTags', this.tags);
    },

    addTagToSidebar: function(tag) {
      this.usedTags.push(tag);

      var data = {
        rowClasses: 'sidebar-row-filter',
        buttonClasses: 'courses-sidebar-row-filter',
        tag: tag
      };

      var template = Handlebars.templates['sidebarRowFilter'];
      this.$('.courses-sidebar-add-tag').parent().after(template(data));
    },

    onFilterRemovedClicked: function(event) {
      event && event.preventDefault();
      var tag = {
        title: $(event.currentTarget).attr('data-title'),
        id: $(event.currentTarget).attr('data-id')
      };
      // Remove this tag from the usedTags
      this.usedTags = _.reject(this.usedTags, function(item) { return item.id === tag.id; });

      this.filterProjectsByTags(tag);

      $(event.currentTarget).parent().remove();
    },

    onCourseFilterClicked: function(event) {
      event && event.preventDefault();
      $('i', event.currentTarget).toggleClass('fa-toggle-on');

      var $filters = $('.course-filter i.fa-toggle-on');

      if($filters.length === 0) {
        Origin.trigger('courses:coursesSidebarView:filter', { title: 'xxxxxxxx' });
      } else if($filters.length === 1) {
        var isMine = $($filters[0]).closest('.course-filter').attr('data-id') === 'mine';
        Origin.trigger('courses:coursesSidebarView:filter', {
          createdBy: isMine ? Origin.sessionModel.get('id') : { $ne: Origin.sessionModel.get('id') }
        });
      } else if($filters.length === 2) {
        Origin.trigger('courses:coursesSidebarView:filter', {});
      }
    }
  }, {
    template: 'coursesSidebar'
  });

  return CoursesSidebarView;
});
