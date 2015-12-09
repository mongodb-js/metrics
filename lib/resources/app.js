var BaseResource = require('./base');
var _ = require('lodash');
var format = require('util').format;

// var debug = require('debug')('metrics:resources:app');

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
    // we're using appInstallerId (aiid) to track OS, like Atom does
    appInstallerId: {
      type: 'string',
      required: false
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
    var options = {
      screenName: screenName,
      documentPath: screenName    // screenName alone doesn't seem to be sufficient
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
      eventLabel: format('%s %s', this.appName, this.appVersion)
    };
    this._send_ga_event(options, callback);
  },
  /**
   * use when you want to track an application quit.
   *
   * GA: send a quit `event` hit. Additional information like app name and
   * version are sent as `el` (eventLabel), e.g. `mongodb-metrics 1.2.3`.
   * If the exit was normal, a value of 0 is sent, abnormal exit sends 1.
   *
   * @param  {Number} exitCode     exit code (0 for expected, normal exit)
   * @param  {Function} callback   optional callback
   */
  quit: function(exitCode, callback) {
    var options = {
      eventLabel: format('%s %s', this.appName, this.appVersion),
      eventValue: exitCode
    };
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
      eventLabel: format('%s %s -> %s', this.appName, previousVersion,
        this.appVersion)
    };
    this._send_ga_event(options, callback);
  }
});
