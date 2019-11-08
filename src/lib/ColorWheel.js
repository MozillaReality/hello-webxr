import * as THREE from 'three';

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
    this.ui.name = 'ColorWheel';
    this.ui.visible = false;
    //this.ui.rotation.x = -Math.PI / 3;
    this.ui.position.y = 0.1;

    controller.add(this.ui);

    ctx.raycontrol.addState('colorwheel', {
      colliderMesh: this.ui,
      order: -1,
      onHover: (intersection, active, controller) => {
        //console.log('lolaso');
      },
      onHoverLeave: (intersection) => {
        //console.log('lolaso');
      },
      onSelectStart: (intersection, controller) => {
        if (intersection.object.name === 'colorWheel') {
          var point = intersection.point.clone();
          this.mesh.updateMatrixWorld();
          this.mesh.worldToLocal(point);

          //this.objects.hueCursor.position.copy(position);
          let uv = intersection.uv.clone();
          uv.x=uv.x*2 - 1;
          uv.y=uv.y*2 - 1;
          console.log(uv, intersection.point, point);

          let polarPosition = {
            r: this.radius * Math.sqrt(uv.x * uv.x + uv.y * uv.y),
            theta: Math.PI + Math.atan2(uv.y, uv.x)
          };
          var angle = ((polarPosition.theta * (180 / Math.PI)) + 180) % 360;
          console.log(angle, polarPosition.theta, polarPosition.r);
          this.hsv.h = angle / 360;
          this.hsv.s = polarPosition.r / this.radius;
          this.updateColor();
        } else {
          this.onColorChanged(intersection.object.material.color.clone().multiplyScalar(255));
        }
      },
      onSelectEnd: (intersection) => {
        //console.log('lolaso');
      }
    });
  }

  updateColor () {
    this.rgb = this.hsv2rgb(this.hsv);
    this.onColorChanged(this.rgb);
    //var color = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
    //this.handEl.setAttribute('brush', 'color', color);
    //this.colorHasChanged = true;
  }

  hsv2rgb(hsv) {
    var r, g, b, i, f, p, q, t;
    var h = THREE.Math.clamp(hsv.h, 0, 1);
    var s = THREE.Math.clamp(hsv.s, 0, 1);
    var v = hsv.v;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  rgb2hsv(r, g, b) {
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var d = max - min;
    var h;
    var s = (max === 0 ? 0 : d / max);
    var v = max;

    if (arguments.length === 1) { g = r.g; b = r.b; r = r.r; }

    switch (max) {
      case min: h = 0; break;
      case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
      case g: h = (b - r) + d * 2; h /= 6 * d; break;
      case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }
    return {h: h, s: s, v: v};
  }

  enter() {
    this.ctx.raycontrol.activateState('colorwheel');
  }

  exit() {
    this.ctx.raycontrol.deactivateState('colorwheel');
  }
}

