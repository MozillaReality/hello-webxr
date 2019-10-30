import * as THREE from 'three';

var
  panoBalls = [],
  panoballsParent = new THREE.Object3D(),
  bbox = new THREE.Box3(),
  panoFxMaterial,
  auxVec = new THREE.Vector3(),
  hallRef = null;

const NUM_PANOBALLS = 2;

export function enter(ctx) {
  ctx.raycontrol.activateState('panoballs');
}

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
    ball.userData.panoId = 4 + i;

    panoBalls.push(ball);
    panoballsParent.add(ball);
  }

  hall.add(panoballsParent);

  ctx.raycontrol.addState('panoballs', {
    colliderMesh: panoballsParent,
    onHover: (intersection, active, controller) => {
      if (active) {
      }
    },
    onHoverLeave: (intersection) => {
    },
    onSelectStart: (intersection, controller) => {
    },
    onSelectEnd: (intersection) => {
      ctx.goto = intersection.object.userData.panoId;
    }
  });
}

export function execute(ctx, delta, time) {
  for (let i = 0; i < panoBalls.length; i++) {
    const ball = panoBalls[i];
    ball.position.y = 1.5 + Math.cos(i + time * 3) * 0.02;
  }
}

export function updateUniforms(time) {
  panoBalls[0].material.uniforms.time.value = time;
  panoBalls[1].material.uniforms.time.value = time;
}
