"use strict"

var sc = require("simplicial-complex")

function disjointUnion(a, b, av) {
  if(typeof av !== "number") {
    av = sc.countVertices(a)
  } else {
    av = av|0
  }
  var ac = a.length
    , bc = b.length
    , result = new Array(ac + bc)
    , i, j, k, t
  for(i=0; i<ac; ++i) {
    result[i] = a[i].slice(0)
  }
  for(i=0; i<bc; ++i) {
    t = b[i].slice(0)
    for(j=0, k=t.length; j<k; ++j) {
      t[j] += av
    }
    result[i+ac] = t
  }
  return result
}

module.exports = disjointUnion