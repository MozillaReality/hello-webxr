import * as THREE from 'three';
var panoL, panoR, context;

export function setup(ctx) {
  const assets = ctx.assets;
  const geometry = new THREE.SphereBufferGeometry(500, 60, 40);
  const materialL = new THREE.MeshBasicMaterial( { map: assets['stereopanoR'], side: THREE.BackSide } );
  const materialR = new THREE.MeshBasicMaterial( { map: assets['stereopanoL'], side: THREE.BackSide } );
  panoL = new THREE.Mesh(geometry, materialL);
  panoL.layers.set(1);
  panoR = new THREE.Mesh(geometry, materialR);
  panoR.layers.set(2);

  ctx.raycontrol.addState('panoramaStereo', {
    raycaster: false,
    onSelectEnd: onSelectEnd
  });
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(panoL);
  ctx.scene.add(panoR);
  ctx.camera.layers.enable(1);
  context = ctx;

  ctx.raycontrol.activateState('panoramaStereo');
}

export function exit(ctx) {
  ctx.scene.remove(panoL);
  ctx.scene.remove(panoR);
  ctx.camera.layers.disable(1);
  ctx.raycontrol.deactivateState('panoramaStereo');
}

export function execute(ctx, delta, time) {
}

export function onSelectEnd(evt) {
  context.goto = 0;
}

