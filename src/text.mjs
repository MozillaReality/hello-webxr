var loadFont = require('load-bmfont');
var createFontGeometry = require('three-bmfont-text');
var MSDFShader = require('three-bmfont-text/shaders/msdf');

/*
createText({
  font: ctx.assets['metropolis_bold_font'],
  map: ctx.assets['metropolis_bold_tex'],
  value: 'Lorem ipsum\nDolor sit ameeett!',
  size: 1,
  width: 400,
  align: 'center',
  anchor: 'left',
  baseline: 'top',
  color: 0xffffff,
  negate: false
})
*/
export function createText(opts){

  if (!opts.font){
    console.warn('createText(): <font> not defined');
    return;
  }
  if (!opts.map){
    console.warn('createText(): texture <map> not defined');
    return;
  }

  const value = opts.value || '[TEXT HERE]';
  const width = opts.width || 300;
  const size = opts.size || 1;
  const align = opts.align || 'left';
  const color = opts.color || 0xffffff;
  const anchor = opts.anchor || opts.align;
  const baseline = opts.baseline || 'bottom';
  const negate = opts.negate !== true ? false : true;

  const geometry = createFontGeometry({
    width: width,
    align: align,
    font: opts.font
  })

  geometry.update(value);

  const layout = geometry.layout;
  let x = 0, y = 0;

  if (baseline === 'top') {
    y = layout._height + layout._ascender;
  } else if (baseline === 'center') {
    y = layout._height / 2;
  }

  if (anchor === 'right') {
    x = -layout._width;
  } else if (anchor === 'center') {
    x = -layout._width / 2;
  }

  if (x !== 0 || y !== 0) {
    geometry.translate(x, y, 0);
  }

  const material = new THREE.RawShaderMaterial(MSDFShader({
    map: opts.map,
    color: color,
    negate: negate
  }));

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(0.001 * size, 0.001 * size, 1.0);
  mesh.rotation.x = Math.PI;
  const obj = new THREE.Object3D();
  obj.add(mesh);
  return obj;
}
