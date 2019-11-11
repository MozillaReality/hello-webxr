uniform float time;
uniform sampler2D tex;
uniform vec2 zoomPos;
uniform float zoomAmount;
uniform float zoomRatio;
varying vec2 vUv;

void main( void ) {
  float t = time;
  vec2 uv = vec2(vUv.x - 0.5, (1.0 - vUv.y) - 0.5);
  vec2 texUv = uv * vec2(zoomRatio, 1.0);
  vec4 col = texture2D(tex, zoomPos + texUv * zoomAmount);
  float dist = length(uv) * 2.0;
  col.a = smoothstep(0.0, 0.1, 1.0 - dist);
  float aura = smoothstep(0.80, 1.0, dist);
  col.rgb += aura * 0.3;
  gl_FragColor = col;
}
