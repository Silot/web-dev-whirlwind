var test = require('tape')
var hyperkv = require('../')
var memdb = require('memdb')
var hyperlog = require('hyperlog')
var sub = require('subleveldown')
var eos = require('end-of-stream')

// Sync two hyperlogs together.
function sync (a, b, done) {
  var r1 = a.replicate()
  var r2 = b.replicate()
  r1.pipe(r2).pipe(r1)
  var pending = 2

  eos(r1, onend)
  eos(r2, onend)

  function onend (err) {
    if (err) return done(err)
    if (--pending === 0) {
      done(err)
    }
  }
}

test('del', function (t) {
  t.plan(12)
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
      remove()
    })
  })
  function remove () {
    kv.del('A', function (err, node) {
      t.ifError(err)
      var delKey = node.key
      kv.get('A', function (err, values) {
        t.ifError(err)
        var expected = {}
        expected[delKey] = { deleted: true }
        t.deepEqual(values, expected)
      })
    })
  }
})

test('return delete and put when there is ambiguity', function (t) {
  t.plan(10)

  var db1 = memdb()
  var db2 = memdb()
  var kv1 = hyperkv({
    log: hyperlog(sub(db1, 'log'), { valueEncoding: 'json' }),
    db: sub(db1, 'kv')
  })
  var kv2 = hyperkv({
    log: hyperlog(sub(db2, 'log'), { valueEncoding: 'json' }),
    db: sub(db2, 'kv')
  })

  var expectedPut
  var expectedDel

  kv1.put('foo', 'bar', function (err, node) {
    t.ifError(err)
    kv2.put('foo', 'bar', function (err, node) {
      t.ifError(err)
      kv1.del('foo', function (err, node) {
        t.ifError(err)
        expectedDel = node.key
        kv2.put('foo', 'box', function (err, node) {
          t.ifError(err)
          expectedPut = node.key
          sync(kv1.log, kv2.log, function (err) {
            t.ifError(err)
            kv1.get('foo', function (err, values) {
              t.ifError(err)
              t.equal(Object.keys(values).length, 2)
              t.notEqual(expectedPut, expectedDel)
              t.deepEqual(values[expectedPut], { value: 'box' })
              t.deepEqual(values[expectedDel], { deleted: true })
            })
          })
        })
      })
    })
  })
})
