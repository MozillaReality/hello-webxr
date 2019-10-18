var
  panoBalls = [],
  panoFxMaterial;


export function setup(ctx, hall) {
  const panoBallsConfig = [
    {src: 'pano1small', position: new THREE.Vector3(2.0, 1.5, 0.5)},
    {src: 'pano2small', position: new THREE.Vector3(-2.1, 1.5, 0)}
  ];
  const assets = ctx.assets;

  const panoGeo = new THREE.SphereBufferGeometry(0.15, 30, 20);
  assets['panoballfx_tex'].wrapT = THREE.RepeatWrapping;
  assets['panoballfx_tex'].wrapS = THREE.RepeatWrapping;

  for (var i = 0; i < panoBallsConfig.length; i++) {
    const config = panoBallsConfig[i];
    let asset = assets[`pano${i + 1}small`];
    asset.encoding = THREE.sRGBEncoding;
    var pano = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.15, 30, 20),
      new THREE.ShaderMaterial({
        uniforms: {
          time: {value: 0},
          tex: {value: asset},
          texfx: {value: assets['panoballfx_tex']},
        },
        vertexShader: ctx.shaders.panoball_vert,
        fragmentShader: ctx.shaders.panoball_frag,
        side: THREE.BackSide,
      })
    );
    pano.position.copy(hall.getObjectByName(`panoball${i + 1}`).position);
    pano.resetPosition = pano.position.clone();

    panoBalls.push(pano);
    hall.add(pano);
  }
}

export function execute(ctx, delta, time) {
  for (let i = 0; i < panoBalls.length; i++) {
    const ball = panoBalls[i];
    const dist = ctx.camera.position.distanceTo(ball.position);
    if (dist < 1) {
      let v = ctx.camera.position.clone().sub(ball.position).multiplyScalar(0.08);
      if (ball.scale.x < 2) {
        ball.scale.multiplyScalar(1.1);
      }
      ball.position.add(v);

      if (dist < 0.1){ ctx.goto = 'panorama' + i; }
    } else {
      ball.scale.set(1, 1, 1);
      ball.position.copy(ball.resetPosition);
      ball.position.y = 1.5 + Math.cos(i + time * 3) * 0.02;
    }
  }
}

export function updateUniforms(time) {
  panoBalls[0].material.uniforms.time.value = time;
  panoBalls[1].material.uniforms.time.value = time;
}

