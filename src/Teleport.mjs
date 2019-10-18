export default class Teleport {
  constructor(ctx, mesh) {
    this.ctx = ctx;
    this.colliderMesh = mesh;
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

    this.active = false;
  }

  onSelectStart() {
    this.active = true;
  }

/*
    let controller = evt.target;

    controller.getWorldPosition(raycasterOrigin);
    controller.getWorldDirection(raycasterDirection);
    raycasterDirection.negate();

    controller.raycaster.set(raycasterOrigin, raycasterDirection);
    var intersects = controller.raycaster.intersectObject(paintings, true);

    if (intersects.length == 0) { return; }

    zoom.painting= intersects[0].object;
    zoom.controller = controller;
    zoom.widget.material = zoom.painting.material;
    zoom.widget.visible = true;
    refreshZoomUV(intersects[0]);
    return true;
  }
*/
  execute(ctx, delta, time) {
    if (!this.active) { return; }

    var raycasterOrigin = new THREE.Vector3();
    var raycasterDirection = new THREE.Vector3();

    var controller = ctx.controllers[0];

    controller.getWorldPosition(raycasterOrigin);
    controller.getWorldDirection(raycasterDirection);
    raycasterDirection.negate();

    controller.raycaster.set(raycasterOrigin, raycasterDirection);
    var intersects = controller.raycaster.intersectObject(this.colliderMesh);

    if (intersects.length === 0) { return; }

    ctx.cameraRig.position.x += 0.5;

  }

  onSelectEnd() {

    const teleportOriginWorldPosition = new THREE.Vector3();
    const newRigLocalPosition = new THREE.Vector3();
    const newHandPosition = [new THREE.Vector3(), new THREE.Vector3()]; // Left and right
    const handPosition = new THREE.Vector3();

    if (!this.active) { return; }
/*
    // Hide the hit point and the curve
    this.active = false;
    this.hitEntity.setAttribute('visible', false);
    this.teleportEntity.setAttribute('visible', false);

    if (!this.hit) {
      // Button released but not hit point
      return;
    }

    const rig = this.data.cameraRig || this.el.sceneEl.camera.el;
    rig.object3D.getWorldPosition(this.rigWorldPosition);
    this.newRigWorldPosition.copy(this.hitPoint);

    // If a teleportOrigin exists, offset the rig such that the teleportOrigin is above the hitPoint
    const teleportOrigin = this.data.teleportOrigin;
    if (teleportOrigin) {
      teleportOrigin.object3D.getWorldPosition(teleportOriginWorldPosition);
      this.newRigWorldPosition.sub(teleportOriginWorldPosition).add(this.rigWorldPosition);
    }

    // Always keep the rig at the same offset off the ground after teleporting
    this.newRigWorldPosition.y = this.rigWorldPosition.y + this.hitPoint.y - this.prevHitHeight;
    this.prevHitHeight = this.hitPoint.y;

    // Finally update the rigs position
    newRigLocalPosition.copy(this.newRigWorldPosition);
    if (rig.object3D.parent) {
      rig.object3D.parent.worldToLocal(newRigLocalPosition);
    }
    rig.setAttribute('position', newRigLocalPosition);

    // If a rig was not explicitly declared, look for hands and mvoe them proportionally as well
    if (!this.data.cameraRig) {
      var hands = document.querySelectorAll('a-entity[tracked-controls]');
      for (var i = 0; i < hands.length; i++) {
        hands[i].object3D.getWorldPosition(handPosition);

        // diff = rigWorldPosition - handPosition
        // newPos = newRigWorldPosition - diff
        newHandPosition[i].copy(this.newRigWorldPosition).sub(this.rigWorldPosition).add(handPosition);
        hands[i].setAttribute('position', newHandPosition[i]);
      }
    }

    this.el.emit('teleported', this.teleportEventDetail);
*/
  }
}
