var Metrics = require('../lib');
var resources = require('../lib/resources');
var assert = require('assert');
var pkg = require('../package.json');

var debug = require('debug')('metrics:test:metrics');

var DEBUG = false;

describe('metrics', function() {
  this.slow(1000);
  this.timeout(5000);

  var metrics;
  var App;
  var User;
  beforeEach(function() {
    // create metrics object and initialize
    metrics = new Metrics({
      gaOptions: {
        debug: DEBUG,
        trackingId: 'UA-71150609-2'
      }
    });

    // create a new app resource
    App = new resources.AppResource({
      appName: pkg.name,
      appVersion: pkg.version
    });

    // create a new user resource
    User = new resources.UserResource({
      userId: '121d91ad-15a4-47eb-977d-f279492932f0'
    });
  });

  it('should send a google analytics App:launched event hit', function(done) {
    // add resources to tracker
    metrics.addResource(App);
    metrics.addResource(User);

    // send App/launched event
    metrics.track('App', 'launched', function(err, resp, body) {
      if (err) {
        done(err);
      }
      assert.equal(resp.statusCode, 200);
      if (DEBUG) {
        debug(body);
        assert.ok(JSON.parse(body).hitParsingResult[0].valid);
      }
      done();
    });
  });

  it('should send a google analytics User:logged_in event hit', function(done) {
    // add resources to tracker
    metrics.addResource(App);
    metrics.addResource(User);

    metrics.track('User', 'logged_in', function(err, resp, body) {
      if (err) {
        done(err);
      }
      assert.equal(resp.statusCode, 200);
      if (DEBUG) {
        assert.ok(JSON.parse(body).hitParsingResult[0].valid);
      }
      done();
    });
  });

  it('should send a google analytics App:viewed screenview hit', function(done) {
    // add resource to tracker
    metrics.addResource(App);
    metrics.addResource(User);

    // send App/launched event
    metrics.track('App', 'viewed', 'Test Results', function(err, resp, body) {
      if (err) {
        done(err);
      }
      assert.equal(resp.statusCode, 200);
      if (DEBUG) {
        debug('body', body);
        assert.ok(JSON.parse(body).hitParsingResult[0].valid);
      }
      done();
    });
  });
});
