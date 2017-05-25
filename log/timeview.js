var hindex = require('hyperlog-index')
var sub = require('subleveldown')

module.exports = function (opts) {
  var mdb = sub(opts.db, 'm', { valueEncoding: 'json' })
  return hindex({
    log: opts.log,
    db: sub(opts.db, 'i'),
    map: function (row, next) {
      mdb.put(row.value.time + '!' + row.key, {}, next)
    }
  })
}
