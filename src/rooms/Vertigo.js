import * as THREE from 'three';
var scene, doorMaterial, door;

function createDoorMaterial(ctx) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0},
      selected: {value: 0},
      tex: {value: ctx.assets['doorfx_tex']}
    },
    vertexShader: ctx.shaders.basic_vert,
    fragmentShader: ctx.shaders.door_frag
  });
}

export function setup(ctx) {
  const assets = ctx.assets;
  var texture = assets['checkboard_tex'];

  var lightmap = assets['vertigo_lm_tex'];
  const material = new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, lightMap: lightmap} );

  scene = assets['vertigo_model'].scene;
  scene.getObjectByName('city').material = material;
  scene.getObjectByName('teleport').visible = false;

  scene.getObjectByName('door_frame').material =
    new THREE.MeshBasicMaterial({map: assets['vertigo_door_lm_tex']});
  doorMaterial = createDoorMaterial(ctx);
  door = scene.getObjectByName('door');
  door.material = doorMaterial;

  ctx.raycontrol.addState('doorVertigo', {
    colliderMesh: scene.getObjectByName('door'),
    onHover: (intersection, active) => {
      //teleport.onHover(intersection.point, active);
      const scale = intersection.object.scale;
      scale.z = Math.min(scale.z + 0.02 * (2 - door.scale.z), 0.8);
    },
    onHoverLeave: () => {
      //teleport.onHoverLeave();
    },
    onSelectStart: (intersection, e) => {
      ctx.goto = 0;
      //teleport.onSelectStart(e);
    },
    onSelectEnd: (intersection) => {
      //teleport.onSelectEnd(intersection.point);
    }
  });

  let teleport = scene.getObjectByName('teleport');
  teleport.visible = true;
  teleport.material.visible = false;
  ctx.raycontrol.addState('teleportVertigo', {
    colliderMesh: teleport,
    onHover: (intersection, active) => {
      ctx.teleport.onHover(intersection.point, active);
    },
    onHoverLeave: () => {
      ctx.teleport.onHoverLeave();
    },
    onSelectStart: (intersection, e) => {
      ctx.teleport.onSelectStart(e);
    },
    onSelectEnd: (intersection) => {
      ctx.teleport.onSelectEnd(intersection.point);
    }
  });
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x677FA7);
  ctx.scene.add(scene);
  ctx.scene.parent.fog = new THREE.FogExp2(0x677FA7, 0.004);
  //ctx.cameraRig.position.set(0,0,0);

  ctx.raycontrol.activateState('teleportVertigo');
  ctx.raycontrol.activateState('doorVertigo');
}

export function exit(ctx) {
  ctx.scene.remove(scene);
  ctx.scene.parent.fog = null;

  ctx.raycontrol.deactivateState('teleportVertigo');
  ctx.raycontrol.deactivateState('doorVertigo');
}

export function execute(ctx, delta, time) {
  doorMaterial.uniforms.time.value = time;

  if (door.scale.z > 0.2) {
    door.scale.z = Math.max(door.scale.z - delta * door.scale.z, 0.2);
  }
}

