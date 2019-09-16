varying vec2 vUv;
void main( void ) {
  gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0 );
}
