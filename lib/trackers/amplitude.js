var State = require('ampersand-state');
var _ = require('lodash');
var singleton = require('singleton-js');
var redact = require('mongodb-redact');
var sentenceCase = require('../shared').sentenceCase;

var debug = require('debug')('mongodb-js-metrics:trackers:amplitude');


var AmplitudeTracker = State.extend({
  id: 'amplitude',
  // super properties (always sent to amplitude)
  props: {
    appName: ['string', false],            // set by App resource
    appVersion: ['string', false],         // set by App resource
    appStage: ['string', false],           // set by App resource
    appPlatform: ['string', false],        // set by App resource

    hostArchitecture: ['string', false],   // set by Host resource
    hostCPUCores: ['number', false],       // set by Host resource
    hostCPUFreqMHz: ['number', false],     // set by Host resource
    hostMemoryTotalGB: ['number', false],  // set by Host resource
    hostMemoryFreeGB: ['number', false]    // set by Host resource
  },
  // these are not sent to amplitude, just used internally
  session: {
    amplitudeHandler: ['object', false, null],
    enabled: ['boolean', true, false],
    apiToken: ['string', true, ''],      // set through metrics.configure()
    userId: ['string', true, ''],        // set by User resource
    createdAt: ['date', true]            // set by User resource
  },
  derived: {
    enabledAndConfigured: {
      deps: ['enabled', 'apiToken', 'userId'],
      fn: function() {
        return this.enabled && this.apiToken !== '' && this.userId !== '';
      }
    }
  },
  initialize: function() {
    this._configureAmplitude = this._configureAmplitude.bind(this);

    // when any of the properties change, re-configure amplitude handler
    this.on('change', this._configureAmplitude);
  },
  /**
   * configure the amplitude handler based on props and derived props. Called
   * whenever a property changes.
   */
  _configureAmplitude: function() {
    if (this.enabledAndConfigured) {
      if (typeof window === 'undefined') {
        return;
      }
      if (!this.amplitudeHandler) {
        this.amplitudeHandler = require('./amplitude-3.0.2-min.gz.js').getInstance();
        this.amplitudeHandler.init(this.apiToken);
      }
      var options = sentenceCase(_.omit(this.serialize({
        props: true,
        derived: false,
        session: false
      }), _.isEmpty));
      this.amplitudeHandler.setUserProperties(options);
      // for privacy purposes, overwrite the current url field, because it
      // contains information about the username and database/collection names
      this.amplitudeHandler.setUserProperties({
        $current_url: 'index.html',
        $created: this.createdAt
      });
      this.amplitudeHandler.setUserId(this.userId);
    }
  },
  /**
   * Method to manually send events to amplitude. Metadata is redacted before
   * sent to amplitude.
   *
   * @param {Error}  eventName  name of the event to send, e.g. "Schema sampled"
   * @param {Object} metadata   Metadata can be attached, @see https://rawgit.com/amplitude/Amplitude-Javascript/master/documentation/Amplitude.html#logEvent
   */
  send: function(eventName, metadata, callback) {
    if (!this.enabled) {
      if (callback) {
        return callback(null, false);
      }
      /* eslint consistent-return:0 */
      return;
    }
    debug('sending event `%s` to amplitude with metadata %j', eventName, metadata);
    this.amplitudeHandler.logEvent(eventName, redact(metadata), callback); 
  }
});

module.exports = singleton(AmplitudeTracker);
