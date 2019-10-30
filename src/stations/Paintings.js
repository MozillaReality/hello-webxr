import * as THREE from 'three';

var paintings;
var zoom = {object: null, widget: null, controller: null, animation: 0};
const PAINTINGS = ['seurat', 'sorolla', 'bosch1', 'bosch2', 'degas', 'rembrandt'];
const PAINTINGS_RATIOS = [1, 1, 1, 1, 1, 1];

export function enter(ctx) {
  ctx.raycontrol.activateState('paintings');
}

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

  ctx.raycontrol.addState('paintings', {
    colliderMesh: hall.getObjectByName('paintings'),
    onHover: (intersection, active, controller) => {
      if (active) {
        zoom.painting = intersection.object;
        zoom.controller = controller;
        zoom.widget.material = zoom.painting.material;
        zoom.widget.visible = true;
        refreshZoomUV(intersection);
      }
    },
    onHoverLeave: (intersection) => {
      zoom.painting = null;
      zoom.animation = 0;
      zoom.widget.visible = false;
    },
    onSelectStart: (intersection, controller) => {
      // controller = evt.target;
      zoom.painting = intersection.object;
      zoom.controller = controller;
      zoom.widget.material = zoom.painting.material;
      zoom.widget.visible = true;
      refreshZoomUV(intersection);
    },
    onSelectEnd: (intersection) => {
      zoom.painting = null;
      zoom.animation = 0;
      zoom.widget.visible = false;
    }
  });
}

export function execute(ctx, delta, time) {
  if (zoom.painting) {
      if (zoom.animation < 1) {
        zoom.animation += (1 - zoom.animation) * delta * 4.0;
      }
  }
}

var minUV = new THREE.Vector2();
var maxUV = new THREE.Vector2();
const zoomAmount = 0.05;

function refreshZoomUV(hit) {
  zoom.widget.position.copy(hit.point);
  zoom.widget.position.x -= 0.5 * zoom.animation;

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
