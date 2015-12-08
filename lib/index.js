var State = require('ampersand-state');
var Collection = require('ampersand-collection');

var resources = require('./resources');
var trackers = require('./trackers');

var ResourceCollection = Collection.extend({
  model: resources.BaseResource
});

module.exports = State.extend({
  props: {
    googleAnalytics: 'any'
  },
  collections: {
    resources: ResourceCollection
  },
  initialize: function() {
    // initalize the trackers
    this.googleAnalytics = new trackers.GoogleAnalyticsTracker({
      // this normally comes passed in to the metrics objet
      tid: 'UA-71150609-1',
      // this normally comes from the User resource, shortcutting here
      cid: '121d91ad-15a4-47eb-977d-f279492932f0'
    });
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
  }
});
