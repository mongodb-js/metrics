# Event Catalog

An event consists of

1. resource
2. action
3. metadata

These attributes form a transparent abstraction and map differently to
trackers like Intercom or Google Analytics.

This document lists useful events for Compass, grouped by their resources
and actions, and specifies the metadata that should be sent for the event.

## All Events

Send the following meta-data with every event:

- `user_id` {String}       (created at first `app_launch` event)
- `session_id` {String}    (created at every `app_launch` event)
- `date` {Timestamp}

## General Events

### `App` Resource

#### `launch` Action
- `app_version` {String}
- `app_platform` {String}
- `os_version` {String}

#### `quit` Action
- `normal` {Boolean}

#### `upgrade` Action
- `last_known_version` {String}
- `current_version` {String}

#### `downgrade` Action
- `last_known_version` {String}
- `current_version` {String}

#### `pageload` Action
- `url` {String}

### `User` Resource

#### `created` Action

#### `login` Action

### `Error` Resource

#### `uncaught` Action
- `exception` {String}
- `stack_trace` {String}
- `fatal` {Boolean}


### `Window` Resource

#### `opened` Action
- `window_name` {String}

#### `closed` Action
- `window_name` {String}

### `Dev Console` Resource

#### `opened` Action
- `window_name` {String}

#### `closed` Action
- `window_name` {String}


## Connect Window Events

### `Clipboard` Resource

#### `detected` Action

#### `used` Action


### `Connection` Resource

#### `failed` Action
- `id` {String}
- `reason` {String}

#### `succeeded` Action
- `id` {String}
- `authentication` {String} (one of "NONE", "MONGODB", "KERBEROS", "LDAP", "X509")
- `ssl` {String} (one of "NONE", "UNVALIDATED", "SERVER", "ALL")
- `mongodb_version` {String}
- `mongodb_topology` {String}
- `enterprise_module` {Boolean}
- `connection_type` {String}  (one of "new", "favorite", "recent", "clipboard")
- `num_dbs` {Number}
- `num_collections` {Number}

## Help Window Events

### `Help` Resource

#### `loaded` Action
- `entry_id` {String}

## Schema Window Events

### `Collection` Resource

#### `sampled` Action
- `duration` {Number}
- `document_count` {Number}
- `total_size` {Number}
- `average_document_size` {Number}
- `num_indexes` {Number}
- `sample_size` {Number}
- `errored_document_count` {Number}
- `total_sample_time` {Number}
- `total_analysis_time` {Number}


### `Query` Resource

#### `refined`
- `num_clauses` {Number}
- `max_depth` {Number}
- `reset` {Boolean}

### `Sharing` Resource

#### `schema` Action
- `size` {Number}

### `Documents` Resource

#### `opened` Action

#### `closed` Action

### `Tour` Resource

#### `opened` Action
- `first_run` {Boolean}

#### `closed` Action

### `Preferences` Resource

#### `opened` Action
- `first_run` {Boolean}

#### `closed` Action

### `Feedback` Resource

##### `opened` Action

##### `sent` Action

##### `received` Action

##### `closed` Action
