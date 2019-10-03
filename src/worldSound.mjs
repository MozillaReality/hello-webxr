var scene, listener, timeout, mixer;

const soundNames = [
  'bells',
  'horn',
  'cowbell',
  'guiro',
  'mandolin',
  'squeaker',
  'train',
  'whistle',
  'castanets',
  'flexatone',
  'motorhorn',
  'surdo',
  'trumpet',
];

var sounds = {};
soundNames.forEach( i => { sounds[i] = {animations: [], mesh: null, player: null} })


export function setup(ctx) {
  const assets = ctx.assets;
  scene = assets['sound_model'].scene;
  assets['sound_floor_tex'].encoding = THREE.sRGBEncoding;

  scene.getObjectByName('floor').material =
    new THREE.MeshBasicMaterial({color: 0xaaaaaa, map: assets['sound_floor_tex']});

  listener = new THREE.AudioListener();

  mixer = new THREE.AnimationMixer(scene);

  for (let id in sounds) {
    const mesh = scene.getObjectByName(id);
    if (!mesh) { continue; } // TODO: enable this

    const sound = new THREE.PositionalAudio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/ogg/' + id + '.ogg', buffer => {
      sound.setBuffer(buffer);
      //sound.setRefDistance(20);
    });

    sounds[id].player = sound;
    sounds[id].mesh = mesh;
    mesh.visible = false;
    mesh.add(sound);

    const clip = THREE.AnimationClip.findByName(assets['sound_model'].animations, id);
    if (clip) {
      const action = mixer.clipAction(clip, mesh);
      action.loop = THREE.LoopOnce;
      sounds[id].animations.push(action);
    }

    for (let j = 0; j < mesh.children.length; j++) {
      const obj = mesh.children[j];
      const clip = THREE.AnimationClip.findByName(assets['sound_model'].animations, `${id}_${obj.name}`);
      if (!clip) { continue; }
      const action = mixer.clipAction(clip, mesh);
      action.loop = THREE.LoopOnce;
      sounds[id].animations.push(action);
    }
  }
  console.log(mixer);
}

var currentSound = -1;

function playSound() {
  let sound;
  if (currentSound >= 0) {
    sound = sounds[soundNames[currentSound]];
    sound.player.pause();
    if (sound.animations.length) {
      sound.mesh.visible = false;
      sound.animations.forEach( i => {i.stop()});
    }
  }
  do {
    currentSound = (currentSound + 1) % soundNames.length;
    sound = sounds[soundNames[currentSound]];
  } while(!sound.mesh);

  sound.player.play();
  if (sound.animations.length) {
    sound.mesh.visible = true;
    sound.animations.forEach( i => {i.play()});
  }

  timeout = setTimeout(playSound, 2000);
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(scene);
  ctx.camera.add(listener);
  ctx.camera.position.set(0, 1.6, 0);
  timeout = setTimeout(playSound, 2000);
}

export function exit(ctx) {
  ctx.scene.remove(scene);
  ctx.camera.remove(listener);
  clearTimeout(timeout);
}

export function execute(ctx, delta, time) {
  mixer.update(delta);
}
