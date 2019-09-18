export var shaders = {
door_frag : `
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