var http = require('http')
var ecstatic = require('ecstatic')
var router = require('routes')()

router.addRoute('GET /', function (req, res, m) {
  res.end('whatever')
})

var st = ecstatic(__dirname + '/public')
var server = http.createServer(function (req, res) {
  var m = router.match(req.method + ' ' + req.url)
  if (m) m.fn(req,res,m)
  else if (req.url === '/' || req.url === '/cool') {
    req.url = '/'
    st(req,res)
  } else st(req,res)
})
server.listen(5000)
