uniform float time;
uniform sampler2D tex;
varying vec2 vUv;

void main( void ) {
  float t = time;
  vec4 col = texture2D(tex, vec2(vUv.x, vUv.y * 3.0 + time * 2.0));
  col *= vUv.y;
  gl_FragColor = col;
}
