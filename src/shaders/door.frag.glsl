uniform float time;
uniform float selected;
uniform sampler2D tex;
varying vec2 vUv;

void main( void ) {
  vec2 uv = vUv - 0.5;
/*
  float ripple = uv.x * uv.x + uv.y * uv.y;
  float ripple_anim = (1.0 + sin(time * 2.0 + ripple * 50.0)) * 0.5;
  vec3 col = vec3(ripple * 1.3, ripple * 0.9, 0.0) * (0.5 + ripple_anim * 0.5);
  col += ripple * selected * 0.4 + selected * col;
*/
vec4 col = texture2D(tex, vUv);
  gl_FragColor = col;
}
