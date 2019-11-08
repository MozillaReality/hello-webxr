import * as THREE from 'three';

var paintings;
var zoom = {object: null, widget: null, controller: null, animation: 0};
const PAINTINGS = ['seurat', 'sorolla', 'bosch1', 'bosch2', 'degas', 'rembrandt'];

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

  zoom.widget = new THREE.Mesh(
    new THREE.PlaneGeometry(),
    new THREE.ShaderMaterial({
        uniforms: {
          time: {value: 0},
          tex: {value: null},
          zoomPos: {value: new THREE.Vector2()},
          zoomAmount: {value: 0},
        },
        vertexShader: ctx.shaders.basic_vert,
        fragmentShader: ctx.shaders.zoom_frag,
        transparent: true
      })
  );
  zoom.widget.geometry.rotateY(-Math.PI / 2);
  zoom.widget.visible = false;

  ctx.scene.add(zoom.widget);

  ctx.raycontrol.addState('paintings', {
    colliderMesh: hall.getObjectByName('paintings'),
    onHover: (intersection, active, controller) => {
      if (active) {
        zoom.painting = intersection.object;
        zoom.controller = controller;
        zoom.widget.material.uniforms.tex.value = zoom.painting.material.map;
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
      zoom.widget.material.uniforms.tex.value = zoom.painting.material.map;
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
    zoom.widget.material.uniforms.time.value = time;
  }
}

var minUV = new THREE.Vector2();
var maxUV = new THREE.Vector2();
const zoomAmount = 0.2;

function refreshZoomUV(hit) {
  zoom.widget.position.copy(hit.point);
  zoom.widget.position.x -= 0.5 * zoom.animation;

  const uvs = zoom.widget.geometry.faceVertexUvs[0];

  hit.uv.clampScalar(zoomAmount, 1 - zoomAmount);
  zoom.widget.material.uniforms.zoomPos.value.copy(hit.uv);
  zoom.widget.material.uniforms.zoomAmount.value = zoomAmount;
}
