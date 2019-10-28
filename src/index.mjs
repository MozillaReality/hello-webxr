import './vendor/PointerLockControls.js';
import {WEBVR} from './vendor/WebVR.js';
import {loadAssets} from './lib/assetManager.mjs';
import './vendor/BasisTextureLoader.js';


import RayControl from './lib/RayControl.mjs';
import Teleport from './lib/Teleport.mjs';

import * as worldHall from './worlds/Hall.mjs';
import * as worldPanorama from './worlds/Panorama.mjs';
import * as worldPanoramaStereo from './worlds/PanoramaStereo.mjs';
import * as worldPhotogrammetryObject from './worlds/PhotogrammetryObject.mjs';
import * as worldVertigo from './worlds/Vertigo.mjs';
import * as worldSound from './worlds/Sound.mjs';

import {shaders} from './lib/shaders.mjs';

var clock = new THREE.Clock();

var scene, parent, renderer, camera, controls, context;
var controller1, controller2, raycontrol, teleport;

var worlds = [
  worldHall,
  worldSound,
  worldPhotogrammetryObject,
  worldVertigo,
  worldPanorama,
  worldPanoramaStereo,
];

const worldNames = [
  'hall',
  'sound',
  'photogrammetry',
  'vertigo',
  'panorama',
  'panoramastereo'
];

const urlObject = new URL(window.location);
const worldName = urlObject.searchParams.get('stage');
var currentWorld = worldNames.indexOf(worldName) !== -1 ? worldNames.indexOf(worldName) : 0;
console.log(`Current world "${worldNames[currentWorld]}", ${currentWorld}`);

var assets = {
  // fonts
  inter_bold_font: 'fonts/Inter-Bold.font',
  inter_bold_tex: 'fonts/Inter-Bold.png',
  inter_regular_font: 'fonts/Inter-Regular.font',
  inter_regular_tex: 'fonts/Inter-Regular.png',
  metropolis_bold_font: 'fonts/Metropolis-Bold.font',
  metropolis_bold_tex: 'fonts/Metropolis-Bold.png',

  // hall
  foxr_tex: 'foxr.png',
  hall_model: 'hall.glb',
  generic_controller_model: 'generic_controller.glb',
  lightmap_tex: 'lightmap.png',
  controller_tex: 'controller.png',
  doorfx_tex: 'doorfx.png',
  sky_tex: 'sky.png',
  clouds_tex: 'clouds.png',

  // vertigo
  vertigo_lm_tex: 'vertigo_lm.png',
  checkboard_tex: 'checkboard.png',

  // panoramas
  pano1: 'zapporthorn.basis',
  pano1small: 'zapporthorn_small.jpg',
  pano2small: 'andes_small.jpg',
  panoballfx_tex: 'ballfx.jpg',
  andesL: 'andesL.jpg',
  andesR: 'andesR.jpg',

  // vertigo
  vertigo_model: 'vertigo.glb',
  vertigo_door_lm_tex: 'vertigo_door_lm.png',

  // sound
  sound_model: 'sound.glb',
  sound_door_model: 'sound_door.glb',
  sound_shadow_tex: 'sound_shadow.png',
  sound_door_lm_tex: 'sound_door_lm.png',

  // photogrammetry object
  pg_floor_tex: 'travertine2.jpg',
  pg_floor_lm_tex: 'pg_floor_lm.png',
  pg_door_lm_tex: 'pg_door_lm.png',
  pg_object_tex: 'angel.basis',
  pg_object_model: 'angel.glb', // TODO: try draco version, angel.min.glb
  pg_bg_tex: 'pg_bg.jpg',
  pg_flare_tex: 'flare.jpg',
  pg_panel_tex: 'panel.jpg',

  // paintings
  painting_seurat_tex: 'paintings/seurat.basis',
  painting_sorolla_tex: 'paintings/sorolla.basis',
  painting_bosch1_tex: 'paintings/bosch1.basis',
  painting_bosch2_tex: 'paintings/bosch2.basis',
  painting_degas_tex: 'paintings/degas.basis',
  painting_rembrandt_tex: 'paintings/rembrandt.basis',
};

function gotoWorld(world) {
  worlds[currentWorld].exit(context);
  raycontrol.deactivateAll();

  currentWorld = world;
  worlds[currentWorld].enter(context);
}

export function init() {
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
      case 78: gotoWorld((currentWorld + 1) % worlds.length); break;
      default: {
        var world = ev.keyCode - 48;
        if (!ev.metaKey && world >= 0 && world < worlds.length) {
          gotoWorld(world);
        }
      }
    }
  });
  scene.add(controls.getObject());

  parent = new THREE.Object3D();
  scene.add(parent);

  renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: false});
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.vr.enabled = true;

  window.addEventListener('resize', onWindowResize, false);
  setInterval(()=>{
    console.log('render calls:', renderer.info.render.calls);
  }, 2000);

  controller1 = renderer.vr.getController(0);
  //scene.add(controller1);
  controller1.addEventListener('selectstart', onSelectStart);
  controller1.addEventListener('selectend', onSelectEnd);

  controller2 = renderer.vr.getController(1);
  //scene.add(controller2);
  controller1.raycaster = new THREE.Raycaster();
  controller1.raycaster.near = 0.1;

  controller2.raycaster = new THREE.Raycaster();
  controller2.raycaster.near = 0.1;
  //controller2.raycaster.far = 3;
  controller2.addEventListener('selectstart', onSelectStart);
  controller2.addEventListener('selectend', onSelectEnd);

  var cameraRig = new THREE.Group();
  cameraRig.add(camera);
  cameraRig.add(controller1);
  cameraRig.add(controller2);
  scene.add(cameraRig);

  context = {
    assets: assets,
    shaders: shaders,
    scene : parent,
    renderer: renderer,
    camera: camera,
    goto: null,
    cameraRig: cameraRig,
    controllers: [controller1, controller2],
  };

  raycontrol = new RayControl(context);
  context.raycontrol = raycontrol;

  teleport = new Teleport(context);
  context.teleport = teleport;

  loadAssets(renderer, 'assets/', assets, () => {
    setupControllers();
    worldHall.setup(context);
    worldPanorama.setup(context);
    worldPanoramaStereo.setup(context);
    worldPhotogrammetryObject.setup(context);
    worldVertigo.setup(context);
    worldSound.setup(context);

    worlds[currentWorld].enter(context);

    document.body.appendChild( renderer.domElement );
    document.body.appendChild(WEBVR.createButton(renderer));
    renderer.setAnimationLoop(animate);
  })
}

function setupControllers() {
  var model = assets['generic_controller_model'].scene;
  var material = new THREE.MeshLambertMaterial({
    map: assets['controller_tex'],
  });
  model.getObjectByName('body').material = material;
  model.getObjectByName('trigger').material = material;
  controller1.add(model);
  controller2.add(model.clone());
  controller1.boundingBox = new THREE.Box3();
  controller2.boundingBox = new THREE.Box3();
  controller1.grabbing = null;
  controller2.grabbing = null;
}

function onSelectStart(ev) {
  const trigger = ev.target.getObjectByName('trigger');
  trigger.rotation.x = -0.3;
  raycontrol.onSelectStart(ev);

  //gotoWorld((currentWorld + 1) % worlds.length);
}

function onSelectEnd(ev) {
  const trigger = ev.target.getObjectByName('trigger');
  trigger.rotation.x = 0;
  raycontrol.onSelectEnd(ev);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  var delta = clock.getDelta();
  var elapsedTime = clock.elapsedTime;
  // update controller bounding boxes
  controller1.boundingBox.setFromObject(controller1.children[0]);
  controller2.boundingBox.setFromObject(controller2.children[0]);
  // render current world
  context.raycontrol.execute(context, delta, elapsedTime);
  worlds[currentWorld].execute(context, delta, elapsedTime);
  renderer.render(scene, camera);
  if (context.goto !== null) {
    gotoWorld(context.goto);
    context.goto = null;
  }
}

window.onload = () => {init()};
