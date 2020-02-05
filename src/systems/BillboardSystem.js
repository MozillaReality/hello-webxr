import * as THREE from 'three';
import {System} from 'ecsy';
import {Billboard, Object3D, Children, Text, Position} from '../components/index.js';

const SHOW_DISTANCE = 4;

var cameraPosition = new THREE.Vector3();

export default class BillboardSystem extends System {
  execute(delta, time) {

    window.context.camera.getWorldPosition(cameraPosition);

    this.queries.entities.results.forEach(entity => {
      const object3D = entity.getComponent(Object3D).value;
      const distance = cameraPosition.distanceTo(object3D.position);
      let opacity = 0;

      if (distance < SHOW_DISTANCE){
        opacity = THREE.Math.clamp(Math.sqrt(SHOW_DISTANCE - distance), 0, 1);
        object3D.lookAt(cameraPosition);
      }

      object3D.material.opacity = opacity;
      // panels text parent
      if (entity.hasComponent(Children)) {
        entity.getComponent(Children).value.forEach(children => {
          let prevOpacity = children.getComponent(Text).opacity;
          if (prevOpacity !== opacity) {
            children.getMutableComponent(Text).opacity = opacity;
          }
        });
      }
    });
  }
}

BillboardSystem.queries = {
  entities: {
    components: [Billboard, Object3D]
  }
}
