import * as THREE from 'three';

class ColorWheel {
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

function angleBetween(point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
}

export function enter(ctx) {
  ctx.raycontrol.activateState('graffiti');
  colorWheel.enter();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var material, wall, drawContext;
var lastPosition = new THREE.Vector2();
var brushImg, canvasTmp, ctxTmp;

var lastController;
var paintImg = new Image();

function colorize(r, g, b) {
  ctxTmp.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
  ctxTmp.drawImage(brushImg, 0, 0);
  let imgData = ctxTmp.getImageData(0, 0, canvasTmp.width, canvasTmp.height);
  for (var t = 0; t < imgData.data.length; t += 4) {
     imgData.data[t]= r * imgData.data[t] / 255;
     imgData.data[t + 1]= g * imgData.data[t + 1] / 255;
     imgData.data[t + 2]= b * imgData.data[t + 2] / 255;
  }
  ctxTmp.putImageData(imgData,0,0);
  paintImg.src = canvasTmp.toDataURL();
}

var colorWheel;

export function setup(ctx, hall) {

  let listener = new THREE.AudioListener();

  const sound = new THREE.PositionalAudio(listener);
  sound.loop = true;
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('assets/ogg/spray.ogg', buffer => {
    sound.setBuffer(buffer);
    sound.name = 'spraySound';
    ctx.controllers[0].add(sound);
  });


  colorWheel = new ColorWheel(ctx, ctx.controllers[1], (rgb) => {
    console.log(rgb);
    colorize(
      rgb.r,
      rgb.g,
      rgb.b);
  });

  const geo = new THREE.PlaneBufferGeometry(5, 4, 1);

  let width = 2048;
  let height = 1024;
  let maxDistance = 1;

  brushImg = new Image();
  canvasTmp = document.createElement('canvas');
  canvasTmp.style.position = "absolute";
  canvasTmp.style.width = "20%";
  //canvasTmp.style.backgroundColor = "#333";

  ctxTmp = canvasTmp.getContext('2d');
  document.body.appendChild(canvasTmp);

  brushImg.onload = () => {
    canvasTmp.width = brushImg.width;
    canvasTmp.height = brushImg.height;
  }
  brushImg.src = 'assets/spray.png';


  var drawingCanvas = document.createElement('canvas');
  // document.body.appendChild(drawingCanvas);
  //drawingCanvas.style.position = "absolute";
  //drawingCanvas.style.width = "20%";

  drawingCanvas.width = width;
  drawingCanvas.height = height;
  drawContext = drawingCanvas.getContext('2d');
  drawContext.clearRect(0, 0, width, height);
  //drawContext.fillStyle = '#333';
  drawContext.fillStyle = '#fff';
  drawContext.fillRect(0, 0, width, height);

  let map = new THREE.CanvasTexture( drawingCanvas );

  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    lightMap: ctx.assets['lightmap_tex'],
    map: map
  });

  wall = hall.getObjectByName('graffiti');
  wall.material = material;

  ctx.raycontrol.addState('graffiti', {
    colliderMesh: wall,
    onHover: (intersection, active, controller) => {
      if (active)
      {
        var distance = intersection.distance;

        if (distance > maxDistance) { return; }

        let x = intersection.uv.x * width;
        let y = height - intersection.uv.y * height;

        //let radius = 0.5 + distance * 10;
/*
        console.log(distance, radius, alpha);
        drawContext.globalAlpha = alpha;

        drawContext.arc(x, y, radius, 0, 2*Math.PI);
        drawContext.fillStyle = '#000';
        drawContext.fill();
        /*
        drawContext.strokeStyle = 'yellow';
        drawContext.stroke();
*/

        var position = new THREE.Vector2(x, y);
        drawContext.imageSmoothingEnabled = true;
        drawContext.fillStyle = '#f00';
        drawContext.strokeStyle = '#0f0';
        var dist = lastPosition.distanceTo(position);
        var angle = angleBetween(lastPosition, position);
        let alpha = 1 - distance;
        if (alpha < 0) {alpha = 0}
        if (alpha > 1) {alpha = 1}

        function lerp(start, end, t) {
          return ( 1 - t ) * start+ t * end;
        }

        drawContext.globalAlpha = alpha;

        for (var i = 0; i < dist; i ++ /* +=4 */) {
            var _x = lastPosition.x + (Math.sin(angle) * i);
            var _y = lastPosition.y + (Math.cos(angle) * i);
            drawContext.save();
            drawContext.translate(_x, _y);
            //let r = 0.01;
            //let r = 0.5;
            //let r = 0.5;
            let r = lerp(0.001, 0.2, distance);
            drawContext.scale(r, r);

            drawContext.rotate(Math.PI * 180 / getRandomInt(0, 180));

            drawContext.drawImage(paintImg, -brushImg.width / 2, -brushImg.height / 2);
            drawContext.restore();
        }

        lastPosition.set(x, y);

        material.map.needsUpdate = true;
      }
    },
    onHoverLeave: (intersection) => {
    },
    onSelectStart: (intersection, controller) => {
      var distance = intersection.distance;

      if (distance > maxDistance) { return; }

      lastController = controller;
      controller.getObjectByName('spraySound').play();

      let x = intersection.uv.x * width;
      let y = height - intersection.uv.y * height;

      lastPosition.set(x, y);
    },
    onSelectEnd: (intersection) => {
      if (!lastController) { return; }
      lastController.getObjectByName('spraySound').stop();
    }
  });
}

export function execute(ctx, delta, time) {

}
