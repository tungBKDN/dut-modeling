import { set } from 'ol/transform';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PanoramaSkybox = ({ isView, url, onClose }) => {
   const containerRef = useRef(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      setLoading(true);
      let scene, camera, renderer, controls, sphere, animationId;
      const container = containerRef.current;
      if (!container) return;

      // Create the Three.js scene.
      scene = new THREE.Scene();

      // Setup the camera.
      camera = new THREE.PerspectiveCamera(
         75,
         container.clientWidth / container.clientHeight,
         1,
         2000
      );
      camera.position.set(0, 0, 0.1);

      // Create the renderer and attach it to the container.
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      // Create a sphere geometry and invert it so that textures appear on the inside.
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);

      // Load the panorama texture.
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(
         url,
         () => {
            setLoading(false);
            renderer.render(scene, camera);
         },
         undefined,
         (error) => {
            console.error('Texture load error:', error);
            setLoading(false);
         }
      );

      // Create the mesh from the geometry and texture.
      const material = new THREE.MeshBasicMaterial({ map: texture });
      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      // Setup OrbitControls for user interactivity.
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.rotateSpeed = 0.5;

      // Handle window resizing.
      const onWindowResize = () => {
         camera.aspect = container.clientWidth / container.clientHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', onWindowResize);

      // Animation loop.
      const animate = () => {
         animationId = requestAnimationFrame(animate);
         controls.update();
         renderer.render(scene, camera);
      };
      animate();

      // Cleanup on component unmount.
      return () => {
         cancelAnimationFrame(animationId);
         window.removeEventListener('resize', onWindowResize);
         renderer.dispose();
         if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
         }
      };
   }, [url]);

   if (!isView) {
      onClose && onClose();
      return null;
   }

   return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] h-[85%] rounded-sm shadow-lg bg-white text-black overflow-hidden">
         {/* Close button */}
         <button
            onClick={onClose}
            className="absolute top-2 right-2 z-20 text-xl font-bold text-black hover:text-red-500"
         >
            X
         </button>

         {/* Loading overlay */}
         {loading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 px-4 py-2 rounded">
               Loading...
            </div>
         )}

         {/* Three.js will render into this container */}
         <div ref={containerRef} className="w-full h-full" />
      </div>
   );
};

export default PanoramaSkybox;
