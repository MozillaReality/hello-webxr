var scene, listener, timeout;

var sounds = {
  'bells.ogg': {position: new THREE.Vector3(1, 2, 1)},
  'cowbell.ogg': {position: new THREE.Vector3(1, 2, 1)},
  'guiro.ogg': {position: new THREE.Vector3(1, 2, 1)},
  'mandolin.ogg': {position: new THREE.Vector3(1, 2, 1)},
  'squeaker.ogg': {position: new THREE.Vector3(1, 2, 0)},
  'train.ogg': {position: new THREE.Vector3(1, 2, 0)},
  'whistle.ogg': {position: new THREE.Vector3(-1, 2, 0)},
  'castanets.ogg': {position: new THREE.Vector3(-1, 2, 0)},
  'flexatone.ogg': {position: new THREE.Vector3(-1, 2, -1)},
  'horn.ogg': {position: new THREE.Vector3(-1, 2, -1)},
  'motorhorn.ogg': {position: new THREE.Vector3(1, 2, -1)},
  'surdo.ogg': {position: new THREE.Vector3(-1, 2, -1)},
  'trumpet.ogg': {position: new THREE.Vector3(1, 2, -1)},
};
var soundNames = Object.keys(sounds);


export function setup(ctx) {
  const assets = ctx.assets;
  /*
  scene = assets['sound_model'].scene;
  assets['sound_tex'].encoding = THREE.sRGBEncoding;
  assets['sound_tex'].flipY = false;

  scene.getObjectByName('object').material =
    new THREE.MeshBasicMaterial({map: assets['sound_tex']});

  */

  scene = new THREE.Object3D();


  listener = new THREE.AudioListener();

  for (let i in sounds) {
    let sound = new THREE.PositionalAudio(listener);
    let audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/ogg/' + i, buffer => {
      sound.setBuffer(buffer);
      //sound.setRefDistance(20);
    });

    let sphere = new THREE.SphereGeometry(0.3);
    let material = new THREE.MeshBasicMaterial();
    let mesh = new THREE.Mesh(sphere, material);
    mesh.visible = false;
    mesh.position.copy(sounds[i].position);
    scene.add(mesh);
    mesh.add(sound);

    sounds[i].player = sound;
    sounds[i].mesh = mesh;
  }
}


var currentSound = 0;

function playSound() {
  let sound = sounds[soundNames[currentSound]];

  sound.player.pause();
  sound.mesh.visible = false;

  currentSound = (currentSound + 1) % soundNames.length;
  sound = sounds[soundNames[currentSound]];

  sound.player.play();
  sound.mesh.visible = true;

  timeout = setTimeout(playSound, 2000);
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(scene);
  ctx.camera.add(listener);
  ctx.camera.position.set(0, 1.6, 0);
  sounds['cowbell.ogg'].player.play();
  timeout = setTimeout(playSound, 2000);
}

export function exit(ctx) {
  ctx.scene.remove(scene);
  ctx.camera.remove(listener);
  clearTimeout(timeout);
}

export function execute(ctx, delta, time) {
}
