var State = require('ampersand-state');
var callerId = require('caller-id');
var _ = require('lodash');

var debug = require('debug')('metrics:resources:base');

module.exports = State.extend({
  idAttribute: 'id',
  id: 'Base',
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
    if (this.googleAnalytics) {
      return this.googleAnalytics.send(options, callback);
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
      t: 'event',
      ec: this.id,
      ea: callerId.getData().methodName
    });
    debug('_send_ga_event, adding hitType, eventCategory, eventAction', options);
    this._send_ga(options, callback);
  }
});
