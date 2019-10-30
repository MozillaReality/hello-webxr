import {rayMaterial} from "./RayControl.js";
import * as THREE from 'three';

var tempMatrix = new THREE.Matrix4();
var intersected = [];

export default class Teleport {
  constructor(ctx, mesh) {
    this.ctx = ctx;

    // Holder for all the
    this.teleportEntity = new THREE.Group();

    this.active = false;

    this.teleportHitGeometry = ctx.assets['teleport_model'].scene.getObjectByName('goal');
    this.teleportHitGeometry.material = rayMaterial;

    this.teleportHitGeometry.renderOrder = 10;

    this.ballColliding = ctx.assets['teleport_model'].scene.getObjectByName('glow');
    ctx.assets['glow_tex'].encoding = THREE.sRGBEncoding;
    this.ballColliding.material = new THREE.MeshBasicMaterial({
      color: 0x00257b,
      map: ctx.assets['glow_tex'],
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.ballColliding.renderOrder = 10;


    this.ballColliding.visible = false;

    this.teleportEntity.add(this.ballColliding);

    this.teleportHitGeometry.visible = false;

    this.teleportHitGeometry.position.set(-2, 0, -2);

    this.teleportEntity.add(this.teleportHitGeometry);

    this.ctx.scene.add(this.teleportEntity);
  }

  onSelectStart(evt) {
    //if (evt.target === this.ctx.controllers[0])
    this.active = true;
  }

  onHoverLeave() {
    this.ballColliding.visible = false;
    this.teleportHitGeometry.visible = false;
  }

  onHover(hitPoint, active) {
    if (active) {
      this.teleportHitGeometry.visible = true;
      this.teleportHitGeometry.position.copy(hitPoint);
      this.hit = true;
      this.ballColliding.visible = false;
    } else {
      this.ballColliding.visible = true;
      this.ballColliding.position.copy(hitPoint);
    }
  }

  onSelectEnd(targetPoint) {

    this.ctx.cameraRig.position.copy(targetPoint);
    this.teleportHitGeometry.visible = false;

    this.active = false;
  }
}

