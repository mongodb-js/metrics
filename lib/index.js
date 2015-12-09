var State = require('ampersand-state');
var Collection = require('ampersand-collection');

var resources = require('./resources');
var trackers = require('./trackers');

var singleton = require('singleton-js');

// var debug = require('debug')('metrics:lib:index');

var ResourceCollection = Collection.extend({
  model: resources.BaseResource
});

var Metrics = State.extend({
  props: {
    googleAnalytics: 'any'
  },
  collections: {
    resources: ResourceCollection
  },
  initialize: function() {
    // initalize the trackers
    this.googleAnalytics = new trackers.GoogleAnalyticsTracker();
    // @todo initialize other trackers
  },
  configure: function(options) {
    this.googleAnalytics.set(options.gaOptions);
    // @todo configure other trackers
  },
  addResource: function(resource) {
    // add trackers to resources
    resource.googleAnalytics = this.googleAnalytics;
    this.resources.add(resource);
  },
  track: function(resourceId, action) {
    var resource = this.resources.get(resourceId);
    var args = Array.prototype.slice.call(arguments, 2);
    resource[action].apply(resource, args);
  },
  error: function(action) {
    var resource = this.resources.get('Error');
    if (!resource) {
      return false;
    }
    var args = Array.prototype.slice.call(arguments, 1);
    resource[action].apply(resource, args);
  }
});

module.exports = singleton(Metrics, {
  instantiate: true
});
