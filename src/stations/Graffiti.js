import * as THREE from 'three';
import { isContext } from 'vm';
import { LoopRepeat } from 'three';

function angleBetween(point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
}

export function enter(ctx) {
  ctx.raycontrol.activateState('graffiti');
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
      colorize(
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255);
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
