import {loadAssets} from './assetManager.mjs';

var clock = new THREE.Clock();

var scene, parent, renderer, camera, controls, materials;

var assets = {
  lightmap_tex: 'lightmap.png',
  travertine_tex: 'travertine.png',
  hall_model: 'hall.gltf'
};


function setupMaterials() {
  var doorMaterial = new THREE.MeshLambertMaterial();
  var lightmapTex = assets['lightmap_tex'];
  lightmapTex.flipY = false;

  var diffuseTex = assets['travertine_tex'];
  //diffuseTex.encoding = THREE.sRGBEncoding;
  diffuseTex.wrapS = THREE.RepeatWrapping;
  diffuseTex.wrapT = THREE.RepeatWrapping;
  diffuseTex.repeat.set(2, 2);

  var objectMaterials = {
    hall: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: diffuseTex,
      lightMap: lightmapTex
    }),
    lightpanels: new THREE.MeshBasicMaterial(),
    doorA: doorMaterial,
    doorB: doorMaterial,
    doorC: doorMaterial,
    doorD: doorMaterial
  };

  for (var i in assets) {
    // gltf
    if (assets[i]['scene'] !== undefined) {
      assets[i].scene.traverse(o => {
        if (o.type == 'Mesh' && objectMaterials[o.name]) {
          o.material = objectMaterials[o.name];
        }
      });
    }
  }
}


function setupHall(){
  parent.add(assets['hall_model'].scene);
}

function init() {
  var w = 100;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.005, 10000);
  camera.position.set(0, 1.6, 0);
  controls = new THREE.PointerLockControls(camera);
  document.body.addEventListener('click', () => controls.lock());
  document.body.addEventListener('keydown', ev => {
    switch(ev.keyCode) {
      case 87: controls.moveForward(0.2); break;
      case 65: controls.moveRight(-0.2); break;
      case 83: controls.moveForward(-0.2); break;
      case 68: controls.moveRight(0.2); break;
    }

  });
  scene.add(controls.getObject());

  parent = new THREE.Object3D();
  scene.add(parent);

  renderer = new THREE.WebGLRenderer();
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  renderer.setClearColor( 0x92B4BB );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild( renderer.domElement );
  window.addEventListener('resize', onWindowResize, false);

  loadAssets(renderer, '../assets/', assets, () => {
    setupMaterials();
    setupHall();
    renderer.setAnimationLoop(animate);
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  var delta = clock.getDelta();
  var elapsedTime = clock.elapsedTime;
  renderer.render( scene, camera );
}

init();
