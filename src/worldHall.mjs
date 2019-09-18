var scene, hall, teleport, panoBalls = [], objectMaterials;
var panoFxMaterial;

export function setup(ctx) {
  const assets = ctx.assets;

  const doorMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0},
      selected: {value: 0},
      tex: {value: assets['travertine_tex']}
    },
    vertexShader: ctx.shaders.basic_vert,
    fragmentShader: ctx.shaders.door_frag
  });

  const hallLightmapTex = assets['lightmap_tex'];
  hallLightmapTex.encoding = THREE.sRGBEncoding;
  hallLightmapTex.flipY = false;

  const hallDiffuseTex = assets['travertine_tex'];
  hallDiffuseTex.encoding = THREE.sRGBEncoding;
  hallDiffuseTex.wrapS = THREE.RepeatWrapping;
  hallDiffuseTex.wrapT = THREE.RepeatWrapping;
  hallDiffuseTex.repeat.set(2, 2);

  objectMaterials = {
    hall: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: hallDiffuseTex,
      lightMap: hallLightmapTex
    }),
    lightpanels: new THREE.MeshBasicMaterial(),
    doorA: doorMaterial.clone(),
    doorB: doorMaterial.clone(),
    doorC: doorMaterial.clone(),
    doorD: doorMaterial.clone()
  };

  scene = new THREE.Object3D();

  hall = assets['hall_model'].scene;
  hall.traverse(o => {
    if (o.name == 'teleport') {
      teleport = o;
      o.visible = false;
      return;
    }
    if (o.type == 'Mesh' && objectMaterials[o.name]) {
      o.material = objectMaterials[o.name];
    }
  });

  const lightSun = new THREE.DirectionalLight(0xeeffff);
  lightSun.position.set(0.2, 1, 0.1);
  const lightFill = new THREE.DirectionalLight(0xfff0ee, 0.3);
  lightFill.position.set(-0.2, -1, -0.1);

  const panoBallsConfig = [
    {src: 'pano1small', position: new THREE.Vector3(1.8, 1.5, 0.5)},
    {src: 'pano2small', position: new THREE.Vector3(0.1, 1.5, 0)}
  ];


  const panoGeo = new THREE.SphereBufferGeometry(0.15, 30, 20);
  assets['panoballfx_tex'].wrapT = THREE.RepeatWrapping;
  assets['panoballfx_tex'].wrapS = THREE.RepeatWrapping;
  panoFxMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0},
      tex: {value: assets['panoballfx_tex']}
    },
    vertexShader: ctx.shaders.basic_vert,
    fragmentShader: ctx.shaders.ballfx_frag,
    blending: THREE.AdditiveBlending,
    transparent: true
  });


  for (var i = 0; i < panoBallsConfig.length; i++) {
    const config = panoBallsConfig[i];
    assets[config.src].encoding = THREE.sRGBEncoding;
    var pano = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.15, 30, 20),
      new THREE.MeshPhongMaterial( {
        map: assets[config.src],
        emissiveMap: assets[config.src],
        emissive: 0xffffff,
        specular: 0x555555,
        side: THREE.BackSide,
      } )
    );
    pano.rotation.z = Math.PI;
    pano.position.copy(config.position);
    pano.resetPosition = new THREE.Vector3().copy(config.position);


    //fx
    var panofx = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.152, 30, 20), panoFxMaterial);
    pano.add(panofx);


    panoBalls.push(pano);
    scene.add(pano);
  }

  scene.add(lightSun);
  scene.add(lightFill);
  scene.add(hall);
}

export function enter(ctx) {
  ctx.renderer.setClearColor( 0x92B4BB );
  ctx.scene.add(scene);
}

export function exit(ctx) {
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {

  for (var i = 0; i < panoBalls.length; i++) {
    const ball = panoBalls[i];
    const dist = ctx.camera.position.distanceTo(ball.position);
    if (dist < 1) {
      var v = ctx.camera.position.clone().sub(ball.position).multiplyScalar(0.08);
      if (ball.scale.x < 2) {
        ball.scale.multiplyScalar(1.1);
      }
      ball.position.add(v);

      if (dist < 0.1){ ctx.goto = 'panorama' + i; }
    } else {
      ball.scale.set(1, -1, 1);
      ball.position.copy(ball.resetPosition); //TEST
      ball.position.y = 1.5 + Math.cos(i + time * 3) * 0.02;
    }
  }

  objectMaterials.doorA.uniforms.time.value = time;
  objectMaterials.doorB.uniforms.time.value = time;
  objectMaterials.doorC.uniforms.time.value = time;
  objectMaterials.doorD.uniforms.time.value = time;
  panoFxMaterial.uniforms.time.value = time;
  objectMaterials.doorD.uniforms.selected.value = 1;
}
