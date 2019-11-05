import * as THREE from 'three';

var pano = null, context;

const NUM_PANOS = 5;

var panoMaterials = [];

export function setup(ctx) {
  const assets = ctx.assets;
  const geometry = new THREE.SphereBufferGeometry(5000, 60, 40);
  for (var i = 0; i < NUM_PANOS; i++) {
    const panoName = 'pano'+(i + 2);
    assets[panoName].encoding = THREE.sRGBEncoding;
    assets[panoName].flipY = false;
    panoMaterials[i] = new THREE.MeshBasicMaterial( { map: assets[panoName], side: THREE.BackSide });
  }
  pano = new THREE.Mesh(geometry, panoMaterials[0]);
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  console.log(ctx.room, panoMaterials[ctx.room - 5]);
  pano.material = panoMaterials[ctx.room - 5];
  ctx.scene.add(pano);

  ctx.controllers[0].addEventListener('selectend', onSelectEnd);
  ctx.controllers[1].addEventListener('selectend', onSelectEnd);

  context = ctx;
}

export function exit(ctx) {
  ctx.scene.remove(pano);
  ctx.controllers[0].removeEventListener('selectend', onSelectEnd);
  ctx.controllers[1].removeEventListener('selectend', onSelectEnd);
}

export function execute(ctx, delta, time) {
}

export function onSelectEnd(evt) {
  context.goto = 0;
}
