import * as THREE from 'three';

var tempMatrix = new THREE.Matrix4();
var intersected = [];
export var rayMaterial;

export default class RayControl {
  enable() {
    this.line0.visible = this.line1.visible = true;
    this.enabled = true;
  }

  disable() {
    this.line0.visible = this.line1.visible = false;
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
    }
  }

  deactivateAll(name) {
    this.currentStates = [];
  }

  deactivateState(name) {
    this.currentStates.splice(this.currentStates.indexOf(name), 1);
  }

  constructor(ctx) {
    this.ctx = ctx;
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

    ctx.controllers[0].add( this.line0 );
    //ctx.controllers[1].add( this.line1 );
  }

  onSelectStart(evt) {
    if (!this.enabled) { return; }

    let controller = evt.target;
    if (controller === this.ctx.controllers[0]) {
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

    this.currentStates.forEach(state => {
      var controller = ctx.controllers[0];
      var intersections = this.getIntersections(controller, state.colliderMesh);

      if (intersections.length > 0) {
        let intersection = intersections[0]
        state.intersection = intersection;
        state.hit = true;
        state.onHover && state.onHover(intersection, this.active, controller);
        this.line0.scale.z = Math.min(intersection.distance, 1);
        //return;
      } else {
        if (state.hit && state.onHoverLeave) {
          state.onHoverLeave(state.intersection, this.active, controller);
        }
        state.hit = false;
        state.intersection = null;
        this.line0.scale.z = Math.min(this.rayLength, 1);
      }
    });
  }

  getIntersections( controller, colliderMesh ) {

    tempMatrix.identity().extractRotation( controller.matrixWorld );

    this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
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
