generic-slice
=============
A poly fill for [`slice`](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/slice) that uniformly and efficiently implements `Array`-like semantics for the following classses of objects:

* Typed Arrays
* Node.JS-style `Buffers()`
* Regular JS Arrays
* Arguments
* Any other array-like object (ie has a length and array accessors)

## Install

    npm install generic-slice
    
## Example

```javascript
var slice = require("generic-slice")

var x = new Float32Array(4)
x[0] = 1
x[1] = 2
x[2] = 3
x[3] = 4

var y = slice(x, 0, 2)

// Now:
//      y = [ 1, 2 ]
//      x = [ 1, 2, 3, 4 ]


y[0] = 1000

// Now:
//      y = [ 1000, 2 ]
//      x = [ 1, 2, 3, 4 ]
```

### `require("generic-slice")(array[, sliceBegin, sliceEnd])`
A generic polyfill for slicing array-like objects.

* `array` is a typed array, buffer, Array, or Arguments object
* `sliceBegin` is an optional argument giving the start of the slice. Negative values change counting to end of array.  (Default: 0)
* `sliceEnd` is an optional argument giving the end of the slice.  Negative values wrap around.  (Default: array.length)

**Returns** A copy of the array from the range `[sliceBegin, sliceEnd)`

### Why make this?
Because:

* `slice` got dropped from the typed array specification (and the replacement method, `.subarray()` merely returns a view and does not make a copy)
* Node.JS's `Buffer`'s slice method does not make a copy like Array's slice does, and so it has inconsistent semantics.
* `Arguments` doesn't have a slice method either
* Using `Array.prototype.slice.call` doesn't properly preserve the types of things like Buffers or typed arrays
* Also `Array.prototype.slice.call` can be slower than an appropriate implementation.  For example, to clone a typed array you can slice the underlying ArrayBuffer assuming that you are careful about how you perform indexing.

### Is it thoroughly tested?

All of the major edge cases should be tested.  If you find a bug, please open an issue or send a pull request.

# Credits
(c) 2013 Mikola Lysenko. MIT License
