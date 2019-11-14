
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
import HierarchySystem from './systems/HierarchySystem.js';
import TransformSystem from './systems/TransformSystem.js';

import SystemsGroup from './systems/SystemsGroup.js';

import assets from './assets.js';

import { Text, Object3D, AreaChecker } from './components/index.js';

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
var raycontrol, teleport, controllers = [];

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
var systemsGroup = {};

export function init() {
  var w = 100;
  ecsyWorld = new World();
  ecsyWorld
    .registerSystem(SDFTextSystem)
    .registerSystem(AreaCheckerSystem)
    .registerSystem(ControllersSystem)
    .registerSystem(DebugHelperSystem)
    .registerSystem(TransformSystem)
    .registerSystem(HierarchySystem);

  systemsGroup['roomHall'] = new SystemsGroup(ecsyWorld, [
    AreaCheckerSystem, ControllersSystem, DebugHelperSystem
  ]);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.005, 10000);
  camera.position.set(0, 1.6, 0);
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

  for (let i = 0; i < 2; i++) {
    controllers[i] = renderer.vr.getController(i);
    controllers[i].raycaster = new THREE.Raycaster();
    controllers[i].raycaster.near = 0.1;
    controllers[i].addEventListener('selectstart', onSelectStart);
    controllers[i].addEventListener('selectend', onSelectEnd);
  }

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
  cameraRig.add(controllers[0]);
  cameraRig.add(controllers[1]);
  cameraRig.position.set(0, 0, 2);
  scene.add(cameraRig);

  context.assets = assets;
  context.shaders = shaders;
  context.scene = parent;
  context.renderer = renderer;
  context.camera = camera;
  context.audioListener = listener;
  context.goto = null;
  context.cameraRig = cameraRig;
  context.controllers = controllers;
  context.world = ecsyWorld;
  context.systemsGroup = systemsGroup;

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

    document.body.appendChild(renderer.domElement);
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

  for (let i = 0;i < 2; i++) {
    controllers[i].add(model.clone());
    controllers[i].boundingBox = new THREE.Box3();
    controllers[i].userData.grabbing = null;
  }
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
  for (let i = 0; i < controllers.length; i++) {
    controllers[i].boundingBox.setFromObject(controllers[i].getObjectByName('Scene'));
  }

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
