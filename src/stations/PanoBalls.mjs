var
  panoBalls = [],
  bbox = new THREE.Box3(),
  panoFxMaterial,
  auxVec = new THREE.Vector3(),
  hallRef = null;

const NUM_PANOBALLS = 2;

export function setup(ctx, hall) {
  const assets = ctx.assets;
  hallRef = hall;

  const panoGeo = new THREE.SphereBufferGeometry(0.15, 30, 20);
  assets['panoballfx_tex'].wrapT = THREE.RepeatWrapping;
  assets['panoballfx_tex'].wrapS = THREE.RepeatWrapping;

  for (var i = 0; i < NUM_PANOBALLS; i++) {
    let asset = assets[`pano${i + 1}small`];
    asset.encoding = THREE.sRGBEncoding;
    var ball = new THREE.Mesh(
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
    ball.position.copy(hall.getObjectByName(`panoball${i + 1}`).position);
    ball.userData.grabbedBy = null;
    ball.userData.animation = 0;
    ball.userData.panoId = i;
    ball.userData.resetPosition = ball.position.clone();

    panoBalls.push(ball);
    hall.add(ball);
  }
}

export function execute(ctx, delta, time) {

  // animate balls
  for (let i = 0; i < panoBalls.length; i++) {
    const ball = panoBalls[i];
    ball.visible = true;
    if (ball.userData.grabbedBy){
      // on hand
      ball.position.y = Math.cos(i + time * 3) * 0.02;
    } else {
      // on pillar
      ball.position.copy(ball.userData.resetPosition);
      ball.position.y = 1.5 + Math.cos(i + time * 3) * 0.02;
    }
    if (ball.userData.animation > 0) {
      ball.userData.animation = Math.max(0, ball.userData.animation - delta * 4);
      auxVec.copy(ball.userData.resetPosition);
      auxVec.addScaledVector(ball.position, -ball.userData.animation);
      ball.position.add(auxVec);
    }
  }

  for (let i = 0; i < ctx.controllers.length; i++) {
    let controller = ctx.controllers[i];
    // console.log(controller.grabbing);
    if (!controller.grabbing) { continue; }
    const dist = ctx.camera.position.distanceTo(controller.position);
    if (dist < 0.2) {
      // on head. Hide ball and change world
      controller.grabbing.visible = false;
      ctx.goto = 'panorama' + controller.grabbing.userData.panoId;
      return;
    }
  }
}

export function updateUniforms(time) {
  panoBalls[0].material.uniforms.time.value = time;
  panoBalls[1].material.uniforms.time.value = time;
}

export function onSelectStart(evt) {
  let controller = evt.target;
  if (controller.grabbing !== null){ return; }

  // hand grabs stick
  for (let i = 0; i < panoBalls.length; i++) {
    bbox.setFromObject(panoBalls[i]);
    if (controller.boundingBox.intersectsBox(bbox)){
      // stick grabbed from the other hand
      if (panoBalls[i].userData.grabbedBy) { return; }
      setVisibleChildren(controller, false);
      panoBalls[i].position.set(0, 0, 0);
      panoBalls[i].rotation.set(0, 0, 0);
      controller.add(panoBalls[i]);
      controller.grabbing = panoBalls[i];
      panoBalls[i].userData.grabbedBy = controller;
      return false;
    }
  }
  return true;
}

export function onSelectEnd(evt) {
  let controller = evt.target;
  if (controller.grabbing !== null) {
    releaseBall(controller);
    return false;
  }
  return true;
}

export function releaseBall(controller){
  if (!controller || !controller.grabbing) { return; }
  let ball = controller.grabbing;
  ball.position.copy(controller.position);
  hallRef.add(ball);
  ball.userData.grabbedBy = null;
  ball.userData.animation = 1;
  controller.grabbing = null;
  setVisibleChildren(controller, true);
}

function setVisibleChildren(controller, visible) {
  for (var i = 0; i < controller.children.length; i++) {
    controller.children[i].visible = visible;
  }
}
