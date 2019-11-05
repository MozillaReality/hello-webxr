uniform sampler2D tex, texfx;
uniform float time;
uniform float selected;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPos;


void main( void ) {
  vec2 uv = vUv;
  //uv.y =  1.0 - uv.y;

  vec3 eye = normalize(cameraPosition - vWorldPos);
  float fresnel = abs(dot(eye, vNormal));
  float shift = pow((1.0 - fresnel), 4.0) * 0.05;

  vec3 col = vec3(
    texture2D(tex, uv - shift).r,
    texture2D(tex, uv).g,
    texture2D(tex, uv + shift).b
  );

  col = mix(col * 0.7, vec3(1.0), 0.7 - fresnel);

  col += selected * 0.3;

  float t = time * 0.4 + vPosition.x + vPosition.z;
  uv = vec2(vUv.x + t * 0.2, vUv.y + t);
  vec3 fx = texture2D(texfx, uv).rgb * 0.4;


  gl_FragColor = vec4(col + fx, 1.0);
}
