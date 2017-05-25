"use strict"

var dup = require("dup")

function p(x,y,nx) { return x + (nx+1)*y; };

//Creates a grid mesh
function gridMesh(nx, ny, origin, dx, dy) {
  //Unpack default arguments
  origin = origin || [0,0]
  if(!dx || dx.length < origin.length) {
    dx = dup(origin.length)
    if(origin.length > 0) {
      dx[0] = 1
    }
  }
  if(!dy || dy.length < origin.length) {
    dy = dup(origin.length)
    if(origin.length > 1) {
      dy[1] = 1
    }
  }
  //Initialize cells
  var cells = []
    , positions = dup([(nx+1) * (ny+1), origin.length])
    , i, j, k, q, d = origin.length
  for(j=0; j<ny; ++j) {
    for(i=0; i<nx; ++i) {
      cells.push([ p(i,j,nx), p(i+1, j,nx), p(i, j+1,nx) ])
      cells.push([ p(i+1,j,nx), p(i+1,j+1,nx), p(i,j+1,nx) ])
    }
  }
  //Initialize positions
  for(j=0; j<=ny; ++j) {
    for(i=0; i<=nx; ++i) {
      q = positions[ p(i, j, nx) ]
      for(k=0; k<d; ++k) {
        q[k] = origin[k] + dx[k] * i + dy[k] * j
      }
    }
  }
  return {
    positions: positions,
    cells: cells
  }
}

module.exports = gridMesh