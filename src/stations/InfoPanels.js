import * as THREE from 'three';
import { Text, Position, ParentObject3D } from '../components/index.js';

var panels = [], panelTexts = [], cameraPosition;

const NUM_PANELS = 15;

const SHOW_DISTANCE = 4;

const DATA = [
  {
    title: '360 Panoramas',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.04
  },
  {
    title: 'Xylophone Toy',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.04
  },
  {
    title: '360 Stereo Panorama',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.03
  },
  {
    title: 'Photogrammetry Room',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.04
  },
  {
    title: 'Twitter Feed',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.02
  },
  {
    title: 'Vertigo Room',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.04
  },
  {
    title: 'Hello WebXR!',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.06
  },
  {
    title: 'The Pink Robe. After the Bath',
    description: '0123456789asdñlfkj,asdlfk',
  },
  {
    title: 'The Garden of Earthly Delights',
    description: '0123456789asdñlfkj,asdlfk',
  },
  {
    title: 'Self-Portrait',
    description: '0123456789asdñlfkj,asdlfk',
  },
  {
    title: 'The Dance Lesson',
    description: '0123456789asdñlfkj,asdlfk',
  },
  {
    title: 'Gray Weather, Grande Jatte',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.04
  },
  {
    title: 'Sound Room',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.04
  },
  {
    title: 'Graffiti Wall',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.04
  },
  {
    title: 'Paintings',
    description: '0123456789asdñlfkj,asdlfk',
    offsety: 0.04
  },
];

export function setup(ctx, hall) {
  const assets = ctx.assets;

  for (var i = 0; i < NUM_PANELS; i++) {
    const id = i < 10 ? '0' + i : i;
    panels[i] = hall.getObjectByName('infopanel0'+id);
    cameraPosition = new THREE.Vector3();

    panels[i].geometry.computeBoundingBox();
    const panelWidth = panels[i].geometry.boundingBox.max.x - panels[i].geometry.boundingBox.min.x;
    const panelHeight = panels[i].geometry.boundingBox.max.y - panels[i].geometry.boundingBox.min.y;
    const offsety = DATA[i].offsety || 0;
    panels[i].material = new THREE.MeshBasicMaterial({color: 0x040404, transparent: true});

    panelTexts[i] = ctx.world.createEntity();
    panelTexts[i]
      .addComponent(Text, {
        color: '#ffffff', //0xdaa056,
        fontSize: 0.05,
        anchor: 'left',
        textAlign: 'left',
        baseline: 'top',
        maxWidth: panelWidth * 0.8,
        lineHeight: 1.3,
        text: DATA[i].title + '\n \n' + DATA[i].description,
      })
      .addComponent(ParentObject3D, {value: panels[i]})
      .addComponent(Position, {x: -panelWidth / 2 * 0.82, y: panelHeight / 2 * 0.65 + offsety, z: 0.01});
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
    let prevOpacity = panelTexts[i].getComponent(Text).opacity;
    if (prevOpacity !== opacity) {
      panelTexts[i].getMutableComponent(Text).opacity = opacity;
    }
  }
}
