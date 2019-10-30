import * as THREE from 'three';
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

//const BASIS_LIB_PATH = 'src/vendor/';
const BASIS_LIB_PATH = '/src/vendor/';

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

  var basisLoader = new BasisTextureLoader();
  basisLoader.setTranscoderPath(BASIS_LIB_PATH);
  basisLoader.detectSupport(renderer);
  var texLoader = new THREE.TextureLoader();
  var gltfLoader = new GLTFLoader();
  var objLoader = new OBJLoader();
  var fontLoader = new THREE.FontLoader();

  var loaders = {
    'gltf': gltfLoader,
    'glb': gltfLoader,
    'obj': objLoader,
    'gif': texLoader,
    'png': texLoader,
    'jpg': texLoader,
    'basis': basisLoader,
    'font': fontLoader
  };

  for (var i in assets) {
    let assetId = i;
    let assetPath = assets[i];
    let ext = assetPath.substr(assetPath.lastIndexOf('.') + 1).toLowerCase();
    loaders[ext].load(basePath + assetPath, asset => {
      console.info(`%c ${assetPath} loaded`, 'color:green');
      assets[assetId] = ext == 'font'? asset.data : asset;
      if (onComplete && allAssetsLoaded(assets)) { onComplete(); }
    }, () => {
      /* on progress */
    },
    (e) => {
      console.error('Error loading asset', e);
    }
    );
  }
}
