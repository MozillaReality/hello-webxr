import * as THREE from 'three';
import {System} from 'ecsy';
import {Object3D, ParentObject3D} from '../components/index.js';

export default class HierarchySystem extends System {
  execute(delta, time) {
    this.queries.entities.added.forEach(entity => {
      const parent = entity.getComponent(ParentObject3D).value;
      const object = entity.getComponent(Object3D).value;

      parent.add(object);
    });

    this.queries.entities.changed.forEach(entity => {
      const parent = entity.getComponent(ParentObject3D).value;
      const object = entity.getComponent(Object3D).value;

      parent.add(object);
    });

    this.queries.entities.removed.forEach(entity => {
      const parent = entity.getComponent(ParentObject3D, true).value;
      parent.remove(entity.getComponent(Object3D, true).value);
    });
  }
}

HierarchySystem.queries = {
  entities: {
    components: [Object3D, ParentObject3D],
    listen: {
      added: true,
      removed: true,
      changed: true // [Component]
    }
  }
}
