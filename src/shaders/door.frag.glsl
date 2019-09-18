uniform float time;
uniform float selected;
uniform sampler2D tex;
varying vec2 vUv;

void main( void ) {
  float t = time * 0.3;
  vec2 uv = vec2(vUv.x + sin(t) * cos(t * 0.1 + vUv.y), vUv.y * sin(t * 0.3) + t);
  vec4 col = texture2D(tex, uv) * 0.5;
  gl_FragColor = vec4(col.xyz, 1.0);
}
