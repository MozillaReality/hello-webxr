var pano = null, context;

export function setup(ctx) {
  const assets = ctx.assets;
  const geometry = new THREE.SphereBufferGeometry(5000, 60, 40);
  assets['pano1'].encoding = THREE.sRGBEncoding;
  assets['pano1'].flipY = false;
  const material = new THREE.MeshBasicMaterial( { map: assets['pano1'], side: THREE.BackSide } );
  pano = new THREE.Mesh(geometry, material);

}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
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
