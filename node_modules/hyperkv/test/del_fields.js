var test = require('tape')
var hyperkv = require('../')
var memdb = require('memdb')
var hyperlog = require('hyperlog')
var sub = require('subleveldown')
var collect = require('collect-stream')

test('del with fields', function (t) {
  t.plan(4)
  var db = memdb()
  var kv = hyperkv({
    log: hyperlog(sub(db, 'log'), { valueEncoding: 'json' }),
    db: sub(db, 'kv')
  })
  kv.put('A', 555, function (err, node) {
    t.error(err)
    kv.del('A', { links: [node.key], fields: { x: 555 } }, function (err, delnode) {
      t.error(err)
      kv.get('A', { fields: true }, function (err, docs) {
        t.error(err)
        t.deepEqual(docs[delnode.key], { x: 555, d: 'A' })
      })
    })
  })
})
