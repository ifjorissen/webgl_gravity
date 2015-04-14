//Initialize shell
var shell = require("gl-now")({tickRate:1000, frameTime:.99, frameSkip:10000})
var fs = require("fs")
var vec = require("victor")

var VERT_SRC = fs.readFileSync(__dirname +  '/shaders/vert_shader.glsl', 'utf8')
var FRAG_SRC = fs.readFileSync(__dirname + '/shaders/frag_shader.glsl', 'utf8')

// var shader
// var vertexPositions
// var vertexVelocity
// var vertexAcceleration
// var vertexColors
var sim
var EPSILON = .000005

System = function (num, orbit){
  this.init(parseInt(num), orbit)
}

System.prototype = {
  init: function(num, orbit){
    var gl = shell.gl
    this.orbit = orbit
    this.color_attribute = gl.getAttribLocation(shader, "a_color")
    this.position_attribute = gl.getAttribLocation(shader, "a_position")

    this.numBodies = parseInt(num) || 4
    this.colors = [
      [0,0,0],
      [0.3451, 1.0, 0.5450],
      [1.0, 0.4313, 0.3411],
      [1.0, 0.8862, 0.3725],
      [1.0, 1.0, 0.0],
      [0.0, 1.0, 1.0],
      [1.0, 0.0, 1.0],
      [0.3804, 0.7647, 1.0]
    ]

    this.bodies = []
    if (orbit){
      this.numBodies ++;
      this.bodies.push(new Body([0.0, 0.0], [0.0,0.0], this.colors[0], 1000))
    }

    for(var i=0; i<this.numBodies-1; ++i){
      var c = this.colors[(Math.random()*this.colors.length)|0]
      var p = [.8-Math.random()*1.6, .8-Math.random()*1.6]
      if (orbit){
        var dist = [(this.bodies[i].p[0] - this.bodies[0].p[0]), (this.bodies[i].p[1] - this.bodies[0].p[1])]
        var v = [.1-Math.random()*.2, .1-Math.random()*.2]
        if (dot(v, d)==0)
      }
      else{
        var v = [.1-Math.random()*.2, .1-Math.random()*.2]
      }
      var m = Math.random()*5
      this.bodies.push(new Body(p, v, c, m, i))
    }
    this.PitemSize = 2
    this.CitemSize = 3

    var vp = new Float32Array(this.numBodies*this.PitemSize)
    var vc = new Float32Array(this.numBodies*this.CitemSize)

    var cPointer = 0;
    var pPointer = 0;
    for(var i=0; i<this.numBodies; ++i){
      for (var k=0; k<this.CitemSize; ++k){
        vc[cPointer] = this.bodies[i].c[k]
        cPointer += 1
      }
      for(var j=0; j<this.PitemSize; ++j){
        vp[pPointer] = this.bodies[i].p[j]
        pPointer += 1
      }
    }
    this.vertexPositions = vp
    this.vertexColors    = vc
    this.gvec = new Array(this.numBodies*this.PitemSize)

  },
  gravity: function(){
    console.log("gravity!")
    this.gvec = new Array(this.numBodies*this.PitemSize).fill(0)
    for(var i=0; i<this.numBodies; ++i){
      for(var j=0; j<this.numBodies; ++j){
        console.log(this.gvec)
        if (j!= i){
          var dist = [(this.bodies[j].p[0] - this.bodies[i].p[0]), (this.bodies[j].p[1] - this.bodies[i].p[1])]
          var dir = Math.sqrt(dist[0]*dist[0] + dist[1]*dist[1])
          this.gvec[i*this.PitemSize + 0] += this.bodies[j].mass/dist[0]*dir
          this.gvec[i*this.PitemSize + 1] += this.bodies[j].mass/dist[1]*dir
          // console.log(this.gvec[i*this.PitemSize + 1])
          // console.log(i*this.PitemSize + 0)
          // console.log(i*this.PitemSize + 1)
          // console.log(this.gvec)
        }
      }
    }
    console.log(this.gvec)
  },
  updateBuffers: function(){
    console.log("updateBuffers called")
    var gl = shell.gl
    this.gravity()
    vp = new Float32Array(this.numBodies*this.PitemSize)
    var pPointer = 0;
    for(var i=0; i<this.numBodies; ++i){
      this.bodies[i].update(this.gvec[i*this.PitemSize + 0], this.gvec[i*this.PitemSize + 1])
      for(var j=0; j<this.PitemSize; ++j){
        vp[pPointer] = this.bodies[i].p[j]
        pPointer += 1
      }
    }
    this.vertexPositions = vp
  }
}

Body = function(p, v, c, mass, i){
  this.init(p, v, c, mass, i)
}

Body.prototype = {
  init: function(p, v, c, mass, i){
    this.p = p
    this.v = v
    this.c = c
    this.mass = mass || 50
    this.id = i
    this.h = 1000
  },
  update: function(gvec0, gvec1){
    this.p[0] += this.v[0]/this.h
    this.p[1] += this.v[1]/this.h
    this.v[0] += gvec0/this.h
    this.v[1] += gvec1/this.h
  }
}

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

  sim = new System(4, true)
  sim.init()
  sim.updateBuffers()
})


shell.on("gl-render", function(t) {
  var gl = shell.gl
  var vertBuf = gl.createBuffer()
  var colorBuf = gl.createBuffer()

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  sim.updateBuffers()

  gl.enableVertexAttribArray(sim.position_attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf)
  gl.bufferData(gl.ARRAY_BUFFER, sim.vertexPositions, gl.STREAM_DRAW)
  gl.vertexAttribPointer(sim.position_attribute, sim.PitemSize, gl.FLOAT, false, 0, 0)

  gl.enableVertexAttribArray(sim.color_attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf)
  gl.bufferData(gl.ARRAY_BUFFER, sim.vertexColors, gl.STATIC_DRAW)
  gl.vertexAttribPointer(sim.color_attribute, sim.CitemSize, gl.FLOAT, false, 0, 0)

  //Draw the points
  gl.drawArrays(gl.POINTS, 0, sim.numBodies)
  gl.disableVertexAttribArray(vertBuf)
  gl.disableVertexAttribArray(colorBuf)
})

shell.on("gl-error", function(e) {
  throw new Error("WebGL not supported :(")
})