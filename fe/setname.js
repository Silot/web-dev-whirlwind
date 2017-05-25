var html = require('yo-yo')
var root = document.createElement('div')
document.body.appendChild(root)
var state = { n: 0, name: '' }

var EventEmitter = require('events').EventEmitter
var emitter = new EventEmitter
emitter.on('set-name', function (name) {
  state.name = name
  emitter.emit('render')
})
emitter.on('increment', function () {
  state.n++
  emitter.emit('render')
})

emitter.on('render', update)
update()
function update () {
  html.update(root, html`<div>
    <h1>hi ${state.name}! ${state.n}</h1>
    <button onclick=${onclick}>CLICK ME</button>
    <form onsubmit=${onsubmit}>
      <input type="text" name="nym">
      <button type="submit">SET NAME</button>
    </form>
  </div>`)
  function onsubmit (ev) {
    ev.preventDefault()
    var name = this.elements.nym.value
    emitter.emit('set-name', name)
  }
  function onclick (ev) {
    emitter.emit('increment')
  }
}
