var html = require('yo-yo')
var root = document.createElement('div')
document.body.appendChild(root)
var n = 0
update()
function update () {
  html.update(root, html`<div>
    <h1>hi ${n}</h1>
    <button onclick=${onclick}>CLICK ME</button>
  </div>`)
}
function onclick (ev) {
  n++
  update()
}
