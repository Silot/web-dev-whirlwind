simplicial-dijsoint-union
=========================
Computes the [disjoint union](http://en.wikipedia.org/wiki/Disjoint_union) of two [simplicial complexes](https://github.com/mikolalysenko/simplicial-complex).  You can use this to do stuff like concatenate meshes.

## Install

    npm install simplicial-disjoint-union


## Usage

```javascript
var disjointUnion = require("simplicial-disjoint-union")

//Example:
//
//    Combine a bunny and teapot into a single mesh
//

//First read in meshes
var bunny = require("bunny")
  , teapot = require("teapot")

//Then combine positions
var combinedPos = bunny.positions.concat(teapot.positions)

//Finally combine cells using simplicial-disjoint-union
var combinedCells = disjointUniont(bunny.cells, teapot.cells)
```

### `require("simplicial-disjoint-union")(a, b[, a_verts])`
Joins two simplicial complexes together.

* `a` and `b` are the complexes we are going to join
* `a_verts` an optional parameter giving the number of vertices in `a` if not specified, is computed dynamically.

**Returns** The cells in `a` concatenated to the cells in `b`, with the vertices in `b` relabeled by those in a's length.