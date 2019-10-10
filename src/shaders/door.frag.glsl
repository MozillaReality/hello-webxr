uniform float time;
uniform float selected;
uniform sampler2D tex;
varying vec2 vUv;

void main( void ) {
  float t = time;
  vec2 uv = vUv * 2.0 - 1.0;
  vec2 puv = vec2(length(uv.xy), atan(uv.x, uv.y));
  vec4 col = texture2D(tex, vec2(log(puv.x) + t / 5.0, puv.y / 3.1415926 ));
  float glow = (1.0 - puv.x) * (0.5 + (sin(t) + 2.0 ) / 4.0);
  // blue glow
  col += vec4(118.0/255.0, 144.0/255.0, 219.0/255.0, 1.0) * (0.4 + glow * 1.0);
  // white glow
  col += vec4(0.2) * smoothstep(0.0, 2.0, glow * glow);
  gl_FragColor = col;

}
