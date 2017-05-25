var log = require('./log.js')
var doc = {
  time: new Date(process.argv[2]).toISOString(),
  msg: process.argv[3]
}
log.append(doc, function (err, node) {
  if (err) console.error(err)
  else console.log(node)
})
