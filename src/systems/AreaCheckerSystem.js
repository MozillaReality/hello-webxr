import * as THREE from 'three';
import {System} from 'ecsy';
import {Area, AreaInside, AreaExiting, AreaEntering, Object3D, AreaChecker, BoundingBox} from '../components/index.js';

export class AreaCheckerSystem extends System {
  execute(delta, time) {
    const areas = this.queries.areas.results;
    const checkers = this.queries.checkers.results;

    for (let i = 0; i < areas.length; i++) {
      const area = areas[i];
      const bboxArea = area.getComponent(BoundingBox);

      for (let j = 0; j < checkers.length; j++) {
        const checker = checkers[j];
        const obj3D = checker.getComponent(Object3D).value;
        if (obj3D.boundingBox.intersectsBox(bboxArea)) {
          checker.addComponent(AreaInside);
        } else {
          checker.removeComponent(AreaInside);
        }
      }
    }
  }
}

AreaCheckerSystem.queries = {
  areas: {
    components: [Area, BoundingBox],
  },
  checkers: {
    components: [AreaChecker, Object3D]
  }
}