import * as THREE from 'three';
import { Children, Object3D, Billboard, Text, Position, ParentObject3D } from '../components/index.js';
import INFO_DATA from './InfoPanelsData.js';

var panels = [], panelTexts = [], panelsEntity = [];

export function setup(ctx, hall) {
  for (var i = 0; i < INFO_DATA.length; i++) {
    const id = i < 10 ? '0' + i : i;
    panels[i] = hall.getObjectByName('infopanel0'+id);
    panels[i].geometry.computeBoundingBox();
    const panelWidth = panels[i].geometry.boundingBox.max.x - panels[i].geometry.boundingBox.min.x;
    const panelHeight = panels[i].geometry.boundingBox.max.y - panels[i].geometry.boundingBox.min.y;
    const offsety = INFO_DATA[i].offsety || 0;
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
        text: INFO_DATA[i].title + '\n \n' + INFO_DATA[i].description,
      })
      .addComponent(ParentObject3D, {value: panels[i]})
      .addComponent(Position, {x: -panelWidth / 2 * 0.82, y: panelHeight / 2 * 0.65 + offsety, z: 0.01})

      panelsEntity[i] = ctx.world.createEntity();
      panelsEntity[i]
        .addComponent(Object3D, {value: panels[i]})
        .addComponent(Billboard, {camera3D: ctx.camera})
        .addComponent(Children, {value: [panelTexts[i]]});

  }
}

export function enter(ctx) {}
export function execute(ctx, delta, time) {}
