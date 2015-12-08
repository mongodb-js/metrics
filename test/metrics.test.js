var Metrics = require('../lib');
var resources = require('../lib/resources');

var debug = require('debug')('metrics:test:metrics');

describe('metrics', function() {
  this.slow(1000);
  this.timeout(5000);

  it('should send a google analytics event', function(done) {
    // create metrics object and initialize
    var metrics = new Metrics({debug: true});

    // create a new app resource
    var App = new resources.AppResource({
      appName: 'mongodb-metrics',
      appVersion: '1.0.0'
    });

    // add resource to tracker
    metrics.addResource(App);

    // send App/launched event
    metrics.track('App', 'launched', function(err, resp, body) {
      if (err) {
        console.error(err);
        done(err);
      }
      debug('statusCode', resp.statusCode);
      debug('body (debug)', body);
      done();
    });
  });
});
