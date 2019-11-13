import * as THREE from 'three';
import {TagComponent} from '../vendor/ecsy.module.js';

export class ParentObject3D {
  constructor() {
    this.value = null;
  }

  reset() {
    this.value = null;
  }
}

export class Object3D {
  constructor() {
    this.value = null;
  }

  reset() {
    this.value = null;
  }
}

export class Text {
  constructor() {
    this.text = '';
    this.textAlign = 'left'; // ['left', 'right', 'center']
    this.anchor = 'center'; // ['left', 'right', 'center', 'align']
    this.baseline = 'center'; // ['top', 'center', 'bottom']
    this.color = '#FFF';
    this.font = 'https://code.cdn.mozilla.net/fonts/ttf/ZillaSlab-SemiBold.ttf';
    this.fontSize = 0.2;
    this.letterSpacing = 0;
    this.lineHeight = 0;
    this.maxWidth = Infinity;
    this.overflowWrap = 'normal'; // ['normal', 'break-word']
    this.whiteSpace = 'normal'; // ['normal', 'nowrap']
    this.opacity = 1;
  }

  reset() {
    this.text = '';
  }
}

export class BoundingBox {
  constructor() {
    this.min = new THREE.Vector3();
    this.max = new THREE.Vector3();
    // this.box3?
  }

  reset() {
    this.min.set(0,0,0);
    this.max.set(0,0,0);
  }
}

export class BoundingSphere {
  constructor() {
    this.debug = true;
    this.center = new THREE.Vector3();
    this.radius = 0;
    //this.sphere?
  }

  reset() {
    this.center.set(0,0,0);
    this.radius = 0;
  }
}

export class Area {
  constructor() {

  }

  reset() {

  }
}

export class AreaEntering extends TagComponent {}
export class AreaExiting extends TagComponent {}
export class AreaInside extends TagComponent {}

export class AreaChecker {
  constructor() {

  }

  reset() {

  }
}

const empty = () => {};

export class AreaReactor {
  constructor() {
    this.reset();
  }

  reset() {
    this.onEntering = empty;
    this.onExiting = empty;
  }
}

export class DebugHelper extends TagComponent {}
