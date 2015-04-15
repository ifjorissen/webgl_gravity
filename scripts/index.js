//Initialize shell
var shell = require("gl-now")({tickRate:1000, frameTime:.99, frameSkip:10000})
var fs = require("fs")
var add = require("vectors/add-nd")
var mag = require("vectors/mag-nd")
var sub = require("vectors/sub-nd")
var dist = require("vectors/dist-nd")
var div = require("vectors/div-nd")
var dot = require("vectors/dot-nd")
var mult = require("vectors/mult-nd")
var norm = require("vectors/normalize-nd")
var copy = require("vectors/copy-nd")

var VERT_SRC = fs.readFileSync(__dirname +  '/shaders/vert_shader.glsl', 'utf8')
var FRAG_SRC = fs.readFileSync(__dirname + '/shaders/frag_shader.glsl', 'utf8')

var shader
var vertexPositions
var vertexVelocity
var vertexAcceleration
var vertexColors
var sim

System = function (num){
  this.init(num)
}

System.prototype = {
  init: function(num){
    var gl = shell.gl
    this.color_attribute = gl.getAttribLocation(shader, "a_color")
    this.position_attribute = gl.getAttribLocation(shader, "a_position")

    this.numBodies = parseInt(num) || 4
    this.colors = [
      [0.0,0.0,0.0],
      [0.3451, 1.0, 0.5450],
      [1.0, 0.4313, 0.3411],
      [1.0, 0.8862, 0.3725],
      [1.0, 1.0, 0.0],
      [0.0, 1.0, 1.0],
      [1.0, 0.0, 1.0],
      [0.3804, 0.7647, 1.0]
    ]

    this.bodies = []
    this.bodies.push(new Body([0.0, 0.0], [0.0,0.0], this.colors[0], 1000, 0))
    for(var i=0; i<this.numBodies-1; ++i){
      var c = this.colors[(Math.random()*this.colors.length)|0]
      var p = [.8-Math.random()*1.6, .8-Math.random()*1.6]
      var v = [.1-Math.random()*.2, .1-Math.random()*.2]
      var m = Math.random()*5
      this.bodies.push(new Body(p, v, c, m, i))
      console.log("pinit" + this.bodies[i].p)
    }
     console.log("pinit" + this.bodies[3].p)
    this.PitemSize = 2
    this.CitemSize = 3

    // var vp = new Float32Array(this.numBodies*this.PitemSize)
    // var vc = new Float32Array(this.numBodies*this.CitemSize)
    var vp = []
    var vc = []

    var cPointer = 0;
    var pPointer = 0;
    for(var i=0; i<this.numBodies; ++i){
      var pos = this.bodies[i].p
      for (var k=0; k<this.CitemSize; ++k){
        // vc[cPointer] = this.bodies[i].c[k]
        // cPointer += 1
        vc.push(this.bodies[i].c[k])
      }
      for(var j=0; j<this.PitemSize; ++j){
        // vp[pPointer] = pos[j]
        // pPointer += 1
        vp.push(this.bodies[i].p[j])
      }
    }
    this.vertexPositions = vp
    this.vertexColors    = vc
    this.gvec = new Array(this.numBodies)

  },
  gravity: function(){
    console.log("gravity!")
    this.gvec = new Array(this.numBodies)
    for(var i=0; i<this.numBodies; ++i){
      for(var j=0; j<this.numBodies; ++j){
        this.gvec[i] = [0,0]
        if (j!= i){
          var tbip = copy(this.bodies[i].p)
          var tbjp = copy(this.bodies[j].p)
          var dist = copy(tbjp)
          sub(dist, tbip)
          var dlen = mag(dist)
          var dir = copy(dist)
          norm(dir)
          var agj = copy(dir)
          mult(agj, this.bodies[j].mass/dlen*dlen)
          add(this.gvec[i], agj)
          console.log("p for j" + this.bodies[j].p)
          console.log("p for i" + this.bodies[i].p)
        }
      }
    }
    console.log(this.gvec)
  },
  updateBuffers: function(){
    console.log("updateBuffers called")
    var gl = shell.gl
    this.gravity()
    // vp = new Float32Array(this.numBodies*this.PitemSize)
    var vp = []
    var pPointer = 0;
    for(var i=0; i<this.numBodies; ++i){
      this.bodies[i].update(this.gvec[i])
      var pos = this.bodies[i].p
      for(var j=0; j<this.PitemSize; ++j){
        // vp[pPointer] = pos[j]
        // pPointer += 1
        vp.push(this.bodies[i].p[j])
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
    this.h = 100
  },
  update: function(gvec){
    var vtmp = copy(this.v)
    var accg = copy(gvec)
    add(this.p, div(vtmp, this.h))
    add(this.v, div(accg, this.h))
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

  sim = new System(6)
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sim.vertexPositions), gl.STREAM_DRAW)
  gl.vertexAttribPointer(sim.position_attribute, sim.PitemSize, gl.FLOAT, false, 0, 0)

  gl.enableVertexAttribArray(sim.color_attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sim.vertexColors), gl.STATIC_DRAW)
  gl.vertexAttribPointer(sim.color_attribute, sim.CitemSize, gl.FLOAT, false, 0, 0)

  //Draw the points
  gl.drawArrays(gl.POINTS, 0, sim.numBodies)
  gl.disableVertexAttribArray(vertBuf)
  gl.disableVertexAttribArray(colorBuf)
})

shell.on("gl-error", function(e) {
  throw new Error("WebGL not supported :(")
})