var log = require('./log.js')
var to = require('to2')
var sub = require('subleveldown')
var mdb = sub(log.timedb, 'm', { valueEncoding: 'json' }) 

log.dex.ready(function () {
  mdb.createReadStream()
    .pipe(to.obj(function (row, enc, next) {
      var hash = row.key.split('!')[1]
      log.get(hash, function (err, node) {
        if (err) return next(err)
        console.log(node.value)
        next()
      })
    }))
})
