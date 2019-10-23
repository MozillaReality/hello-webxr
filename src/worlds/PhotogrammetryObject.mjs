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
  scene = assets['pg_object_model'].scene;
  assets['pg_object_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_object_tex'].flipY = false;
  assets['pg_floor_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_floor_tex'].flipY = false;
  assets['pg_floor_lm_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_floor_lm_tex'].flipY = false;

  assets['pg_floor_tex'].wrapS = THREE.RepeatWrapping;
  assets['pg_floor_tex'].wrapT = THREE.RepeatWrapping;

  assets['pg_bg_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_bg_tex'].flipY = false;

  assets['pg_flare_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_flare_tex'].flipY = false;

  assets['pg_panel_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_panel_tex'].flipY = false;

  assets['pg_door_lm_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_door_lm_tex'].flipY = false;

  scene.getObjectByName('object').material =
    new THREE.MeshBasicMaterial({map: assets['pg_object_tex']});
  scene.getObjectByName('floor').material =
    new THREE.MeshBasicMaterial({map: assets['pg_floor_tex'], lightMap: assets['pg_floor_lm_tex']});
  scene.getObjectByName('bg').material =
    new THREE.MeshBasicMaterial({map: assets['pg_bg_tex']});
  scene.getObjectByName('flare').material =
    new THREE.MeshBasicMaterial({map: assets['pg_flare_tex'], blending: THREE.AdditiveBlending});
  scene.getObjectByName('panel').material =
    new THREE.MeshBasicMaterial({map: assets['pg_panel_tex']});
  scene.getObjectByName('door_frame').material =
    new THREE.MeshBasicMaterial({map: assets['pg_door_lm_tex']});

  doorMaterial = createDoorMaterial(ctx);
  scene.getObjectByName('door').material = doorMaterial;

  scene.getObjectByName('teleport').visible = false;
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(scene);
  ctx.camera.position.set(0, 1.6, 2);
}

export function exit(ctx) {
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
  doorMaterial.uniforms.time.value = time;
}
