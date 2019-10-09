var loadFont = require('load-bmfont');
var createFontGeometry = require('three-bmfont-text');
var MSDFShader = require('three-bmfont-text/shaders/msdf');

export class Text extends(THREE.Object3D){

  constructor(opts){
    super();

    if (!opts.font){
      console.warn('createText(): <font> not defined');
      return;
    }
    if (!opts.map){
      console.warn('createText(): texture <map> not defined');
      return;
    }

    this.width = opts.width || 300;
    this.size = opts.size || 1;
    this.align = opts.align || 'left';
    this.color = opts.color || 0xffffff;
    this.anchor = opts.anchor || opts.align;
    this.baseline = opts.baseline || 'bottom';
    this.negate = opts.negate !== true ? false : true;

    this.geometry = createFontGeometry({
      width: this.width,
      align: this.align,
      font: opts.font
    })

    this.material = new THREE.RawShaderMaterial(MSDFShader({
      map: opts.map,
      color: this.color,
      negate: this.negate
    }));

    const mesh = new THREE.Mesh(this.geometry, this.material);
    mesh.scale.set(0.001 * this.size, 0.001 * this.size, 1.0);
    mesh.rotation.x = Math.PI / 2;
    this.add(mesh);

    this.value = opts.value || '[TEXT]';
  }

  set value(text) {
    this.geometry.update(text);

    const layout = this.geometry.layout;
    let x = 0, y = 0;

    if (this.baseline === 'top') {
      y = layout._height + layout._ascender;
    } else if (this.baseline === 'center') {
      y = layout._height / 2;
    }

    if (this.anchor === 'right') {
      x = -layout._width;
    } else if (this.anchor === 'center') {
      x = -layout._width / 2;
    }

    if (x !== 0 || y !== 0) {
      this.geometry.translate(x, y, 0);
    }

    console.log(this.geometry.layout);

  }
}




