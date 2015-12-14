var BaseResource = require('./base');
var _ = require('lodash');

// var debug = require('debug')('mongodb-js-metrics:resources:app');

module.exports = BaseResource.extend({
  id: 'Feature',
  used: function(metadata, callback) {
    metadata = metadata || {};
    // for google analytics, find first string and number and use those for
    // eventLabel and eventValue
    var metaStr = _.find(metadata, function(val) {
      return typeof(val) === 'string';
    });
    var metaNumber = _.find(metadata, function(val) {
      return typeof(val) === 'number';
    });
    var gaOptions = {};
    if (metaStr) {
      gaOptions.eventLabel = metaStr;
    }
    if (metaNumber) {
      gaOptions.eventValue = metaNumber;
    }
    this._send_ga_event(gaOptions, callback);
    this._send_intercom_event(metadata);
  }
});
