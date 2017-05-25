// budo main.js
var level = require('level-browserify')
//to run in node:
//var level = require('level')
var db = level('cool.db')

db.get('counter', function (err, value) {
  var nvalue = Number(value || 0) + 1
  db.put('counter', nvalue, function (err) {
    if (err) console.error(err)
    else console.log(nvalue)
  })
})
