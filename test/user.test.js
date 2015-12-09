var Metrics = require('../lib');
var resources = require('../lib/resources');
var assert = require('assert');

var debug = require('debug')('metrics:test:user');
var DEBUG = true;

describe('User Resource', function() {
  var metrics;
  var user;

  beforeEach(function() {
    // create metrics object and initialize
    metrics = new Metrics({
      gaOptions: {
        debug: DEBUG,
        trackingId: 'UA-71150609-2'
      }
    });

    // create a new user resource
    user = new resources.UserResource({
      clientId: '121d91ad-15a4-47eb-977d-f279492932f0'
    });
  });

  it('should have `User` as its id', function() {
    assert.equal(user.id, 'User');
  });

  it('should complain if a new User resource does not contain a name or version', function() {
    /* eslint no-unused-vars: 0 */
    assert.throws(function() {
      var badUser = new resources.UserResource();
    }, /required/);

    assert.ok(new resources.UserResource({clientId: '123'}));
  });

  it('should have a clientId after adding the user resource', function() {
    metrics.addResource(user);
    assert.equal(metrics.googleAnalytics.clientId, '121d91ad-15a4-47eb-977d-f279492932f0');
  });

  it('should update the clientId when it changes on the user resource', function() {
    metrics.addResource(user);
    assert.equal(metrics.googleAnalytics.clientId, '121d91ad-15a4-47eb-977d-f279492932f0');
    user.clientId = '3c007a83-e8c3-4b52-9631-b5fd97950dce';
    assert.equal(metrics.googleAnalytics.clientId, '3c007a83-e8c3-4b52-9631-b5fd97950dce');
  });

  it('should attach the right protocol parameters for a logged_in event', function(done) {
    // mock function to intercept options
    user._send_ga = function(options) {
      debug('_send_ga options', options);
      assert.equal(options.hitType, 'event');
      assert.equal(options.eventLabel, user.clientId);
      assert.equal(options.eventCategory, 'User');
      assert.equal(options.eventAction, 'logged_in');
      done();
    };
    user.logged_in();
  });
});
