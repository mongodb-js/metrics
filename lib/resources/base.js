var State = require('ampersand-state');
var callerId = require('caller-id');
var TrackerCollection = require('../models/tracker-collection');
var _ = require('lodash');

var debug = require('debug')('metrics:resources:base');

module.exports = State.extend({
  idAttribute: 'id',
  id: 'Base',
  collections: {
    trackers: TrackerCollection
  },
  initialize: function() {
    this.on('change', this._update_trackers.bind(this));
    this.listenTo(this.trackers, 'add reset', this._update_trackers.bind(this));
  },
  /**
   * Either the trackers or the properties of this resource have changed. In
   * any case, pass own properties to the trackers.
   */
  _update_trackers: function() {
    debug('tracker or properties have changed, updating trackers.', this.serialize());
    this.trackers.each(function(tracker) {
      tracker.set(this.serialize());
    }.bind(this));
  },
  /**
   * send any GA hit. This is the only actual call to GA.
   *
   * @param {Object} options   options to send
   * @api private
   */
  _send_ga: function(options, callback) {
    var tracker = this.trackers.get('ga');
    if (tracker) {
      return tracker.send(options, callback);
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
      eventCategory: this.id,
      eventAction: callerId.getData().methodName
    });
    debug('_send_ga_event, adding hitType, eventCategory, eventAction', options);
    this._send_ga(options, callback);
  }
});
