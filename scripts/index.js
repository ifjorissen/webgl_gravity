//Initialize shell

var fs = require("fs")
cwd = process.cwd()
console.log(cwd)

var VERT_SRC = fs.readFileSync(__dirname +  '/shaders/shader.vert', 'utf8')
var FRAG_SRC = fs.readFileSync(__dirname + '/shaders/shader.frag', 'utf8')


var shell = require("gl-now")()
shell.on("gl-init", function() {
  var gl = shell.gl

  //Create fragment shader
  var frags = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(frags, FRAG_SRC)
  gl.compileShader(frags)

  //Create vertex shader
  var verts = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(verts, VERT_SRC)
  gl.compileShader(verts)

  //Link
  var shader = gl.createProgram()
  gl.attachShader(shader, frags)
  gl.attachShader(shader, verts)
  gl.linkProgram(shader)
  gl.useProgram(shader)

  //Create buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, 0, 0,
    0, -1, 0,
    1, 1, 0
  ]), gl.STATIC_DRAW)

  //Set up attribute pointer
  var position_attribute = gl.getAttribLocation(shader, "position")
  gl.enableVertexAttribArray(position_attribute)
  gl.vertexAttribPointer(position_attribute, 3, gl.FLOAT, false, 0, 0)
})

shell.on("gl-render", function(t) {
  var gl = shell.gl

  //Draw arrays
  gl.drawArrays(gl.TRIANGLES, 0, 3)
})

shell.on("gl-error", function(e) {
  throw new Error("WebGL not supported :(")
})