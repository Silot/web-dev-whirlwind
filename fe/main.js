var html = require('yo-yo')
var root = document.createElement('div')
document.body.appendChild(root)
var EventEmitter = require('events').EventEmitter
var emitter = new EventEmitter

var state = { n: 0, name: ''}
update()
function update(){
html.update(root, html`<div>
	<h1>hi ${n}</h1>
	<button onclick=${onclick}>Click me</button>
	<form onsubmit=${onclick}>
		<input type="text" name="nym">
		<button type="submit">Set Name</button>
</div>`)
}
function onclick (ev) {
	
	n++
	update()
}


