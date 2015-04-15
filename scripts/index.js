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
  init: function(num, method){
    var gl = shell.gl
    this.h = 100
    this.numMethod = method || "euler"
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
    this.bodies.push(new Body([0.0, 0.0], [0.0,0.0], this.colors[0], 1000*this.numBodies, 0))
    for(var i=1; i<this.numBodies; ++i){
      var c = this.colors[(Math.random()*this.colors.length)|0]
      var p = [.8-Math.random()*1.6, .8-Math.random()*1.6]
      var v = [.1-Math.random()*.2, .1-Math.random()*.2]
      var m = Math.random()*5
      this.bodies.push(new Body(p, v, c, m, i))
    }
     console.log("pinit" + this.bodies[3].p)
    this.PitemSize = 2
    this.CitemSize = 3

    var vp = []
    var vc = []

    for(var i=0; i<this.numBodies; ++i){
      var pos = this.bodies[i].p
      for (var k=0; k<this.CitemSize; ++k){
        vc.push(this.bodies[i].c[k])
      }
      for(var j=0; j<this.PitemSize; ++j){
        vp.push(this.bodies[i].p[j])
      }
    }
    this.vertexPositions = vp
    this.vertexColors    = vc
    this.gvec = new Array(this.numBodies)

  },
  gravity: function(){
    var gvec = new Array(this.numBodies)
    for(var i=0; i<this.numBodies; ++i){
      for(var j=0; j<this.numBodies; ++j){
        gvec[i] = [0,0]
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
          add(gvec[i], agj)
        }
      }
    }
    return gvec
  },
  midptUP: function(){

  },
  eulerUB: function(){
    var gvec = this.gravity()
    var vp = []
    for(var i=0; i<this.numBodies; ++i){
      var data = this.bodies[i].update(gvec[i], this.h)
      console.log(data)
      this.bodies[i].set(data[0], data[1])
      for(var j=0; j<this.PitemSize; ++j){
        vp.push(this.bodies[i].p[j])
      }
    }
    return vp
  },
  updateBuffers: function(){
    if (this.numMethod == "rk4"){
      console.log("rk4!")
      return this.rk4UB()
    }
    else if (this.numMethod == "midpoint"){
      console.log("midpoint!")
      return this.midptUB()
    }
    else{
      console.log("euler!")
      this.vertexPositions = this.eulerUB()
    }
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
    // this.h = 100
  },
  update: function(gvec, h){
    var data = []
    var ptmp = copy(this.p)
    var vtmp = copy(this.v)
    var vtmp2 = copy(vtmp)
    var accg = copy(gvec)
    add(ptmp, div(vtmp2, h))
    add(vtmp, div(accg, h))
    data.push(ptmp)
    data.push(vtmp)
    console.log(ptmp)
    console.log(vtmp)
    return data
  },
  set: function(p, v){
    this.p = p
    this.v = v
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

  sim = new System(6, "euler")
  sim.updateBuffers()
})


shell.on("gl-render", function(t) {
  //update the positions, accelerations & velocities of simulation bodies
  sim.updateBuffers()

  //update gl arrays
  var gl = shell.gl
  var vertBuf = gl.createBuffer()
  var colorBuf = gl.createBuffer()
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
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