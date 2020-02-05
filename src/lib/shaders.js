export var shaders = {
door_frag : `
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
`,

zoom_frag : `
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

panoball_vert : `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPos;
uniform float time;
uniform float selected;

mat4 inverse(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,

      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}


mat4 transpose(in mat4 m) {
  vec4 i0 = m[0];
  vec4 i1 = m[1];
  vec4 i2 = m[2];
  vec4 i3 = m[3];

  return mat4(
    vec4(i0.x, i1.x, i2.x, i3.x),
    vec4(i0.y, i1.y, i2.y, i3.y),
    vec4(i0.z, i1.z, i2.z, i3.z),
    vec4(i0.w, i1.w, i2.w, i3.w)
  );
}

void main()
{
  vUv = uv;

  vPosition = position;

  vec3 offset = vec3(
    sin(position.x * 50.0 + time),
    sin(position.y * 10.0 + time * 2.0),
    cos(position.z * 40.0 + time)
  ) * 0.003;

  vPosition *= 1.0 + selected * 0.2;

  vNormal = normalize(inverse(transpose(modelMatrix)) * vec4(normalize(normal), 1.0)).xyz;
  vWorldPos = (modelMatrix * vec4(vPosition, 1.0)).xyz;

  vec4 mvPosition = modelViewMatrix * vec4(vPosition + offset, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,

panoball_frag : `
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
`,

beam_frag : `
uniform float time;
uniform sampler2D tex;
varying vec2 vUv;

void main( void ) {
  float t = time;
  vec4 col = texture2D(tex, vec2(vUv.x, vUv.y * 3.0 + time * 2.0));
  col *= vUv.y;
  gl_FragColor = col;
}
`,

};