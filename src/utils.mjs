
export function newMarker(x, y, z, color){
  const geo = new THREE.SphereBufferGeometry(0.01);
  const mat = new THREE.MeshBasicMaterial({color: color ? color : 0xff0000});
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  return mesh;
}
