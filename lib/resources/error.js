var BaseResource = require('./base');

// var debug = require('debug')('mongodb-js-metrics:resources:error');

module.exports = BaseResource.extend({
  id: 'Error',
  info: function(err, metadata) {
    this._send_bugsnag(err, metadata);
  },
  warning: function(err, metadata) {
    this._send_bugsnag(err, metadata);
  },
  error: function(err, metadata) {
    this._send_bugsnag(err, metadata);
  }
});
