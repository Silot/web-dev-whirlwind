// budo grid.js -- -t glslify
var regl = require('regl')()
var camera = require('regl-camera')(regl,
  { distance: 30, phi: 0.1 })
var icosphere = require('icosphere')
var anormals = require('angle-normals')
var bunny = require('bunny')
var glsl = require('glslify')
var grid = require('grid-mesh')

var draw = {
  blob: createBlob(regl),
  floor: createFloor(regl)
}
regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  camera(function () {
    draw.blob()
    draw.floor()
  })
})
function createFloor (regl) {
  var mesh = grid(40,40)
  return regl({
    frag: glsl`
      precision highp float;
      #pragma glslify: snoise = require('glsl-noise/simplex/4d')
      #pragma glslify: hsl2rgb = require('glsl-hsl2rgb')
      #pragma glslify: dither = require('glsl-dither/8x8')
      uniform float time;
      varying vec3 vpos;
      void main () {
        float h = (snoise(vec4(vpos*0.3,time*0.2))*0.5+0.5)*0.3+0.6;
        float s = (snoise(vec4(vpos*0.1,time*0.1))*0.5+0.5)*0.4+0.6;
        float l = (pow(snoise(vec4(vpos,time*1.0))*0.5+0.5,8.0)+0.2)
          * sin(vpos.x);
        gl_FragColor = vec4(hsl2rgb(h,s,l),1);
      }
    `,
    vert: glsl`
      precision highp float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      uniform mat4 projection, view;
      attribute vec2 position;
      varying vec3 vpos;
      uniform float time;
      void main () {
        float y = snoise(vec3(position,time));
        vpos = (vec3(position.x,19.0,position.y)/40.0*2.0-1.0)*80.0
          + vec3(0,y,0);
        gl_Position = projection * view * vec4(vpos,1);
      }
    `,
    attributes: {
      position: mesh.positions
    },
    elements: mesh.cells,
    uniforms: {
      time: regl.context('time')
    }
  })
}
function createBlob (regl) {
  var mesh = bunny
  return regl({
    frag: glsl`
      precision highp float;
      #pragma glslify: snoise = require('glsl-noise/simplex/4d')
      #pragma glslify: hsl2rgb = require('glsl-hsl2rgb')
      varying vec3 vpos;
      uniform float time;
      void main () {
        float h = (snoise(vec4(vpos*0.2,time*0.2))*0.5+0.5)*0.3
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
}
