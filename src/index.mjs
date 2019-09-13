import {WEBVR} from './vendor/WebVR.js';
import {loadAssets} from './assetManager.mjs';
//import {World, System} from './vendor/ecsy.module.js';
import * as worldHall from './worldHall.mjs';
import * as worldPanorama from './worldPanorama.mjs';

var clock = new THREE.Clock();

var scene, parent, renderer, camera, controls, context;
var controller1, controller2;

var worlds = [
  worldHall,
  worldPanorama
];
var currentWorld = null;

var assets = {
  lightmap_tex: 'lightmap.png',
  travertine_tex: 'travertine.png',
  hall_model: 'hall.gltf',
  pano1: 'zapporthorn.basis',
  pano1small: 'zapporthorn_small.basis'
};

function gotoWorld(world) {
  currentWorld.exit(context);
  currentWorld = world;
  currentWorld.enter(context);
}

function init() {
  var w = 100;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.005, 10000);
  camera.position.set(0, 1.6, 0);
  camera.position.set(1.5, 1.6, 2.3); //near pano1
  controls = new THREE.PointerLockControls(camera);
  document.body.addEventListener('click', () => controls.lock());
  document.body.addEventListener('keydown', ev => {
    switch(ev.keyCode) {
      case 87: controls.moveForward(0.2); break;
      case 65: controls.moveRight(-0.2); break;
      case 83: controls.moveForward(-0.2); break;
      case 68: controls.moveRight(0.2); break;
    }
    const n = ev.keyCode - 49;
    if (n <= 9 && n >= 0) {
      gotoWorld(worlds[n]);
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
  renderer.vr.enabled = true;

  window.addEventListener('resize', onWindowResize, false);

  context = {
    assets: assets,
    scene : parent,
    renderer: renderer,
    camera: camera
  };

  controller1 = renderer.vr.getController(0);
  scene.add(controller1);
  controller1.add(new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.05, 15, 10),
    new THREE.MeshLambertMaterial({color: 0xff0000})
  ));

  //controller1.addEventListener('selectstart', onSelectStart);
  //controller1.addEventListener('selectend', onSelectEnd);

  controller2 = renderer.vr.getController(1);
  scene.add(controller2);
  controller2.add(new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.05, 15, 10),
    new THREE.MeshLambertMaterial({color: 0x0000ff})
  ));
  //controller2.addEventListener('selectstart', onSelectStart);
  //controller2.addEventListener('selectend', onSelectEnd);

  loadAssets(renderer, '../assets/', assets, () => {
    worldHall.setup(context);
    worldPanorama.setup(context);

    currentWorld = worlds[0];
    currentWorld.enter(context);

    document.body.appendChild( renderer.domElement );
    document.body.appendChild(WEBVR.createButton(renderer));
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
  context.goto = null;
  currentWorld.execute(context, delta, elapsedTime);
  renderer.render( scene, camera );
  if (context.goto !== null) {
    gotoWorld(context.goto == 'panorama'? worldPanorama : worldHall);
  }
}

init();
