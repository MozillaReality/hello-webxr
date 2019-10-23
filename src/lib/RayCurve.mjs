/* global THREE */
export default class RayCurve {
  constructor(numPoints, width) {
    this.geometry = new THREE.BufferGeometry();
    this.vertices = new Float32Array(numPoints * 3 * 2);
    this.uvs = new Float32Array(numPoints * 2 * 2);
    this.width = width;

    this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setDynamic(true));

    this.material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: 0xff0000
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.drawMode = THREE.TriangleStripDrawMode;

    this.mesh.frustumCulled = false;
    this.mesh.vertices = this.vertices;

    this.direction = new THREE.Vector3();
    this.numPoints = numPoints;
  }

  setDirection(direction) {
    var UP = new THREE.Vector3(0, 1, 0);
    this.direction
      .copy(direction)
      .cross(UP)
      .normalize()
      .multiplyScalar(this.width / 2);
  }

  setWidth(width) {
    this.width = width;
  }

  setPoint() {
    var posA = new THREE.Vector3();
    var posB = new THREE.Vector3();

    posA.copy(point).add(this.direction);
    posB.copy(point).sub(this.direction);

    var idx = 2 * 3 * i;
    this.vertices[idx++] = posA.x;
    this.vertices[idx++] = posA.y;
    this.vertices[idx++] = posA.z;

    this.vertices[idx++] = posB.x;
    this.vertices[idx++] = posB.y;
    this.vertices[idx++] = posB.z;

    this.geometry.attributes.position.needsUpdate = true;
  }
}
