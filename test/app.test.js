var metrics = require('../lib')();
var resources = require('../lib/resources');
var assert = require('assert');
var pkg = require('../package.json');
var process = require('process');
var format = require('util').format;

var debug = require('debug')('metrics:test:user');
var DEBUG = true;

describe('App Resource', function() {
  var app;

  beforeEach(function() {
    // create metrics object and initialize
    metrics.configure({
      gaOptions: {
        debug: DEBUG,
        trackingId: 'UA-71150609-2'
      }
    });

    metrics.resources.reset();

    // create a new app resource
    app = new resources.AppResource({
      appName: pkg.name,
      appVersion: pkg.version,
      appInstallerId: process.platform
    });
  });

  it('should have `App` as its id', function() {
    assert.equal(app.id, 'App');
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

  it('should have appName, appVersion, appInstallerId after adding the app resource', function() {
    metrics.addResource(app);
    assert.equal(metrics.googleAnalytics.appName, pkg.name);
    assert.equal(metrics.googleAnalytics.appVersion, pkg.version);
    assert.equal(metrics.googleAnalytics.appInstallerId, process.platform);
  });

  it('should update the parameters when they change on the app resource', function() {
    metrics.addResource(app);
    assert.equal(metrics.googleAnalytics.appName, pkg.name);
    app.appName = 'AngryWolvesWithTinyWings';
    assert.equal(metrics.googleAnalytics.appName, 'AngryWolvesWithTinyWings');
    app.appVersion = '0.0.1';
    assert.equal(metrics.googleAnalytics.appVersion, '0.0.1');
    app.appInstallerId = 'Mac OS X';
    assert.equal(metrics.googleAnalytics.appInstallerId, 'Mac OS X');
  });

  it('should attach the right protocol parameters for a viewed screenview', function(done) {
    // mock function to intercept options
    app._send_ga = function(options) {
      assert.equal(options.hitType, 'screenview');
      assert.equal(options.screenName, 'MyScreenName');
      assert.equal(options.documentPath, 'MyScreenName');
      done();
    };
    app.viewed('MyScreenName');
  });

  it('should attach the right protocol parameters for a launched event', function(done) {
    // mock function to intercept options
    app._send_ga = function(options) {
      assert.equal(options.hitType, 'event');
      assert.equal(options.eventCategory, 'App');
      assert.equal(options.eventAction, 'launched');
      assert.equal(options.eventLabel, format('%s %s', pkg.name, pkg.version));
      done();
    };
    app.launched();
  });

  it('should attach the right protocol parameters for a quit event', function(done) {
    // mock function to intercept options
    app._send_ga = function(options) {
      assert.equal(options.hitType, 'event');
      assert.equal(options.eventCategory, 'App');
      assert.equal(options.eventAction, 'quit');
      assert.equal(options.eventLabel, format('%s %s', pkg.name, pkg.version));
      assert.equal(options.eventValue, 15);
      done();
    };
    app.quit(15);
  });

  it('should attach the right protocol parameters for an upgraded event', function(done) {
    // mock function to intercept options
    app._send_ga = function(options) {
      assert.equal(options.hitType, 'event');
      assert.equal(options.eventCategory, 'App');
      assert.equal(options.eventAction, 'upgraded');
      assert.equal(options.eventLabel, format('%s %s -> %s', pkg.name, '0.1.5', pkg.version));
      done();
    };
    app.upgraded('0.1.5');
  });
});
