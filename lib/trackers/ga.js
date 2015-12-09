var querystring = require('querystring');
var State = require('ampersand-state');
var xhr = (typeof window !== 'undefined') ? require('xhr') : require('request');
var _ = require('lodash');
var format = require('util').format;

var debug = require('debug')('metrics:trackers:ga');

var PROTOCOL_PARAMETER_MAP = {
  'version': 'v',
  'dataSource': 'ds',
  'trackingId': 'tid',
  'clientId': 'cid',
  'userId': 'uid',
  'hitType': 't',
  'appName': 'an',
  'appVersion': 'av',
  'appInstallerId': 'aiid',
  'eventCategory': 'ec',
  'eventAction': 'ea',
  'eventLabel': 'el',
  'eventValue': 'ev',
  'screenName': 'cd',
  'documentPath': 'dp'
};

module.exports = State.extend({
  props: {
    version: ['number', true, 1],
    dataSource: ['string', true, 'app'],
    trackingId: ['string', true, ''],
    clientId: ['string', true, ''],
    appName: ['string', true, ''],
    appVersion: ['string', true, ''],
    appInstallerId: ['string', true, '']
  },
  session: {
    debug: {
      type: 'boolean',
      required: true,
      default: false  // set to false to actually send data to GA. @see https://developers.google.com/analytics/devguides/collection/protocol/v1/validating-hits
    },
    baseUrl: {
      type: 'string',
      required: true,
      default: 'https://www.google-analytics.com%s/collect?'
    }
  },
  derived: {
    url: {
      deps: ['baseUrl', 'debug'],
      fn: function() {
        return format(this.baseUrl, this.debug ? '/debug' : '');
      }
    }
  },
  send: function(options, callback) {
    // extend options with default options
    _.defaults(options || {}, this.serialize());
    options = this.shortify(options);
    var url = this.url + querystring.stringify(options);
    debug('sending hit to google analytics', options, url);
    xhr.post(url, callback);
  },
  shortify: function(obj) {
    return _.mapKeys(obj, function(value, key) {
      if (PROTOCOL_PARAMETER_MAP[key] === undefined) {
        throw new Error(format('key %s not found in protocol map.', key));
      }
      return PROTOCOL_PARAMETER_MAP[key];
    });
  }
});
