//import {Text} from '../lib/text.mjs';
import * as THREE from 'three';
import { Text, Rotation, Position, ParentObject3D } from '../components/index.js';

var newsTicker = {
  url: 'assets/tweets.json',
  hashtag: '#helloWebXR',
  hashtagText: null,
  authorText: null,
  messageText: null,
  news: [],
  current: 0
};

var screenMaterial;

export function setup(ctx, hall) {
  const newsTickerMesh = hall.getObjectByName('newsticker');

  ctx.world.createEntity();

  screenMaterial = hall.getObjectByName('screen').material;

  newsTicker.hashtagText = ctx.world.createEntity();
  newsTicker.hashtagText.addComponent(Text, {
    color: '#f6cdde', //0xdaa056,
    fontSize: 0.1,
    anchor: 'right',
    textAlign: 'right'
  }).addComponent(ParentObject3D, {value: newsTickerMesh});

  newsTicker.authorText = ctx.world.createEntity();
  newsTicker.authorText.addComponent(Text, {
    color: '#7f0c38', //0x67bccd,
    fontSize: 0.1,
    anchor: 'left',
  }).addComponent(ParentObject3D, {value: newsTickerMesh});

  newsTicker.messageText = ctx.world.createEntity();
  newsTicker.messageText.addComponent(Text, {
    color: 0x000000,
    fontSize: 0.13,
    maxWidth: 2.3,
    lineHeight: 1,
    textAlign: 'left',
    baseline: 'top',
    anchor: 'left'
  }).addComponent(ParentObject3D, {value: newsTickerMesh});

  ['hashtag', 'author', 'message'].forEach( i => {

    newsTicker[`${i}Text`].addComponent(Position, hall.getObjectByName(i).position);
    newsTicker[`${i}Text`].addComponent(Rotation, {x: 0, y: Math.PI, z: 0});
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

export function execute(ctx, delta, time) {
  var v = 0.98 + Math.sin(time * 40) * 0.02;
  screenMaterial.color.setRGB(v, v, v);
}
