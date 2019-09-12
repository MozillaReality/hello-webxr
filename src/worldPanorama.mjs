var pano = null;

export function setup(ctx) {
  const assets = ctx.assets;
  const geometry = new THREE.SphereBufferGeometry(5000, 60, 40);
  geometry.scale( 1, -1, 1 );
  const material = new THREE.MeshBasicMaterial( { map: assets['pano1'] } );
  pano = new THREE.Mesh( geometry, material );
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(pano);
}

export function exit(ctx) {
  ctx.scene.remove(pano);

}

export function execute(ctx, delta, time) {

}

