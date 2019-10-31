import * as THREE from 'three';
import { isContext } from 'vm';
import { LoopRepeat } from 'three';

var paintings;
var zoom = {object: null, widget: null, controller: null, animation: 0};
const PAINTINGS = ['seurat', 'sorolla', 'bosch1', 'bosch2', 'degas', 'rembrandt'];
const PAINTINGS_RATIOS = [1, 1, 1, 1, 1, 1];

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

export function setup(ctx, hall) {
  const geo = new THREE.PlaneBufferGeometry(5, 4, 1);

  this.width = 2048;
  this.height = 1024;

  var drawingCanvas = document.createElement('canvas');
  document.body.appendChild(drawingCanvas);
  drawingCanvas.style.position = "absolute";
  drawingCanvas.style.width = "20%";

  drawingCanvas.width = this.width;
  drawingCanvas.height = this.height;
  drawContext = drawingCanvas.getContext('2d');
  drawContext.clearRect(0,0,1024,1024);
  //drawContext.fillStyle = '#333';
  drawContext.fillStyle = '#fff';
  drawContext.fillRect(0,0,this.width, this.height);

  let map = new THREE.CanvasTexture( drawingCanvas );

  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: map
  });

  wall = new THREE.Mesh(geo, material);
  wall.position.set(0,0,6);
  wall.rotation.set(0,Math.PI,0);

  hall.add(wall);

  ctx.raycontrol.addState('graffiti', {
    colliderMesh: wall,
    onHover: (intersection, active, controller) => {
      if (active)
      {
        var distance = intersection.distance;

        if (distance > 1) { return; }

        let x = intersection.uv.x * 1024;
        let y = 1024 - intersection.uv.y * 1024;
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

        var position = new THREE.Vector2(x,y);
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
            drawContext.scale(r,r);

            drawContext.rotate(Math.PI * 180 / getRandomInt(0, 180));
            drawContext.drawImage(paintImg, -paintImg.width / 2, -paintImg.height / 2);
            drawContext.restore();
        }

        lastPosition.set(x, y);

        material.map.needsUpdate = true;
      }
    },
    onHoverLeave: (intersection) => {
      /*
      zoom.painting = null;
      zoom.animation = 0;
      zoom.widget.visible = false;
      */
    },
    onSelectStart: (intersection, controller) => {
      drawContext.lineJoin = drawContext.lineCap = 'round';

      let x = intersection.uv.x * 1024;
      let y = 1024 - intersection.uv.y * 1024;

      lastPosition.set(x,y);
    },
    onSelectEnd: (intersection) => {
      /*
      zoom.painting = null;
      zoom.animation = 0;
      zoom.widget.visible = false;
      */
    }
  });
}

export function execute(ctx, delta, time) {

}
