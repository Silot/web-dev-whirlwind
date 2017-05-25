`fuse-vertices`
===============
Fuses together vertices and faces in bad meshes.

Install
=======
Via npm:

    npm install fuse-vertices
    
Usage
=====
Take a bad mesh, for example the Utah teapot:

    var teapot = require('teapot');

And then call the method:

    var repaired_teapot = require('fuse-vertices')(teapot.cells, teapot.positions, 1e-4);


`require('fuse-vertices')(cells, positions, tolerance)`
-------------------------------------------------------
This function fuses together all vertices which are within `tolerance` distance of one another.  It takes the following parameters:

* `cells` a cell complex
* `positions` the positions of the cells
* `tolerance` fuse threshold

Returns an object with the following properties:

* `cells`: The fused cells
* `positions`: The positions of the fused vertices
* `vertexRelabel`: A relabelling of the vertices

Credits
=======
(c) 2013 Mikola Lysenko. BSD
