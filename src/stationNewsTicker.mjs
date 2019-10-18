import {Text} from './text.mjs';

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

  newsTicker.hashtagText = new Text({
    font: ctx.assets['inter_bold_font'],
    map: ctx.assets['inter_bold_tex'],
    size: 2,
    align: 'right',
    anchor: 'right',
    width: 350,
    color: 0xdaa056
  });

  newsTicker.authorText = new Text({
    font: ctx.assets['inter_bold_font'],
    map: ctx.assets['inter_bold_tex'],
    size: 2,
    width: 500,
    color: 0x67bccd
  });

  newsTicker.messageText = new Text({
    font: ctx.assets['inter_regular_font'],
    map: ctx.assets['inter_regular_tex'],
    size: 2.6,
    width: 900,
    baseline: 'top',
    color: 0xffffff
  });

  ['hashtag', 'author', 'message'].forEach( i => {
    newsTickerMesh.add(newsTicker[`${i}Text`]);
    newsTicker[`${i}Text`].rotation.set(-Math.PI / 2, Math.PI, 0);
    newsTicker[`${i}Text`].position.copy(hall.getObjectByName(i).position);
  });
  newsTicker.hashtagText.value = newsTicker.hashtag;

  fetch(newsTicker.url).then(res => res.json()).then(res => {
    newsTicker.news = res;
    nextNews();
  });
}

function nextNews() {
  const n = newsTicker;
  n.authorText.value = n.news[n.current].author;
  n.messageText.value = n.news[n.current].message;
  n.current = (n.current + 1) % n.news.length;
  setTimeout(nextNews, 3000);
}
