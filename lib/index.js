var State = require('ampersand-state');
var singleton = require('singleton-js');
var _ = require('lodash');

var trackers = require('./trackers');

var TrackerCollection = require('./models/tracker-collection');
var ResourceCollection = require('./models/resource-collection');

var debug = require('debug')('mongodb-js-metrics:lib:index');

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

    debug('initialized with %d trackers: %j', this.trackers.length, this.trackers.pluck('id'));
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
      debug('resource now has %d trackers: %j', resource.trackers.length, resource.trackers.pluck('id'));
      this.resources.add(resource);
    }.bind(this));
  },
  track: function(resourceId, action) {
    var resource = this.resources.get(resourceId);
    if (!resource) {
      debug('Unknown resource `%s`, tried to track action `%s`', resourceId, action);
      return;
    }
    var args = Array.prototype.slice.call(arguments, 2);
    if (resource[action]) {
      debug('tracking resource %s with action %s', resourceId, action);
      resource[action].apply(resource, args);
    } else {
      debug('ignoring unknown action %s on resource %s', action, resourceId);
    }
  },
  error: function(action) {
    var args = Array.prototype.slice.call(arguments, 1);
    this.track.apply(this, ['Error', action].concat(args));
  }
});

module.exports = singleton(Metrics, {
  instantiate: true
});
