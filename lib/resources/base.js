var State = require('ampersand-state');
var callerId = require('caller-id');
var _ = require('lodash');

// var debug = require('debug')('metrics:resources:base');

module.exports = State.extend({
  namespace: 'Base',
  session: {
    intercom: 'any',
    googleAnalytics: 'any',
    bugsnag: 'any'
  },
  /**
   * send any GA hit. This is the only actual call to GA.
   *
   * @param {Object} options   options to send
   * @api private
   */
  _send_ga: function(options, callback) {
    if (callback) {
      options.hitCallback = callback;
    }
    if (this.googleAnalytics) {
      return this.googleAnalytics('send', options);
    }
    callback(new Error('Google Analytics not set up.'));
  },
  /**
   * prepare GA hit with a `event` hitType. Category and action
   * are set automatically if not provided.
   *
   * @param {Object} options  options can contain eventCategory, eventAction,
   *                          eventLabel, eventValue.
   * @api private
   */
  _send_ga_event: function(options, callback) {
    options = _.defaults(options || {}, {
      hitType: 'event',
      eventCategory: this.namespace,
      eventAction: callerId.getData().methodName
    });
    this._send_ga(options, callback);
  }
});
