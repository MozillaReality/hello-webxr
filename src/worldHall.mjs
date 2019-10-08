var
  scene,
  hall,
  teleportFloor,
  fader,
  panoBalls = [],
  objectMaterials,
  panoFxMaterial,
  paintings,
  controllers;

var zoom = {object: null, widget: null, controller: null, animation: 0};

const PAINTINGS = ['seurat', 'sorolla', 'bosch', 'degas', 'rembrandt'];
const PAINTINGS_RATIOS = [1, 1, 1.875, 1, 1];


function createDoorMaterial(ctx) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0},
      selected: {value: 0},
      tex: {value: ctx.assets['panoballfx_tex']}
    },
    vertexShader: ctx.shaders.basic_vert,
    fragmentShader: ctx.shaders.door_frag
  });
}

export function setup(ctx) {
  const assets = ctx.assets;

  const hallLightmapTex = assets['lightmap_tex'];
  hallLightmapTex.encoding = THREE.sRGBEncoding;
  hallLightmapTex.flipY = false;

  objectMaterials = {
    hall: new THREE.MeshBasicMaterial({
      lightMap: hallLightmapTex
    }),
    lightpanels: new THREE.MeshBasicMaterial(),
    doorA: createDoorMaterial(ctx),
    doorB: createDoorMaterial(ctx),
    doorC: createDoorMaterial(ctx),
    doorD: createDoorMaterial(ctx)
  };

  scene = new THREE.Object3D();

  hall = assets['hall_model'].scene;
  hall.traverse(o => {
    if (o.name == 'teleport') {
      teleportFloor = o;
      o.visible = false;
      return;
    }
    if (o.type == 'Mesh' && objectMaterials[o.name]) {
      o.material = objectMaterials[o.name];
    }
  });

  // paintings
  for (let i in PAINTINGS) {
    let painting = PAINTINGS[i];
    let mesh = hall.getObjectByName(painting);
    if (!mesh) { continue; }

    let paintingTexture = assets[`painting_${painting}_tex`];
    paintingTexture.encoding = THREE.sRGBEncoding;
    paintingTexture.flipY = false;
    mesh.material = new THREE.MeshBasicMaterial({
      map: paintingTexture
    });
    mesh.userData.paintingId = i;
  }

  paintings = hall.getObjectByName('paintings');

  zoom.widget = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial({color:0xff0000}));
  zoom.widget.geometry.rotateY(-Math.PI / 2);
  zoom.widget.visible = false;

  const lightSun = new THREE.DirectionalLight(0xeeffff);
  lightSun.position.set(0.2, 1, 0.1);
  const lightFill = new THREE.DirectionalLight(0xfff0ee, 0.3);
  lightFill.position.set(-0.2, -1, -0.1);

  const panoBallsConfig = [
    {src: 'pano1small', position: new THREE.Vector3(2.0, 1.5, 0.5)},
    {src: 'pano2small', position: new THREE.Vector3(-2.1, 1.5, 0)}
  ];

  const panoGeo = new THREE.SphereBufferGeometry(0.15, 30, 20);
  assets['panoballfx_tex'].wrapT = THREE.RepeatWrapping;
  assets['panoballfx_tex'].wrapS = THREE.RepeatWrapping;

  for (var i = 0; i < panoBallsConfig.length; i++) {
    const config = panoBallsConfig[i];
    assets[config.src].encoding = THREE.sRGBEncoding;
    var pano = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.15, 30, 20),
      new THREE.ShaderMaterial({
        uniforms: {
          time: {value: 0},
          tex: {value: assets[config.src]},
          texfx: {value: assets['panoballfx_tex']},
        },
        vertexShader: ctx.shaders.panoball_vert,
        fragmentShader: ctx.shaders.panoball_frag,
        side: THREE.BackSide,
      })
    );
    pano.position.copy(config.position);
    pano.resetPosition = new THREE.Vector3().copy(config.position);

    panoBalls.push(pano);
    scene.add(pano);
  }

  fader = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(),
    new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, depthTest: false})
  );
  fader.position.z = -0.1;

  scene.add(lightSun);
  scene.add(lightFill);
  scene.add(hall);
  scene.add(zoom.widget);
  ctx.camera.add(fader);
}

export function enter(ctx) {
  ctx.renderer.setClearColor( 0x92B4BB );
  controllers = ctx.controllers;
  ctx.controllers[1].addEventListener('selectstart', onSelectStart);
  ctx.controllers[1].addEventListener('selectend', onSelectEnd);
  ctx.scene.add(scene);
}

export function exit(ctx) {
  ctx.scene.remove(scene);
  ctx.controllers[1].removeEventListener('selectstart', onSelectStart);
  ctx.controllers[1].removeEventListener('selectend', onSelectEnd);
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
      ball.scale.set(1, 1, 1);
      ball.position.copy(ball.resetPosition);
      ball.position.y = 1.5 + Math.cos(i + time * 3) * 0.02;
    }
  }

  if (zoom.painting) {
    moveZoom(delta);
  }

  updateUniforms(time);
  checkCameraBoundaries(ctx);
}

function updateUniforms(time) {
  objectMaterials.doorA.uniforms.time.value = time;
  objectMaterials.doorB.uniforms.time.value = time;
  objectMaterials.doorC.uniforms.time.value = time;
  objectMaterials.doorD.uniforms.time.value = time;
  objectMaterials.doorD.uniforms.selected.value = 1; //test
  panoBalls[0].material.uniforms.time.value = time;
  panoBalls[1].material.uniforms.time.value = time;
}

function checkCameraBoundaries(ctx) {
  const cam = ctx.camera.position;
  const margin = 0.25;
  var fade = 0;
  if (cam.y < margin)     { fade = 1 - (cam.y / margin); }
  else if (cam.x < -5.4)  { fade = (-cam.x - 5.4) / margin; }
  else if (cam.x > 8)     { fade = (cam.x - 8) / margin; }
  else if (cam.z < -6.45) { fade = (-cam.z - -6.45) / margin; }
  else if (cam.z > 6.4)  { fade = (cam.z - 6.4) / margin; }
  fader.material.opacity = Math.min(1, Math.max(0, fade));
}


var raycasterOrigin = new THREE.Vector3();
var raycasterDirection = new THREE.Vector3();

function onSelectStart(evt) {
  let controller = evt.target;

  controller.getWorldPosition(raycasterOrigin);
  controller.getWorldDirection(raycasterDirection);
  raycasterDirection.negate();

  controller.raycaster.set(raycasterOrigin, raycasterDirection);
  var intersects = controller.raycaster.intersectObject(paintings, true);

  if (intersects.length == 0) { return; }

  zoom.painting= intersects[0].object;
  zoom.controller = controller;
  zoom.widget.material = zoom.painting.material;
  zoom.widget.visible = true;
  refreshZoomUV(intersects[0]);
}

function onSelectEnd(evt) {
  if (zoom.painting) {
    zoom.painting = null;
    zoom.animation = 0;
    zoom.widget.visible = false;
  }
}

function moveZoom(delta) {

  if (zoom.animation < 1) {
    zoom.animation += (1 - zoom.animation) * delta * 4.0;
  }
  const controller = zoom.controller;
  controller.getWorldPosition(raycasterOrigin);
  controller.getWorldDirection(raycasterDirection);
  raycasterDirection.negate();

  controller.raycaster.set(raycasterOrigin, raycasterDirection);
  var intersects = controller.raycaster.intersectObject(paintings, true);
  if (intersects.length == 0 || intersects[0].object !== zoom.painting) { return; }

  refreshZoomUV(intersects[0]);
}

var minUV = new THREE.Vector2();
var maxUV = new THREE.Vector2();
const zoomAmount = 0.05;

function refreshZoomUV(hit) {

  zoom.widget.position.copy(hit.point);
  zoom.widget.position.x -= 0.3 * zoom.animation;

  const uvs = zoom.widget.geometry.faceVertexUvs[0];
  const ratio = PAINTINGS_RATIOS[zoom.painting.userData.paintingId];
  //const amount = zoomAmount  // TODO: adjust zoom amount depending on hit.distance
  hit.uv.clampScalar(zoomAmount, 1 - zoomAmount);
  minUV.set(hit.uv.x - zoomAmount, hit.uv.y + zoomAmount * ratio);
  maxUV.set(hit.uv.x + zoomAmount, hit.uv.y - zoomAmount * ratio);
  uvs[0][0].x = minUV.x;
  uvs[0][0].y = maxUV.y;
  uvs[0][1].x = minUV.x;
  uvs[0][1].y = minUV.y;
  uvs[0][2].x = maxUV.x;
  uvs[0][2].y = maxUV.y;

  uvs[1][0].x = minUV.x;
  uvs[1][0].y = minUV.y;
  uvs[1][1].x = maxUV.x;
  uvs[1][1].y = minUV.y;
  uvs[1][2].x = maxUV.x;
  uvs[1][2].y = maxUV.y;
  zoom.widget.geometry.uvsNeedUpdate = true;
}
