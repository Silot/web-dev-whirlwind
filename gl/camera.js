// budo camera.js
var regl = require('regl')()
var camera = require('regl-camera')(regl, { distance: 30 })
var icosphere = require('icosphere')
var anormals = require('angle-normals')
var mesh = require('bunny')

var draw = regl({
  frag: `
    precision highp float;
    varying vec3 vpos;
    void main () {
      gl_FragColor = vec4(normalize(vpos)*0.5+0.5,1);
    }
  `,
  vert: `
    precision highp float;
    attribute vec3 position, normal;
    uniform mat4 projection, view;
    varying vec3 vpos;
    void main () {
      vpos = position - normal * 0.5;
      gl_Position = projection * view * vec4(vpos,1);
    }
  `,
  attributes: {
    position: mesh.positions,
    normal: anormals(mesh.cells, mesh.positions)
  },
  elements: mesh.cells
})
regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  camera(function () {
    draw()
  })
})
