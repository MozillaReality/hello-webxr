import * as THREE from 'three';
import ColorWheel from '../lib/ColorWheel';
import {Area, AreaReactor, AreaChecker, Object3D, BoundingBox, ParentObject3D, DebugHelper} from '../components/index';
import {angleBetween, getRandomInt} from '../lib/utils.js';

var colorWheel;

export function enter(ctx) {
  //ctx.raycontrol.activateState('graffiti');
  if (colorWheel) {
    colorWheel.enter();
  }
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

export function setup(ctx, hall) {

  let area = ctx.world.createEntity();
  area.name = 'area';
  area
    .addComponent(BoundingBox)
    //.addComponent(DebugHelper)
    .addComponent(ParentObject3D, {value: hall})
    .addComponent(Area);

    let component = area.getMutableComponent(BoundingBox);
  component.min.set(-5, 0, 4.4);
  component.max.set(3, 3, 7);

  let checker = ctx.world.createEntity();
  let checkerSpray = ctx.world.createEntity();
  let spray = ctx.assets['spray_model'].scene;

  function attachSprayCan(controllerData) {
    let controller = controllerData.controller;
    const handedness = controllerData.inputSource.handedness;
    let listener = new THREE.AudioListener();

    const sound = new THREE.PositionalAudio(listener);
    sound.loop = true;
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/ogg/spray.ogg', buffer => {
      sound.setBuffer(buffer);
      sound.name = 'spraySound';
      controller.add(sound);
    });

    spray.getObjectByName('spraycan').geometry.rotateY(handedness === "right" ? Math.PI / 2 : -Math.PI / 2);
    spray.name = 'spray';
    spray.visible = false;
    const sprayTex = ctx.assets['spray_tex'];
    spray.getObjectByName('spraycan').material = new THREE.MeshPhongMaterial({map: sprayTex});
    spray.getObjectByName('spraycolor').material = new THREE.MeshLambertMaterial({color: 0xFF0000});
    controller.add(spray);
  }

  function attachColorWheel(controllerData) {
    let controller = controllerData.controller;
    colorWheel = new ColorWheel(ctx, controller, (rgb) => {
      colorize(
        rgb.r,
        rgb.g,
        rgb.b);
      spray.getObjectByName('spraycolor').material.color.setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
    });

    colorWheel.enter();
  }

  ctx.raycontrol.addEventListener('controllerConnected', controllerData => {
    if (ctx.raycontrol.matchController(controllerData, "primary")) {
      attachSprayCan(controllerData);
      checkerSpray
      .addComponent(AreaChecker)
      .addComponent(Object3D, {value: controllerData.controller})
      .addComponent(AreaReactor, {
        onEntering: entity => {
          const obj3D = entity.getComponent(Object3D).value;
          obj3D.getObjectByName('Scene').visible = false;
          obj3D.getObjectByName('spray').visible = true;
          let raycasterContext = obj3D.getObjectByName('raycasterContext');
          raycasterContext.rotation.set(-Math.PI / 2, (controllerData.inputSource.handedness === "right" ? 1 : -1) * Math.PI / 2, 0);
          raycasterContext.position.set(0,-0.015,-0.025)
          ctx.raycontrol.setLineStyle('basic');
          ctx.raycontrol.activateState('graffiti');
        },
        onExiting: entity => {
          const obj3D = entity.getComponent(Object3D).value;
          obj3D.getObjectByName('Scene').visible = true;
          obj3D.getObjectByName('spray').visible = false;
          let raycasterContext = obj3D.getObjectByName('raycasterContext');
          raycasterContext.rotation.set(0,0,0);
          raycasterContext.position.set(0,0,0);
          ctx.raycontrol.setLineStyle('advanced');
          ctx.raycontrol.deactivateState('graffiti');
        }
      });
    } else {
      attachColorWheel(controllerData);
      checker
      .addComponent(AreaChecker)
      .addComponent(Object3D, {value: controllerData.controller})
      .addComponent(AreaReactor, {
        onEntering: entity => {
          const obj3D = entity.getComponent(Object3D).value;
          obj3D.getObjectByName('Scene').visible = false;
          obj3D.getObjectByName('ColorWheel').visible = true;
        },
        onExiting: entity => {
          const obj3D = entity.getComponent(Object3D).value;
          obj3D.getObjectByName('Scene').visible = true;
          obj3D.getObjectByName('ColorWheel').visible = false;
        }
      });
    }
  });

  let width = 2048;
  let height = 1024;
  let maxDistance = 1;

  brushImg = new Image();
  canvasTmp = document.createElement('canvas');
  //canvasTmp.style.position = "absolute";
  //canvasTmp.style.width = "20%";
  //canvasTmp.style.backgroundColor = "#333";
  ctxTmp = canvasTmp.getContext('2d');
  // document.body.appendChild(canvasTmp);

  brushImg.onload = () => {
    canvasTmp.width = brushImg.width;
    canvasTmp.height = brushImg.height;
    colorize(0,0,0);
  }
  brushImg.src = 'assets/spray_brush.png';

  var drawingCanvas = document.createElement('canvas');

  drawingCanvas.width = width;
  drawingCanvas.height = height;
  drawContext = drawingCanvas.getContext('2d');
  drawContext.clearRect(0, 0, width, height);
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

  var aux2 = new THREE.Vector2();

  ctx.raycontrol.addState('graffiti', {
    colliderMesh: wall,
    lineStyleOnIntersection: 'basic',
    onHover: (intersection, active, controller) => {
      if (active)
      {
        var distance = intersection.distance;

        if (distance > maxDistance) { return; }

        let x = intersection.uv.x * width;
        let y = height - intersection.uv.y * height;

        aux2.set(x, y);
        drawContext.imageSmoothingEnabled = true;
        drawContext.fillStyle = '#f00';
        drawContext.strokeStyle = '#0f0';
        var dist = lastPosition.distanceTo(aux2);
        var angle = angleBetween(lastPosition, aux2);
        let alpha = THREE.Math.clamp(1 - distance, 0, 1);

        drawContext.globalAlpha = alpha;

        for (var i = 0; i < dist; i ++ /* +=4 */) {
            var _x = lastPosition.x + (Math.sin(angle) * i);
            var _y = lastPosition.y + (Math.cos(angle) * i);
            drawContext.save();
            drawContext.translate(_x, _y);
            let r = THREE.Math.lerp(0.001, 0.2, distance);
            drawContext.scale(r, r);

            drawContext.rotate(Math.PI * 180 / getRandomInt(0, 180));

            drawContext.drawImage(paintImg, -brushImg.width / 2, -brushImg.height / 2);
            drawContext.restore();
        }

        lastPosition.set(x, y);

        material.map.needsUpdate = true;
      }
    },
    onHoverLeave: (intersection) => {},
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

export function execute(ctx, delta, time) {}
