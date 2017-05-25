var level = require('level')
var hyperlog = require('hyperlog')
var db = level('log.db')
var log = hyperlog(db, { valueEncoding: 'json' })
var timedb = level('time.db')
module.exports = log
log.dex = require('./timeview.js')({ db: timedb, log: log })
log.timedb = timedb
