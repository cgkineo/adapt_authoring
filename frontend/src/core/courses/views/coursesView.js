// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Backbone = require('backbone');
  var Handlebars = require('handlebars');
  var Origin = require('coreJS/app/origin');
  var OriginView = require('coreJS/app/views/originView');
  var ProjectView = require('coreJS/project/views/projectView');
  var SharedProjectView = require('coreJS/project/views/sharedProjectView');
  var ProjectCollection = require('coreJS/project/collections/projectCollection');

  var CoursesView = OriginView.extend({

    settings: {
      autoRender: true,
      preferencesKey: 'courses'
    },

    className: 'courses',

    preRender: function(options) {
      this.setupFilterSettings();
      this.addListeners();
    },

    setupFilterSettings: function() {
      // Setup filtering and lazy loading settings
      this.sort = {createdAt: -1};
      this.search = {};
      // TODO set this limit to what can actually fit on screen...
      this.courseLimit = -32;
      this.courseDenominator = 32;
      // Set empty filters
      this.filters = [];
      this.tags = [];

      this.collectionLength = 0;
      this.shouldStopFetches = false;
    },

    addListeners: function() {
      this.listenTo(Origin, 'window:resize', this.resizeCourses);

      this.listenTo(Origin, 'courses:layout:thumb', this.switchLayoutToThumb);
      this.listenTo(Origin, 'courses:layout:grid', this.switchLayoutToGrid);
      this.listenTo(Origin, 'courses:layout:list', this.switchLayoutToList);

      this.listenTo(Origin, 'courses:sort:asc', this.sortAscending);
      this.listenTo(Origin, 'courses:sort:desc', this.sortDescending);
      this.listenTo(Origin, 'courses:sort:updated', this.sortLastUpdated);

      this.listenTo(Origin, 'courses:coursesSidebarView:filter', this.filter);
      this.listenTo(Origin, 'courses:coursesSidebarView:filterBySearch', this.filterBySearchInput);
      this.listenTo(Origin, 'courses:coursesSidebarView:filterByTags', this.filterByTags);

      this.listenTo(Origin, 'courses:sidebarFilter:add', this.addTag);
      this.listenTo(Origin, 'courses:sidebarFilter:remove', this.removeTag);

      this.listenTo(this.collection, 'add', this.appendProjectItem);
      this.listenTo(this.collection, 'sync', this.checkIfCollectionIsEmpty)
    },

    resizeCourses: function() {
      var navigationHeight = $('.navigation').outerHeight();
      var locationTitleHeight = $('.location-title').outerHeight();
      var windowHeight = $(window).height();
      var actualHeight = windowHeight - (navigationHeight + locationTitleHeight);
      this.$el.css('height', actualHeight);
    },

    checkIfCollectionIsEmpty: function() {
      if (this.collection.length === 0) {
        this.$('.courses-no-projects').removeClass('display-none');
      } else {
        this.$('.courses-no-projects').addClass('display-none');
      }
    },

    postRender: function() {
      this.setupUserPreferences();
      // Fake a scroll trigger - just incase the limit is too low and no scroll bars
      $('.courses-projects').trigger('scroll');
      this.lazyRenderCollection();
      this.resizeCourses();
      this.setViewToReady();
      this.setupLazyScrolling();
    },

    switchLayoutToList: function() {
      var $container = $('.courses-projects');

      $container.removeClass('grid-layout thumb-layout').addClass('list-layout');

      this.setUserPreference('layout','list');
    },

    switchLayoutToGrid: function() {
      var $container = $('.courses-projects');

      $container.removeClass('list-layout thumb-layout').addClass('grid-layout');

      this.setUserPreference('layout','grid');
    },

    switchLayoutToThumb: function() {
      var $container = $('.courses-projects');
      $container.removeClass('list-layout grid-layout').addClass('thumb-layout');
      this.setUserPreference('layout','thumb');
    },

    sortAscending: function(shouldRenderProjects) {
      this.sort = {
        title: 1
      };

      this.setUserPreference('sort','asc', true);

      if (shouldRenderProjects !== false) {
        this.updateCollection(true);
      }
    },

    sortDescending: function(shouldRenderProjects) {
      this.sort = {
        title: -1
      }

      this.setUserPreference('sort','desc', true);

      if (shouldRenderProjects !== false) {
        this.updateCollection(true);
      }
    },

    sortLastUpdated: function(shouldRenderProjects) {
      this.sort = {
        updatedAt: -1
      }

      this.setUserPreference('sort','updated', true);

      if (shouldRenderProjects !== false) {
        this.updateCollection(true);
      }
    },

    setupUserPreferences: function() {
      // Preserve the user preferences or display default mode
      var userPreferences = this.getUserPreferences();

      if(!userPreferences) {
        return;
      }
      // Check if the user preferences are list view
      // Else if nothing is set or is grid view default to grid view
      if (userPreferences.layout === 'list') {
        this.switchLayoutToList();
      } else if (userPreferences.layout === 'thumb') {
        this.switchLayoutToThumb();
      } else {
        this.switchLayoutToGrid();
      }
      // Check if there's any user preferences for search and tags
      // then set on this view
      var searchString = (userPreferences.search || '');
      this.search = this.convertFilterTextToPattern(searchString);
      this.setUserPreference('search', searchString, true);
      this.tags = (_.pluck(userPreferences.tags, 'id') || []);
      this.setUserPreference('tags', userPreferences.tags, true);
      // Check if sort is set and sort the collection
      if (userPreferences.sort === 'desc') {
        this.sortDescending(false);
      } else if (userPreferences.sort === 'updated') {
        this.sortLastUpdated(false);
      } else {
        this.sortAscending(false);
      }
      // Once everything has been setup
      // refresh the userPreferences object
      userPreferences = this.getUserPreferences();
      // Trigger event to update options UI
      Origin.trigger('options:update:ui', userPreferences);
      Origin.trigger('sidebar:update:ui', userPreferences);
    },

    lazyRenderCollection: function() {
      // Adjust limit based upon the denominator
      this.courseLimit += this.courseDenominator;
      this.updateCollection(false);
    },

    emptyProjectsContainer: function() {
      // Trigger event to kill zombie views
      Origin.trigger('courses:coursesView:removeSubViews');
      // Empty collection container
      this.$('.courses-projects').empty();
    },

    updateCollection: function(reset) {
      // If removing items, we need to reset our limits
      if (reset) {
        // Empty container
        this.emptyProjectsContainer();
        // Reset fetches cache
        this.shouldStopFetches = false;
        this.courseLimit = 0;
        this.collectionLength = 0;
        this.collection.reset();
      }

      this.search = _.extend(this.search, { tags: { $all: this.tags }});
      // This is set when the fetched amount is equal to the collection length
      // Stops any further fetches and HTTP requests
      if (this.shouldStopFetches) {
        return;
      }

      this.collection.fetch({
        remove: reset,
        data: {
          search: this.search,
          operators : {
            skip: this.courseLimit,
            limit: this.courseDenominator,
            sort: this.sort
          }
        },
        success: _.bind(function(data) {
          // On successful collection fetching set lazy render to enabled
           if (this.collectionLength === this.collection.length) {
            this.shouldStopFetches = true;
          } else {
            this.shouldStopFetches = false;
            this.collectionLength = this.collection.length;
          }
          this.isCollectionFetching = false;
        }, this)
      });
    },

    appendProjectItem: function(projectModel) {
      projectModel.attributes.title = this.highlight(projectModel.attributes.title);

      // var projectClass = projectModel.isEditable() ? ProjectView : SharedProjectView;
      // this.$('.courses-projects').append(new projectClass({ model: projectModel }).$el);

      this.$('.courses-projects').append(new ProjectView({ model: projectModel }).$el);
    },

    highlight: function(text){
      var userPreferences =this.getUserPreferences()
      var search = userPreferences.search || '';
      var regex = new RegExp(this.regExpEscape(search), "gi");
      return text.replace(regex, this.addHighlightWrapper);
    },

    regExpEscape: function(str){
      var specials = /[.*+?|()\[\]{}\\$^]/g; // .*+?|()[]{}\$^
      return str.replace(specials, "\\$&");
    },

    addHighlightWrapper: function(term) {
      return '<span class="highlighted">' + term + '</span>';
    },

    addTag: function(filterType) {
      // add filter to this.filters
      this.tags.push(filterType);
      this.filterCollection();
    },

    removeTag: function(filterType) {
      // remove filter from this.filters
      this.tags = _.filter(this.tags, function(item) {
          return item != filterType;
      });
      this.filterCollection();
    },

    filterCollection: function() {
      this.search.tags = this.tags.length ? { $all: this.tags } : null;
      this.updateCollection(true);
    },

    convertFilterTextToPattern: function(filterText) {
      return {
        title: { $regex: '.*' + filterText + '.*', $options: 'i' }
      };
    },

    filterBySearchInput: function (filterText) {
      this.filterText = filterText;
      this.search = this.convertFilterTextToPattern(filterText);
      this.setUserPreference('search', filterText, true);
      this.updateCollection(true);
    },

    filterByTags: function(tags) {
      this.setUserPreference('tags', tags, true);
      this.tags = _.pluck(tags, 'id');
      this.updateCollection(true);
    },

    filter: function(search) {
      this.search = search;
      this.updateCollection(true);
    },

    setupLazyScrolling: function() {
      var $projectContainer = $('.courses');
      var $projectContainerInner = $('.courses-inner');
      // Remove event before attaching
      $projectContainer.off('scroll');

      $projectContainer.on('scroll', _.bind(function() {
        var scrollTop = $projectContainer.scrollTop();
        var scrollableHeight = $projectContainerInner.height();
        var containerHeight = $projectContainer.height();
        // If the scroll position of the assets container is
        // near the bottom
        if ((scrollableHeight-containerHeight) - scrollTop < 30) {
          if (!this.isCollectionFetching) {
            this.isCollectionFetching = true;
            this.lazyRenderCollection();
          }
        }
      }, this));
    }
  }, {
    template: 'courses'
  })

  return CoursesView;
});
