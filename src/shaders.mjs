export var shaders = {
door_frag : `
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
`,

ballfx_frag : `
uniform float time;
uniform sampler2D tex;
varying vec2 vUv;
varying vec3 vPosition;

void main( void ) {
  float t = time + vPosition.x + vPosition.z;
  vec2 uv = vec2(vUv.x + t * 0.2, vUv.y - t);
  vec4 col = texture2D(tex, uv);
  col.a = 0.5 + sin(t * 5.0) * 0.3;
  gl_FragColor = col;
}
`,

basic_vert : `
varying vec2 vUv;
varying vec3 vPosition;
void main()
{
  vUv = uv;
  vPosition = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,

};