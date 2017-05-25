#!/usr/bin/env node
var path = require('path')
var fs = require('fs')

var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  default: {
    d: path.join(process.env.HOME || process.env.USERPROFILE
      || process.getcwd(), '.hyperkv')
  },
  alias: { h: 'help' },
  boolean: [ 'json' ]
})
if (argv.help) return usage(0)

var sub = require('subleveldown')

var mkdirp = require('mkdirp')
mkdirp.sync(argv.d)

var level = require('level')
var ldb = level(path.join(argv.d, 'log'))
var idb = level(path.join(argv.d, 'index'))

var hyperkv = require('../')
var hyperlog = require('hyperlog')
var log = hyperlog(ldb, { valueEncoding: 'json' })
var kv = hyperkv({ db: idb, log: log })

if (argv._[0] === 'put' && argv._.length >= 2) {
  var key = argv._[1]
  var value = JSON.parse(argv._[2])
  kv.put(key, value, function (err, node) {
    if (err) error(err)
    else console.log(node.key)
  })
} else if (argv._[0] === 'get') {
  var key = argv._[1]
  kv.get(key, function (err, values) {
    if (err) error(err)
    else console.log(JSON.stringify(values, null, 2))
  })
} else if (argv._[0] === 'list') {
  kv.createReadStream(argv).on('data', function (row) {
    console.log(JSON.stringify(row))
  })
} else if (/^(push|pull|sync)$/.test(argv._[0])) {
  var r = log.replicate({ mode: argv._[0] })
  process.stdin.pipe(r).pipe(process.stdout)
  r.on('end', function () { process.stdin.pause() })
} else usage(1)

function usage (code) {
  var r = fs.createReadStream(path.join(__dirname, 'usage.txt'))
  r.pipe(process.stdout)
  if (code) r.once('end', function () { process.exit(code) })
}

function error (err) {
  console.error(err.message)
  process.exit(1)
}
