# hyperkv

p2p key/value store over a [hyperlog][1]
using a [multi-value register conflict strategy][2]

[1]: https://npmjs.com/package/hyperlog
[2]: https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type#Others

# example

## put

``` js
var hyperkv = require('hyperkv')
var hyperlog = require('hyperlog')
var sub = require('subleveldown')

var level = require('level')
var db = level('/tmp/kv.db')

var kv = hyperkv({
  log: hyperlog(sub(db, 'log'), { valueEncoding: 'json' }),
  db: sub(db, 'kv')
})

var key = process.argv[2]
var value = process.argv[3]

kv.put(key, value, function (err, node) {
  if (err) console.error(err)
	else console.log(node.key)
})
```

```
$ node example/put.js greeting hello
1f1b819cd3f7d379914037b473a855b7867f71c76126e379c91cbb31df2a859b
$ node example/put.js greeting 'beep boop'
eadb22a224313d5fb5b811e50915f16491e7714dd32b83503c1e1a1db2bd9e9b
```

## get

``` js
var hyperkv = require('hyperkv')
var hyperlog = require('hyperlog')
var sub = require('subleveldown')

var level = require('level')
var db = level('/tmp/kv.db')

var kv = hyperkv({
  log: hyperlog(sub(db, 'log'), { valueEncoding: 'json' }),
  db: sub(db, 'kv')
})

var key = process.argv[2]
kv.get(key, function (err, values) {
  if (err) console.error(err)
  else console.log(values)
})
```

```
$ node example/get.js greeting
{
  eadb22a224313d5fb5b811e50915f16491e7714dd32b83503c1e1a1db2bd9e9b: { value: 'beep boop' }
}
```

# api

``` js
var hyperkv = require('hyperkv')
```

## var kv = hyperkv(opts)

* `opts.log` - [hyperlog](https://npmjs.org/package/hyperlog) instance created
with `valueEncoding: 'json'`
* `opts.db` - [level](https://npmjs.com/package/level) instance

## kv.put(key, value, opts={}, cb)

Set `key` to a json `value`.

If `opts.links` is set, refer to previously set keys. Otherwise, the key will
refer to the current "head" key hashes.

If `opts.fields` is set, merge the object properties of `opts.fields` into the
raw document that is stored in the db alongside the `k` and `v` properties.

`cb(err, node)` fires from the underlying `log.add()` call.

## kv.get(key, opts={}, cb)

Get the current values for `key` as `cb(err, values)` where `values` maps
hyperlog hashes to set values.

Each value is an object of one of two forms:

- `{ value: ... }` - the value of the key
- `{ deleted: true }` - tombstone indicating the key has been deleted

It is possible to receive both types for the same key; it is left up to the api
consumer to decide how the data is best interpreted.

If there are no known values for `key`, `values` will be `{}`.

If `opts.fields` is true, include the raw document as each value instead of
individual values.

## kv.del(key, opts={}, cb)

Remove `key`.

If `opts.links` is set, refer to previously set keys. Otherwise, the key will
refer to the current "head" key hashes.

Note that keys are only removed with respect to `opts.links`, not globally and
that edits made in forks may cause deleted keys to "reappear". This is by
design.

`cb(err, node)` fires from the underlying `log.add()` call.

If `opts.fields` is set, merge the object properties of `opts.fields` into the
raw document that is stored in the db alongside the `d` property.

## kv.batch(rows, opts={}, cb)

Insert an array of documents `rows` atomically into the database.

Each `row` object in the `rows` array should have:

* `row.type` - required, one of: `'put'` or `'del'`
* `row.key` - required key string
* `row.value` - value, required when `row.type === 'put'`
* `row.links` - optional array of ancestor hashes, defaults to most recent heads
for the key

`cb(err, nodes)` fires from the underlying `log.batch()` call.

## var stream = kv.createReadStream(opts)

Create a readable object mode `stream` for each key/values in the store.

Each object `row` has:

* `row.key` - the key set with `.put()`
* `row.links` - array of hashes that are the current holders for the key
* `row.values` - object mapping hashes to values

Optionally:

* `opts.values` - set to `false` to turn off setting `row.values`, which
requires an extra lookup in the implementation
* `opts.fields` - when true, include the full document instead of the value
* `opts.live` - when true, keep the stream open and add additional matching
results as they are written to the db

## var stream = kv.createHistoryStream(key, opts={})

Create a readable object mode `stream` with the history of `key`.

Each `row` object in the output stream has:

* `row.key` - the key (as in key/value) of the document
* `row.link` - the hyperlog key (version hash) of the current document
* `row.links` - array of version hashes that are ancestors of this document
* `row.value` - value associated with this document

You might want to topologically sort the output before displaying it.
Otherwise, documents will always appear before their ancestors, but documents in
a fork have an undefined ordering.

## kv.on('put', function (key, value, node) {})

Whenever a node is put, this event fires.

## kv.on('update', function (key, value, node) {})

Whenever the indexes update through a put or replication, this event fires with
the underlying `node` object from the hyperlog.

# usage

This package ships with a `hyperkv` command.

```
hyperkv put KEY VALUE {OPTIONS}

  Insert a json VALUE at KEY.

	--links  Comma-separated list of ancestor hashes

hyperkv get KEY

  Print a json object for the values at KEY,
	mapping hashes to values.

hyperkv list

  Print a list of keys and values as json, one per line.

hyperkv push
hyperkv pull
hyperkv sync

  Replicate with another hyperkv using stdin and stdout.

```

# install

```
npm install hyperkv
npm install -g hyperkv
```

# license

BSD
