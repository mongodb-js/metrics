var State = require('ampersand-state');
var _ = require('lodash');
var singleton = require('singleton-js');
var format = require('util').format;

var debug = require('debug')('mongodb-js-metrics:trackers:intercom');

var IntercomTracker = State.extend({
  id: 'intercom',
  props: {
    appId: ['string', true, ''],
    userId: ['string', true, ''],
    createdAt: ['date', true],
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
    enabled: {
      type: 'boolean',
      required: true,
      default: false
    },
    hasBooted: ['boolean', true, false]
  },
  derived: {
    enabledAndConfigured: {
      deps: ['enabled', 'appId'],
      fn: function() {
        return this.enabled && this.appId !== '';
      }
    }
  },
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
  _removeDOMNode: function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.parentNode.removeChild(el);
    }
  },
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
  },
  initialize: function() {
    this._updateIntercom = this._updateIntercom.bind(this);
    this._enabledConfiguredChanged = this._enabledConfiguredChanged.bind(this);

    this.on('change:enabledAndConfigured', this._enabledConfiguredChanged);
  },
  _enabledConfiguredChanged: function() {
    if (this.enabledAndConfigured) {
      this._setup();
      this.on('change:userId', this._updateIntercom);
    } else {
      this.off('change:userId', this._updateIntercom);
      this._teardown();
    }
  },
  _updateIntercom: function() {
    if (typeof window !== 'undefined') {
      if (!this.hasBooted) {
        window.Intercom('boot', {
          app_id: this.appId,
          user_id: this.userId,
          created_at: this.createdAt
        });
        this.hasBooted = true;
      } else {
        window.Intercom('update', {
          user_id: this.userId,
          created_at: this.createdAt
        });
      }
    }
  },
  onShow: function(fn) {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.Intercom) {
      /* eslint new-cap: 0 */
      window.Intercom('onShow', fn);
    }
  },
  onHide: function(fn) {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.Intercom) {
      /* eslint new-cap: 0 */
      window.Intercom('onHide', fn);
    }
  },
  send: function(eventName, options) {
    if (!this.enabled) {
      return;
    }
    if (_.keys(options).length > 5) {
      debug('Warning: meta-data contains more than 5 keys but Intercom only '
        + 'supports 5 keys max.');
    }
    debug('sending event `%s` to intercom with metadata %j', eventName, options);
    if (typeof window !== 'undefined') {
      window.Intercom('trackEvent', eventName, options);
    }
  }
});

module.exports = singleton(IntercomTracker);
