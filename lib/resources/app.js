var BaseResource = require('./base');
var _ = require('lodash');
var format = require('util').format;

// var debug = require('debug')('metrics:resources:app');

module.exports = BaseResource.extend({
  namespace: 'App',
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
  },
  /**
   * prepares a GA hit with type `screenview`, including app name and version.
   * @api private
   */
  _send_ga_screenview: function(options, callback) {
    options = _.defaults(options || {}, {
      hitType: 'screenview',
      appName: this.appName,
      appVersion: this.appVersion
    });
    this.send_ga(options, callback);
  },
  /**
   * use when you want to track a page/screen view.
   *
   * GA: send a `screenview` hit with the given name. Additional information
   * like app name and version are attached automatically.
   *
   * @param  {String} screenName   screen name, e.g. 'Preference Pane'
   * @param  {function} callback   optional callback
   */
  viewed: function(screenName, callback) {
    var options = {
      screenName: screenName
    };
    this._send_ga_screenview(options, callback);
  },
  /**
   * use when you want to track an application launch.
   *
   * GA: send a launch `event` hit. Additional information like app name and
   * version are sent as `eventLabel`, e.g. `mongodb-metrics 1.2.3`.
   *
   * @param  {Function} callback   optional callback
   */
  launched: function(callback) {
    var options = {
      eventLabel: format('%s %s', this.appName, this.appVersion)
    };
    this._send_ga_event(options, callback);
  },
  /**
   * use when you want to track an application upgrade.
   *
   * GA: send an upgrade `event` hit. Additional information like app name and
   * versions are sent as `eventLabel`, e.g. `mongodb-metrics 1.2.3 -> 1.2.4`.
   *
   * @param  {String} previousVersion   the previous version before the upgrade
   * @param  {Function} callback        optional callback
   */
  upgraded: function(previousVersion, callback) {
    var options = {
      eventLabel: format('%s %s -> %s', this.appName, previousVersion,
        this.appVersion)
    };
    this._send_ga_event(options, callback);
  }
});
