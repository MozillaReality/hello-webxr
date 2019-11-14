import * as THREE from 'three';
import { Text, Position, ParentObject3D } from '../components/index.js';

var panels = [], panelTexts = [], cameraPosition;

const NUM_PANELS = 15;

const SHOW_DISTANCE = 4;

const DATA = [
  {
    title: '360 Panoramas',
    description: 'Photographs wrapped around spheres provide an environment, but without stereo effect nor depth.',
    offsety: 0.04
  },
  {
    title: 'Xylophone Toy',
    description: 'Example of object grabbing and simple interaction.',
    offsety: 0.04
  },
  {
    title: '360 Stereo Panorama',
    description: 'By using one photo for each eye, panoramas can have some depth and stereo effect.',
    offsety: 0.03
  },
  {
    title: 'Photogrammetry Room',
    description: 'Example of an object created out of photographs using an automated software.',
    offsety: 0.04
  },
  {
    title: 'Twitter Feed',
    description: 'Bringing external realtime data to an XR environment.',
    offsety: 0.02
  },
  {
    title: 'Vertigo Room',
    description: 'An example of how this new medium can play with your perception and senses.',
    offsety: 0.04
  },
  {
    title: 'Hello WebXR!',
    description: 'A small compendium of interactions and little experiences introducing and celebrating the final specification of the WebXR API.\n \nMade by the Mozilla Mixed Reality team\nmixedreality.mozilla.org',
    offsety: 0.06
  },
  {
    title: 'The Pink Robe. After the Bath',
    description: 'Joaquín Sorolla, 1916\n208 x 126.5 cm. Oil on canvas.',
  },
  {
    title: 'The Garden of Earthly Delights',
    description: 'Hieronymus Bosch, 1490 - 1510\n205.5 x 384.9 cm. Oil on oak panels.',
  },
  {
    title: 'Self-Portrait',
    description: 'Rembrandt van Rijn, 1659\n84.5 x 66 cm. Oil on canvas.',
  },
  {
    title: 'The Dance Lesson',
    description: 'Edgar Degas, 1879\n38 x 88 cm. Oil on canvas.',
  },
  {
    title: 'Gray Weather, Grande Jatte',
    description: 'Georges Seurat, 1888\n71 x 66 cm. Oil on canvas.',
    offsety: 0.04
  },
  {
    title: 'Sound Room',
    description: 'Showcase of positional audio, very useful on XR experiences.\nTry to find where the sounds come from!.',
    offsety: 0.04
  },
  {
    title: 'Graffiti Wall',
    description: 'Get close and spray the wall!.\nLet\'s collaborate on a full masterpiece.',
    offsety: 0.04
  },
  {
    title: 'Paintings',
    description: 'Real-scale paintings that can be inspected very closely using the controller.',
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
