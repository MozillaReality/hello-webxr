import * as THREE from 'three';
import {System} from '../vendor/ecsy.module.js';
import {TextMesh} from 'troika-3d-text/dist/textmesh-standalone.esm.js';
import {Object3D, Text} from '../components/index.js';

export class SDFTextSystem extends System {

  updateText(textMesh, textComponent) {
      // Update the text mesh
      textMesh.text = textComponent.text;
      // textMesh.textAlign = textComponent.align;
      // textMesh.anchor[0] = anchorMapping[textComponent.anchor];
      // textMesh.anchor[1] = baselineMapping[textComponent.baseline];
      //textMesh.color = textComponent.color;
      textMesh.font = 'https://fonts.gstatic.com/s/cutivemono/v6/m8JWjfRfY7WVjVi2E-K9H6RCTmg.woff';
      textMesh.fontSize = 1; //textComponent.fontSize;
      // textMesh.letterSpacing = textComponent.letterSpacing || 0;
      // textMesh.lineHeight = textComponent.lineHeight || null;
      // textMesh.overflowWrap = textComponent.overflowWrap;
      // textMesh.whiteSpace = textComponent.whiteSpace;
      // textMesh.maxWidth = textComponent.maxWidth;
      textMesh.sync();
  }

  execute(delta, time) {
    var entities = this.queries.entities;

    entities.added.forEach(e => {
      var object3D = e.getComponent(Object3D).value;

      const textMesh = new TextMesh();
      object3D.add(textMesh);

      // set properties to configure:
      textMesh.text = 'text example';
      textMesh.font = 'https://fonts.gstatic.com/s/cutivemono/v6/m8JWjfRfY7WVjVi2E-K9H6RCTmg.woff';
      textMesh.fontSize = 0.2;
      textMesh.position.set(0,0,-1);
      textMesh.color = 0x9966FF;

      // be sure to call sync() after all properties are set to update the rendering:
      textMesh.sync();

      /*
    var textComponent = e.getComponent(Text);
      var textMesh = new TextMesh();
      textMesh.name = 'textMesh';
      textMesh.anchor = [0, 0];
      object3D.add(textMesh);
      object3D.position.set(1.5, 1.6, 3.3); //near pano1

      this.updateText(textMesh, textComponent);
      */
    });

    entities.removed.forEach(e => {
      var object3D = e.getComponent(Object3D).value;
      var textMesh = object3D.getObjectByName('textMesh');
      textMesh.dispose();
      object3D.remove(textMesh);
    });

    entities.changed.forEach(e => {
      /*
      var object3D = e.getComponent(Object3D).value;
      var textComponent = e.getComponent(Text);
      var textMesh = object3D.getObjectByName('textMesh');

      this.updateText(textMesh, textComponent);
/*
      // Pass material config down to child entity
      if (entity !== this.el) {
        var materialAttr = this.el.getAttribute('troika-text-material')
        if (materialAttr) {
          entity.setAttribute('material', materialAttr)
        } else {
          entity.removeAttribute('material')
        }
      }
*/
    });
  }
}

SDFTextSystem.queries = {
  entities: {
    components: [Text, Object3D],
    listen: {
      added: true,
      removed: true,
      changed: [Text]
    }
  }
}