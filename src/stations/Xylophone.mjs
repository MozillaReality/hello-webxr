import PositionalAudioPolyphonic from '../lib/PositionalAudioPolyphonic.mjs';

var
  listener,
  xyloSticks = [null, null],
  xyloStickBalls = [null, null],
  xyloNotes = new Array(13),
  bbox = new THREE.Box3(),
  hallRef = null;

var auxVec = new THREE.Vector3();

var NUM_NOTES = 13;

var stickNotesColliding = [
  new Array(NUM_NOTES).fill(false),
  new Array(NUM_NOTES).fill(false)
];

export function setup(ctx, hall) {
  this.ctx = ctx;
  const audioLoader = new THREE.AudioLoader();
  listener = new THREE.AudioListener();
  hallRef = hall;

  for (let i = 0; i < NUM_NOTES; i++) {
    let noteName = 'xnote0' + (i < 10 ? '0' + i : i);
    let note = hall.getObjectByName(noteName);
    note.geometry.computeBoundingBox();
    note.geometry.boundingBox.translate(note.position).translate(note.parent.position);
    note.material = new THREE.MeshLambertMaterial();
    note.material.color.setHSL(i / 13, 0.9, 0.2);
    note.material.emissive = note.material.color.clone();
    note.material.emissiveIntensity = 0;
    xyloNotes[i] = note;
    note.userData.animation = 0;
    note.userData.resetY = note.position.y;
    note.userData.sound = new PositionalAudioPolyphonic(listener, 10);
    audioLoader.load('assets/ogg/xylophone' + i + '.ogg', buffer => {
      note.userData.sound.setBuffer(buffer);
    });
  }

  xyloSticks[0] = hall.getObjectByName('xylostick-left');
  xyloSticks[1] = hall.getObjectByName('xylostick-right');
  xyloSticks[0].userData.resetPosition = xyloSticks[0].position.clone();
  xyloSticks[1].userData.resetPosition = xyloSticks[1].position.clone();
  xyloSticks[0].userData.resetRotation = xyloSticks[0].rotation.clone();
  xyloSticks[1].userData.resetRotation = xyloSticks[1].rotation.clone();
  xyloSticks[0].userData.grabbedBy = null;
  xyloSticks[1].userData.grabbedBy = null;
  xyloSticks[0].userData.animation = 0;
  xyloSticks[1].userData.animation = 0;
  xyloStickBalls[0] = hall.getObjectByName('xylostickball-left');
  xyloStickBalls[1] = hall.getObjectByName('xylostickball-right');
  xyloStickBalls[0].geometry.computeBoundingBox();
  xyloStickBalls[1].geometry.computeBoundingBox();
}

export function enter(ctx) {
  ctx.camera.add(listener);

  let selectStart = onSelectStart.bind(this);
  let selectEnd = onSelectEnd.bind(this);

  ctx.controllers[0].addEventListener('selectstart', selectStart);
  ctx.controllers[1].addEventListener('selectstart', selectStart);
  ctx.controllers[0].addEventListener('selectend', selectEnd);
  ctx.controllers[1].addEventListener('selectend', selectEnd);
}

export function exit(ctx) {
  ctx.camera.remove(listener);

  let selectStart = onSelectStart.bind(this);
  let selectEnd = onSelectEnd.bind(this);

  ctx.controllers[0].removeEventListener('selectstart', selectStart);
  ctx.controllers[1].removeEventListener('selectstart', selectStart);
  ctx.controllers[0].removeEventListener('selectend', selectEnd);
  ctx.controllers[1].removeEventListener('selectend', selectEnd);
}

export function execute(ctx, delta, time) {
  let controllers = ctx.controllers;

  if (!controllers) {return;}

  for (var c = 0; c < 2; c++) {
    if (controllers[c].grabbing === null) { continue; }

    bbox.setFromObject(xyloStickBalls[c]).expandByScalar(-0.01);
    for (var i = 0; i < xyloNotes.length; i++) {
      let note = xyloNotes[i];
      if (note.userData.animation > 0) {
        note.userData.animation = Math.max(0, note.userData.animation - delta * 4);
        note.material.emissiveIntensity = note.userData.animation;
        note.position.y = note.userData.resetY - note.userData.animation * 0.005;
      }

      if (bbox.intersectsBox(note.geometry.boundingBox)) {
        if (!stickNotesColliding[c][i]) {
          stickNotesColliding[c][i] = true;
          note.userData.sound.play();
          note.userData.animation = 1;
        }
      } else {
        stickNotesColliding[c][i] = false;
      }
    }

    if (xyloSticks[c].userData.animation > 0){
      xyloSticks[c].userData.animation = Math.max(0, xyloSticks[c].userData.animation - delta * 4);
      auxVec.copy(xyloSticks[c].userData.resetPosition);
      auxVec.addScaledVector(xyloSticks[c].position, -xyloSticks[c].userData.animation);
      xyloSticks[c].position.add(auxVec);
    }

  }
}

export function onSelectStart(evt) {
  let controller = evt.target;
  if (controller.grabbing !== null){ return; }

  // hand grabs stick
  for (let i = 0; i < 2; i++) {
    bbox.setFromObject(xyloSticks[i]);
    if (controller.boundingBox.intersectsBox(bbox)){

      this.ctx.raycontrol.disable();

      // stick grabbed from the other hand
      if (xyloSticks[i].userData.grabbedBy) {
        xyloSticks[i].userData.grabbedBy.grabbing = null;
      }
      xyloSticks[i].position.set(0, 0, 0);
      xyloSticks[i].rotation.set(0, 0, 0);
      controller.add(xyloSticks[i]);
      controller.grabbing = xyloSticks[i];
      xyloSticks[i].userData.grabbedBy = controller;
      return false;
    }
  }
  return true;
}

export function onSelectEnd(evt) {
  this.ctx.raycontrol.enable();

  let controller = evt.target;
  if (controller.grabbing !== null) {
    let stick = controller.grabbing;
    stick.getWorldPosition(auxVec);
    hallRef.add(stick);
    stick.position.copy(auxVec);
    stick.rotation.copy(stick.userData.resetRotation);
    stick.userData.grabbedBy = null;
    //stick.userData.animation = 1;
    controller.grabbing = null;
    return false;
  }
  return true;
}
