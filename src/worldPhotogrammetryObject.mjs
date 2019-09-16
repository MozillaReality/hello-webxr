var scene;

export function setup(ctx) {
  const assets = ctx.assets;
  scene = assets['pg_object_model'].scene;
  assets['pg_object_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_floor_tex'].encoding = THREE.sRGBEncoding;

  scene.getObjectByName('object').material =
    new THREE.MeshBasicMaterial({map: assets['pg_object_tex']});
  scene.getObjectByName('floor').material = 
  new THREE.MeshBasicMaterial({map: assets['pg_floor_tex']});
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(scene);
}

export function exit(ctx) {
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
}

