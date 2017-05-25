# regl

functional wrapper around the webgl api

---
# regl

flat 2d teapot with no aspect ratio:

``` js
var regl = require('regl')()
var mesh = require('teapot')
var draw = regl({
  frag: `
    precision highp float;
    void main () {
      gl_FragColor = vec4(0,1,0,1);
    }
  `,
  vert: `
    precision highp float;
    attribute vec3 position;
    void main () {
      gl_Position = vec4(position.xy*0.05,0,1);
    }
  `,
  attributes: {
    position: mesh.positions
  },
  elements: mesh.cells
})
draw()
```

---
# rendering pipeline

geometry -> vertex shader -> fragment shader -> screen

* vertex shader: convert geometry to screen coordinates
* fragment shader: what color each pixel should be

---
# geometry: simplicial complex

* positions - array of arrays of coordinates
* cells - array of arrays of position indexes (3-element arrays for triangles)

---
# glsl

subset of C

* types
* semicolons
* no closures
* must always put `.0` if a float is used

---
# glsl types

* int (use sparingly)
* float
* vec2(x,y), vec3(x,y,z), vec4(x,y,z,w)
* mat2, mat3, mat4
* sampler2D - 2d texture
* samplerCube - cube map texture

---
# swizzle

```
vec4 v = vec4(1,2,3,4);
v.zx // same as vec2(3,1)
```

---
# glsl built-in functions

http://www.shaderific.com/glsl-functions/ (incomplete but a good ref)

---
# kinds of variables

* attributes - defined per-vertex
* uniforms - the same everywhere, vertex and fragment
* varying - set in the vertex shader, interpolated in the fragment shader

---
# vertex shader

```
precision highp float;
void main () {
  gl_Position = vec4(...);
}
```

* `gl_Position.x` - screen x coordinate from -1 to 1
* `gl_Position.y` - screen y coordinate from -1 to 1
* `gl_Position.z` - depth buffer

---
# fragment shader

```
precision highp float;
void main () {
  gl_FragColor = vec4(0,1,0,1); // green
}
```

---
# webgl packages

* regl - wrap webgl in something nice
* regl-camera - handy setup for mouse control, projection and view mat4s
* resl - load textures over xhr
* glslify - browserify transform to load glsl modules 
* glsl-hsl2rgb, glsl-noise, etc - glsl modules
* angle-normals - compute normals of a simplicial complex
* gl-mat4 - manipulate matrices in javascript
* gl-vec3 - manipulate vectors in javascript
* gl-quat - manipulate quaternions in javascript
* bunny, teapot - placeholder geometry
* icosphere, cube-mesh, conway-hart - geometry building blocks

---
# glslify

shader functions as npm packages

```
  frag: glsl`
    precision highp float;
    #pragma glslify: hsl = require('glsl-hsl2rgb')
    uniform float time;
    void main () {
      gl_FragColor = vec4(hsl(time,1.0,0.5),1);
    }
  `
```

---
# glslify: some packages

* glsl-hsl2rgb
* glsl-noise
* glsl-specular-beckmann
* glsl-diffuse-lambert
* glsl-dither

---
# webaudio

synthesize a waveform by returning a value between -1 and 1

```
var baudio = require('webaudio')
var b = baudio(function (t) {
  // this function gets called 44000 to 48000 times per second
  return Math.sin(2*Math.PI*440*t) // 440Hz
})
b.play()
```

* in the browser: `require('webaudio')`
* in node: `require('baudio')`

---
# webaudio

browser dev studio:

* http://studio.substack.net/-/recent
* http://studio.substack.net/waves_

or do `npm install -g code-music-studio` and run it locally

---
# webaudio

cut an mp3 or ogg file (must first install http://sox.sourceforge.net/)

```
$ npm i -g baudio
$ baudio song.js -o song.ogg -d 120 -f 2
```

cut a 120 second file song.ogg with 2 seconds of fade-out at the end

songs are the format used by studio.substack.net

