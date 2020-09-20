import * as THREE from 'three';

const PATH_TIME = 3; // 3 secs per path

var slideshow = {};

slideshow.paths = [
  //'hall'
  [
    {
      from: new THREE.Vector3(0, 1.6, 0),
      lookAt: new THREE.Vector3(0, 1, -100),
      velocity: new THREE.Vector3(0, 0, -0.1),
      angularVelocity: new THREE.Vector3(0.04, 0, 0)
    },
    {
      from: new THREE.Vector3(4.5, 1.6, -3),
      lookAt: new THREE.Vector3(100, 0, 0),
      velocity: new THREE.Vector3(0, 0, -0.15),
      angularVelocity: new THREE.Vector3(0, 0, 0)
    },
    {
      from: new THREE.Vector3(0, 1.6, 0),
      lookAt: new THREE.Vector3(50, 0, -40),
      velocity: new THREE.Vector3(0, 0.12, 0),
      angularVelocity: new THREE.Vector3(0, 0.1, 0)
    },
    {
      from: new THREE.Vector3(3, 2.4, -4),
      lookAt: new THREE.Vector3(-50, 0, 40),
      velocity: new THREE.Vector3(0, -0.12, 0),
      angularVelocity: new THREE.Vector3(0, -0.1, 0)
    }
  ],
  //'sound'
  [
    {
      from: new THREE.Vector3(0, 1.6, 0),
      lookAt: new THREE.Vector3(0, 0, -100),
      velocity: new THREE.Vector3(0.1, 0, 0.1),
      angularVelocity: new THREE.Vector3(0, 0.01, 0)
    },
  ],
  //'photogrammetry'
  [
    {
      from: new THREE.Vector3(0, 1.2, 0.8),
      lookAt: new THREE.Vector3(-100, 0.5, 0),
      velocity: new THREE.Vector3(0, 0, -0.2),
      angularVelocity: new THREE.Vector3(0, 0, 0)
    },
    {
      from: new THREE.Vector3(-1, 1, -1.6),
      lookAt: new THREE.Vector3(-40, 0, 100),
      velocity: new THREE.Vector3(-0.05, 0, 0),
      angularVelocity: new THREE.Vector3(0, 0, 0)
    }
  ],
  //'vertigo'
  [
    {
      from: new THREE.Vector3(0, 1.6, 0),
      lookAt: new THREE.Vector3(0, 0, -10),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(-0.01, 0.07, 0)
    },
    {
      from: new THREE.Vector3(0, 1.6, -0.4),
      lookAt: new THREE.Vector3(0, 0, 6),
      velocity: new THREE.Vector3(0, 0, 0.1),
      angularVelocity: new THREE.Vector3(0.07, 0, 0)
    }
  ],
  //'panoramastereo'
  [
    {
      from: new THREE.Vector3(0, 0, 0),
      lookAt: new THREE.Vector3(-100, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(0.03, 0.05, 0)
    }
  ],
  //'panorama1'
  [
  ],
  //'panorama2'
  [
      {
      from: new THREE.Vector3(0, 0, 0),
      lookAt: new THREE.Vector3(-100, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(0.01, 0.1, 0)
    }
  ],
  //'panorama3'
  [
  ],
  //'panorama4'
  [
    {
      from: new THREE.Vector3(0, 0, 0),
      lookAt: new THREE.Vector3(-100, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(-0.07, -0.05, 0)
    }
  ],
  //'panorama5'
  [
    {
      from: new THREE.Vector3(0, 0, 0),
      lookAt: new THREE.Vector3(100, 0, 80),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(0, -0.02, 0)
    }
  ]
];

slideshow.setup = function (context) {
  this.room = undefined;
  this.path = undefined;
  this.next(context);
  context.camera.position.set(0, 1.6, 0);
  context.cameraRig.position.set(0, 0, 2);
  context.goto = this.room;
};

slideshow.next = function (context) {
  this.time = PATH_TIME + Math.random() * PATH_TIME / 2;
  if (this.room === undefined) {
    this.room = 0;
    this.path = 0;
  } else {
    this.path ++;
    if (this.path >= this.paths[this.room].length){
      // find next room with paths
      do {
        this.room ++;
        if (this.room >= this.paths.length) {
          this.room = 0;
          context.cameraRig.position.set(0, 0, 2);
        }
      } while (!this.paths[this.room].length);
      var camera = context.renderer.xr.getCamera(context.camera);
      camera.position.set(0, 1.6, 0);
      context.goto = this.room;
      this.path = 0;
    }
  }
  this.reset = true;
};

slideshow.execute = function (context, delta, time) {
  const path = this.paths[this.room][this.path];
  if (this.reset) {
    this.reset = false;
    // init camera settings
    context.camera.position.copy(path.from);
    context.camera.rotation.set(0, 0, 0);
    context.camera.lookAt(path.lookAt);
  }
  context.camera.position.addScaledVector(path.velocity, delta);
  context.camera.rotation.x += path.angularVelocity.x * delta;
  context.camera.rotation.y += path.angularVelocity.y * delta;
  context.camera.rotation.z += path.angularVelocity.z * delta;
  this.time -= delta;
  if (this.time < 0) {
    this.next(context);
  }
};

export {slideshow};
