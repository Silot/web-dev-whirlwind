var fuseVertices = require("../index.js")

require("tap").test("fuseVertices", function(t) {

  var cells = [[0,1], [2,3]]
  var positions = [[0], [1], [1.000000001], [2]]
  var result = fuseVertices(cells, positions)
  
  t.equals(result.positions[0][0], 0.0)
  t.equals(result.positions[1][0], 1.0000000005)
  t.equals(result.positions[2][0], 2.0)
  t.equals(result.cells[0][0], 0)
  t.equals(result.cells[0][1], 1)
  t.equals(result.cells[1][0], 1)
  t.equals(result.cells[1][1], 2)
  t.equals(result.vertexRelabel[0], 0)
  t.equals(result.vertexRelabel[1], 1)
  t.equals(result.vertexRelabel[2], 1)
  t.equals(result.vertexRelabel[3], 2)


  result = fuseVertices( [], [] )
  t.equals(result.cells.length, 0)
  t.equals(result.positions.length, 0)
  
  
  result = fuseVertices( [[0, 1, 2]], [[0], [1], [1.0000000001]])
  t.equals(result.cells.length, 0)
  t.equals(result.positions.length, 2)
  
  result = fuseVertices( [[0, 1], [1, 2]], [[0,0], [1,0], [0.0000001, 0.000000001]])
  t.equals(result.positions.length, 2)

  t.end()
})

