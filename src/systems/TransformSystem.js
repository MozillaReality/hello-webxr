import {System} from 'ecsy';
import {Object3D, Rotation, Position} from '../components/index.js';

let updateRotation = entity => {
  const rotation = entity.getComponent(Rotation);
  const object3D = entity.getComponent(Object3D).value;
  object3D.rotation.set(rotation.x, rotation.y, rotation.z);
};

let updatePosition = entity => {
  const position = entity.getComponent(Position);
  const object3D = entity.getComponent(Object3D).value;
  object3D.position.copy(position);
};

export default class TransformSystem extends System {
  execute(delta, time) {
    // Position
    this.queries.position.added.forEach(updatePosition);
    this.queries.position.changed.forEach(updatePosition);

    // Rotation
    this.queries.rotation.added.forEach(updateRotation);
    this.queries.rotation.changed.forEach(updateRotation);
  }
}

TransformSystem.queries = {
  position: {
    components: [Position, Object3D],
    listen: {
      added: true,
      changed: true
    }
  },
  rotation: {
    components: [Rotation, Object3D],
    listen: {
      added: true,
      changed: true
    }
  }
}