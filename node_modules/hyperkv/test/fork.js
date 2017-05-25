var test = require('tape')
var hyperkv = require('../')
var memdb = require('memdb')
var hyperlog = require('hyperlog')
var sub = require('subleveldown')

test('forks', function (t) {
  t.plan(15)
  var db = memdb()
  var kv = hyperkv({
    log: hyperlog(sub(db, 'log'), { valueEncoding: 'json' }),
    db: sub(db, 'kv')
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
    kv.put(doc.key, doc.value, opts, function (err, node) {
      t.ifError(err)
      nodes[key] = node
      next()
    })
  })()

  function done () {
    kv.get('X', function (err, values) {
      t.ifError(err)
      var expected = {}
      expected[nodes.E.key] = { value: 400 }
      expected[nodes.D.key] = { value: 222 }
      t.deepEqual(values, expected, 'X')
    })
    kv.get('Y', function (err, values) {
      t.ifError(err)
      var expected = {}
      expected[nodes.F.key] = { value: 999 }
      t.deepEqual(values, expected, 'Y')
    })
    kv.get('Z', function (err, values) {
      t.ifError(err)
      var expected = {}
      expected[nodes.I.key] = { value: 3000 }
      t.deepEqual(values, expected, 'Y')
    })
  }
})
