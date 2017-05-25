var test = require('tape')
var hyperkv = require('../')
var memdb = require('memdb')
var hyperlog = require('hyperlog')

test('del forks', function (t) {
  t.plan(19)
  var kv0 = hyperkv({
    log: hyperlog(memdb(), { valueEncoding: 'json' }),
    db: memdb()
  })
  var kv1 = hyperkv({
    log: hyperlog(memdb(), { valueEncoding: 'json' }),
    db: memdb()
  })
  var docs = {
    A: { links: [], key: 'X', value: 555 },
    B: { links: ['A'], key: 'X', value: 333 },
    C: { links: [], key: 'Z', value: 1000 },
    D: { links: ['B'], key: 'X', value: 222 },
    E: { links: ['B'], key: 'X', value: 400 },
    F: { links: [], key: 'Y', value: 999 },
    G: { links: ['C'], key: 'Z', value: 2000 },
    H: { links: ['C'], key: 'Z', value: 2500 },
    I: { links: ['G', 'H'], key: 'Z', value: 3000 }
  }

  var nodes = []
  var xput
  var xdel
  var keys = Object.keys(docs).sort()
  ;(function next () {
    if (keys.length === 0) return done()
    var key = keys.shift()
    var doc = docs[key]
    var opts = {
      links: doc.links.map(function (link) {
        return nodes[link].key
      })
    }
    kv0.put(doc.key, doc.value, opts, function (err, node) {
      t.ifError(err)
      nodes[key] = node
      next()
    })
  })()

  function done () {
    var pending = 3
    kv0.get('X', function (err, values) {
      t.ifError(err)
      var expected = {}
      expected[nodes.E.key] = { value: 400 }
      expected[nodes.D.key] = { value: 222 }
      t.deepEqual(values, expected, 'X')
      if (--pending === 0) replicate0()
    })
    kv0.get('Y', function (err, values) {
      t.ifError(err)
      var expected = {}
      expected[nodes.F.key] = { value: 999 }
      t.deepEqual(values, expected, 'Y')
      if (--pending === 0) replicate0()
    })
    kv0.get('Z', function (err, values) {
      t.ifError(err)
      var expected = {}
      expected[nodes.I.key] = { value: 3000 }
      t.deepEqual(values, expected, 'Y')
      if (--pending === 0) replicate0()
    })
  }
  function replicate0 () {
    var r0 = kv0.log.replicate()
    var r1 = kv1.log.replicate()
    r0.pipe(r1).pipe(r0)
    r0.once('end', fork)
  }
  function fork () {
    kv0.del('X', function (err, node) {
      t.ifError(err)
      xdel = node
      kv1.put('X', 111, function (err, node) {
        t.ifError(err)
        xput = node
        replicate1()
      })
    })
  }
  function replicate1 () {
    var r0 = kv0.log.replicate()
    var r1 = kv1.log.replicate()
    r0.pipe(r1).pipe(r0)
    r0.once('end', check)
  }
  function check () {
    kv0.get('X', function (err, values) {
      t.ifError(err)
      var expected = {}
      expected[xput.key] = { value: 111 }
      expected[xdel.key] = { deleted: true }
      t.deepEqual(values, expected)
    })
  }
})
