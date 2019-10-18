import * as panoballs from './stationPanoBalls.mjs';
import * as paintings from './stationPaintings.mjs';
import * as newsticker from './stationNewsTicker.mjs';
import * as xylophone from './stationXylophone.mjs';
import Teleport from './Teleport.mjs';

var
  scene,
  hall,
  teleportFloor,
  fader,
  teleport,
  objectMaterials,
  controllers;

function createDoorMaterial(ctx) {
  ctx.assets['doorfx_tex'].wrapT = THREE.RepeatWrapping;
  ctx.assets['doorfx_tex'].wrapS = THREE.RepeatWrapping;
  return new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0},
      selected: {value: 0},
      tex: {value: ctx.assets['doorfx_tex']}
    },
    vertexShader: ctx.shaders.basic_vert,
    fragmentShader: ctx.shaders.door_frag
  });
}

export function setup(ctx) {
  const assets = ctx.assets;
  scene = new THREE.Object3D();

  // setup hall model

  const hallLightmapTex = assets['lightmap_tex'];
  hallLightmapTex.encoding = THREE.sRGBEncoding;
  hallLightmapTex.flipY = false;

  const skyTex = assets['sky_tex'];
  skyTex.encoding = THREE.sRGBEncoding;
  skyTex.flipY = false;

  const cloudsTex = assets['clouds_tex'];
  cloudsTex.encoding = THREE.sRGBEncoding;
  cloudsTex.flipY = false;

  objectMaterials = {
    hall: new THREE.MeshBasicMaterial({map: hallLightmapTex}),
    lightpanels: new THREE.MeshBasicMaterial(),
    doorA: createDoorMaterial(ctx),
    doorB: createDoorMaterial(ctx),
    doorC: createDoorMaterial(ctx),
    doorD: createDoorMaterial(ctx),
    sky: new THREE.MeshBasicMaterial({map: skyTex}),
    clouds: new THREE.MeshBasicMaterial({map: cloudsTex, transparent: true})
  };


  hall = assets['hall_model'].scene;
  hall.traverse(o => {
    if (o.name == 'teleport') {
      teleportFloor = o;
      console.log(teleportFloor);
      o.visible = false;
      return;
    }
    if (o.type == 'Mesh' && objectMaterials[o.name]) {
      o.material = objectMaterials[o.name];
    }
  });

  paintings.setup(ctx, hall);
  xylophone.setup(ctx, hall);
  newsticker.setup(ctx, hall);
  panoballs.setup(ctx, hall);

  teleport = new Teleport(ctx, teleportFloor);

  // lights
  const lightSun = new THREE.DirectionalLight(0xeeffff);
  lightSun.position.set(0.2, 1, 0.1);
  const lightFill = new THREE.DirectionalLight(0xfff0ee, 0.3);
  lightFill.position.set(-0.2, -1, -0.1);

  // fade camera to black on walls
  fader = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(),
    new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, depthTest: false})
  );
  fader.position.z = -0.1;


  scene.add(lightSun);
  scene.add(lightFill);
  scene.add(hall);
  ctx.camera.add(fader);
}

export function enter(ctx) {
  ctx.renderer.setClearColor( 0xC0DFFB );
  controllers = ctx.controllers;
  controllers[0].addEventListener('selectstart', onSelectStart);
  controllers[0].addEventListener('selectend', onSelectEnd);
  controllers[1].addEventListener('selectstart', onSelectStart);
  controllers[1].addEventListener('selectend', onSelectEnd);
  ctx.scene.add(scene);

  controllers[0].grabbing = null;
  controllers[1].grabbing = null;

  xylophone.enter(ctx);
}

export function exit(ctx) {
  ctx.scene.remove(scene);
  ctx.controllers[0].removeEventListener('selectstart', onSelectStart);
  ctx.controllers[0].removeEventListener('selectend', onSelectEnd);
  ctx.controllers[1].removeEventListener('selectstart', onSelectStart);
  ctx.controllers[1].removeEventListener('selectend', onSelectEnd);

  xylophone.exit(ctx);
}

export function execute(ctx, delta, time) {
  panoballs.execute(ctx, delta, time);
  paintings.execute(ctx, delta, time);
  xylophone.execute(ctx, delta, time, controllers);
  teleport.execute(ctx, delta, time);

  updateUniforms(time);
  checkCameraBoundaries(ctx);
}

function updateUniforms(time) {
  objectMaterials.doorA.uniforms.time.value = time;
  objectMaterials.doorB.uniforms.time.value = time;
  objectMaterials.doorC.uniforms.time.value = time;
  objectMaterials.doorD.uniforms.time.value = time;
  objectMaterials.doorD.uniforms.selected.value = 1; //test
  panoballs.updateUniforms(time);
}

function checkCameraBoundaries(ctx) {
  const cam = ctx.camera.position;
  const margin = 0.25;
  var fade = 0;
  if (cam.y < margin)     { fade = 1 - (cam.y / margin); }
  else if (cam.x < -5.4)  { fade = (-cam.x - 5.4) / margin; }
  else if (cam.x > 8)     { fade = (cam.x - 8) / margin; }
  else if (cam.z < -6.45) { fade = (-cam.z - -6.45) / margin; }
  else if (cam.z > 6.4)  { fade = (cam.z - 6.4) / margin; }
  fader.material.opacity = Math.min(1, Math.max(0, fade));
}

// if module returns false, do nothing else (prevents selecting two things at the same time)
function onSelectStart(evt) {
//  if (!xylophone.onSelectStart(evt)) { return; }
//  if (!paintings.onSelectStart(evt)) { return; }
  if (!teleport.onSelectStart(evt)) { return; }
}

function onSelectEnd(evt) {
//  if (!xylophone.onSelectEnd(evt)) { return; }
//  if (!paintings.onSelectEnd(evt)) { return; }
  if (!teleport.onSelectEnd(evt)) { return; }
}
