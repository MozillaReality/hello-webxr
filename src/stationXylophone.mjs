import PositionalAudioPolyphonic from './PositionalAudioPolyphonic.js';

var
  listener,
  xyloSticks = [null, null],
  xyloStickBalls = [null, null],
  xyloNotes = new Array(13),
  bbox = new THREE.Box3(),
  hallRef = null;

var NUM_NOTES = 13;

var stickNotesColliding = [
  new Array(NUM_NOTES).fill(false),
  new Array(NUM_NOTES).fill(false)
];

export function setup(ctx, hall) {
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
    note.animation = 0;
    note.resetY = note.position.y;
    note.sound = new PositionalAudioPolyphonic(listener, 10);
    audioLoader.load('assets/ogg/xylophone' + i + '.ogg', buffer => {
      note.sound.setBuffer(buffer);
    });
  }

  xyloSticks[0] = hall.getObjectByName('xylostick-left');
  xyloSticks[1] = hall.getObjectByName('xylostick-right');
  xyloSticks[0].resetPosition = xyloSticks[0].position.clone();
  xyloSticks[1].resetPosition = xyloSticks[1].position.clone();
  xyloSticks[0].resetRotation = xyloSticks[0].rotation.clone();
  xyloSticks[1].resetRotation = xyloSticks[1].rotation.clone();
  xyloStickBalls[0] = hall.getObjectByName('xylostickball-left');
  xyloStickBalls[1] = hall.getObjectByName('xylostickball-right');
  xyloStickBalls[0].geometry.computeBoundingBox();
  xyloStickBalls[1].geometry.computeBoundingBox();
}

export function enter(ctx) {
  ctx.camera.add(listener);
}

export function exit(ctx) {
  ctx.camera.remove(listener);
}

export function execute(ctx, delta, time, controllers) {
  for (var c = 0; c < 2; c++) {
    if (controllers[c].grabbing === null) { continue; }

    bbox.setFromObject(xyloStickBalls[c]).expandByScalar(-0.01);
    for (var i = 0; i < xyloNotes.length; i++) {
      let note = xyloNotes[i];
      if (note.animation > 0) {
        note.animation = Math.max(0, note.animation - delta * 4);
        note.material.emissiveIntensity = note.animation;
        note.position.y = note.resetY - note.animation * 0.005;
        console.log(note.animation);
      }

      if (bbox.intersectsBox(note.geometry.boundingBox)) {
        //console.log('intersection', c ,'with note', i);
        if (!stickNotesColliding[c][i]) {
          stickNotesColliding[c][i] = true;
          note.sound.play();
          note.animation = 1;  
        }
      } else {
        stickNotesColliding[c][i] = false;
      }
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
      xyloSticks[i].position.set(0, 0, 0);
      xyloSticks[i].rotation.set(0, 0, 0);
      controller.add(xyloSticks[i]);
      controller.grabbing = xyloSticks[i];
      return false;
    }
  }
  return true;
}

export function onSelectEnd(evt) {
  let controller = evt.target;
  if (controller.grabbing !== null) {
    let stick = controller.grabbing;
    hallRef.add(stick);
    stick.position.copy(stick.resetPosition);
    stick.rotation.copy(stick.resetRotation);
    controller.grabbing = null;
    return false;
  }
  return true;
}
