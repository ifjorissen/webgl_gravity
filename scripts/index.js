//Initialize shell
var shell = require("gl-now")({tickRate:1000})
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

  var colorArray = [
    [1,1,1],
    [0.3451, 1.0, 0.5450],
    [1.0, 0.4313, 0.3411],
    [1.0, 0.8862, 0.3725],
    [0.3804, 0.7647, 1.0]
  ]

  var numPoints = 3
  var PitemSize = 3
  var CitemSize = 3

  var vertexPositions = new Float32Array(numPoints*PitemSize)
  var vertexColors    = new Float32Array(numPoints*CitemSize)

  //   var vertexPBuffer = createBuffer(gl, vertexPositions)
  //   var vertexCBuffer = createBuffer(gl, vertexColors)

  // refine this or scrap it, assigns random colors and positions to the bodies
  var cPointer = 0
  var pPointer = 0
  for(var i=0; i<=numPoints; ++i) {
    var c = colorArray[(Math.random()*colorArray.length)|0]
    var p = [.8-Math.random()*1.6, .8-Math.random()*1.6, .8-Math.random()*1.6]
    for(var j=0; j<=CitemSize; ++j) {
      vertexColors[cPointer] = c[j]
      cPointer += 1
    }
    for(var j=0; j<PitemSize; ++j){
      vertexPositions[pPointer] =p[j]
      pPointer += 1
    }
  }

//   var vertexArray = createVAO(gl, [
//     {
//       "buffer": vertexPBuffer,
//       "size": PitemSize
//     },
//     {
//       "buffer": vertexCBuffer,
//       "size": CitemSize
//     }
//   ])

  // Create buffer
  // var colors = [.1,0.,1, 1.,0,1., 0.,1.,1.]
  // var positions = [.5, .5, 0., .75, 0, 0., 0., 0., 0.]

  var colorBuf = gl.createBuffer()
  var vertBuf = gl.createBuffer()

  var color_attribute = gl.getAttribLocation(shader, "a_color")
  var position_attribute = gl.getAttribLocation(shader, "a_position")
  var velocity_uniform = gl.getAttribLocation(shader, "u_velocity")
  shell.movementLoc = velocity_uniform

  gl.enableVertexAttribArray(color_attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf)
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW)
  gl.vertexAttribPointer(color_attribute, 3, gl.FLOAT, false, 0, 0)

  gl.enableVertexAttribArray(position_attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf)
  gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STREAM_DRAW)
  gl.vertexAttribPointer(position_attribute, 3, gl.FLOAT, false, 0, 0)

})

// shell.on("tick", function(){
//   console.log("tick")
//   shell.gl.
// })

shell.on("gl-render", function(t) {
  console.log("render called")
  var gl = shell.gl
  var movementLoc = shell.movementLoc
  movement = [0., -.001, 0.]
  gl.uniform3fv(movementLoc, movement)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  //Draw the points
  gl.drawArrays(gl.POINTS, 0, 3)
})

shell.on("gl-error", function(e) {
  throw new Error("WebGL not supported :(")
})