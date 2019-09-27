var city = null;
var rig = null;

export function setup(ctx) {
  const assets = ctx.assets;
  var texture = assets['checkboard_tex'];
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  var lightmap = assets['vertigo_lm_tex'];
  lightmap.encoding = THREE.sRGBEncoding;
  lightmap.flipY = false;
  const material = new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, lightMap: lightmap} );

  city = assets['vertigo_model'].scene;
  city.traverse(o => {
    if (o.type == 'Mesh') {
      o.material = material;
    }
  });
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x677FA7);
  ctx.scene.add(city);
  ctx.scene.parent.fog = new THREE.FogExp2(0x677FA7, 0.004);
}

export function exit(ctx) {
  ctx.scene.remove(city);
  ctx.scene.parent.fog = null;
}

export function execute(ctx, delta, time) {
}

