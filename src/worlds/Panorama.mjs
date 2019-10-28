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

  ctx.controllers[0].addEventListener('selectstart', onSelectStart);
  ctx.controllers[1].addEventListener('selectstart', onSelectStart);

  context = ctx;
}

export function exit(ctx) {
  ctx.scene.remove(pano);
  ctx.controllers[0].removeEventListener('selectstart', onSelectStart);
  ctx.controllers[1].removeEventListener('selectstart', onSelectStart);
}

export function execute(ctx, delta, time) {
}

export function onSelectStart(evt) {
  context.goto = 0;
}
