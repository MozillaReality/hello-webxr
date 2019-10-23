var city = null;
var light1 = null, light2 = null;
var rig = null;

export function setup(ctx) {
  const assets = ctx.assets;
  var texture = assets['pavement_tex'];

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6,6);
  const material = new THREE.MeshLambertMaterial({color: 0xffffff, map: texture} );

  rig = new THREE.Object3D();
  rig.position.set(-3, 200, -1.4);

  city = assets['city_model'].scene;
  light1 = new THREE.DirectionalLight(0xffffff, 1, 10);
  light2 = new THREE.AmbientLight(0xffffff, 0.03);
  light1.position.set(0, 8, -1);
  light2.position.set(0, -40, -1);
  city.traverse(o => {
    if (o.type == 'Mesh') {
      o.material = material;
    }
  });
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0xc3d2e2);
  ctx.scene.add(city);
  ctx.scene.add(light1);
  ctx.scene.add(light2);
  ctx.scene.parent.fog = new THREE.FogExp2(0xc3d2e2, 0.003);
  ctx.scene.add(rig);
  rig.add(ctx.camera);
}

export function exit(ctx) {
  ctx.scene.remove(city);
  ctx.scene.remove(light1);
  ctx.scene.remove(light2);
  ctx.scene.parent.fog = null;
  ctx.scene.add(ctx.camera);
  ctx.scene.remove(rig);
}

export function execute(ctx, delta, time) {
}

