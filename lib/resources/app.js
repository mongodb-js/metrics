var BaseResource = require('./base');
var _ = require('lodash');
var format = require('util').format;

// var debug = require('debug')('mongodb-js-metrics:resources:app');

module.exports = BaseResource.extend({
  id: 'App',
  props: {
    appName: {
      type: 'string',
      required: true
    },
    appVersion: {
      type: 'string',
      required: true
    },
    appPlatform: {
      type: 'string',
      required: false
    },
    appStage: {
      type: 'string',
      required: false
    },
    startTime: {
      type: 'date',
      required: true,
      default: function() {
        return new Date();
      }
    }
  },
  /**
   * ensure appName and appVersion are set on initializing the resource.
   */
  initialize: function() {
    BaseResource.prototype.initialize.apply(this, arguments);
  },
  /**
   * prepares a GA hit with type `screenview`, including app name and version.
   * @api private
   */
  _send_ga_screenview: function(options, callback) {
    options = _.defaults(options || {}, {
      hitType: 'screenview'
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
    var gaOptions = {
      screenName: screenName,
      documentPath: screenName    // screenName alone doesn't seem to be sufficient
    };
    this._send_ga_screenview(gaOptions, callback);
    var intercomOptions = {
      screen: screenName
    };
    this._send_intercom_event(intercomOptions);
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
    var gaOptions = {
      eventLabel: format('%s %s', this.appName, this.appVersion)
    };
    this._send_ga_event(gaOptions, callback);
    var intercomOptions = {
      name: this.appName,
      version: this.appVersion,
      platform: this.appPlatform
    };
    this._send_intercom_event(intercomOptions);
  },
  /**
   * use when you want to track an application quit.
   *
   * GA: send a quit `event` hit. Additional information like app name and
   * version are sent as `el` (eventLabel), e.g. `mongodb-metrics 1.2.3`.
   *
   * @param  {Number} exitCode     exit code (0 for expected, normal exit)
   * @param  {Function} callback   optional callback
   */
  quit: function(exitCode, callback) {
    var minutesSinceStart = Math.round((new Date() - this.startTime) / 1000 / 60);
    var gaOptions = {
      eventLabel: format('%s %s', this.appName, this.appVersion),
      eventValue: minutesSinceStart
    };
    this._send_ga_event(gaOptions, callback);
    var intercomOptions = {
      name: this.appName,
      version: this.appVersion,
      platform: this.appPlatform,
      exitCode: exitCode || 0,
      minutesSinceStart: minutesSinceStart
    };
    this._send_intercom_event(intercomOptions);
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
    var gaOptions = {
      eventLabel: format('%s %s -> %s', this.appName, previousVersion,
        this.appVersion)
    };
    this._send_ga_event(gaOptions, callback);
    var intercomOptions = {
      name: this.appName,
      previousVersion: previousVersion,
      version: this.appVersion,
      platform: this.appPlatform
    };
    this._send_intercom_event(intercomOptions);
  }
});
