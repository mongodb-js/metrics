var metrics = require('../lib')();
var resources = require('../lib/resources');
var assert = require('assert');
// var format = require('util').format;
var _ = require('lodash');
var common = require('./common');

// var debug = require('debug')('mongodb-js-metrics:test:stitch');

describe('Stitch Tracker', function() {
  var app;
  var user;
  var stitchTracker;

  beforeEach(function() {
    // create metrics object and initialize
    metrics.configure('stitch', {
      enabled: true,
      stitchAppId: 'compass-metrics-irinb',
      eventNamespace: 'metrics.events',
      userNamespace: 'metrics.users'
    });

    metrics.resources.reset();

    // create a new app resource
    app = new resources.AppResource({
      appName: common.appName,
      appVersion: common.appVersion,
      appPlatform: common.appPlatform
    });

    user = new resources.UserResource({
      userId: common.userId
    });

    stitchTracker = metrics.trackers.get('stitch');
  });

  it('should only initialize after setting app and user resources', function() {
    assert.equal(stitchTracker.stitchClient, null);
    metrics.addResource(app);
    assert.equal(stitchTracker.stitchClient, null);
    metrics.addResource(user);
    // after call stack clears, stitchClient should not be null anymore
    _.defer(function() {
      assert.ok(stitchTracker.stitchClient);
      assert.ok(stitchTracker.collection);
    });
  });
});
