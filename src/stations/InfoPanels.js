import * as THREE from 'three';
import { Text, Object3D } from '../components/index.js';

var panel, panelText, cameraPosition;

export function setup(ctx, hall) {
  const assets = ctx.assets;

  panel = hall.getObjectByName('infopanel');
  cameraPosition = new THREE.Vector3();

  panel.geometry.computeBoundingBox();
  const panelWidth = panel.geometry.boundingBox.max.x - panel.geometry.boundingBox.min.x;
  panel.material = new THREE.MeshBasicMaterial({color: 0x040404, transparent: true});

  panelText = ctx.world.createEntity();
  panelText.addComponent(Text, {
    color: '#ffffff', //0xdaa056,
    fontSize: 0.05,
    anchor: 'left',
    textAlign: 'left',
    baseline: 'top',
    maxWidth: panelWidth * 0.8,
    lineHeight: 1.3,
    text: '360 PANORAMAS\n \nPhotos wrapped around spheres,\nno stereo effect.',
  });
  let object3D = new THREE.Group();
  panel.add(object3D);
  object3D.position.set(-panelWidth / 2 * 0.8, panelWidth / 2 * 0.65, 0.01);
  panelText.addComponent(Object3D, {value: object3D});

/*
  ctx.raycontrol.addState('panoballs', {
    colliderMesh: panoballsParent,
    onHover: (intersection, active, controller) => {
      intersection.object.userData.selected = 1;
    },
    onHoverLeave: (intersection) => {
      intersection.object.userData.selected = 0;
    },
    onSelectStart: (intersection, controller) => {
    },
    onSelectEnd: (intersection) => {
      ctx.goto = intersection.object.userData.panoId;
    }
  });
  */
}

export function enter(ctx) {
  //ctx.raycontrol.activateState('panoballs');
}

export function execute(ctx, delta, time) {
  cameraPosition.copy(ctx.camera.position).add(ctx.cameraRig.position);

  const distance = cameraPosition.distanceTo(panel.position);
  let opacity = 0;

  if (distance < 2){
    opacity = Math.sqrt(2 - distance);
    panel.lookAt(cameraPosition);
  }

  panel.material.opacity = opacity;
  panelText.getMutableComponent(Text).opacity = opacity;
}
