import {
   SphereGeometry,
   MeshStandardMaterial,
   Mesh,
   TextureLoader,
   WebGLCubeRenderTarget,
   EquirectangularReflectionMapping,
   sRGBEncoding
} from 'https://unpkg.com/three@0.137.5/build/three.module.js';

import BaseExample from './base-example.js';


class ThreejsExample extends BaseExample {
   constructor(canvas) {
       super(canvas);
       this.createLights(false);
       this.createMesh();
       this.createSkybox();
       requestAnimationFrame(this.render.bind(this));
   }

   createMesh() {
       const material = new MeshStandardMaterial({
           color: 0x156289,
           emissive: 0x072534,
           roughness: 0.07
       });
       const geometry = new SphereGeometry(0.4);
       const mesh = new Mesh(geometry, material);
       this.scene.add(mesh);
   }

   createSkybox() {
       const textureLoader = new TextureLoader();
       const url = './vitacura-360-drone.jpg';
       const onLoaded = texture => {
           texture.mapping = EquirectangularReflectionMapping;
           texture.encoding = sRGBEncoding;
           this.scene.background = texture;

           const rt = new WebGLCubeRenderTarget(texture.image.height);
           rt.fromEquirectangularTexture(this.renderer, texture);
           // this.scene.background = rt.texture;
       };
       textureLoader.load(url, onLoaded);
   }
}


new ThreejsExample(document.querySelector('#webglOutput'));