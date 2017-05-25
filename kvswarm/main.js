// budo main.js
var hyperlog = require('hyperlog')
var level = require('level-browserify')
var db = level('kv.db')
var log = hyperlog(db, { valueEncoding: 'json' })
var hyperkv = require('hyperkv')
var kv = hyperkv({ log: log, db: db })

var wswarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var sw = wswarm(signalhub('kvswarm',['https://signalhub.mafintosh.com/']))
sw.on('peer', function (peer, id) {
  console.log('PEER',id)
  peer.pipe(log.replicate({ live: true })).pipe(peer)
})

var html = require('yo-yo')
var root = document.body.appendChild(document.createElement('div'))

var state = { values: {} }
update()
function update () {
  html.update(root, html`<div>
    <form onsubmit=${save}>
      <div><input type="text" name="key" placeholder="key"></div>
      <div><textarea name="content"></textarea></div>
      <div><button type="submit">SAVE</button></div>
    </form>
    <hr>
    ${Object.keys(state.values).map(function (key) {
      return html`<div>
        <div>${key}</div>
        <pre>${state.values[key].value}</pre>
        <hr>
      </div>`
    })}
    <form onsubmit=${load}>
      <input type="text" name="key">
      <button>LOAD</button>
    </form>
  </div>`)
  function save (ev) {
    ev.preventDefault()
    var content = this.elements.content.value
    var key = this.elements.key.value
    kv.put(key, content, function (err, node) {
      if (err) console.error(err)
      else console.log(node)
    })
  }
  function load (ev) {
    ev.preventDefault()
    var key = this.elements.key.value
    kv.get(key, function (err, values) {
      if (err) return console.error(err)
      state.values = values
      update()
    })
  }
}
