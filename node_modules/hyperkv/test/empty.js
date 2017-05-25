var test = require('tape')
var hyperkv = require('../')
var memdb = require('memdb')
var hyperlog = require('hyperlog')
var sub = require('subleveldown')

test('empty get', function (t) {
  t.plan(2)
  var db = memdb()
  var kv = hyperkv({
    log: hyperlog(sub(db, 'log'), { valueEncoding: 'json' }),
    db: sub(db, 'kv')
  })
  kv.get('A', function (err, values) {
    t.ifError(err)
    t.deepEqual(values, {})
  })
})
