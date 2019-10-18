var paintings;
var zoom = {object: null, widget: null, controller: null, animation: 0};
const PAINTINGS = ['seurat', 'sorolla', 'bosch', 'degas', 'rembrandt'];
const PAINTINGS_RATIOS = [1, 1, 1.875, 1, 1];

export function setup(ctx, hall) {

  for (let i in PAINTINGS) {
    let painting = PAINTINGS[i];
    let mesh = hall.getObjectByName(painting);
    if (!mesh) { continue; }

    let paintingTexture = ctx.assets[`painting_${painting}_tex`];
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

  ctx.scene.add(zoom.widget);
}


export function execute(ctx, delta, time) {
  if (zoom.painting) {
    moveZoom(delta);
  }
}


var raycasterOrigin = new THREE.Vector3();
var raycasterDirection = new THREE.Vector3();

export function onSelectStart(evt) {
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
  return true;
}

export function onSelectEnd(evt) {
  if (zoom.painting) {
    zoom.painting = null;
    zoom.animation = 0;
    zoom.widget.visible = false;
  }
  return true;
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
