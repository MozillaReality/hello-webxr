uniform float time;
uniform sampler2D tex;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;


void main( void ) {
  float t = time + vPosition.x + vPosition.z;
  vec2 uv = vec2(vUv.x + t * 0.2, vUv.y + t);
  vec4 col = texture2D(tex, uv);
  col.a = 0.5 + sin(t * 5.0) * 0.3;

  gl_FragColor = col;
}
