var hall = null;

export function setup(ctx) {
  const assets = ctx.assets;
  const doorMaterial = new THREE.MeshLambertMaterial();
  const lightmapTex = assets['lightmap_tex'];
  lightmapTex.flipY = false;

  const diffuseTex = assets['travertine_tex'];
  //diffuseTex.encoding = THREE.sRGBEncoding;
  diffuseTex.wrapS = THREE.RepeatWrapping;
  diffuseTex.wrapT = THREE.RepeatWrapping;
  diffuseTex.repeat.set(2, 2);

  const objectMaterials = {
    hall: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: diffuseTex,
      lightMap: lightmapTex
    }),
    lightpanels: new THREE.MeshBasicMaterial(),
    doorA: doorMaterial,
    doorB: doorMaterial,
    doorC: doorMaterial,
    doorD: doorMaterial
  };

  hall = assets['hall_model'].scene;
  hall.traverse(o => {
    if (o.type == 'Mesh' && objectMaterials[o.name]) {
      o.material = objectMaterials[o.name];
    }
  });
}

export function enter(ctx) {
  ctx.renderer.setClearColor( 0x92B4BB );
  ctx.scene.add(hall);
}

export function exit(ctx) {
  ctx.scene.remove(hall);

}

export function execute(ctx, delta, time) {

}
