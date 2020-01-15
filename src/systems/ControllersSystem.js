import * as THREE from 'three';
import {System} from 'ecsy';
import {Area, AreaReactor, AreaInside, AreaExiting, AreaEntering, Object3D, AreaChecker, BoundingBox} from '../components/index.js';

export class ControllersSystem extends System {
  execute(delta, time) {
    const added = this.queries.checkers.added;
    const removed = this.queries.checkers.removed;

    for (let i = 0; i < added.length; i++) {
      const entity = added[i];
      const reactor = entity.getComponent(AreaReactor);
      reactor.onEntering(entity);
    }

    for (let i = 0; i < removed.length; i++) {
      const entity = removed[i];
      const reactor = entity.getComponent(AreaReactor);
      reactor.onExiting(entity);
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
