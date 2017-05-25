// budo animate.js -- -t glslify
var regl = require('regl')()
var camera = require('regl-camera')(regl, { distance: 30 })
var icosphere = require('icosphere')
var anormals = require('angle-normals')
var mesh = require('bunny')
var glsl = require('glslify')

var draw = regl({
  frag: glsl`
    precision highp float;
    #pragma glslify: snoise = require('glsl-noise/simplex/4d')
    #pragma glslify: hsl2rgb = require('glsl-hsl2rgb')
    varying vec3 vpos;
    uniform float time;
    void main () {
      float h = (snoise(vec4(vpos,time*0.2))*0.5+0.5)*0.3
        + mod(time*0.2,1.0);
      float l = pow(snoise(vec4(vpos,time*0.5))*0.5+0.5,2.0);
      vec3 color = hsl2rgb(h,1.0,l);
      gl_FragColor = vec4(color,1);
    }
  `,
  vert: glsl`
    precision highp float;
    #pragma glslify: snoise = require('glsl-noise/simplex/4d')
    attribute vec3 position, normal;
    uniform mat4 projection, view;
    uniform float time;
    varying vec3 vpos;
    void main () {
      vpos = position - normal
        * snoise(vec4(position,time*0.4)) * 0.5;
      gl_Position = projection * view * vec4(vpos,1);
    }
  `,
  attributes: {
    position: mesh.positions,
    normal: anormals(mesh.cells, mesh.positions)
  },
  elements: mesh.cells,
  uniforms: {
    time: regl.context('time')
  }
})
regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  camera(function () {
    draw()
  })
})
