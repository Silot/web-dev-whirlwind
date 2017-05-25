var slice = require("../index.js")

require("tap").test("generic slice", function(t) {
  function testArrayObj(x, nocons) {
    var y, px, i, j, k, p
    
    y = slice(x)
    t.equals(y.length, x.length)
    nocons || t.equals(y.constructor, x.constructor)
    for(i=0; i<x.length; ++i) {
      px = x[i]
      t.equals(y[i], x[i])
      y[i] = 100-i
      t.equals(x[i], px)
      t.equals(y[i], 100-i)
    }
    
    for(j=0; j<x.length; ++j) {
      y = slice(x, j)
      t.equals(y.length, x.length - j)
      nocons || t.equals(y.constructor, x.constructor)
      for(i=j; i<x.length; ++i) {
        px = x[i]
        t.equals(y[i-j], x[i])
        y[i-j] = 100-i
        t.equals(x[i], px)
        t.equals(y[i-j], 100-i)
      }
      
      for(k=j; k<=x.length; ++k) {
        y = slice(x, j, k)
        t.equals(y.length, k - j)
        nocons || t.equals(y.constructor, x.constructor)
        for(var i=j; i<k; ++i) {
          px = x[i]
          t.equals(y[i-j], x[i])
          y[i-j] = 100-i
          t.equals(x[i], px)
          t.equals(y[i-j], 100-i)
        }
        if(k < x.length) {
          y = slice(x, j, k - x.length)
          t.equals(y.length, k - j)
          nocons || t.equals(y.constructor, x.constructor)
          for(var i=j; i<k; ++i) {
            px = x[i]
            t.equals(y[i-j], x[i])
            y[i-j] = 100-i
            t.equals(x[i], px)
            t.equals(y[i-j], 100-i)
          }
        }
      }
    }
    
    for(j=1-x.length; j<0; ++j) {
      y = slice(x, j)
      t.equals(y.length, -j)
      nocons || t.equals(y.constructor, x.constructor)
      for(i=x.length+j, p=0; p<y.length; ++i, ++p) {
        px = x[i]
        t.equals(y[p], x[i])
        y[p] = 100-i
        t.equals(x[i], px)
        t.equals(y[p], 100-i)
      }
      for(k=x.length+j; k<=x.length; ++k) {
        y = slice(x, j, k)
        t.equals(y.length, k - (x.length + j) )
        nocons || t.equals(y.constructor, x.constructor)
        for(i=x.length+j, p=0; p<y.length; ++i, ++p) {
          px = x[i]
          t.equals(y[p], x[i])
          y[p] = 100-i
          t.equals(x[i], px)
          t.equals(y[p], 100-i)
        }
        if(k < x.length) {
          y = slice(x, j, k - x.length)
          t.equals(y.length, k - x.length - j)
          nocons || t.equals(y.constructor, x.constructor)
          for(i=x.length+j, p=0; p<y.length; ++i, ++p) {
            px = x[i]
            t.equals(y[p], x[i])
            y[p] = 100-i
            t.equals(x[i], px)
            t.equals(y[p], 100-i)
          }
        }
      }
    }
  }
  
  function testArray(array_t) {
    var x = new array_t(16)
    for(var i=0; i<16; ++i) {
      x[i] = i
    }
    testArrayObj(x)
  }
  testArray(Array)
  testArray(Buffer)
  
  function testTypedArray(array_t) {
    var x = new array_t(16)
    for(var i=0; i<16; ++i) {
      x[i] = i
    }
    
    testArrayObj(x)
    testArrayObj(x.subarray(8))
    testArrayObj(x.subarray(0, 8))
    testArrayObj(x.subarray(4, 12))
  }
  testTypedArray(Int8Array)
  testTypedArray(Int16Array)
  testTypedArray(Int32Array)
  testTypedArray(Uint8Array)
  testTypedArray(Uint16Array)
  testTypedArray(Uint32Array)
  testTypedArray(Float32Array)
  testTypedArray(Float64Array)
  
  function testArgs() {
    testArrayObj(arguments, true)
  }
  testArgs(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)
  
  t.end()

})