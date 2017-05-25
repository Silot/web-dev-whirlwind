"use strict"

var nbp = require("n-body-pairs")
  , iota = require("iota-array")
  , generic_slice = require("generic-slice")

var NBP_CACHE = {}

//Fuses vertices in a mesh to remove cracks, sliver faces
function fuseVertices(cells, positions, tolerance) {

  //Check position length
  var n = positions.length
  if(n === 0) {
    return {
      positions: [],
      cells: cells,
      vertexRelabel: []
    }
  }
  
  //Default tolerance === 1e-6
  tolerance = tolerance || 1e-6
  
  //Compute dimension
  var d = positions[0].length
  
  //Pull out cached search data structure
  var search
  if(d in NBP_CACHE) {
    search = NBP_CACHE[d]
  } else {
    search = nbp(d, n)
    NBP_CACHE[d] = search
  }
  
  //Group adjacent vertices together
  var n_index     = iota(n)
  search(positions, tolerance, function(a, b) {
    n_index[a] = n_index[b] = Math.min(n_index[a], n_index[b])
  })
  
  //Do a pass over the vertices to build new vertex array and clean up indices
  var n_positions = []
    , weights     = []
  for(var i=0; i<n; ++i) {
    if(n_index[i] === i) {
      n_index[i] = n_positions.length
      n_positions.push(generic_slice(positions[i]))
      weights.push(1.0)
    } else {
      var parent_index = n_index[i]
        , n_label = n_index[parent_index]
        , p = positions[i]
        , q = n_positions[n_label]
      n_index[i] = n_label
      for(var j=0; j<d; ++j) {
        q[j] += p[j]
      }
      weights[parent_index] += 1.0
    }
  }
  for(var i=0, nn=n_positions.length; i<nn; ++i) {
    var recip = 1.0 / weights[i]
      , q = n_positions[i]
    for(var j=0; j<d; ++j) {
      q[j] *= recip
    }
  }
  
  //Fix up faces
  var n_cells = []
i_loop:
  for(var i=0, nc=cells.length; i<nc; ++i) {
    var face = cells[i].slice(0)
    for(var j=0, fl=face.length; j<fl; ++j) {
      face[j] = n_index[face[j]]
      for(var k=0; k<j; ++k) {
        if(face[j] === face[k]) {
          continue i_loop
        }
      }
    }
    n_cells.push(face)
  }
  
  //Return resulting mesh
  return {
    positions: n_positions,
    cells: n_cells,
    vertexRelabel: n_index
  }
}

module.exports = fuseVertices