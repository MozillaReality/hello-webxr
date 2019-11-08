import * as THREE from 'three';
import {System} from '../vendor/ecsy.module.js';
import {Area, AreaInside, AreaExiting, AreaEntering, Object3D, AreaChecker, BoundingBox} from '../components/index.js';

export class ControllersSystem extends System {
  execute(delta, time) {
    const added = this.queries.checkers.added;
    const removed = this.queries.checkers.removed;

    for (let i = 0; i < added.length; i++) {
      const entity = added[i];
      const obj3D = entity.getComponent(Object3D).value;
      obj3D.getObjectByName('Scene').visible = false;
      obj3D.getObjectByName('ColorWheel').visible = true;
    }

    for (let i = 0; i < removed.length; i++) {
      const entity = removed[i];
      const obj3D = entity.getComponent(Object3D).value;
      obj3D.getObjectByName('Scene').visible = true;
      obj3D.getObjectByName('ColorWheel').visible = false;
    }
  }
}

ControllersSystem.queries = {
  checkers: {
    components: [AreaChecker, Object3D, AreaInside],
    listen: {
      added: true,
      removed: true
    }
  }
}
