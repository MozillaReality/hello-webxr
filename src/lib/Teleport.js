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

    // sounds
    this.startSound = new THREE.Audio(ctx.audioListener);
    this.startSound.setBuffer(ctx.assets['teleport_a_snd']);
    this.startSound.setLoop(true);
    this.startSound.pause();

    this.endSound = new THREE.Audio(ctx.audioListener);
    this.endSound.setBuffer(ctx.assets['teleport_b_snd']);
    this.endSound.setLoop(false);
    this.endSound.pause();
  }


  onSelectStart(evt) {
    //if (evt.target === this.ctx.controllers[0])
    this.active = true;
    this.endSound.pause();
    this.startSound.play();
  }

  onHoverLeave() {
    this.ballColliding.visible = false;
    this.teleportHitGeometry.visible = false;
    this.startSound.pause();
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
    const headPosition = this.ctx.renderer.xr.getCamera(this.ctx.camera).position;
    const offset = targetPoint.sub(headPosition);
    offset.y = 0; // We don't want to change height to floor's level

    this.ctx.cameraRig.position.add(offset);
    this.teleportHitGeometry.visible = false;

    this.active = false;

    this.startSound.pause();
    this.endSound.play();
  }
}

