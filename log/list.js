var log = require('./log.js')
var to = require('to2')

//log.createReadStream({ live: true }) // stream stays open
log.createReadStream()
  .pipe(to.obj(function (row, enc, next) {
    console.log(row)
    next()
  }))
