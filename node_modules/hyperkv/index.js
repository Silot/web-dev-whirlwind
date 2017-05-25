var sub = require('subleveldown')
var inherits = require('inherits')
var indexer = require('hyperlog-index')
var once = require('once')
var has = require('has')
var EventEmitter = require('events').EventEmitter
var readonly = require('read-only-stream')
var through = require('through2')
var Readable = require('readable-stream').Readable
var xtend = require('xtend')
var defined = require('defined')
var lock = require('mutexify')
var pump = require('pump')
var liveStream = require('level-live-stream')

module.exports = KV
inherits(KV, EventEmitter)

function KV (opts) {
  if (!(this instanceof KV)) return new KV(opts)
  var self = this
  EventEmitter.call(self)
  self.log = opts.log
  self.idb = sub(opts.db, 'i')
  self.xdb = sub(opts.db, 'x', { valueEncoding: 'json' })
  self.dex = indexer({
    log: self.log,
    db: self.idb,
    map: mapfn
  })
  self.lock = lock()

  function mapfn (row, next) {
    if (!row.value) return next()
    if (row.value.k !== undefined) {
      self.xdb.get(row.value.k, function (err, ops) {
        if (err && !notFound(err)) {
          self.emit('error', err)
          return next()
        }
        var doc = {}
        ;(ops || []).forEach(function (op) { doc[op.key] = op.type })
        row.links.forEach(function (link) { delete doc[link] })
        doc[row.key] = 'put'

        doc = Object.keys(doc).map(function (k) {
          return { key: k, type: doc[k] }
        })

        self.xdb.put(row.value.k, doc, function (err) {
          if (!err) self.emit('update', row.value.k, row.value.v, row)
          next(err)
        })
      })
    } else if (row.value.d !== undefined) {
      self.xdb.get(row.value.d, function (err, ops) {
        if (err && !notFound(err)) {
          self.emit('error', err)
          return next()
        }
        var doc = {}
        ;(ops || []).forEach(function (op) { doc[op.key] = op.type })
        row.links.forEach(function (link) { delete doc[link] })
        doc[row.key] = 'del'

        doc = Object.keys(doc).map(function (k) {
          return { key: k, type: doc[k] }
        })

        self.xdb.put(row.value.d, doc, onput)

        function onput (err) {
          if (!err) self.emit('remove', row.value.d, row)
          next(err)
        }
      })
    } else next()
  }
}

KV.prototype.put = function (key, value, opts, cb) {
  var self = this
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  if (!cb) cb = noop
  var doc = xtend(opts.fields || {}, { k: key, v: value })
  self._put(key, doc, opts, function (err, node) {
    cb(err, node)
    if (!err) self.emit('put', key, value, node)
  })
}

KV.prototype.del = function (key, opts, cb) {
  var self = this
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  if (!cb) cb = noop
  var doc = xtend(opts.fields || {}, { d: key })
  self._put(key, doc, opts, function (err, node) {
    cb(err, node)
    if (!err) self.emit('del', key, node)
  })
}

KV.prototype.get = function (key, opts, cb) {
  var self = this
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  cb = once(cb || noop)
  self.dex.ready(function () {
    self.xdb.get(key, function (err, data) {
      if (err && !notFound(err)) return cb(err)
      var docs = {}
      data = data || []
      data.forEach(function (datum) {
        docs[datum.key] = datum.type
      })
      var keys = Object.keys(docs)

      var values = {}
      var pending = keys.length + 1
      keys.forEach(function (key) {
        self.log.get(key, function (err, doc) {
          if (err) return cb(err)
          if (docs[key] === 'put') {
            values[key] = opts.fields ? doc.value : { value: doc.value.v }
          } else if (docs[key] === 'del') {
            values[key] = opts.fields ? doc.value : { deleted: true }
          }
          else return cb(new Error('unknown type'))
          if (--pending === 0) cb(null, values)
        })
      })
      if (--pending === 0) cb(null, values)
    })
  })
}

KV.prototype.createReadStream = function (opts) {
  var self = this
  if (!opts) opts = {}
  var xopts = {
    gt: opts.gt,
    gte: opts.gte,
    lt: opts.lt,
    lte: opts.lte
  }
  var stream = through.obj(write)
  self.dex.ready(function () {
    if (opts.live) {
      pump(liveStream(self.xdb, xopts), stream)
    } else pump(self.xdb.createReadStream(xopts), stream)
  })
  return readonly(stream)

  function write (row, enc, next) {
    var nrow = {
      key: row.key,
      links: row.value.map(function (v) { return v.key })
    }
    if (opts.values !== false) {
      self.get(row.key, opts, function (err, values) {
        if (err) return next(err)
        nrow.values = values
        stream.push(nrow)
        next()
      })
    } else {
      stream.push(nrow)
      next()
    }
  }
}

KV.prototype.createHistoryStream = function (key, opts) {
  var self = this
  if (!opts) opts = {}
  var stream = new Readable({ objectMode: true })
  var queue = null
  var reading = false
  stream._read = function () {
    if (!queue) {
      reading = true
      return
    }
    if (queue.length === 0) return stream.push(null)
    var q = queue.shift()
    if (q.key) q = q.key
    if (has(seen, q)) return stream._read()
    seen[q] = true
    self.log.get(q, onget)
  }

  var seen = {}
  self.dex.ready(function () {
    self.xdb.get(key, function (err, heads) {
      if (err) return stream.emit('error', err)
      queue = heads
      if (reading) stream._read()
    })
  })
  return stream

  function onget (err, doc) {
    if (err) return stream.emit('error', err)
    var rdoc = {
      key: doc.value ? doc.value.k : null,
      link: doc.key,
      value: doc.value ? doc.value.v : null,
      links: doc.links
    }
    if (doc.identity) rdoc.identity = doc.identity
    if (doc.signature) rdoc.signature = doc.signature
    ;(doc.links || []).forEach(function (link) {
      if (!has(seen, link)) queue.push(link)
    })
    stream.push(rdoc)
  }
}

KV.prototype._put = function (key, doc, opts, cb) {
  var self = this
  if (opts.links) {
    self.log.add(opts.links, doc, cb)
  } else {
    self.lock(function (release) {
      self.dex.ready(function () { onlock(release) })
    })
  }
  function onlock (release) {
    self.xdb.get(key, function (err, links) {
      if (err && !notFound(err)) return release(cb, err)
      self.log.add(links || [], doc, function (err, node) {
        release(cb, err, node)
      })
    })
  }
}

KV.prototype.batch = function (rows, opts, cb) {
  var self = this
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  cb = once(cb || noop)
  if (!opts) opts = {}

  var batch = []
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i]
    if (row.type === 'put') {
      batch.push({
        value: xtend(row.fields || {}, { k: row.key, v: row.value }),
        links: row.links
      })
    } else if (row.type === 'del') {
      batch.push({
        value: xtend(row.fields || {}, { d: row.key }),
        links: row.links
      })
    } else if (row.type) {
      return ntick(cb, 'batch type not recognized')
    } else if (!row.type) return ntick(cb, 'batch type not provided')
  }

  if (batch.every(hasLinks)) return self.log.batch(batch, cb)

  self.lock(function (release) {
    self.dex.ready(function () { onlock(release) })
  })

  function onlock (release) {
    release = once(release)
    var pending = batch.length + 1
    batch.forEach(function (row) {
      var key = defined(row.value.k, row.value.d)
      self.xdb.get(key, function (err, links) {
        if (err && !notFound(err)) return release(cb, err)
        row.links = links
        if (--pending === 0) commit()
      })
    })
    if (--pending === 0) commit()

    function commit () {
      self.log.batch(batch, function (err, nodes) {
        release(cb, err, nodes)
        if (!err) batch.forEach(eachRow)
        function eachRow (row, i) {
          if (row.k !== undefined) {
            self.emit('put', row.k, row.v, nodes[i])
          } else if (row.d !== undefined) {
            self.emit('del', row.d, nodes[i])
          }
        }
      })
    }
  }
  function hasLinks (row) { return row.links !== undefined }
}

function notFound (err) {
  return err && (err.notFound || /notfound/i.test(err.message))
}
function noop () {}
function ntick (cb, msg) {
  var err = new Error(msg)
  process.nextTick(function () { cb(err) })
}
