var unite = require("../union")

require("tap").test("disjoint-union", function(t) {

  var a = [[0, 1, 2]]
    , b = [[0], [1,2]]
    , c = unite(a, b)
  
  t.equals(c.length, 3)
  t.equals(c[0].join(), a.join())
  t.equals(c[1][0], 3)
  t.equals(c[2][0], 4)
  t.equals(c[2][1], 5)
  
  t.end()
})