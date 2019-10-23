import RayCurve from "./RayCurve.mjs";

var tempMatrix = new THREE.Matrix4();
var intersected = [];

export default class Teleport {
  constructor(ctx, mesh) {
    this.ctx = ctx;
    this.raycaster = new THREE.Raycaster();
    this.colliderMesh = mesh;
    this.targetPoint = new THREE.Vector3();
    this.data = {
      type: 'parabolic',
      button: 'trackpad',
      startEvents: [],
      endEvents: [],
      collisionEntities: '',
      hitEntity: '',
      cameraRig: '',
      teleportOrigin: '',
      hitCylinderColor: '#99ff99',
      hitCylinderRadius: 0.25,
      hitCylinderHeight: 0.3,
      interval: 0,
      maxLength: 10,
      curveNumberPoints: 30,
      curveLineWidth: 0.025,
      curveHitColor: '#99ff99',
      curveMissColor: '#ff0000',
      curveShootingSpeed: 5,
      defaultPlaneSize: 100,
      landingNormal: new THREE.Vector3(0, 1, 0),
      landingMaxAngle: 45,
    }

    // Holder for all the
    this.teleportEntity = new THREE.Group();

    this.active = false;
    this.line = this.createLine(this.data);

    this.teleportHitGeometry = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(0.3, 1),
      new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true})
    );

    this.teleportHitGeometry.visible = false;

    this.teleportHitGeometry.position.set(-2, 0, -2);

    this.teleportEntity.add(this.teleportHitGeometry);

    this.ctx.scene.add(this.teleportEntity);

    var geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
    var material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    var line = new THREE.Line( geometry, material );
    line.name = 'line';
    line.scale.z = 5;

    this.line0 = line.clone();
    this.line1 = line.clone();
    this.line0.visible = this.line1.visible = true;

    ctx.controllers[0].add( this.line0 );
    //ctx.controllers[1].add( this.line1 );

  }

  onSelectStart(evt) {
    if (evt.target === this.ctx.controllers[0])
      this.active = true;
  }

  getIntersections( controller ) {

    tempMatrix.identity().extractRotation( controller.matrixWorld );

    this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    return this.raycaster.intersectObject( this.colliderMesh, true, null, true );

  }

  intersectObjects(controller) {
    if ( controller.userData.selected !== undefined ) return;

    var line = controller.getObjectByName( 'line' );
    var intersections = this.getIntersections( controller );

    if ( intersections.length > 0 ) {

      var intersection = intersections[ 0 ];

      var object = intersection.object;
      object.material.emissive.r = 1;
      intersected.push( object );

      line.scale.z = intersection.distance;
      line.material.color.setRGB(1,1,0);

    } else {

      line.scale.z = 5;
      line.material.color.setRGB(1,0,0);

    }
  }

  execute(ctx, delta, time) {
    if (!this.active) { return; }

    //for (var c=0;c<2;c++)
    {
      var controller = ctx.controllers[0];
      var intersections = this.getIntersections(controller);

      if (intersections.length > 0) {
        this.targetPoint.copy(intersections[0].point);
        this.teleportHitGeometry.visible = true;
        this.teleportHitGeometry.position.copy(this.targetPoint);
        this.hit = true;
        return;
      }
    }
  }

  onSelectEnd() {

    const teleportOriginWorldPosition = new THREE.Vector3();
    const newRigLocalPosition = new THREE.Vector3();
    const newHandPosition = [new THREE.Vector3(), new THREE.Vector3()]; // Left and right
    const handPosition = new THREE.Vector3();

    if (!this.active) { return; }

    if (this.hit) {
      this.ctx.cameraRig.position.copy(this.targetPoint);
      this.teleportHitGeometry.visible = false;
    }

    this.active = false;
    this.hit = false;
  }

  createLine(data) {
    return new RayCurve(
      data.type === 'line' ? 2 : data.curveNumberPoints,
      data.curveLineWidth);
  }
}

