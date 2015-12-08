var querystring = require('querystring');
var State = require('ampersand-state');
var xhr = /* (typeof window !== 'undefined') ? require('xhr') : */ require('request');
var _ = require('lodash');
var format = require('util').format;

var debug = require('debug')('metrics:trackers:ga');

module.exports = State.extend({
  props: {
    v: ['number', true, 1],        // api version
    ds: ['string', true, 'app'],   // data source
    tid: ['string', true, ''],     // tracking id
    // cid: ['string', true, ''],  // client id
    an: ['string', true, ''],      // application name
    av: ['string', true, ''],      // application version
    aiid: ['string', true, '']     // application installer id
  },
  session: {
    debug: {
      type: 'boolean',
      required: true,
      default: true  // set to false to actually send data to GA. @see https://developers.google.com/analytics/devguides/collection/protocol/v1/validating-hits
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
    options.cid = '121d91ad-15a4-47eb-977d-f279492932f0';
    var url = this.url + querystring.stringify(options);
    debug('options', options);
    debug('url', url);
    xhr.post(url, callback);
  }
});
