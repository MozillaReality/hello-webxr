import * as THREE from 'three';
import {hsv2rgb} from '../lib/ColorUtils.js';

export default class ColorWheel {
  constructor(ctx, controller, onColorChanged) {
    this.ctx = ctx;
    this.radius = 0.1;
    this.hsv = { h: 0.0, s: 0.0, v: 1.0 };
    this.rgb = {r: 0, g: 0, b: 0};
    this.onColorChanged = onColorChanged;
    const geometry = new THREE.CircleBufferGeometry(this.radius, 12);
    var vertexShader = '\
      varying vec2 vUv;\
      void main() {\
        vUv = uv;\
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\
        gl_Position = projectionMatrix * mvPosition;\
      }\
      ';

    var fragmentShader = '\
      #define M_PI2 6.28318530718\n \
      uniform float brightness;\
      varying vec2 vUv;\
      vec3 hsb2rgb(in vec3 c){\
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, \
                          0.0, \
                          1.0 );\
          rgb = rgb * rgb * (3.0 - 2.0 * rgb);\
          return c.z * mix( vec3(1.0), rgb, c.y);\
      }\
      \
      void main() {\
        vec2 toCenter = vec2(0.5) - vUv;\
        float angle = atan(toCenter.y, toCenter.x);\
        float radius = length(toCenter) * 2.0;\
        vec3 color = hsb2rgb(vec3((angle / M_PI2) + 0.5, radius, brightness));\
        gl_FragColor = vec4(color, 1.0);\
      }\
      ';

    var material = new THREE.ShaderMaterial({
      uniforms: { brightness: { type: 'f', value: this.hsv.v } },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = 'colorWheel';
    this.controller = controller;


    const geometryLast = new THREE.CircleBufferGeometry(0.025, 12);
    let materialBlack = new THREE.MeshBasicMaterial({color: 0x000000});
    this.blackMesh = new THREE.Mesh(geometryLast, materialBlack);
    this.blackMesh.name = 'black';
    this.blackMesh.position.set(0, 0.15, 0);

    this.ui = new THREE.Group();
    this.ui.add(this.mesh);
    this.ui.add(this.blackMesh);

    var geometryRing = new THREE.RingGeometry( 0.005, 0.01, 32 );
    var materialRing = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
    this.colorSelector = new THREE.Mesh( geometryRing, materialRing );
    this.colorSelector.position.z = 0.01;
    this.colorSelector.name = 'colorSelector';
    this.ui.add(this.colorSelector);

    this.ui.name = 'ColorWheel';
    this.ui.visible = false;
    //this.ui.rotation.x = -Math.PI / 3;
    this.ui.position.y = 0.1;

    controller.add(this.ui);

    ctx.raycontrol.addState('colorwheel', {
      colliderMesh: this.ui,
      order: -1,
      onHover: (intersection, active, controller) => {
        if (active) {
          var point = intersection.point.clone();
          this.mesh.worldToLocal(point);
  
          this.colorSelector.position.x = point.x;
          this.colorSelector.position.y = point.y;
        }
      },
      onHoverLeave: (intersection) => {
      },
      onSelectStart: (intersection, controller) => {
        if (intersection.object.name === 'colorWheel') {

          var point = intersection.point.clone();
          this.mesh.updateMatrixWorld();
          this.mesh.worldToLocal(point);

          //this.objects.hueCursor.position.copy(position);
          let uv = intersection.uv.clone();
          uv.x = uv.x * 2 - 1;
          uv.y = uv.y * 2 - 1;

          let polarPosition = {
            r: this.radius * Math.sqrt(uv.x * uv.x + uv.y * uv.y),
            theta: Math.PI + Math.atan2(uv.y, uv.x)
          };
          var angle = ((polarPosition.theta * (180 / Math.PI)) + 180) % 360;
          this.hsv.h = angle / 360;
          this.hsv.s = polarPosition.r / this.radius;
          this.updateColor();
        } else {
          this.onColorChanged(intersection.object.material.color.clone().multiplyScalar(255));
        }
      },
      onSelectEnd: (intersection) => {
      }
    });
  }

  updateColor () {
    this.rgb = hsv2rgb(this.hsv);
    this.colorSelector.material.color.setRGB(this.rgb.r / 255, this.rgb.g / 255, this.rgb.b / 255);
    this.onColorChanged(this.rgb);
  }

  enter() {
    this.ctx.raycontrol.activateState('colorwheel');
  }

  exit() {
    this.ctx.raycontrol.deactivateState('colorwheel');
  }
}
