export class Object3D {
  constructor() {
    this.value = null;
  }

  reset() {
    this.value = null;
  }
}

export class Text {
  constructor() {
    this.text = '';
    this.textAlign = 'left'; // ['left', 'right', 'center']
    this.anchor = 'center'; // ['left', 'right', 'center', 'align']
    this.baseline = 'center'; // ['top', 'center', 'bottom']
    this.color = '#FFF';
    this.font = 'https://code.cdn.mozilla.net/fonts/ttf/ZillaSlab-SemiBold.ttf';
    this.fontSize = 0.2;
    this.letterSpacing = 0;
    this.lineHeight = 0;
    this.maxWidth = Infinity;
    this.overflowWrap = 'normal'; // ['normal', 'break-word']
    this.whiteSpace = 'normal'; // ['normal', 'nowrap']
    this.opacity = 1;
  }

  reset() {
    this.text = '';
  }
}
