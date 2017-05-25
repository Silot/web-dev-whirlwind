var test = require('tape')
var hyperkv = require('../')
var memdb = require('memdb')
var hyperlog = require('hyperlog')

test('batch', function (t) {
  t.plan(5)
  var kv = hyperkv({
    log: hyperlog(memdb(), { valueEncoding: 'json' }),
    db: memdb()
  })
  var pending = 3
  kv.batch([
    { type: 'put', key: 'A', value: 123 },
    { type: 'put', key: 'B', value: 456 }
  ], onbatch)

  kv.batch([
    { type: 'put', key: 'A', value: 555 }
  ], onbatch)

  kv.batch([
    { type: 'put', key: 'A', value: 444 }
  ], onbatch)

  function onbatch (err, nodes) {
    t.error(err)
    if (--pending !== 0) return
    kv.get('A', function (err, values) {
      t.error(err)
      var expected = {}
      expected[nodes[0].key] = { value: 444 }
      t.deepEqual(values, expected, 'last value for A')
    })
  }
})
