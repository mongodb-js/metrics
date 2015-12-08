var resources = require('../lib/resources');
var assert = require('assert');
var debug = require('debug')('metrics:test:resources');

var mockTracker = function(callback) {
  return function(cmd, options) {
    callback(options);
  };
};


describe('Resources', function() {
  describe('Base', function() {
    var base;
    beforeEach(function() {
      base = new resources.BaseResource();
    });

    it('should have `Base` as its namespace', function() {
      assert.equal(base.namespace, 'Base');
    });
  });

  describe('App', function() {
    var app;
    beforeEach(function() {
      app = new resources.AppResource({
        appName: 'mongodb-metrics',
        appVersion: '1.2.3'
      });
    });

    it('should have `App` as its namespace', function() {
      assert.equal(app.namespace, 'App');
    });

    it('should complain if a new App resource does not contain a name or version', function() {
      /* eslint no-unused-vars: 0 */
      assert.throws(function() {
        var badApp = new resources.AppResource({appName: 'Foo'});
      }, /required/);

      assert.throws(function() {
        var badApp = new resources.AppResource({appVersion: '1.0'});
      }, /required/);

      assert.ok(new resources.AppResource({appName: 'Foo', appVersion: '1.0'}));
    });

    it('should send a `launched` event to GA with app name and version', function(done) {
      app.googleAnalytics = mockTracker(function(options) {
        assert.equal(options.hitType, 'event');
        assert.equal(options.eventCategory, 'App');
        assert.equal(options.eventAction, 'launched');
        assert.equal(options.eventLabel, 'mongodb-metrics 1.2.3');
        done();
      });

      app.launched();
    });

    it('should send an `upgraded` event to GA with app name and old and new versions', function(done) {
      app.googleAnalytics = mockTracker(function(options) {
        assert.equal(options.hitType, 'event');
        assert.equal(options.eventCategory, 'App');
        assert.equal(options.eventAction, 'upgraded');
        assert.equal(options.eventLabel, 'mongodb-metrics 1.2.1 -> 1.2.3');
        done();
      });

      app.upgraded('1.2.1');
    });
  });
});
