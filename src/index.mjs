import {loadAssets} from './assetManager.mjs';
//import {World, System} from './vendor/ecsy.module.js';
import * as worldHall from './worldHall.mjs';
import * as worldPanorama from './worldPanorama.mjs';

var clock = new THREE.Clock();

var scene, parent, renderer, camera, controls, context;

var worlds = [
  worldHall,
  worldPanorama
];
var currentWorld = null;

var assets = {
  lightmap_tex: 'lightmap.png',
  travertine_tex: 'travertine.png',
  hall_model: 'hall.gltf',
  pano1: 'zapporthorn.basis'
};

function init() {
  var w = 100;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.005, 10000);
  camera.position.set(0, 1.6, 0);
  controls = new THREE.PointerLockControls(camera);
  document.body.addEventListener('click', () => controls.lock());
  document.body.addEventListener('keydown', ev => {
    switch(ev.keyCode) {
      case 87: controls.moveForward(0.2); break;
      case 65: controls.moveRight(-0.2); break;
      case 83: controls.moveForward(-0.2); break;
      case 68: controls.moveRight(0.2); break;
    }
    if (ev.keyCode - 49 < 9) {
      currentWorld.exit(context);
      currentWorld = worlds[ev.keyCode - 49];
      currentWorld.enter(context);
    }

  });
  scene.add(controls.getObject());

  parent = new THREE.Object3D();
  scene.add(parent);

  renderer = new THREE.WebGLRenderer();
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);

  window.addEventListener('resize', onWindowResize, false);

  context = {
    assets: assets,
    scene : parent,
    renderer: renderer
  };

  loadAssets(renderer, '../assets/', assets, () => {
    worldHall.setup(context);
    worldPanorama.setup(context);

    currentWorld = worlds[0];
    currentWorld.enter(context);

    document.body.appendChild( renderer.domElement );
    renderer.setAnimationLoop(animate);
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  var delta = clock.getDelta();
  var elapsedTime = clock.elapsedTime;
  currentWorld.execute(context, delta, elapsedTime);
  renderer.render( scene, camera );
}

init();
