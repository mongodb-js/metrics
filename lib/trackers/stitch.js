var stitch = require('mongodb-stitch');
var State = require('ampersand-state');
var _ = require('lodash');
var singleton = require('singleton-js');
var debug = require('debug')('mongodb-js-metrics:trackers:stitch');
var redact = require('mongodb-redact');
var parseNamespaceString = require('mongodb-ns');

var os =
  typeof window === 'undefined'
    ? require('os')
    : require('electron').remote.require('os');

var StitchTracker = State.extend({
  id: 'stitch',
  props: {
    /**
     * Set through metrics.configure()
     */
    appId: ['string', true],
    users: {
      type: 'string',
      default: 'metrics.users'
    },
    events: {
      type: 'string',
      default: 'metrics.events'
    },
    /**
     * <set by `lib/resources/app.js`>
     */
    appName: ['string', false],
    appVersion: ['string', false],
    appStage: ['string', false],
    /**
     * </set by `lib/resources/app.js`>
     * <set by `lib/resources/user.js`>
     */
    userId: ['string', true],
    createdAt: ['date', true],
    name: {
      type: 'any',
      default: undefined,
      required: false,
      allowNull: true
    },
    email: {
      type: 'any',
      default: undefined,
      required: false,
      allowNull: true
    }
  },
  session: {
    _eventsDatabaseName: 'any',
    _eventsCollectionName: 'any',
    _usersDatabaseName: 'any',
    _usersCollectionName: 'any',
    _client: 'any',
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
  initialize: function() {
    this._identify = this._identify.bind(this);
    this._enabledConfiguredChanged = this._enabledConfiguredChanged.bind(this);

    this.on('change:enabledAndConfigured', this._enabledConfiguredChanged);
  },
  _enabledConfiguredChanged: function() {
    if (this.enabledAndConfigured) {
      this._setup();
      this._identify();
    }
  },
  _setup: function() {
    var eventsNS = parseNamespaceString(this.events);
    this._eventsDatabaseName = eventsNS.database;
    this._eventsCollectionName = eventsNS.collection;

    var usersNS = parseNamespaceString(this.users);
    this._usersDatabaseName = usersNS.database;
    this._usersCollectionName = usersNS.collection;

    this._client = new stitch.StitchClient(this.appId);
    debug('setup client', {
      _client: this._client,
      _eventsDatabaseName: this._eventsDatabaseName,
      _eventsCollectionName: this._eventsCollectionName,
      _usersDatabaseName: this._usersDatabaseName,
      _usersCollectionName: this._usersCollectionName
    });
  },
  _identify: function() {
    var obj = {
      user_id: this.userId,
      created_at: Math.floor(this.createdAt.getTime() / 1000),
      name: this.name,
      email: this.email,
      app_name: this.appName,
      app_version: this.appVersion,
      app_stage: this.appStage
    };

    if (typeof os !== 'undefined') {
      obj.host_arch = os.arch();
      obj.host_cpu_cores = os.cpus().length;
      obj.host_cpu_freq_mhz = _.get(os.cpus()[0], 'speed', 'unknown');
      obj.host_total_memory_gb = os.totalmem() / 1024 / 1024 / 1024;
      obj.host_free_memory_gb = os.freemem() / 1024 / 1024 / 1024;
    }

    if (!this.hasBooted) {
      this.hasBooted = true;
    }

    return this._getCollection(
      this._usersDatabaseName,
      this._usersCollectionName,
      function(err, collection) {
        if (err) {
          return console.error(err);
        }

        debug('sending identify', redact(obj));
        return collection.updateOne(
          { user_id: this.userId },
          { $set: obj },
          { upsert: true }
        );
      }.bind(this)
    );
  },
  _getCollection: function(db, name, fn) {
    return this._client.login().then(
      function() {
        var collection = this._client
          .service('mongodb', 'mongodb-atlas')
          .db(db)
          .collection(name);
        return fn(null, collection);
      }.bind(this)
    );
  },
  /**
   * Sends an event with `eventName` and attached metadata
   * @param  {String} eventName    The event name to send, this is
   *                               usually `Resource action`, e.g. `App launched`.
   * @param  {Object} metadata     Metadata information with up to 5 keys
   */
  send: function(eventName, metadata) {
    var resource = eventName.split(' ')[0];
    var action = eventName.split(' ')[1];
    var payload = Object.assign({
      resource: resource,
      action: action,
      userId: this.userId,
      timestamp: Date.now(),
      metadata: redact(metadata)
    });

    return this._getCollection(
      this._eventsDatabaseName,
      this._eventsCollectionName,
      function(err, collection) {
        if (err) {
          return console.error(err);
        }
        payload.stitchUserId = this._client.authedId();
        debug('sending event `%s`', eventName, payload);
        return collection.insertOne(payload);
      }.bind(this)
    );
  }
});

module.exports = singleton(StitchTracker);
