import {Matrix4, Vector3} from 'three';

const SNAP_TURN_DEGREES = 45;

const doSnapTurn = (() => {
  const transform = new Matrix4();
  const invTranslation = new Matrix4();
  const rotation = new Matrix4();
  const yAxis = new Vector3(0, 1, 0);

  return (context, direction) => {
    const headPosition = context.renderer.xr.getCamera(context.camera).position;

    invTranslation.makeTranslation(-headPosition.x, 0, -headPosition.z);
    rotation.makeRotationAxis(yAxis, direction * SNAP_TURN_DEGREES * Math.PI / 180);

    transform.makeTranslation(headPosition.x, 0, headPosition.z);
    transform.multiply(rotation);
    transform.multiply(invTranslation);

    context.cameraRig.applyMatrix(transform);
  };
})();

export default class SnapTurn {
  constructor(context) {
    this.gamepads = [];
    this.snapTurning = false;
  }
  addController(controller, inputSource) {
    if (!this.gamepads.includes(inputSource.gamepads)) {
      this.gamepads.push(inputSource.gamepad);
    }
  }
  removeController(controller, inputSource) {
    const index = this.gamepads.indexOf(inputSource.gamepads)
    if (index !== -1) {
      this.gamepads.splice(index, 1);
    }
  }
  execute(context, delta, elapsedTime) {
    let anySnapTurning = false;
    for (let i = 0; i < this.gamepads.length; i++) {
      const gamepad = this.gamepads[i];

      if (!gamepad.connected || gamepad.mapping !== "xr-standard") continue;

      if (gamepad.axes[2] > 0.75) {
        if (!this.snapTurning) {
          doSnapTurn(context, -1);
          this.snapTurning = true;
        }
        anySnapTurning = true;
        break;
      } 

      if (gamepad.axes[2] < -0.75) {
        if (!this.snapTurning) {
          doSnapTurn(context, 1);
          this.snapTurning = true;
        }
        anySnapTurning = true;
        break;
      } 
    }
    if (!anySnapTurning) {
      this.snapTurning = false;
    }
  }
}
