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
var paintImg = new Image();
//paintImg.src = 'assets/spray.png';
paintImg.src = 'assets/spray_black.png';
//paintImg.width = 10;

var lastController;

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

  var drawingCanvas = document.createElement('canvas');
  // document.body.appendChild(drawingCanvas);
  drawingCanvas.style.position = "absolute";
  drawingCanvas.style.width = "20%";

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

        if (distance > 1) { return; }

        let x = intersection.uv.x * width;
        let y = height - intersection.uv.y * height;
        drawContext.beginPath();

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
        let alpha = (1 / distance * 2);
        if (alpha < 0) {alpha = 0}
        if (alpha > 1) {alpha = 1}

        function lerp(start, end, t) {
          return ( 1 - t ) * start+ t * end;
        }

        drawContext.globalAlpha = 1 - distance;
        drawContext.fillStyle="rgba(255,255,255, 0.5)";

        for (var i = 0; i < dist; i++) {
            var _x = lastPosition.x + (Math.sin(angle) * i);
            var _y = lastPosition.y + (Math.cos(angle) * i);
            drawContext.save();
            drawContext.translate(_x, _y);
            //let r = 0.01;
            //let r = 0.5;
            //let r = 0.5;
            let r = lerp(0.001, 0.2, distance);
            console.log(r);
            drawContext.scale(r, r);

            drawContext.rotate(Math.PI * 180 / getRandomInt(0, 180));
            drawContext.drawImage(paintImg, -paintImg.width / 2, -paintImg.height / 2);
            drawContext.restore();
        }

        lastPosition.set(x, y);

        material.map.needsUpdate = true;
      }
    },
    onHoverLeave: (intersection) => {
    },
    onSelectStart: (intersection, controller) => {
      lastController = controller;
      controller.getObjectByName('spraySound').play();

      drawContext.lineJoin = drawContext.lineCap = 'round';

      let x = intersection.uv.x * width;
      let y = height - intersection.uv.y * height;

      lastPosition.set(x, y);
    },
    onSelectEnd: (intersection) => {
      lastController.getObjectByName('spraySound').stop();
    }
  });
}

export function execute(ctx, delta, time) {

}
