var tempMatrix = new THREE.Matrix4();
var intersected = [];

export default class RayControl {
  addState(name, state, activate) {
    this.states[name] = state;
    state.hit = false;
    state.intersection = null;

    if (activate === true) {
      this.currentStates.push(state);
    }
  }

  activateState(name) {
    if (this.states[name]) {
      this.currentStates.push(this.states[name]);
    }
  }

  deactivateState(name) {
    this.currentStates.splice(this.currentStates.indexOf(name), 1);
  }

  constructor(ctx) {
    this.ctx = ctx;
    this.raycaster = new THREE.Raycaster();
    this.states = {};
    this.currentStates = [];

    this.active = false;
    // this.line = this.createLine(this.data);

    var geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
    var material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    var line = new THREE.Line( geometry, material );
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
    if (evt.target === this.ctx.controllers[0]) {
      this.active = true;
    }

    this.currentStates.forEach(state => {
      if (state.intersection && state.onSelectStart) {
        state.onSelectStart(state.intersection);
      }
    });
  }

  execute(ctx) {
    if (this.currentStates.length === 0) { return; }

    this.currentStates.forEach(state => {
      var controller = ctx.controllers[0];
      var intersections = this.getIntersections(controller, state.colliderMesh);

      if (intersections.length > 0) {
        let intersection = intersections[0]
        state.intersection = intersection;
        state.hit = true;
        state.onHover && state.onHover(intersection, this.active);
        this.line0.scale.z = intersection.distance;
        //return;
      } else {
        if (state.hit && state.onHoverLeave) {
          state.onHoverLeave(state.intersection);
        }
        state.hit = false;
        state.intersection = null;
        this.line0.scale.z = this.rayLength;
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
    if (!this.active) { return; }

    this.currentStates.forEach(state => {
      if (state.hit) {
        state.onSelectEnd && state.onSelectEnd(state.intersection);
        state.hit = false;
      }
    });

    this.active = false;
  }

  createLine(data) {
    return new RayCurve(
      data.type === 'line' ? 2 : data.curveNumberPoints,
      data.curveLineWidth);
  }
}
