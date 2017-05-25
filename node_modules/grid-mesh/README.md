grid-mesh
=========
Creates a triangulated orthogonal grid.  This is not the same as [grid-graph](https://github.com/mikolalysenko/grid-graph), since:

* It only works for 2D meshes (though they can be embedded in arbitrary dimensional space)
* It fills in the faces

Usage
=====
Install using npm:

    npm install grid-mesh
    
And use as follows:

```javascript
console.log(require("grid-mesh")(100, 100))
```

`require("grid-mesh")(nx, ny[, origin, dx, dy])`
------------------------------
Creates an nx by ny sized grid mesh.

* `nx` the number of subdivisions along the `dx` axis
* `ny` the number of subdivisions along the `dy` axis
* `origin` is the start coordinate for the mesh (Default: [0,0])
* `dx` the step vector along the `x` direction (Default: [1,0])
* `dy` the step vector along the `y` direction (Defulat: [0,1])

**Returns** A json object with the following properties:

* `cells` the cells of the mesh
* `positions` the positions of the mesh

Credits
=======
(c) 2013 Mikola Lysenko. MIT License