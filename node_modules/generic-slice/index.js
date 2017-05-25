"use strict"

var sliced = require("sliced")

function slice_typedarray(array, sliceBegin, sliceEnd) {
  var bs = array.BYTES_PER_ELEMENT
    , bo = array.byteOffset
    , n = array.length
  sliceBegin = (sliceBegin|0) || 0
  sliceEnd = sliceEnd === undefined ? n : (sliceEnd|0)
  if(sliceBegin < 0) {
    sliceBegin += n
  }
  if(sliceEnd < 0) {
    sliceEnd += n
  }
  return new array.constructor(array.buffer.slice(bo + bs*sliceBegin, bo + bs*sliceEnd))
}

function slice_buffer(buffer, sliceBegin, sliceEnd) {
  var len = buffer.length | 0
    , start = sliceBegin || 0
    , end = sliceEnd === undefined ? len : sliceEnd
  if(start < 0) {
    start += len
  }
  if(end < 0) {
    end += len
  }
  var nsize = end - start
  if(nsize <= 0) {
    return new Buffer(0)
  }
  var result = new Buffer(end - start)
  buffer.copy(result, 0, start, end)
  return result
}

function genericSlice(array, sliceBegin, sliceEnd) {
  if(array.buffer) {
    return slice_typedarray(array, sliceBegin, sliceEnd)
  } else if(array instanceof Buffer) {
    return slice_buffer(array, sliceBegin, sliceEnd)
  } else if(array.slice) {
    return array.slice(sliceBegin, sliceEnd)
  }
  return sliced(array, sliceBegin, sliceEnd)
}

function genericSlice_nobuffer(array, sliceBegin, sliceEnd) {
  if(array.buffer) {
    return slice_typedarray(array, sliceBegin, sliceEnd)
  } else if(array.slice) {
    return array.slice(sliceBegin, sliceEnd)
  }
  return sliced(array, sliceBegin, sliceEnd)
}

if(typeof Buffer === undefined) {
  module.exports = genericSlice_nobuffer
} else {
  module.exports = genericSlice
}
