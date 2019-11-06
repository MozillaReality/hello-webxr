import * as THREE from 'three';
import { Text, Object3D } from '../components/index.js';

var panels = [], panelTexts = [], cameraPosition;

const NUM_PANELS = 13;

const SHOW_DISTANCE = 4;

export function setup(ctx, hall) {
  const assets = ctx.assets;

  for (var i = 0; i < NUM_PANELS; i++) {
    const id = i < 10 ? '0' + i : i;
    panels[i] = hall.getObjectByName('infopanel0'+id);
    cameraPosition = new THREE.Vector3();

    panels[i].geometry.computeBoundingBox();
    const panelWidth = panels[i].geometry.boundingBox.max.x - panels[i].geometry.boundingBox.min.x;
    panels[i].material = new THREE.MeshBasicMaterial({color: 0x040404, transparent: true});

    panelTexts[i] = ctx.world.createEntity();
    panelTexts[i].addComponent(Text, {
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
    panels[i].add(object3D);
    object3D.position.set(-panelWidth / 2 * 0.8, panelWidth / 2 * 0.65, 0.01);
    panelTexts[i].addComponent(Object3D, {value: object3D});
  }
}

export function enter(ctx) {
}

export function execute(ctx, delta, time) {
  cameraPosition.copy(ctx.camera.position).add(ctx.cameraRig.position);

  for (var i = 0; i < NUM_PANELS; i++) {
    const distance = cameraPosition.distanceTo(panels[i].position);
    let opacity = 0;

    if (distance < SHOW_DISTANCE){
      opacity = Math.sqrt(SHOW_DISTANCE - distance);
      panels[i].lookAt(cameraPosition);
    }

    panels[i].material.opacity = opacity;
    panelTexts[i].getMutableComponent(Text).opacity = opacity;
  }
}
