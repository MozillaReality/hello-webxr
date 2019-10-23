var elevator = null;
var light1 = null, light2 = null;
var cube = null;

export function setup(ctx) {
  const assets = ctx.assets;
  var texture = assets['lanes01_tex'];
  var lightmap = assets['elevator_lm_tex'];
  lightmap.flipY = false;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const material = new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, lightMap: lightmap} );

  cube = new THREE.Mesh(
      new THREE.BoxBufferGeometry(),
      new THREE.MeshLambertMaterial({map: texture})
    );
  cube.position.set(0, 1, -3);
  elevator = assets['elevator_model'].scene;
  light1 = new THREE.PointLight(0xffffff, 1, 10);
  light2 = new THREE.AmbientLight(0xffffff, 0.03);
  light1.position.set(0, 8, -1);
  light2.position.set(0, -40, -1);
  elevator.traverse(o => {
    if (o.type == 'Mesh') {
      o.material = material;
    }
  });
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0xaaccff);
  ctx.scene.add(elevator);
  ctx.scene.add(cube);
  ctx.scene.add(light1);
  ctx.scene.add(light2);
  ctx.camera.position.set(0, 1.6, 0);
//  ctx.scene.parent.fog = new THREE.FogExp2(0xaaccff, 0.003);
}

export function exit(ctx) {
  ctx.scene.remove(elevator);
  ctx.scene.remove(cube);
  ctx.scene.remove(light1);
  ctx.scene.remove(light2);
}

export function execute(ctx, delta, time) {
  cube.position.y = Math.sin(time/2) * 5;
  cube.rotation.x += delta * 0.3;
  cube.rotation.y += delta * 0.2;
  cube.rotation.z += delta * 0.1;
}

