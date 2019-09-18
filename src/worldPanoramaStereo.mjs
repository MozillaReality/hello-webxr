var panoL, panoR;
var timeout;

export function setup(ctx) {
  const assets = ctx.assets;
  const geometry = new THREE.SphereBufferGeometry(5000, 60, 40);
  assets['andesL'].encoding = THREE.sRGBEncoding;
  assets['andesR'].encoding = THREE.sRGBEncoding;
  const materialL = new THREE.MeshBasicMaterial( { map: assets['andesL'], side: THREE.BackSide } );
  const materialR = new THREE.MeshBasicMaterial( { map: assets['andesR'], side: THREE.BackSide } );
  panoL = new THREE.Mesh(geometry, materialL);
  panoL.layers.set(1);
  panoR = new THREE.Mesh(geometry, materialR);
  panoR.layers.set(2);
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(panoL);
  ctx.scene.add(panoR);
  timeout = null;
  ctx.camera.layers.enable(1);
}

export function exit(ctx) {
  ctx.scene.remove(panoL);
  ctx.scene.remove(panoR);
  ctx.camera.layers.disable(1);
}

export function execute(ctx, delta, time) {
  if (timeout == null) { timeout = time; }
  else if (time - timeout > 3) {
    ctx.camera.position.set(1.5, 1.6, 2.3);
    ctx.goto = 'hall';
  }
}

