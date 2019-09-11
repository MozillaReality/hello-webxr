var clock = new THREE.Clock();

var scene, renderer, camera, controls;
var materials;


function createMaterials() {
/*
  var basisLoader = new THREE.BasisTextureLoader();
  basisLoader.setTranscoderPath( '../src/vendor/' );
  basisLoader.detectSupport(renderer);

  basisLoader.load( '../assets/lightmap.basis', function (texture) {
    // use texture
  }, null, function (e) {console.error(e);});

  basisLoader.load( '../assets/travertine.basis', function (texture) {
    // use texture
  }, null, function (e) {console.error(e);});
*/

  var doorMaterial = new THREE.MeshLambertMaterial();

  var lightmapTexture = new THREE.TextureLoader().load('../assets/lightmap.png');
  lightmapTexture.flipY = false;

  var diffuseTexture = new THREE.TextureLoader().load('../assets/travertine.png');
  //diffuseTexture.encoding = THREE.sRGBEncoding;
  diffuseTexture.wrapS = THREE.RepeatWrapping;
  diffuseTexture.wrapT = THREE.RepeatWrapping;
  diffuseTexture.repeat.set(2, 2);

  var materials = {
    hall: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: diffuseTexture,
      lightMap: lightmapTexture
    }),
    lightpanels: new THREE.MeshBasicMaterial(),
    doorA: doorMaterial,
    doorB: doorMaterial,
    doorC: doorMaterial,
    doorD: doorMaterial
  };

  return materials;
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
  renderer.setSize( window.innerWidth, window.innerHeight );

  materials = createMaterials();

  var gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load('../assets/hall.gltf', gltf =>{
    gltf.scene.traverse(o => o.material = materials[o.name] || null);
    parent.add(gltf.scene);
  });

  document.body.appendChild( renderer.domElement );

  window.addEventListener('resize', onWindowResize, false);
  renderer.setAnimationLoop(animate);
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
