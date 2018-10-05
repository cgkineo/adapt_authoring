// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Backbone = require('backbone');
  var Origin = require('core/origin');
  var OriginView = require('core/views/originView');
  var ContentCollection = require('core/collections/contentCollection');
  var TagCollection = Backbone.Collection.extend({ url: '/api/content/tag' });

  var TAG_PREFIX = '(p|m)-';

  var TagMapView = OriginView.extend({
    className: 'tagmap',
    settings: {
      autoRender: false
    },
    events: {
      'click button.sort': 'onSortClicked',
      'click button.tag': 'onTagClicked'
    },
    sorts: {
      date: {
        regular: function(a, b) {
          return new Date(a.get('updatedAt')) < new Date(b.get('updatedAt'));
        },
        reverse: function(a, b) {
          return new Date(a.get('updatedAt')) > new Date(b.get('updatedAt'));
        }
      },
      module: {
        regular: function(a, b) {
          return a.get('moduleTag').title.localeCompare(b.get('moduleTag').title);
        },
        reverse: function(a, b) {
          return b.get('moduleTag').title.localeCompare(a.get('moduleTag').title);
        }
      },
      project: {
        regular: function(a, b) {
          return a.get('projectTag').title > b.get('projectTag').title;
        },
        reverse: function(a, b) {
          return b.get('projectTag').title.localeCompare(a.get('projectTag').title);
        }
      },
      title: {
        regular: function(a, b) {
          return a.get('title').localeCompare(b.get('title'));
        },
        reverse: function(a, b) {
          return b.get('title').localeCompare(a.get('title'));
        }
      }
    },

    initialize: function(options) {
      this.model = new Backbone.Model({
        tags: new TagCollection(),
        courses: new ContentCollection(null, { _type: 'course' }),
        currentSort: 'module'
      });
      this.listenTo(Origin, 'tagmap:filter', this.onFilterClicked);
      OriginView.prototype.initialize.apply(this, arguments);
    },

    preRender: function() {
      this.fetchTags(function() {
        this.fetchCourses(function() {
          this.filterCourses();
          this.doSort('module');
        });
      });
    },

    fetchTags: function(cb) {
      this.model.get('tags').fetch({
        data: { title: { $regex: '^' + TAG_PREFIX } },
        success: _.bind(function(tags) {
          this.processTags(tags);
          cb.apply(this);
        }, this)
      });
    },

    processTags: function(tags) {
      var m = [], p = [];
      tags.each(function(tag) {
        (tag.get('title')[0] === 'p') ? p.push(tag) : m.push(tag);
      });
      this.model.set({ moduleTags: m, projectTags: p });
    },

    fetchCourses: function(cb) {
      this.model.get('courses').fetch({
        success: _.bind(function(courses) {
          this.processCourses(courses);
          cb.apply(this);
        }, this)
      });
    },

    processCourses: function(courses) {
      courses.each(function(course) {
        var pTag, mTag;
        course.get('tags').forEach(function(tag) {
          if(pTag && mTag) return;
          this.model.get('projectTags').forEach(function(projectTag) {
            if(projectTag.get('_id') === tag._id) return pTag = tag;
          }, this);
          this.model.get('moduleTags').forEach(function(moduleTag) {
            if(moduleTag.get('_id') === tag._id) return mTag = tag;
          }, this);
        }, this);
        course.set({ projectTag: pTag, moduleTag: mTag });
      }, this);
    },

    filterCourses: function() {
      var allTagIds = this.getTagIds();
      // only want matching courses
      var filtered = this.model.get('courses').filter(_.bind(function(course) {
        var courseTagIds = course.get('tags').map(function(tag) {
          return tag._id;
        });
        return _.intersection(courseTagIds, allTagIds).length > 0;
      }, this));
      this.model.set('courses', new Backbone.Collection(filtered));

      this.doSort('module');
    },

    doesCourseHaveTag: function(course, tag) {
      var ret = false;
      course.get('tags').forEach(function(courseTag) {
        if(courseTag._id === tag.get('_id')) return ret = true;
      });
      return ret;
    },

    doSort: function(type) {
      this.model.get('courses').comparator = this.getSortFunction(type);
      this.model.get('courses').sort();
      this.model.set({ currentSort: type, isReverseSort: this.isReverseSort() });
      this.render();
    },

    getSortFunction: function(type) {
      var sort = this.sorts[type];
      var shouldReverse = this.model.get('currentSort') === type && !this.isReverseSort();
      return shouldReverse ? sort.reverse : sort.regular;
    },

    getTagIds: function() {
      return this.model.get('tags').map(function(tag) {
        return tag.get('_id');
      });
    },

    isReverseSort: function() {
      var sort = this.sorts[this.model.get('currentSort')];
      return this.model.get('courses').comparator === sort.reverse;
    },

    onFilterClicked: function(event) {
      this.$('.filters').toggleClass('hidden');
    },

    onSortClicked: function(event) {
      this.doSort($(event.currentTarget).attr('data-id'));
    },

    onTagClicked: function(event) {
      var filter = $(event.currentTarget).attr('data-id');
      this.model.set('tagFilter', (filter === this.model.get('tagFilter')) ? '' : filter);
      this.render();
    }
  }, { template: 'tagMap' });

  return TagMapView;
});
