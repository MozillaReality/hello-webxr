varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main()
{
  vUv = uv;

  vNormal = normalize(normalMatrix * normal);

  vPosition = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
