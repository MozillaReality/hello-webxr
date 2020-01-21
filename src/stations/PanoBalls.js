import * as THREE from 'three';

var
  panoBalls = [],
  panoballsParent = new THREE.Object3D(),
  bbox = new THREE.Box3(),
  panoFxMaterial,
  auxVec = new THREE.Vector3(),
  hallRef = null;

const NUM_PANOBALLS = 6;

export function enter(ctx) {
  ctx.raycontrol.activateState('panoballs');
}

export function setup(ctx, hall) {
  const assets = ctx.assets;
  hallRef = hall;

  const panoGeo = new THREE.SphereBufferGeometry(0.15, 30, 20);

  for (var i = 0; i < NUM_PANOBALLS; i++) {
    let asset = assets[`pano${i + 1}small`];
    var ball = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.15, 30, 20),
      new THREE.ShaderMaterial({
        uniforms: {
          time: {value: 0},
          tex: {value: asset},
          texfx: {value: assets['panoballfx_tex']},
          selected: {value: 0}
        },
        vertexShader: ctx.shaders.panoball_vert,
        fragmentShader: ctx.shaders.panoball_frag,
        side: THREE.BackSide,
      })
    );
    ball.rotation.set(Math.PI, 0, 0);
    ball.position.copy(hall.getObjectByName(`panoball${i + 1}`).position);
    ball.userData.floatY = ball.position.y;
    ball.userData.panoId = 4 + i;
    ball.userData.selected = 0;

    panoBalls.push(ball);
    panoballsParent.add(ball);
  }

  hall.add(panoballsParent);

  ctx.raycontrol.addState('panoballs', {
    colliderMesh: panoballsParent,
    onHover: (intersection, active, controller) => {
      panoBalls.forEach(panoBall => panoBall.userData.selected = 0);
      intersection.object.userData.selected = 1;
    },
    onHoverLeave: (intersection) => {
      intersection.object.userData.selected = 0;
    },
    onSelectStart: (intersection, controller) => {
    },
    onSelectEnd: (intersection) => {
      ctx.goto = intersection.object.userData.panoId;
      intersection.object.userData.selected = 0;
    }
  });
}

export function execute(ctx, delta, time) {
  for (let i = 0; i < panoBalls.length; i++) {
    const ball = panoBalls[i];
    ball.position.y = ball.userData.floatY + Math.cos(i + time * 3) * 0.02;
  }
}

export function updateUniforms(time) {
  for (let i = 0; i < panoBalls.length; i++) {
    panoBalls[i].material.uniforms.time.value = i + time;
    panoBalls[i].material.uniforms.selected.value +=
      (panoBalls[i].userData.selected - panoBalls[i].material.uniforms.selected.value) * 0.1;
  }
}
