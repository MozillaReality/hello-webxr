export var shaders = {
panoball_vert : `
varying vec2 vUv;
void main()
{
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,

panoball_frag : `
varying vec2 vUv;
void main( void ) {
  gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0 );
}
`,

};