
const BASIS_LIB_PATH = '../src/vendor/';

function allAssetsLoaded(assets) {
  for (var i in assets) {
    if (typeof assets[i] === 'string') { return false; }
  }
  return true;
}

export function loadAssets(renderer, basePath, assets, onComplete) {
  if (basePath && basePath[basePath.length - 1] != '/') {
    basePath += '/';
  }

  var basisLoader = new THREE.BasisTextureLoader();
  basisLoader.setTranscoderPath(BASIS_LIB_PATH);
  basisLoader.detectSupport(renderer);
  var texLoader = new THREE.TextureLoader();
  var gltfLoader = new THREE.GLTFLoader();
  var objLoader = new THREE.OBJLoader();

  var loaders = {
    'gltf':  gltfLoader,
    'obj' :  objLoader,
    'gif' :  texLoader,
    'png' :  texLoader,
    'jpg' :  texLoader,
    'basis': basisLoader
  };

  for (var i in assets) {
    let assetId = i;
    let assetPath = assets[i];
    var ext = assetPath.substr(assetPath.lastIndexOf('.') + 1).toLowerCase();
    loaders[ext].load(basePath + assetPath, asset => {
      assets[assetId] = asset;
      if (onComplete && allAssetsLoaded(assets)) { onComplete(); }
    });
  }
}
