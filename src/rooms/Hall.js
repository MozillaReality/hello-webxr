import * as THREE from 'three';
import * as panoballs from '../stations/PanoBalls.js';
import * as paintings from '../stations/Paintings.js';
import * as newsticker from '../stations/NewsTicker.js';
import * as xylophone from '../stations/Xylophone.js';
import * as graffiti from '../stations/Graffiti.js';
import * as infopanels from '../stations/InfoPanels.js';

var
  scene,
  hall,
  teleportFloor,
  fader,
  doors = [],
  objectMaterials,
  controllers,
  auxVec = new THREE.Vector3();

function createDoorMaterial(ctx) {
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
  const skyTex = assets['sky_tex'];
  const cloudsTex = assets['clouds_tex'];
  const foxrTex = assets['foxr_tex'];
  const newstickerTex = assets['newsticker_tex'];
  const mozillamrTex = assets['mozillamr_tex'];

  const hallMaterial = new THREE.MeshBasicMaterial({map: hallLightmapTex});

  objectMaterials = {
    'hall': hallMaterial,
    'screen': new THREE.MeshBasicMaterial({map: newstickerTex}),
    'xylophone': hallMaterial,
    'xylostick-left': hallMaterial,
    'xylostick-right': hallMaterial,
    'xylostickball-left': hallMaterial.clone(),
    'xylostickball-right': hallMaterial.clone(),
    'lightpanels': new THREE.MeshBasicMaterial(),
    'doorA': createDoorMaterial(ctx),
    'doorB': createDoorMaterial(ctx),
    'doorC': createDoorMaterial(ctx),
    'doorD': createDoorMaterial(ctx),
    'sky': new THREE.MeshBasicMaterial({map: skyTex}),
    'clouds': new THREE.MeshBasicMaterial({map: cloudsTex, transparent: true}),
    'foxr': new THREE.MeshBasicMaterial({map: foxrTex, transparent: true}),
    'mozillamr': new THREE.MeshBasicMaterial({map: mozillamrTex, transparent: true}),
  };

  hall = assets['hall_model'].scene;
  hall.traverse(o => {
    if (o.name == 'teleport') {
      teleportFloor = o;
      //o.visible = false;
      o.material.visible = false;
      return;
    } else if (o.name.startsWith('door')) {
      doors.push(o);
    }

    if (o.type == 'Mesh' && objectMaterials[o.name]) {
      o.material = objectMaterials[o.name];
    }
  });

  paintings.setup(ctx, hall);
  xylophone.setup(ctx, hall);
  graffiti.setup(ctx, hall);
  newsticker.setup(ctx, hall);
  panoballs.setup(ctx, hall);
  infopanels.setup(ctx, hall);

  ctx.raycontrol.addState('teleport', {
    colliderMesh: teleportFloor,
    onHover: (intersection, active) => {
      ctx.teleport.onHover(intersection.point, active);
    },
    onHoverLeave: () => {
      ctx.teleport.onHoverLeave();
    },
    onSelectStart: (intersection, e) => {
      ctx.teleport.onSelectStart(e);
    },
    onSelectEnd: (intersection) => {
      ctx.teleport.onSelectEnd(intersection.point);
    }
  });

  ctx.raycontrol.addState('doors', {
    colliderMesh: doors,
    onHover: (intersection, active) => {
      const scale = intersection.object.scale;
      scale.z = Math.min(scale.z + 0.05 * (5.5 - scale.z), 5);
    },
    onHoverLeave: (intersection) => {
    },
    onSelectStart: (intersection) => {
      const transitions = {
        doorA: 1,
        doorB: 2,
        doorC: 3,
        doorD: 4
      };
      ctx.goto = transitions[intersection.object.name];
    },
    onSelectEnd: (intersection) => {}
  });

  // fade camera to black on walls
  fader = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(),
    new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, depthTest: false})
  );
  fader.position.z = -0.1;
  fader.material.opacity = 0;

  scene.add(hall);
  ctx.camera.add(fader);
}

export function enter(ctx) {
  ctx.systemsGroup['roomHall'].play();
  ctx.renderer.setClearColor( 0xC0DFFB );
  ctx.scene.add(scene);

  xylophone.enter(ctx);
  graffiti.enter(ctx);
  infopanels.enter(ctx);
  ctx.raycontrol.activateState('doors');
  ctx.raycontrol.activateState('teleport');
  paintings.enter(ctx);
  panoballs.enter(ctx);
}

export function exit(ctx) {
  ctx.systemsGroup['roomHall'].stop();
  ctx.scene.remove(scene);

  ctx.raycontrol.deactivateState('doors');
  ctx.raycontrol.deactivateState('teleport');

  xylophone.exit(ctx);
}

export function execute(ctx, delta, time) {
  panoballs.execute(ctx, delta, time);
  paintings.execute(ctx, delta, time);
  xylophone.execute(ctx, delta, time, controllers);
  graffiti.execute(ctx, delta, time);
  newsticker.execute(ctx, delta, time);
  infopanels.execute(ctx, delta, time);
  updateUniforms(time);
  //checkCameraBoundaries(ctx);

  for (var i = 0; i < doors.length; i++) {
    if (doors[i].scale.z > 1) {
      doors[i].scale.z = Math.max(doors[i].scale.z - delta * doors[i].scale.z, 1);
    }
  }

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
  auxVec.copy(ctx.camera.position).add(ctx.cameraRig.position);
  const cam = auxVec;
  const margin = 0.25;
  var fade = 0;
  if (cam.y < margin)     { fade = 1 - (cam.y / margin); }
  else if (cam.x < -5.4)  { fade = (-cam.x - 5.4) / margin; }
  else if (cam.x > 8)     { fade = (cam.x - 8) / margin; }
  else if (cam.z < -6.45) { fade = (-cam.z - 6.45) / margin; }
  else if (cam.z > 6.4)  { fade = (cam.z - 6.4) / margin; }
  fader.material.opacity = Math.min(1, Math.max(0, fade));
}
