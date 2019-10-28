var pano = null, controller = null, exitRequested;

export function setup(ctx) {
  const assets = ctx.assets;
  const geometry = new THREE.SphereBufferGeometry(5000, 60, 40);
  assets['pano1'].encoding = THREE.sRGBEncoding;
  const material = new THREE.MeshBasicMaterial( { map: assets['pano1'], side: THREE.BackSide } );
  pano = new THREE.Mesh(geometry, material);

}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(pano);
  // get controller close to head
  for (var i = 0; i < ctx.controllers.length; i++) {
    const dist = ctx.camera.position.distanceTo(ctx.controllers[i].position);
    if (dist < 0.2){
      controller = ctx.controllers[i];
      controller.addEventListener('selectend', onSelectEnd);
      break;
    }
  }
  exitRequested = false;
}

export function exit(ctx) {
  ctx.scene.remove(pano);
  controller.removeEventListener('selectend', onSelectEnd);
}

export function execute(ctx, delta, time) {
  if (!controller || exitRequested) {
    if (exitRequested) {
      ctx.message.text = 'selectEnd'; // send a selectEnd message to stationPanoBalls.mjs
      ctx.message.data = controller;
    }
    ctx.goto = 0;
    return;
  }
  const dist = ctx.camera.position.distanceTo(controller.position);
  if (dist > 0.5){
    ctx.goto = 0;
    return;
  }
}

export function onSelectEnd(evt) {
  exitRequested = true;
}
