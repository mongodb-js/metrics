var State = require('ampersand-state');
var _ = require('lodash');
var singleton = require('singleton-js');
var format = require('util').format;

var debug = require('debug')('mongodb-js-metrics:trackers:intercom');

var IntercomTracker = State.extend({
  id: 'intercom',
  props: {
    appId: ['string', true, ''],    // set through metrics.configure()
    appName: ['string', false],     // set by the App resource
    appVersion: ['string', false],  // set by the App resource
    appStage: ['string', false],    // set by the App resource
    userId: ['string', true, ''],   // set by the User resource
    createdAt: ['date', true],      // set by the User resource
    widget: {
      type: 'object',
      required: true,
      default: function() {
        return {
          activator: '#IntercomDefaultWidget'
        };
      }
    }
  },
  session: {
    intercomHandle: 'any',
    enabled: ['boolean', true, false],
    hasBooted: ['boolean', true, false]
  },
  derived: {
    enabledAndConfigured: {
      deps: ['enabled', 'appId', 'userId'],
      fn: function() {
        return this.enabled && this.appId !== '' && this.userId !== '';
      }
    }
  },
  /**
   * Inject the intercom script into the page
   */
  _setup: function() {
    var self = this;
    if (typeof window === 'undefined') {
      return;
    }
    var w = window;
    var ic = w.Intercom;
    if (typeof ic === 'function') {
      ic('reattach_activator');
      ic('update', this.serialize());
    } else {
      var d = document;
      var i = function() {
        i.c(arguments);
      };
      i.q = [];
      i.c = function(args) {
        i.q.push(args);
      };
      w.Intercom = i;

      /* eslint no-inner-declarations: 0 */
      function l() {
        var s = d.createElement('script');
        s.type = 'text/javascript';
        s.id = 'intercom-script';
        s.async = true;
        s.src = format('https://widget.intercom.io/widget/%s', self.appId);
        var x = d.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
      }
      if (d.readyState === 'complete') {
        // call directly, window already loaded
        l();
      } else if (w.attachEvent) {
        w.attachEvent('onload', l);
      } else {
        w.addEventListener('load', l, false);
      }
    }
  },
  /**
   * Helper method to remove a DOM node based on its id
   * @param  {String} id    DOM id
   */
  _removeDOMNode: function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.parentNode.removeChild(el);
    }
  },
  /**
   * Call this to remove the intercom panel.
   */
  _teardown: function() {
    if (typeof window === 'undefined') {
      return;
    }
    // remove the intercom widget
    if (window.Intercom) {
      /* eslint new-cap: 0 */
      window.Intercom('hide');
      window.Intercom('shutdown');
    }
    this._removeDOMNode('intercom-container');
    this._removeDOMNode('intercom-script');
    this.hasBooted = false;
  },
  initialize: function() {
    this._updateIntercom = this._updateIntercom.bind(this);
    this._enabledConfiguredChanged = this._enabledConfiguredChanged.bind(this);

    this.on('change:enabledAndConfigured', this._enabledConfiguredChanged);
  },
  _enabledConfiguredChanged: function() {
    if (this.enabledAndConfigured) {
      this._setup();
      this._updateIntercom();
    } else {
      this._teardown();
    }
  },
  /**
   * Configure/Update intercom settings. First call will use the `boot` action
   * subsequent calls the `update` on the Intercom object.
   */
  _updateIntercom: function() {
    if (typeof window !== 'undefined') {
      if (!this.hasBooted) {
        window.Intercom('boot', {
          app_id: this.appId,
          user_id: this.userId,
          created_at: this.createdAt,
          app_name: this.appName,
          app_version: this.appVersion,
          app_stage: this.appStage
        });
        this.hasBooted = true;
      } else {
        window.Intercom('update', {
          user_id: this.userId,
          created_at: this.createdAt,
          app_name: this.appName,
          app_version: this.appVersion,
          app_stage: this.appStage
        });
      }
    }
  },
  /**
   * Attach a callback function on Intercom's `onShow` event.
   * @param  {Function} fn    callback function
   */
  onShow: function(fn) {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.Intercom) {
      /* eslint new-cap: 0 */
      window.Intercom('onShow', fn);
    }
  },
  /**
   * Attach a callback function on Intercom's `onHide` event.
   * @param  {Function} fn    callback function
   */
  onHide: function(fn) {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.Intercom) {
      /* eslint new-cap: 0 */
      window.Intercom('onHide', fn);
    }
  },
  /**
   * Sends an Intercom event with `eventName` and attached metadata
   * @param  {String} eventName    The event name to send to Intercom, this is
   *                               usually `Resource action`, e.g. `App launched`.
   * @param  {Object} metadata     Metadata information with up to 5 keys
   */
  send: function(eventName, metadata) {
    if (!this.enabled) {
      return;
    }
    if (_.keys(metadata).length > 5) {
      debug('Warning: meta-data contains more than 5 keys but Intercom only '
        + 'supports 5 keys max.');
    }
    debug('sending event `%s` to intercom with metadata %j', eventName, metadata);
    if (typeof window !== 'undefined') {
      window.Intercom('trackEvent', eventName, metadata);
    }
  }
});

module.exports = singleton(IntercomTracker);
