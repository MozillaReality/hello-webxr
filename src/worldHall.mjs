var scene, hall, pano1;

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

  scene = new THREE.Object3D();

  hall = assets['hall_model'].scene;
  hall.traverse(o => {
    if (o.type == 'Mesh' && objectMaterials[o.name]) {
      o.material = objectMaterials[o.name];
    }
  });

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0.2, 1, 0.1);

  assets['pano1small'].encoding = THREE.sRGBEncoding;
  pano1 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.15, 30, 20),
    new THREE.MeshPhongMaterial( {
      map: assets['pano1small'],
      emissiveMap: assets['pano1small'],
      emissive: 0xffffff,
      specular: 0x555555
    } )
  );
  pano1.scale.y = -1;
  pano1.position.set(3.1, 1.15, 4);

  scene.add(light);
  scene.add(hall);
  scene.add(pano1);
}

export function enter(ctx) {
  ctx.renderer.setClearColor( 0x92B4BB );
  ctx.scene.add(scene);
}

export function exit(ctx) {
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
  pano1.material.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.25 + 0.25;
}
