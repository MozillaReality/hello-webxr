import * as THREE from 'three';
import EventDispatcher from './EventDispatcher.js';

var tempMatrix = new THREE.Matrix4();
export var rayMaterial;
const validStateController = [
  "primary",
  "secondary",
  "both",
  "left",
  "right"
];

export default class RayControl extends EventDispatcher {
  enable() {
    this.setLineStyle(this.previousLineStyle);
    this.enabled = true;
  }

  _sort() {
    this.currentStates = this.currentStates.sort((a,b) => {
      let pa = a.order || 0;
      let pb = b.order || 0;
      return pa - pb;
    });
  }

  disable() {
    this.lineBasic.visible = this.line0.visible = false;
    this.enabled = false;
    this.controllers.forEach(controller => controller.active = false);
  }

  changeHandedness(primary) {
    if (primary !== this.primary) {
      this.primary = primary;
      this.secondary = primary === "right" ? "left" : "right";

      this.dispatchEvent("handednessChanged", {primary: this.primary, secondary: this.secondary});
    }
  }

  addState(name, state, activate) {
    if (this.states[name]) {
      console.error(`RayControl state '${name}' already exist, please use a different name.`);
      return;
    }

    state.name = name;

    if (typeof state.raycaster === "undefined") {
      state.raycaster = true;
    }

    if (typeof state.controller === "undefined") {
      state.controller = "primary";
    } else if (!validStateController.includes(state.controller)) {
      console.warn("Invalid controller selector:", state.controller);
      state.controller = "primary";
    }

    this.states[name] = state;

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
    this.controllers.forEach(c => {
      this.currentStates.forEach(s => {
        if (c.intersections[s.name]) {
          c.intersections[s.name] = null;
        }
      });
    });
  }

  deactivateState(name) {
    this.currentStates.splice(this.currentStates.indexOf(name), 1);
    this.controllers.forEach(c => {
      if (c.intersections[name]) {
        c.intersections[name] = null;
      }
    });

    this._sort();
  }

  addController(controller, inputSource) {
    let controllerData = {
      controller: controller,
      inputSource: inputSource,
      active: false,
      stateHit: {},
      intersections: {},
      currentIntersection: null,
      hit: false
    };

    this.controllers.push(controllerData);

    if (this.matchController(controllerData, "primary")) {
      controller.add( this.raycasterContext );
    }

    this.dispatchEvent("controllerConnected", controllerData);
  }

  removeController(controller) {
    const index = this.controllers.findIndex(controllerData => controllerData.controller === controller);
    const controllerData = this.controllers.find(controllerData => controllerData.controller === controller)
    this.controllers.splice(index, 1);
    this.dispatchEvent("controllerDisconnected", controllerData);
  }

  constructor(ctx, primary) {
    super();
    this.ctx = ctx;

    if (typeof primary === "undefined") {
      this.primary = "right";
      this.secondary = "left";
    } else {
      this.primary = primary;
      this.secondary = primary === "right" ? "left" : "right";
    }

    this.controllers = [];

    this.previousLineStyle = 'pretty';
    this.enabled = true;
    this.raycaster = new THREE.Raycaster();
    this.states = {};
    this.currentStates = [];

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
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    line.renderOrder = 10;

    line.name = 'line';
    this.rayLength = 5;
    line.scale.z = this.rayLength;

    this.line0 = line.clone();
    this.line0.visible = true;

    this.raycasterContext = new THREE.Group();
    this.raycasterContext.add(this.line0);
    this.raycasterContext.name = 'raycasterContext';

    var geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    this.lineBasic = new THREE.Line( geometry );
    this.lineBasic.name = 'line';
    this.lineBasic.scale.z = 5;
    this.lineBasic.visible = false;
    this.raycasterContext.add(this.lineBasic);
  }

  setLineStyle(lineStyle) {
    const basic = lineStyle === 'basic';
    this.lineBasic.visible = basic;
    this.line0.visible = !basic;
    this.previousLineStyle = lineStyle;
  }

  /*
  selector could be: left, right, both, primary, secondary
  */
  matchController(controllerData, selector) {
    const handedness = controllerData.inputSource.handedness;

    return (
      (selector === handedness)  ||
      (selector === "both" && (handedness === "right" || handedness === "left")) ||
      (selector === "primary" && this.primary === handedness) ||
      (selector === "secondary" && this.secondary === handedness)
    );
  }

  onSelectStart(evt) {
    if (!this.enabled) { return; }

    let controller = evt.target;
    let controllerData = this.controllers.find(c => c.controller === controller);
    if (controllerData) {
      controllerData.active = true;
      if (controllerData.currentIntersection) {
        const state = controllerData.currentIntersection.state;
        if (state.onSelectStart) {
          state.onSelectStart(controllerData.currentIntersection.intersection, controllerData.controller);
        }
      }

      // Check no raycaster states
      this.currentStates.forEach(state => {
        if (state.onSelectStart && !state.raycaster) {
          state.onSelectStart(controllerData.intersections[state.name], controller);
        }
      });
    }
  }

  execute(ctx, delta, time) {
    if (!this.enabled || this.currentStates.length === 0) { return; }

    rayMaterial.uniforms.time.value = time;

    let firstHit = false;

    var stateIntersections = {};
    for (var c = 0; c < this.controllers.length; c++) {
      let controllerData = this.controllers[c];

      for (var i = 0; i < this.currentStates.length; i++) {
        let state = this.currentStates[i];
        if (!state.raycaster) {
          continue;
        }

        // Check if this controller should be active on this state
        if (!this.matchController(controllerData, state.controller)) {
          continue;
        }

        let controller = controllerData.controller;
        let active = controllerData.active;
        let intersections = this.getIntersections(controller, state.colliderMesh);

        if (intersections.length > 0) {
          // Use just the closest object
          controllerData.intersections[state.name] = intersections[0];
          controllerData.stateHit[state.name] = true;
        } else {
          controllerData.intersections[state.name] = null;
        }
      }
    }

    this.line0.scale.z = Math.min(this.rayLength, 1);
    this.lineBasic.scale.z = Math.min(this.rayLength, 1);

    // For each controller, find the closest intersection from all the states
    for (var c = 0; c < this.controllers.length; c++) {
      let controllerData = this.controllers[c];
      let intersections = Object.entries(controllerData.intersections).filter(i => i[1] !== null);
      if (intersections.length > 0) {

        intersections.sort((a,b) => {
          return a[1].distance - b[1].distance;
        });

        const intersectionData = intersections[0];
        const intersection = intersectionData[1];
        const state = this.states[intersectionData[0]];

        controllerData.prevIntersection = controllerData.currentIntersection;
        controllerData.currentIntersection = {
          state, intersection
        };

        if (state.lineStyleOnIntersection) {
          this.setLineStyle(state.lineStyleOnIntersection);
        } else {
          this.setLineStyle('advanced');
        }

        state.onHover && state.onHover(intersection, controllerData.active, controllerData.controller);
        this.line0.scale.z = Math.min(intersection.distance, 1);
        this.lineBasic.scale.z = Math.min(intersection.distance, 1);
      } else {
        controllerData.currentIntersection = null;
      }
    }

    // Handle onHoverLeave
    for (var c = 0; c < this.controllers.length; c++) {
      let controllerData = this.controllers[c];
      if (!controllerData.prevIntersection) {
        continue;
      }

      // If we can't find the previous intersection currently enabled, we should emit hoverLeave
      if (!this.controllers.find(c => {
        let prev = controllerData.prevIntersection;
        let current = c.currentIntersection;
        return current && prev.state.name === current.state.name &&
          prev.intersection.object === current.intersection.object;
      }
        )) {
        controllerData.prevIntersection.state.onHoverLeave(
          controllerData.prevIntersection.intersection,
          false,
          controllerData.controller
        );

        controllerData.prevIntersection = null;
      }
    }
  }

  getIntersections( controller, colliderMesh ) {
    let raycasterContext = controller.getObjectByName('raycasterContext');
    if (!raycasterContext) {
      console.warn('No raycasterContext found for this controller', controller);
      return [];
    }

    tempMatrix.identity().extractRotation( raycasterContext.matrixWorld );

    this.raycaster.ray.origin.setFromMatrixPosition( raycasterContext.matrixWorld );
    this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    if (Array.isArray(colliderMesh)) {
      return this.raycaster.intersectObjects( colliderMesh, true);
    } else {
      return this.raycaster.intersectObject( colliderMesh, true);
    }
  }

  onSelectEnd(evt) {
    if (!this.enabled) { return; }

    let controllerData = this.controllers.find(c => c.controller === evt.target)
    if (!controllerData || !controllerData.active) { return; }

    if (controllerData) {
      if (controllerData.currentIntersection) {
        const state = controllerData.currentIntersection.state;
        if (state.onSelectEnd) {
          state.onSelectEnd(controllerData.currentIntersection.intersection, controllerData.controller);
        }
      }

      // Check no raycaster states
      this.currentStates.forEach(state => {
        if (state.onSelectEnd && !state.raycaster) {
          state.onSelectEnd(null, controllerData.controller);
        }
      });
    }

    controllerData.active = false;
  }
}
