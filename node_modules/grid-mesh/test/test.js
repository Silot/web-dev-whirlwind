var grid = require("../grid.js")

require("tap").test("grid-mesh", function(t) {

  var simple_grid = grid(1, 1)
  
  t.equals(simple_grid.positions.length, 4)
  t.equals(simple_grid.cells.length, 2)
  t.equals(simple_grid.positions[0][0], 0)


  var advanced_grid = grid(2, 3, [0, 0, 1], [1, 0, 0], [0, 1, 0])
  
  t.equals(advanced_grid.positions.length, 12)
  t.equals(advanced_grid.cells.length, 12)

  t.end()
})