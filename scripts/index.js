//Initialize shell
var shell = require("gl-now")()
var fs = require("fs")

var VERT_SRC = fs.readFileSync(__dirname +  '/shaders/vert_shader.glsl', 'utf8')
var FRAG_SRC = fs.readFileSync(__dirname + '/shaders/frag_shader.glsl', 'utf8')


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

  // Create buffer
  var colors = [0,1.,0, 1.,0,1., 0,0,1.]
  colorBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

  var positions = [.5, .5, 0., .75, 0, 0., 0., 0., 0.]
  vertBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  var color_attribute = gl.getAttribLocation(shader, "a_color")
  gl.enableVertexAttribArray(color_attribute)
  gl.vertexAttribPointer(color_attribute, 3, gl.FLOAT, false, 0, 0)

  //Set up attribute pointer
  var position_attribute = gl.getAttribLocation(shader, "a_position")
  gl.enableVertexAttribArray(position_attribute)
  gl.vertexAttribPointer(position_attribute, 3, gl.FLOAT, false, 0, 0)

})

shell.on("gl-render", function(t) {
  var gl = shell.gl
  // gl.clearColor(0.0, 0.0, 0.0, 1.0); 
  //Draw the points
  gl.drawArrays(gl.POINTS, 0, 3)
})

shell.on("gl-error", function(e) {
  throw new Error("WebGL not supported :(")
})