var metrics = require('../lib')();
var resources = require('../lib/resources');
var assert = require('assert');

var debug = require('debug')('metrics:test:user');
var DEBUG = true;

describe('User Resource', function() {
  var user;

  beforeEach(function() {
    // create metrics object and initialize
    metrics.configure({
      gaOptions: {
        debug: DEBUG,
        trackingId: 'UA-71150609-2'
      }
    });

    metrics.resources.reset();

    // create a new user resource
    user = new resources.UserResource({
      clientId: '121d91ad-15a4-47eb-977d-f279492932f0'
    });
  });

  it('should have `User` as its id', function() {
    assert.equal(user.id, 'User');
  });

  it('should have a clientId after adding the user resource', function() {
    metrics.addResource(user);
    assert.equal(metrics.trackers.get('ga').clientId, '121d91ad-15a4-47eb-977d-f279492932f0');
  });

  it('should update the clientId when it changes on the user resource', function() {
    metrics.addResource(user);
    assert.equal(metrics.trackers.get('ga').clientId, '121d91ad-15a4-47eb-977d-f279492932f0');
    user.clientId = '3c007a83-e8c3-4b52-9631-b5fd97950dce';
    assert.equal(metrics.trackers.get('ga').clientId, '3c007a83-e8c3-4b52-9631-b5fd97950dce');
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
