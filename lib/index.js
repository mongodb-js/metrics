var State = require('ampersand-state');
var singleton = require('singleton-js');
var _ = require('lodash');

var trackers = require('./trackers');

var TrackerCollection = require('./models/tracker-collection');
var ResourceCollection = require('./models/resource-collection');

var debug = require('debug')('metrics:lib:index');

var Metrics = State.extend({
  collections: {
    trackers: TrackerCollection,
    resources: ResourceCollection
  },
  initialize: function() {
    // initalize the trackers (but disabled by default)
    _.each(trackers, function(Tracker) {
      this.trackers.add(new Tracker());
    }.bind(this));

    debug('initialized with %d trackers: %s', this.trackers.length, this.trackers.pluck('id'));
  },
  configure: function(name, options) {
    var tracker;
    var trackerOptions = {};

    if (arguments.length === 2) {
      trackerOptions[name] = options;
    } else if (arguments.length === 1) {
      trackerOptions = name;
    } else {
      throw new Error('configure requires either 1 or 2 arguments.');
    }
    // configure the tracker(s)
    _.each(trackerOptions, function(opts, key) {
      tracker = this.trackers.get(key);
      if (tracker) {
        // also enable the tracker now
        opts.enabled = true;
        debug('configuring tracker `%s` with %j', key, opts);
        tracker.set(opts);
      }
    }.bind(this));
  },
  addResource: function() {
    // add trackers to resources
    _.each(arguments, function(resource) {
      debug('adding resource `%s`', resource.id);
      resource.trackers.reset(this.trackers.models);
      debug('resource now has %d trackers: %s', resource.trackers.length, resource.trackers.pluck('id'));
      this.resources.add(resource);
    }.bind(this));
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
