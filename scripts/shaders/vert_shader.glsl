precision highp float;
precision highp int;

attribute vec3 a_position;
attribute vec3 a_color;
varying vec3 fragColor;

void main() {
  gl_Position = vec4(a_position, 1.0);
  gl_PointSize = 100.0;
  fragColor = a_color;
}
