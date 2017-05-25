// node wsclient.js ws://localhost:5000
var wsock = require('websocket-stream')
var stream = wsock(process.argv[2])
process.stdin.pipe(stream).pipe(process.stdout)
