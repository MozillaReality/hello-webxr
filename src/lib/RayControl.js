import * as THREE from 'three';

var tempMatrix = new THREE.Matrix4();
var intersected = [];
export var rayMaterial;

export default class RayControl {
  enable() {
    this.setLineStyle(this.previousLineStyle);
    this.enabled = true;
  }

  _sort() {
    this.currentStates = this.currentStates.sort((a,b) => {
      let pa = a.order || 0;
      let pb = b.order || 0;
      return pa - pb;
    });
  }

  disable() {
    this.lineBasic.visible = this.line0.visible = this.line1.visible = false;
    this.enabled = false;
    this.active = false;
  }

  addState(name, state, activate) {
    if (this.states[name]) {
      console.error(`RayControl state '${name}' already exist, please use a different name.`);
      return;
    }
    this.states[name] = state;
    state.hit = false;
    state.intersection = null;

    if (activate === true) {
      this.currentStates.push(state);
    }

    return state;
  }

  activateState(name) {
    if (this.states[name]) {
      this.currentStates.push(this.states[name]);
      this._sort();
    }
  }

  deactivateAll(name) {
    this.currentStates = [];
  }

  deactivateState(name) {
    this.currentStates.splice(this.currentStates.indexOf(name), 1);
    this._sort();
  }

  constructor(ctx) {
    this.ctx = ctx;
    this.previousLineStyle = 'pretty';
    this.exclusiveMode = true; // it wil return on first hit
    this.enabled = true;
    this.raycaster = new THREE.Raycaster();
    this.states = {};
    this.currentStates = [];

    this.active = false;

    var line = ctx.assets['teleport_model'].scene.getObjectByName('beam');

    ctx.assets['beam_tex'].wrapT = THREE.RepeatWrapping;
    ctx.assets['beam_tex'].wrapS = THREE.RepeatWrapping;
    rayMaterial = line.material = new THREE.ShaderMaterial({
      uniforms: {
        time: {value: 0},
        active: {value: 0},
        tex: {value: ctx.assets['beam_tex']}
      },
      vertexShader: ctx.shaders.basic_vert,
      fragmentShader: ctx.shaders.beam_frag,
      blending: THREE.AdditiveBlending
    });

    line.renderOrder = 10;


    line.name = 'line';
    this.rayLength = 5;
    line.scale.z = this.rayLength;

    this.line0 = line.clone();
    this.line1 = line.clone();
    this.line0.visible = this.line1.visible = true;

    let raycasterContext = new THREE.Group();
    raycasterContext.add(this.line0);
    raycasterContext.name = 'raycasterContext';

    //ctx.controllers[1].add( this.line0 );
    ctx.controllers[1].add( raycasterContext );

    var geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    this.lineBasic = new THREE.Line( geometry );
    this.lineBasic.name = 'line';
    this.lineBasic.scale.z = 5;
    this.lineBasic.visible = false;
    raycasterContext.add(this.lineBasic);
  }

  setLineStyle(lineStyle) {
    const basic = lineStyle === 'basic';
    this.lineBasic.visible = basic;
    this.line0.visible = !basic;
    this.previousLineStyle = lineStyle;
  }

  onSelectStart(evt) {
    if (!this.enabled) { return; }

    let controller = evt.target;
    if (controller === this.ctx.controllers[1]) {
      this.active = true;

      this.currentStates.forEach(state => {
        if (state.intersection && state.onSelectStart) {
          state.onSelectStart(state.intersection, controller);
        }
      });
    }
  }

  execute(ctx, delta, time) {
    if (!this.enabled || this.currentStates.length === 0) { return; }

    rayMaterial.uniforms.time.value = time;

    let firstHit = false;

    for (var i = 0; i < this.currentStates.length; i++) {
      let state = this.currentStates[i];
      var controller = ctx.controllers[1];
      var intersections = this.getIntersections(controller, state.colliderMesh);

      if (intersections.length > 0) {
        let intersection = intersections[0]

        if (!this.exclusiveMode || !firstHit) {
          state.intersection = intersection;
          state.hit = true;
          if (state.lineStyleOnIntersection) {
            this.setLineStyle(state.lineStyleOnIntersection);
          } else {
            this.setLineStyle('advanced');
          }
          state.onHover && state.onHover(intersection, this.active, controller);
          this.line0.scale.z = Math.min(intersection.distance, 1);
          this.lineBasic.scale.z = Math.min(intersection.distance, 1);
        }

        firstHit = true;
      } else {
        if (state.hit && state.onHoverLeave) {
          state.onHoverLeave(state.intersection, this.active, controller);
        }
        state.hit = false;
        state.intersection = null;
      }
    }

    if (!firstHit) {
      this.line0.scale.z = Math.min(this.rayLength, 1);
      this.lineBasic.scale.z = Math.min(this.rayLength, 1);
    }
  }

  getIntersections( controller, colliderMesh ) {

    let raycasterContext = controller.getObjectByName('raycasterContext');

    tempMatrix.identity().extractRotation( raycasterContext.matrixWorld );

    this.raycaster.ray.origin.setFromMatrixPosition( raycasterContext.matrixWorld );
    this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    if (Array.isArray(colliderMesh)) {
      return this.raycaster.intersectObjects( colliderMesh, true);
    } else {
      return this.raycaster.intersectObject( colliderMesh, true);
    }
  }

  onSelectEnd() {
    if (!this.enabled || !this.active) { return; }

    this.currentStates.forEach(state => {
      if (state.hit) {
        state.onSelectEnd && state.onSelectEnd(state.intersection);
        state.hit = false;
      }
    });

    this.active = false;
  }
}
