//import {Text} from '../lib/text.mjs';
import * as THREE from 'three';
import { Text, Object3D } from '../components/index.js';

var newsTicker = {
  url: 'assets/tweets.json',
  hashtag: '#helloWebXR.',
  hashtagText: null,
  authorText: null,
  messageText: null,
  news: [],
  current: 0
};

export function setup(ctx, hall) {
  const newsTickerMesh = hall.getObjectByName('newsticker');

  ctx.world.createEntity();


  newsTicker.hashtagText = ctx.world.createEntity();
  newsTicker.hashtagText.addComponent(Text, {
    color: 0xdaa056,
    fontSize: 0.1,
    anchor: 'right',
    textAlign: 'right'
  });
  let object3D = new THREE.Group();
  newsTickerMesh.add(object3D);
  newsTicker.hashtagText.addComponent(Object3D, { value: object3D });

  newsTicker.authorText = ctx.world.createEntity();
  newsTicker.authorText.addComponent(Text, {
    color: 0x67bccd,
    fontSize: 0.1,
    anchor: 'left',
  });

  object3D = new THREE.Group();
  newsTickerMesh.add(object3D);
  newsTicker.authorText.addComponent(Object3D, { value: object3D });

  newsTicker.messageText = ctx.world.createEntity();
  newsTicker.messageText.addComponent(Text, {
    color: 0x000000,
    fontSize: 0.15,
    maxWidth: 2.3,
    lineHeight: 1,
    textAlign: 'left',
    baseline: 'top',
    anchor: 'left'
  });
  object3D = new THREE.Group();
  newsTickerMesh.add(object3D);
  newsTicker.messageText.addComponent(Object3D, { value: object3D });

  const geo = new THREE.SphereBufferGeometry(0.04);
  const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
  var debugMeshes = {
    hashtag: new THREE.Mesh(geo, mat),
    author: new THREE.Mesh(geo, mat),
    message: new THREE.Mesh(geo, mat)
  };

  ['hashtag', 'author', 'message'].forEach( i => {

    newsTickerMesh.add(debugMeshes[i]);

    let object3D = newsTicker[`${i}Text`].getMutableComponent(Object3D).value;
    //newsTickerMesh.add(newsTicker[`${i}Text`]);
    object3D.rotation.set(0, Math.PI, 0);
    console.log(hall.getObjectByName(i).position);

    debugMeshes[i].position.copy(hall.getObjectByName(i).position);
    object3D.position.copy(hall.getObjectByName(i).position);
  });
  newsTicker.hashtagText.getMutableComponent(Text).text = newsTicker.hashtag;

  fetch(newsTicker.url).then(res => res.json()).then(res => {
    newsTicker.news = res;
    nextNews();
  });
}

function nextNews() {
  const n = newsTicker;
  n.authorText.getMutableComponent(Text).text = n.news[n.current].author;
  n.messageText.getMutableComponent(Text).text = n.news[n.current].message;
  n.current = (n.current + 1) % n.news.length;
  setTimeout(nextNews, 3000);
}
