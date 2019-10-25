var scene, doorMaterial;

function createDoorMaterial(ctx) {
  ctx.assets['doorfx_tex'].wrapT = THREE.RepeatWrapping;
  ctx.assets['doorfx_tex'].wrapS = THREE.RepeatWrapping;
  return new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0},
      selected: {value: 0},
      tex: {value: ctx.assets['doorfx_tex']}
    },
    vertexShader: ctx.shaders.basic_vert,
    fragmentShader: ctx.shaders.door_frag
  });
}

export function setup(ctx) {
  const assets = ctx.assets;
  var texture = assets['checkboard_tex'];
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  var lightmap = assets['vertigo_lm_tex'];
  lightmap.encoding = THREE.sRGBEncoding;
  lightmap.flipY = false;
  const material = new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, lightMap: lightmap} );

  scene = assets['vertigo_model'].scene;
  scene.getObjectByName('city').material = material;
  scene.getObjectByName('teleport').visible = false;

  assets['vertigo_door_lm_tex'].encoding = THREE.sRGBEncoding;
  assets['vertigo_door_lm_tex'].flipY = false;

  scene.getObjectByName('door_frame').material =
    new THREE.MeshBasicMaterial({map: assets['vertigo_door_lm_tex']});
  doorMaterial = createDoorMaterial(ctx);
  scene.getObjectByName('door').material = doorMaterial;
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x677FA7);
  ctx.scene.add(scene);
  ctx.scene.parent.fog = new THREE.FogExp2(0x677FA7, 0.004);
  ctx.cameraRig.position.set(0,0,0);
}

export function exit(ctx) {
  ctx.scene.remove(scene);
  ctx.scene.parent.fog = null;
}

export function execute(ctx, delta, time) {
  doorMaterial.uniforms.time.value = time;
}

