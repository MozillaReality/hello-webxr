import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import {WEBVR} from './vendor/WebVR.js';
import {loadAssets} from './lib/assetManager.js';

// ECSY
import { World } from './vendor/ecsy.module.js';
import { SDFTextSystem } from './systems/SDFTextSystem.js';
import { DebugHelperSystem } from './systems/DebugHelperSystem.js';
import { AreaCheckerSystem } from './systems/AreaCheckerSystem.js';
import { ControllersSystem } from './systems/ControllersSystem.js';

import { Text, Object3D } from './components/index.js';

import RayControl from './lib/RayControl.js';
import Teleport from './lib/Teleport.js';

import * as roomHall from './rooms/Hall.js';
import * as roomPanorama from './rooms/Panorama.js';
import * as roomPanoramaStereo from './rooms/PanoramaStereo.js';
import * as roomPhotogrammetryObject from './rooms/PhotogrammetryObject.js';
import * as roomVertigo from './rooms/Vertigo.js';
import * as roomSound from './rooms/Sound.js';

import {shaders} from './lib/shaders.js';

var clock = new THREE.Clock();

var scene, parent, renderer, camera, controls, context = {};
var controller1, controller2, raycontrol, teleport;

var listener, ambientMusic;

var rooms = [
  roomHall,
  roomSound,
  roomPhotogrammetryObject,
  roomVertigo,
  roomPanoramaStereo,
  roomPanorama,
  roomPanorama,
  roomPanorama,
  roomPanorama,
  roomPanorama,
];

const roomNames = [
  'hall',
  'sound',
  'photogrammetry',
  'vertigo',
  'panoramastereo',
  'panorama1',
  'panorama2',
  'panorama3',
  'panorama4',
  'panorama5',
];

const musicThemes = [
  false,
  false,
  'chopin_snd',
  'wind_snd',
  false,
  'birds_snd',
  'birds_snd',
  'forest_snd',
  'wind_snd',
  'birds_snd',
];

const urlObject = new URL(window.location);
const roomName = urlObject.searchParams.get('stage');
context.room = roomNames.indexOf(roomName) !== -1 ? roomNames.indexOf(roomName) : 0;
console.log(`Current room "${roomNames[context.room]}", ${context.room}`);

var assets = {
  // hall
  foxr_tex: 'foxr.png',
  hall_model: 'hall.glb',
  generic_controller_model: 'generic_controller.glb',
  lightmap_tex: 'lightmap.jpg',
  controller_tex: 'controller.png',
  doorfx_tex: 'doorfx.png',
  sky_tex: 'sky.png',
  clouds_tex: 'clouds.png',
  teleport_model: 'teleport.glb',
  beam_tex: 'beamfx.png',
  glow_tex: 'glow.png',
  newsticker_tex: 'newsticker.png',
  mozillamr_tex: 'mozillamr.png',
  zoomicon_tex: 'zoomicon.png',

  // panoramas
  panoballfx_tex: 'ballfx.jpg',

  stereopanoL: 'stereopanoL.basis',
  stereopanoR: 'stereopanoR.basis',
  pano1small: 'stereopano_small.jpg',

  pano2: 'tigerturtle.basis',
  pano3: 'lakebyllesby.basis',
  pano4: 'haldezollern.basis',
  pano5: 'zapporthorn.basis',
  pano6: 'thuringen.basis',
  pano2small: 'tigerturtle_small.png',
  pano3small: 'lakebyllesby_small.png',
  pano4small: 'haldezollern_small.png',
  pano5small: 'zapporthorn_small.png',
  pano6small: 'thuringen_small.png',

  // graffiti
  spray_model: 'spray.glb',
  spray_tex: 'spray.png',

  // vertigo
  vertigo_model: 'vertigo.glb',
  vertigo_door_lm_tex: 'vertigo_door_lm.png',
  vertigo_lm_tex: 'vertigo_lm.basis',
  checkboard_tex: 'checkboard.basis',

  // sound
  sound_model: 'sound.glb',
  sound_door_model: 'sound_door.glb',
  sound_shadow_tex: 'sound_shadow.png',
  sound_door_lm_tex: 'sound_door_lm.png',
  grid_tex: 'grid.png',

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
  painting_bosch_tex: 'paintings/bosch.basis',
  painting_degas_tex: 'paintings/degas.basis',
  painting_rembrandt_tex: 'paintings/rembrandt.basis',

  // sounds
  birds_snd: 'ogg/birds.ogg',
  chopin_snd: 'ogg/chopin.ogg',
  forest_snd: 'ogg/forest.ogg',
  wind_snd: 'ogg/wind.ogg',
  teleport_a_snd: 'ogg/teleport_a.ogg',
  teleport_b_snd: 'ogg/teleport_b.ogg',
};

function gotoRoom(room) {
  rooms[context.room].exit(context);
  raycontrol.deactivateAll();

  playMusic(room);

  context.room = room;
  rooms[context.room].enter(context);
}

function playMusic(room) {
  if (ambientMusic.source) ambientMusic.stop();

  const music = musicThemes[room];
  if (!music) { return; }
  ambientMusic.setBuffer(assets[music]);
  ambientMusic.setLoop(true);
  ambientMusic.setVolume(1.0);
  ambientMusic.offset = Math.random() * 60;
  ambientMusic.play();
}

var ecsyWorld;

export function init() {
  var w = 100;
  ecsyWorld = new World();
  ecsyWorld
    .registerSystem(SDFTextSystem)
    .registerSystem(AreaCheckerSystem)
    .registerSystem(ControllersSystem)
    .registerSystem(DebugHelperSystem);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.005, 10000);
  camera.position.set(0, 1.6, 0);
  //camera.position.set(1.5, 1.6, 2.3); //near pano1
  listener = new THREE.AudioListener();
  camera.add(listener);

  ambientMusic = new THREE.Audio(listener);

  controls = new PointerLockControls(camera);
  document.body.addEventListener('click', () => controls.lock());
  document.body.addEventListener('keydown', ev => {
    switch(ev.keyCode) {
      case 87: controls.moveForward(0.2); break;
      case 65: controls.moveRight(-0.2); break;
      case 83: controls.moveForward(-0.2); break;
      case 68: controls.moveRight(0.2); break;
      case 78: gotoRoom((context.room + 1) % rooms.length); break;
      default: {
        var room = ev.keyCode - 48;
        if (!ev.metaKey && room >= 0 && room < rooms.length) {
          gotoRoom(room);
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
/*
  setInterval(()=>{
    console.log('render calls:', renderer.info.render.calls);
  }, 2000);
*/
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

  // global lights
  const lightSun = new THREE.DirectionalLight(0xeeffff);
  lightSun.name = 'sun';
  lightSun.position.set(0.2, 1, 0.1);
  const lightFill = new THREE.DirectionalLight(0xfff0ee, 0.3);
  lightFill.name = 'fillLight';
  lightFill.position.set(-0.2, -1, -0.1);

  scene.add(lightSun, lightFill);

  var cameraRig = new THREE.Group();
  cameraRig.add(camera);
  cameraRig.add(controller1);
  cameraRig.add(controller2);
  cameraRig.position.set(0, 0, 2);
  //cameraRig.rotation.set(0, -0.5, 0);
  scene.add(cameraRig);

  context.assets = assets;
  context.shaders = shaders;
  context.scene = parent;
  context.renderer = renderer;
  context.camera = camera;
  context.audioListener = listener;
  context.goto = null;
  context.cameraRig = cameraRig;
  context.controllers = [controller1, controller2];
  context.world = ecsyWorld;

  window.context = context;

  loadAssets(renderer, 'assets/', assets, () => {
    raycontrol = new RayControl(context);
    context.raycontrol = raycontrol;

    teleport = new Teleport(context);
    context.teleport = teleport;

    setupControllers();
    roomHall.setup(context);
    roomPanorama.setup(context);
    roomPanoramaStereo.setup(context);
    roomPhotogrammetryObject.setup(context);
    roomVertigo.setup(context);
    roomSound.setup(context);


    rooms[context.room].enter(context);



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
  controller1.userData.grabbing = null;
  controller2.userData.grabbing = null;
}

function onSelectStart(ev) {
  const trigger = ev.target.getObjectByName('trigger');
  trigger.rotation.x = -0.3;
  raycontrol.onSelectStart(ev);
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

  ecsyWorld.execute(delta, elapsedTime);

  // update controller bounding boxes
  controller1.boundingBox.setFromObject(controller1.getObjectByName('Scene'));
  controller2.boundingBox.setFromObject(controller2.getObjectByName('Scene'));

  // render current room
  context.raycontrol.execute(context, delta, elapsedTime);
  rooms[context.room].execute(context, delta, elapsedTime);
  renderer.render(scene, camera);
  if (context.goto !== null) {
    gotoRoom(context.goto);
    context.goto = null;
  }
}

window.onload = () => {init()};
