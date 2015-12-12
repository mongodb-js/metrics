var BaseResource = require('./base');

// var debug = require('debug')('mongodb-js-metrics:resources:app');

module.exports = BaseResource.extend({
  id: 'User',
  props: {
    clientId: {
      type: 'string',
      required: true
    }
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
  login: function(callback) {
    var options = {
      eventLabel: this.clientId
    };
    this._send_ga_event(options, callback);
  }
});
