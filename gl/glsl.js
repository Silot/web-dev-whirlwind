// budo glsl.js -- -t glslify
var regl = require('regl')()
var camera = require('regl-camera')(regl, { distance: 30 })
var icosphere = require('icosphere')
var anormals = require('angle-normals')
var mesh = require('bunny')
var glsl = require('glslify')

var draw = regl({
  frag: glsl`
    precision highp float;
    #pragma glslify: snoise = require('glsl-noise/simplex/3d')
    #pragma glslify: hsl2rgb = require('glsl-hsl2rgb')
    varying vec3 vpos;
    void main () {
      float h = (snoise(vpos)*0.5+0.5)*0.3+0.6;
      vec3 color = hsl2rgb(h,1.0,0.5);
      gl_FragColor = vec4(color,1);
    }
  `,
  vert: glsl`
    precision highp float;
    #pragma glslify: snoise = require('glsl-noise/simplex/3d')
    attribute vec3 position, normal;
    uniform mat4 projection, view;
    varying vec3 vpos;
    void main () {
      vpos = position - normal * snoise(position) * 0.5;
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
