// budo circle.js
var regl = require('regl')()
var icosphere = require('icosphere')
var mesh = icosphere(3)

var draw = regl({
  frag: `
    precision highp float;
    void main () {
      gl_FragColor = vec4(0.5,0,1,1);
    }
  `,
  vert: `
    precision highp float;
    attribute vec3 position;
    void main () {
      gl_Position = vec4(position,1);
    }
  `,
  attributes: {
    position: mesh.positions
  },
  elements: mesh.cells
})
draw()
