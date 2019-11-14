export function newMarker(x, y, z, color){
  const geo = new THREE.SphereBufferGeometry(0.04);
  const mat = new THREE.MeshBasicMaterial({color: color ? color : 0xff0000});
  const mesh = new THREE.Mesh(geo, mat);
  if (typeof x === 'object') {
    mesh.position.copy(x);
  } else {
    mesh.position.set(x, y, z);
  }
  return mesh;
}

export function angleBetween(point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

