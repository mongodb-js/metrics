var BaseResource = require('./base');
var debug = require('debug')('metrics:resources:app');

module.exports = BaseResource.extend({
  id: 'User',
  props: {
    userId: {
      type: 'string',
      required: true
    }
  },
  /**
   * ensure appName and appVersion are set on initializing the resource.
   */
  initialize: function() {
    BaseResource.prototype.initialize.apply(this, arguments);

    if (!this.userId) {
      throw new Error('userId is required but not set.');
    }
  },
  _tracker_ga_changed: function(model, tracker) {
    debug('tracker changed, adding userId');
    tracker.clientId = this.userId;
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
  logged_in: function(callback) {
    var options = {
      eventLabel: this.userId
    };
    this._send_ga_event(options, callback);
  }
});
