import * as THREE from 'three';
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

//const BASIS_LIB_PATH = 'src/vendor/';
const BASIS_LIB_PATH = 'src/vendor/';
const DRACO_LIB_PATH = 'src/vendor/';

function getLoadedCount(assets) {
  let count = 0;
  for (var i in assets) {
    if (assets[i].loading !== true) { count ++; }
  }
  return count;
}

function allAssetsLoaded(assets) {
  for (var i in assets) {
    if (assets[i].loading === true) { return false; }
  }
  return true;
}

export function loadAssets(renderer, basePath, assets, onComplete, onProgress, debug) {
  if (basePath && basePath[basePath.length - 1] != '/') {
    basePath += '/';
  }

  var basisLoader = new BasisTextureLoader();
  basisLoader.setTranscoderPath(BASIS_LIB_PATH);
  basisLoader.detectSupport(renderer);

  var gltfLoader = new GLTFLoader();
  var dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_LIB_PATH);
  gltfLoader.setDRACOLoader(dracoLoader);

  var texLoader = new THREE.TextureLoader();
  var objLoader = new OBJLoader();
  var fontLoader = new THREE.FontLoader();
  var audioLoader = new THREE.AudioLoader();


  var loaders = {
    'gltf': gltfLoader,
    'glb': gltfLoader,
    'obj': objLoader,
    'gif': texLoader,
    'png': texLoader,
    'jpg': texLoader,
    'basis': basisLoader,
    'font': fontLoader,
    'ogg': audioLoader
  };

  for (var i in assets) {
    let assetId = i;
    let assetPath = assets[i].url;
    assets[i].loading = true;
    let ext = assetPath.substr(assetPath.lastIndexOf('.') + 1).toLowerCase();
    loaders[ext].load(basePath + assetPath, asset => {
      if (debug) {
        console.info(`%c ${assetPath} loaded`, 'color:green');
      }
      var options = assets[assetId].options;
      assets[assetId] = ext == 'font'? asset.data : asset;

      if (typeof options !== "undefined") {
        if (typeof options.repeat !== "undefined") {
          assets[assetId].repeat.set(options.repeat[0], options.repeat[1]);
          delete options.repeat;
        }
        for (let opt in options) {
          assets[assetId][opt] = options[opt];
        }

        if (onProgress) { onProgress(getLoadedCount(assets)) };
      }

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
