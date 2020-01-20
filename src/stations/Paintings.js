import * as THREE from 'three';

var paintings;
var zoom = {object: null, widget: null, controller: null, animation: 0, icon: null};
const PAINTINGS = ['seurat', 'sorolla', 'bosch', 'degas', 'rembrandt'];
const RATIOS = [1, 1, 0.5, 0.5, 1];
const ZOOMS = [0.4, 0.2, 0.2, 0.4, 0.25];


export function enter(ctx) {
  ctx.raycontrol.activateState('paintings');
}

export function setup(ctx, hall) {
  for (let i in PAINTINGS) {
    let painting = PAINTINGS[i];
    let mesh = hall.getObjectByName(painting);
    if (!mesh) { continue; }

    let paintingTexture = ctx.assets[`painting_${painting}_tex`];
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
          zoomRatio: {value: 1}
        },
        vertexShader: ctx.shaders.basic_vert,
        fragmentShader: ctx.shaders.zoom_frag,
        transparent: true,
        depthTest: false,
        depthWrite: false
      })
  );
  zoom.widget.geometry.rotateY(-Math.PI / 2);
  zoom.widget.visible = false;

  zoom.icon = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.2),
    new THREE.MeshBasicMaterial({
      map: ctx.assets['zoomicon_tex'],
      transparent: true
      //side: THREE.DoubleSide
    })
  );
  zoom.icon.geometry.rotateY(-Math.PI / 2);
  zoom.icon.visible = false;

  ctx.scene.add(zoom.icon);
  ctx.scene.add(zoom.widget);

  ctx.raycontrol.addState('paintings', {
    colliderMesh: hall.getObjectByName('paintings'),
    onHover: (intersection, active, controller) => {
      if (intersection.distance > 3) { return; }
      if (active) {
        zoom.painting = intersection.object;
        zoom.controller = controller;
        zoom.widget.material.uniforms.tex.value = zoom.painting.material.map;
        zoom.widget.material.uniforms.zoomRatio.value = RATIOS[intersection.object.userData.paintingId];
        zoom.widget.visible = true;
        refreshZoomUV(intersection);
      } else {
        zoom.icon.visible = true;
        zoom.icon.position.copy(intersection.point);
        zoom.icon.position.x -= 0.01;
      }
    },
    onHoverLeave: (intersection) => {
      zoom.painting = null;
      zoom.animation = 0;
      zoom.widget.visible = false;
      zoom.icon.visible = false;
    },
    onSelectStart: (intersection, controller) => {
      if (intersection.distance < 3) {
        zoom.painting = intersection.object;
        zoom.controller = controller;
        zoom.widget.material.uniforms.tex.value = zoom.painting.material.map;
        zoom.widget.material.uniforms.zoomRatio.value = RATIOS[intersection.object.userData.paintingId];
        zoom.widget.visible = true;
        zoom.icon.visible = false;
        refreshZoomUV(intersection);
      }
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

function refreshZoomUV(hit) {
  zoom.widget.position.copy(hit.point);
  zoom.widget.position.x -= 0.5 * zoom.animation;

  const uvs = zoom.widget.geometry.faceVertexUvs[0];
  zoom.widget.material.uniforms.zoomPos.value.copy(hit.uv);
  zoom.widget.material.uniforms.zoomAmount.value = ZOOMS[hit.object.userData.paintingId];
}
