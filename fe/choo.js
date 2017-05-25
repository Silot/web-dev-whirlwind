var app = require('choo')()
var html = require('choo/html')

app.route('/cool', function (state, emit) {
  return html`<body>
    <h1>COOOL</h1>
  </body>`
})
app.route('/', function (state, emit) {
  return html`<body>
    <h1>hi ${state.name}!!!!! ${state.n}</h1>
    <a href="/cool">CoOOOOOOllllllll</a>
    <button onclick=${onclick}>CLICK ME</button>
    <form onsubmit=${onsubmit}>
      <input type="text" name="nym">
      <button type="submit">SET NAME</button>
    </form>
  </body>`
  function onsubmit (ev) {
    ev.preventDefault()
    var name = this.elements.nym.value
    emit('set-name', name)
  }
  function onclick (ev) {
    emit('increment')
  }
})

app.use(function (state, emitter) {
  state.n = 0
  state.name = ''
  emitter.on('set-name', function (name) {
    state.name = name
    emitter.emit('render')
  })
  emitter.on('increment', function () {
    state.n++
    emitter.emit('render')
  })
})

app.mount('body')
