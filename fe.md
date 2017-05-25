# modular frontend

* hyperx/bel/yo-yo - template strings into reactive DOM diffing
* choo - combines yo-yo with a tiny router and architecture

---
# diy redux architecture

* dom listeners emit events
* reducers handle state transitions and re-render

---
# yo-yo

tagged template string function

``` js
var html = require('yo-yo')
var x = 111
console.log(html`<div>
  <h1>HELLO</h1>
  <div>${x*5}</div>
</div>`)
```

---
# choo

``` js
var html = require('choo/html')
var app = require('choo')()
app.route('/', function (state, emit) {
  return html`<body>
    <h1>${state.times} TIMES</h1>
    <button onclick=${onclick}>CLICK ME</button>
  </body>`
  function onclick () { emit('increment') }
})
app.use(function (state, emitter) {
  state.times = 0
  emitter.on('increment', function () {
    state.times++
    emitter.emit('render')
  })
})
app.mount('body')
```

---
