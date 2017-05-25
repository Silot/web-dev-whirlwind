var ms = [2,1,-5,2,17,18,12,-5,8,-3,4,8,-5]

module.exports = function (t) {
  var m0 = Math.pow(2,ms[Math.floor(t)%ms.length]/12)
  var m1 = Math.pow(2,ms[Math.floor(t*4)%ms.length]/12)
  return 0
    + sin_(sin(200)+sin(100)+sin(50),sin(.1)*0.1+.4)
       * Math.pow((1-saw(8))*0.5,4)
       * Math.pow((1-saw(2))*0.5,2)
    + sin_(sin(50)+sin(80),sin(1)*0.2+.6)*0.5
       * Math.pow((1-saw(2))*0.5,2)
    + sin_(sin(400*m0)+sin(80),sin(1)*0.2+.6)*0.5
       * Math.pow((1-saw(2))*0.5,8)
    + sin_(sin(100*m1)+sin(80),sin(1)*0.2+.6)*0.6
       * Math.pow((1-saw(4))*0.5,1)

  function tri_ (x,t) { return Math.abs(1 - t % (1/x) * x * 2) * 2 - 1 }
  function tri (x) { return tri_(x,t) }
  function saw_ (x,t) { return t%(1/x)*x*2-1 }
  function saw (x) { return saw_(x,t) }
  function sin_ (x,t) { return Math.sin(2 * Math.PI * t * x) }
  function sin (x) { return sin_(x,t) }
  function sq_ (x,t) { return t*x % 1 < 0.5 ? -1 : 1 }
  function sq (x) { return sq_(x,t) }
  function clamp (x) { return Math.max(-1,Math.min(1,x)) }
}
