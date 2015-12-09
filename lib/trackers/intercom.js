var State = require('ampersand-state');
var _ = require('lodash');
var singleton = require('singleton-js');

var debug = require('debug')('metrics:trackers:ga');

var IntercomTracker = State.extend({
  props: {
    app_id: ['string', true, ''],
    clientId: ['string', true, ''],
    created_at: ['date', true],
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
    intercomHandle: 'any'
  },
  derived: {
    user_id: {
      deps: ['clientId'],
      fn: function() {
        return this.clientId;
      }
    }
  },
  _setup: function() {
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
        s.src = 'https://widget.intercom.io/widget/p57suhg7';
        var x = d.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
      }
      if (w.attachEvent) {
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
    this.on('change:enabled', this._enabledChanged.bind(this));
    this.on('change:user_id', this._updateIntercom.bind(this));
  },
  /**
   * [function description]
   * @return {[type]} [description]
   */
  _enabledChanged: function() {
    if (this.enabled) {
      this._setup();
    } else {
      this._teardown();
    }
  },
  _updateIntercom: function() {
    if (typeof window !== 'undefined') {
      debug('window', window);
      window.Intercom('update', {
        user_id: this.user_id,
        created_at: this.created_at
      });
    }
  },
  send: function(eventName, options, callback) {
    if (!this.enabled) {
      return;
    }
    if (_.keys(options).length > 5) {
      debug('Warning: meta-data contains more than 5 keys but Intercom only '
        + 'supports 5 keys max.');
    }
    debug('sending event %s to intercom with metadata %j', eventName, options);
    if (typeof window !== 'undefined') {
      window.Intercom('trackEvent', eventName, options, callback);
    }
  }
});

module.exports = singleton(IntercomTracker);
