var BaseResource = require('./base');
var _ = require('lodash');
var format = require('util').format;

var debug = require('debug')('metrics:resources:app');

module.exports = BaseResource.extend({
  id: 'App',
  props: {
    appName: {
      type: 'string',
      require: true
    },
    appVersion: {
      type: 'string',
      required: true
    }
  },
  /**
   * ensure appName and appVersion are set on initializing the resource.
   */
  initialize: function() {
    if (!this.appName) {
      throw new Error('appName is required but not set.');
    }
    if (!this.appVersion) {
      throw new Error('appVersion is required but not set.');
    }
    this.on('change:googleAnalytics', this._tracker_ga_changed.bind(this));
  },
  _tracker_ga_changed: function(model, tracker) {
    debug('tracker changed, adding fields', arguments);
    tracker.an = this.appName;
    tracker.av = this.appVersion;
  },
  /**
   * prepares a GA hit with type `screenview`, including app name and version.
   * @api private
   */
  _send_ga_screenview: function(options, callback) {
    options = _.defaults(options || {}, {
      ht: 'screenview',
      an: this.appName,
      av: this.appVersion
    });
    this._send_ga(options, callback);
  },
  /**
   * use when you want to track a page, screen or feature view.
   *
   * GA: send a `screenview` hit with the given name. Additional information
   * like app name and version are attached automatically.
   *
   * @param  {String} screenName   screen name, e.g. 'Preference Pane'
   * @param  {function} callback   optional callback
   */
  viewed: function(screenName, callback) {
    var options = {
      cd: screenName,
      dp: screenName
    };
    this._send_ga_screenview(options, callback);
  },
  /**
   * use when you want to track an application launch.
   *
   * GA: send a launch `event` hit. Additional information like app name and
   * version are sent as `el` (eventLabel), e.g. `mongodb-metrics 1.2.3`.
   *
   * @param  {Function} callback   optional callback
   */
  launched: function(callback) {
    var options = {
      el: format('%s %s', this.appName, this.appVersion)
    };
    debug('launched, adding eventLabel', options);
    this._send_ga_event(options, callback);
  },
  /**
   * use when you want to track an application upgrade.
   *
   * GA: send an upgrade `event` hit. Additional information like app name and
   * versions are sent as `el` (eventLabel), e.g. `mongodb-metrics 1.2.3 -> 1.2.4`.
   *
   * @param  {String} previousVersion   the previous version before the upgrade
   * @param  {Function} callback        optional callback
   */
  upgraded: function(previousVersion, callback) {
    var options = {
      el: format('%s %s -> %s', this.appName, previousVersion,
        this.appVersion)
    };
    this._send_ga_event(options, callback);
  }
});
