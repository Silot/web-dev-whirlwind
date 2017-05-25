var html = require('yo-yo')
var wsock = require('websocket-stream')
var stream = wsock('ws://' + location.host)
var to = require('to2')
var split = require('split2')
stream.pipe(split()).pipe(to(function (buf, enc, next) {
  state.messages.push(buf.toString())
  update()
  next()
}))

var state = { messages: [] }
var root = document.body.appendChild(document.createElement('div'))
update()

function update () {
  html.update(root, html`<div>
    <form onsubmit=${onsubmit}>
      <input type="text" name="msg">
      <button type="submit">post</button>
    </form>
    ${state.messages.map(function (msg) {
      return html`<div>${msg}</div>`
    })}
  </div>`)
  function onsubmit (ev) {
    ev.preventDefault()
    var msg = this.elements.msg.value
    stream.write(msg + '\n')
    this.reset()
  }
}
