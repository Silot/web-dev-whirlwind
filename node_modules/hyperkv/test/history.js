var test = require('tape')
var hyperkv = require('../')
var memdb = require('memdb')
var hyperlog = require('hyperlog')
var sub = require('subleveldown')
var collect = require('collect-stream')
var toposort = require('toposort')

test('history', function (t) {
  t.plan(7)
  var db = memdb()
  var kv = hyperkv({
    log: hyperlog(sub(db, 'log'), { valueEncoding: 'json' }),
    db: sub(db, 'kv')
  })
  var docs = {
    A: { links: [], key: 'X', value: 100 },
    B: { links: ['A'], key: 'X', value: 201 },
    C: { links: ['A'], key: 'X', value: 202 },
    D: { links: ['B', 'C'], key: 'X', value: 300 }
  }
  var nodes = {}
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
    collect(kv.createHistoryStream('X'), function (err, rows) {
      t.ifError(err)
      t.deepEqual(sort(rows), sort([
        {
          key: 'X',
          link: nodes.A.key,
          value: 100,
          links: []
        },
        {
          key: 'X',
          link: nodes.B.key,
          value: 201,
          links: [ nodes.A.key ]
        },
        {
          key: 'X',
          link: nodes.C.key,
          value: 202,
          links: [ nodes.A.key ]
        },
        {
          key: 'X',
          link: nodes.D.key,
          value: 300,
          links: [ nodes.B.key, nodes.C.key ]
        }
      ]), 'expected history')
    })
    collect(kv.createHistoryStream('missing'), function (err) {
      t.true(err instanceof Error, 'emits error for missing id')
    })
  }
})

function sort (rows) {
  var edges = []
  var map = {}
  rows.forEach(function (row) {
    map[row.link] = row
    row.links.forEach(function (link) {
      edges.push([ row.link, link ])
    })
  })
  return toposort(edges).map(function (key) { return map[key] })
}
