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

  const lightSun = new THREE.DirectionalLight(0xeeffff);
  lightSun.position.set(0.2, 1, 0.1);
  const lightFill = new THREE.DirectionalLight(0xfff0ee, 0.3);
  lightFill.position.set(-0.2, -1, -0.1);

  assets['pano1small'].encoding = THREE.sRGBEncoding;
  pano1 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.15, 30, 20),
    new THREE.MeshPhongMaterial( {
      map: assets['pano1small'],
      emissiveMap: assets['pano1small'],
      emissive: 0xffffff,
      specular: 0x555555,
      side: THREE.DoubleSide,
    } )
  );
  pano1.scale.y = -1;
  pano1.position.set(3.1, 1.5, 4);
  pano1.position.set(1.8, 1.5, 0.5); // TEST

  scene.add(lightSun);
  scene.add(lightFill);
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

  const dist = ctx.camera.position.distanceTo(pano1.position);

  if (dist < 1) {
    var v = ctx.camera.position.clone().sub(pano1.position).multiplyScalar(0.08);
    if (pano1.scale.x < 2) {
      pano1.scale.multiplyScalar(1.1);
    }
    pano1.position.add(v);

    if (dist < 0.1){ ctx.goto = 'panorama'; }
  } else {
    pano1.scale.set(1, -1, 1);
    pano1.position.set(3.1, 1.5, 4);
    pano1.position.set(1.8, 1.5, 0.5); //TEST
    pano1.position.y = 1.5 + Math.cos(time * 3) * 0.02;
  }

}
