var test = require('tape')
var hyperkv = require('../')
var memdb = require('memdb')
var hyperlog = require('hyperlog')
var sub = require('subleveldown')

test('kv', function (t) {
  t.plan(9)
  var db = memdb()
  var kv = hyperkv({
    log: hyperlog(sub(db, 'log'), { valueEncoding: 'json' }),
    db: sub(db, 'kv')
  })
  kv.on('put', function (key, value, node) {
    t.equal(key, 'A')
    t.equal(value, 555)
    t.equal(node.seq, 1)
  })
  kv.on('update', function (key, value, node) {
    t.equal(key, 'A')
    t.equal(value, 555)
    t.equal(node.seq, 1)
  })
  kv.put('A', 555, function (err, node) {
    t.ifError(err)
    kv.get('A', function (err, values) {
      t.ifError(err)
      var expected = {}
      expected[node.key] = { value: 555 }
      t.deepEqual(values, expected, 'expected values for key A')
    })
  })
})
