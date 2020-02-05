import * as THREE from 'three';

export default {
  // hall
  foxr_tex: { url: 'foxr.png', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  hall_model: { url: 'hall.glb' },
  generic_controller_model: { url: 'generic_controller.glb' },
  lightmap_tex: { url: 'lightmap.jpg', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  controller_tex: { url: 'controller.basis' },
  doorfx_tex: { url: 'doorfx.basis', options: { wrapT: THREE.RepeatWrapping, wrapS: THREE.RepeatWrapping }},
  sky_tex: { url: 'sky.png', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  clouds_tex: { url: 'clouds.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  teleport_model: { url: 'teleport.glb' },
  beam_tex: { url: 'beamfx.png' },
  glow_tex: { url: 'glow.basis', options: { encoding: THREE.sRGBEncoding} },
  newsticker_tex: { url: 'newsticker.jpg', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  mozillamr_tex: { url: 'mozillamr.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  zoomicon_tex: { url: 'zoomicon.png', options: { encoding: THREE.sRGBEncoding } },

  // panoramas
  panoballfx_tex: { url: 'ballfx.basis', options: { wrapT: THREE.RepeatWrapping, wrapS: THREE.RepeatWrapping } },

  stereopanoL: { url: 'stereopanoL.basis', options: { encoding: THREE.sRGBEncoding }},
  stereopanoR: { url: 'stereopanoR.basis', options: { encoding: THREE.sRGBEncoding }},
  pano1small: { url: 'stereopano_small.basis', options: {encoding: THREE.sRGBEncoding} },

  pano2: { url: 'tigerturtle.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pano3: { url: 'lakebyllesby.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pano4: { url: 'haldezollern.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pano5: { url: 'zapporthorn.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pano6: { url: 'thuringen.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pano2small: { url: 'tigerturtle_small.basis', options: {encoding: THREE.sRGBEncoding} },
  pano3small: { url: 'lakebyllesby_small.basis', options: {encoding: THREE.sRGBEncoding} },
  pano4small: { url: 'haldezollern_small.basis', options: {encoding: THREE.sRGBEncoding} },
  pano5small: { url: 'zapporthorn_small.basis', options: {encoding: THREE.sRGBEncoding} },
  pano6small: { url: 'thuringen_small.basis', options: {encoding: THREE.sRGBEncoding} },

  // graffiti
  spray_model: { url: 'spray.glb' },
  spray_tex: { url: 'spray.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },

  // vertigo
  vertigo_model: { url: 'vertigo.glb' },
  vertigo_door_lm_tex: { url: 'vertigo_door_lm.jpg', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  vertigo_lm_tex: { url: 'vertigo_lm.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  checkboard_tex: { url: 'checkboard.basis', options: { wrapT: THREE.RepeatWrapping, wrapS: THREE.RepeatWrapping, repeat: [4, 4] } },

  // sound
  sound_model: { url: 'sound.glb' },
  sound_door_model: { url: 'sound_door.glb' },
  sound_shadow_tex: { url: 'sound_shadow.png' },
  sound_door_lm_tex: { url: 'sound_door_lm.jpg', options: { wrapT: THREE.RepeatWrapping, wrapS: THREE.RepeatWrapping} },
  grid_tex: { url: 'grid.png', options: { wrapT: THREE.RepeatWrapping, wrapS: THREE.RepeatWrapping, repeat: [20, 20] } },

  // photogrammetry object
  pg_floor_tex: { url: 'travertine2.basis', options: { encoding: THREE.sRGBEncoding, flipY: false, wrapT: THREE.RepeatWrapping, wrapS: THREE.RepeatWrapping} },
  pg_floor_lm_tex: { url: 'pg_floor_lm.jpg', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pg_door_lm_tex: { url: 'pg_door_lm.jpg', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pg_object_tex: { url: 'angel.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pg_object_model: { url: 'angel.min.glb' }, // TODO: try draco version, angel.min.gl
  pg_bg_tex: { url: 'pg_bg.jpg', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pg_flare_tex: { url: 'flare.jpg', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  pg_panel_tex: { url: 'panel.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },

  // paintings
  painting_seurat_tex: { url: 'paintings/seurat.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  painting_sorolla_tex: { url: 'paintings/sorolla.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  painting_bosch_tex: { url: 'paintings/bosch.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  painting_degas_tex: { url: 'paintings/degas.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
  painting_rembrandt_tex: { url: 'paintings/rembrandt.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },

  // sounds
  birds_snd: { url: 'ogg/birds.ogg' },
  chopin_snd: { url: 'ogg/chopin.ogg' },
  forest_snd: { url: 'ogg/forest.ogg' },
  wind_snd: { url: 'ogg/wind.ogg' },
  teleport_a_snd: { url: 'ogg/teleport_a.ogg' },
  teleport_b_snd: { url: 'ogg/teleport_b.ogg' }
};

