//Initialize shell
var shell = require("gl-now")({tickRate:1000, frameTime:0.0})
var fs = require("fs")

var VERT_SRC = fs.readFileSync(__dirname +  '/shaders/vert_shader.glsl', 'utf8')
var FRAG_SRC = fs.readFileSync(__dirname + '/shaders/frag_shader.glsl', 'utf8')

var shader
var vertexPositions
var vertexVelocity
var vertexAcceleration
var vertexColors

function updatePositions(){
  var movement = [0., -.01, 0.]
  for(var i=0; i<3; ++i) {
    vertexPositions[i*2 + 1] += movement[1]
  }
}

System = function (num){
  this.init(num)
}

System.prototype = {
  init: function(num){
    var gl = shell.gl
    this.color_attribute = gl.getAttribLocation(shader, "a_color")
    this.position_attribute = gl.getAttribLocation(shader, "a_position")
    // this.velocity_uniform = gl.getUniformLocation(shader, "u_velocity")
    this.numBodies = num || 2
    this.colors = [
      [1,1,1],
      [0.3451, 1.0, 0.5450],
      [1.0, 0.4313, 0.3411],
      [1.0, 0.8862, 0.3725],
      [0.3804, 0.7647, 1.0]
    ]
    this.bodies = []
    for(var i=0; i<=this.numBodies; ++i){
      var c = this.colors[(Math.random()*this.colors.length)|0]
      var p = [.8-Math.random()*1.6, .8-Math.random()*1.6]
      this.bodies.push(new Body(p[0], p[1],c, 75))
    }
    console.log(this.bodies)
    this.PitemSize = 2
    this.CitemSize = 3

    this.vertexPositions = new Float32Array(this.numBodies*this.PitemSize)
    this.vertexColors    = new Float32Array(this.numBodies*this.CitemSize)
    for(var i=0; i<=this.numBodies; ++i){
      this.vertexPositions.push(this.bodies[i].x)
      this.vertexPositions.push(this.bodies[i].y)
      for (var j; j<this.CitemSize; ++j){
        this.vertexColors.push(this.bodies[i].c[j])
      }
    }

  },
  tick: function(){
    updatePositions()
  },
  updateBuffers: function(){
    console.log("updateBuffers called")
    var gl = shell.gl

    this.vertexPositions = new Float32Array(this.numBodies*this.PitemSize)
    for(var i=0; i<=this.numBodies; ++i){
      this.vertexPositions.push(this.bodies[i].x)
      this.vertexPositions.push(this.bodies[i].y)
    }
    var colorBuf = gl.createBuffer()
    var vertBuf = gl.createBuffer()

    // var color_attribute = gl.getAttribLocation(shader, "a_color")
    // var position_attribute = gl.getAttribLocation(shader, "a_position")
    // var velocity_uniform = gl.getUniformLocation(shader, "u_velocity")
    // shell.movementLoc = velocity_uniform

    gl.enableVertexAttribArray(this.color_attribute)
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexColors, gl.STATIC_DRAW)
    gl.vertexAttribPointer(this.color_attribute, 3, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(this.position_attribute)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexPositions, gl.STREAM_DRAW)
    gl.vertexAttribPointer(this.position_attribute, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.POINTS, 0, 3)
    gl.disableVertexAttribArray(vertBuf)
    gl.disableVertexAttribArray(colorBuf)
  }
}

Body = function(x, y, c, mass){
  this.init(x,y,c,mass)
}

Body.prototype = {
  init: function(x,y,c, mass){
    this.x = x || 0.0
    this.y = y || 0.0
    this.c = c
    // this.vx = vx || 0.0
    // this.vy = vy || 0.0
    // this.ax = ax || 0.0
    // this.ay = ax || 0.0
    this.mass = mass || 50
  }
  // tick: function(){
  //   this.x += this.vx
  //   this.y += this.vy
  //   this.vx = 
  //   this.vy = 
  //   this.ax = 
  //   this.ay = 
  // }
}

// function bindAttribBuf(data, buffer){
// }
// function gravity(){

// }

shell.on("gl-init", function() {
  console.log("gl-init called")
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
  shader = gl.createProgram()
  shell.shader = shader
  gl.attachShader(shader, frags)
  gl.attachShader(shader, verts)
  gl.linkProgram(shader)
  gl.useProgram(shader)

  shell.sim = new System(3)
  shell.sim.init()
  shell.sim.updateBuffers()
  var colorArray = [
  //   [1,1,1],
  //   [0.3451, 1.0, 0.5450],
  //   [1.0, 0.4313, 0.3411],
  //   [1.0, 0.8862, 0.3725],
  //   [0.3804, 0.7647, 1.0]
  // ]

  // var numPoints = 3
  // var PitemSize = 2
  // var CitemSize = 3

  // vertexPositions = new Float32Array(numPoints*PitemSize)
  // vertexColors    = new Float32Array(numPoints*CitemSize)

    // var vertexPBuffer = createBuffer(gl, vertexPositions)
    // var vertexCBuffer = createBuffer(gl, vertexColors)

  // var cPointer = 0
  // var pPointer = 0
  // for(var i=0; i<=numPoints; ++i) {
  //   var c = colorArray[(Math.random()*colorArray.length)|0]
  //   var p = [.8-Math.random()*1.6, .8-Math.random()*1.6]
  //   for(var j=0; j<=CitemSize; ++j) {
  //     vertexColors[cPointer] = c[j]
  //     cPointer += 1
  //   }
  //   for(var j=0; j<PitemSize; ++j){
  //     vertexPositions[pPointer] =p[j]
  //     pPointer += 1
  //   }
  // }

  // var colorBuf = gl.createBuffer()
  // var vertBuf = gl.createBuffer()

  // var color_attribute = gl.getAttribLocation(shader, "a_color")
  // var position_attribute = gl.getAttribLocation(shader, "a_position")
  // var velocity_uniform = gl.getUniformLocation(shader, "u_velocity")
  // shell.movementLoc = velocity_uniform

  // gl.enableVertexAttribArray(color_attribute)
  // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf)
  // gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW)
  // gl.vertexAttribPointer(color_attribute, 3, gl.FLOAT, false, 0, 0)

  // gl.enableVertexAttribArray(position_attribute)
  // gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf)
  // gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STREAM_DRAW)
  // gl.vertexAttribPointer(position_attribute, 2, gl.FLOAT, false, 0, 0)
})


shell.on("gl-render", function(t) {
  console.log("render called")
  var gl = shell.gl
  var position_attribute = gl.getAttribLocation(shader, "a_position")
  var color_attribute = gl.getAttribLocation(shader, "a_color")
  var vertBuf = gl.createBuffer()
  var colorBuf = gl.createBuffer()

  // gl.uniform3fv(gl.getUniformLocation(shader, "u_velocity"), movement)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // sim.updateBuffers()
  updatePositions()
  console.log(shell)
  shell.paused = true
  
  movement = [0., -.01, 0.]

  gl.enableVertexAttribArray(position_attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf)
  gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STREAM_DRAW)
  gl.vertexAttribPointer(position_attribute, 2, gl.FLOAT, false, 0, 0)

  gl.enableVertexAttribArray(color_attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf)
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW)
  gl.vertexAttribPointer(color_attribute, 3, gl.FLOAT, false, 0, 0)

  //Draw the points
  gl.drawArrays(gl.POINTS, 0, 3)
  gl.disableVertexAttribArray(vertBuf)
  gl.disableVertexAttribArray(colorBuf)
})

shell.on("gl-error", function(e) {
  throw new Error("WebGL not supported :(")
})