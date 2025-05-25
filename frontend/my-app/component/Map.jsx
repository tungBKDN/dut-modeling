import React, { useEffect, useState, useRef } from 'react';
import { Map, View } from 'ol';
import 'ol/ol.css';
import { Tile as TileLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "flowbite-react";
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import config from '../urls/config.json';



const MapComponent = () => {
   const [coordinates, setCoordinates] = useState([0, 0]);
   const [mapInstance, setMapInstance] = useState(null);
   const [spot, setSpot] = useState(null);
   const [openModal, setOpenModal] = useState(false);
   const [loading, setLoading] = useState(false);
   const geojsonSourceRef = useRef(null);

   useEffect(() => {
      // Create GeoJSON vector source
      const geojsonSource = new VectorSource({
         url: `${config.BACKEND_URL}/places`, // Use environment variable for API URL
         format: new GeoJSON({
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
         }),
      });

      // Store reference for later use
      geojsonSourceRef.current = geojsonSource;

      // Create vector layer with dynamic styling
      const geojsonLayer = new VectorLayer({
         source: geojsonSource,
         style: (feature) => {
            const category = feature.get('category');
            const iconUrl = categoryIcons[category] || "https://cdn-icons-png.flaticon.com/512/684/684908.png";

            return new Style({
               image: new Icon({
                  anchor: [0.5, 1],
                  scale: 0.05,
                  src: iconUrl,
               }),
            });
         },
      });

      // Loading event handlers
      geojsonSource.on('featuresloadstart', () => {
         console.log("Loading features...");
         setLoading(true);
      });

      geojsonSource.on('featuresloadend', () => {
         console.log("Features loaded successfully");
         setLoading(false);
      });

      geojsonSource.on('featuresloaderror', (e) => {
         setLoading(false);
         console.error("Features failed to load", e);
      });

      // Create the map
      const map = new Map({
         target: 'map',
         layers: [
            // Base tile layer (OpenStreetMap)
            new TileLayer({
               source: new XYZ({
                  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
               })
            }),
            // GeoJSON vector layer
            geojsonLayer,
         ],
         view: new View({
            center: fromLonLat([108.221, 16.067]),  // Center on Da Nang
            zoom: 12,
         }),
      });

      // Handle mouse movement for coordinates
      map.on('pointermove', (event) => {
         const coordinate = event.coordinate;
         const lonLat = toLonLat(coordinate);
         setCoordinates(lonLat);
      });

      // Handle click events on features
      map.on('singleclick', async (event) => {
         const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);

         if (feature) {
            // Clicked on a feature
            const properties = feature.getProperties();
            setSpot(properties);
            setOpenModal(true);
         } else {
            // Clicked on empty map area
            const coordinate = toLonLat(event.coordinate);
            setCoordinates(coordinate);
            console.log('Clicked at:', coordinate);
         }
      });

      setMapInstance(map);

      return () => map.setTarget(null);
   }, []);

   const refreshSpots = () => {
      if (geojsonSourceRef.current) {
         geojsonSourceRef.current.refresh();
      }
   };

   return (
      <div className='flex relative border-2 border-gray-500 rounded-2xl' style={{ width: '100vw%', height: '100vh' }}>
         {loading && (
            <div className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white/70 p-4 rounded shadow-lg flex gap-4">
               <Spinner color="info" size="lg" aria-label="Loading map" />
               <p className="text-center mt-2 text-sm text-gray-600">Loading map...</p>
            </div>
         )}

         <Modal show={spot && openModal} onClose={() => setOpenModal(false)}>
            <ModalHeader>{spot?.name}</ModalHeader>
            <ModalBody>
               <div className="space-y-4">
                  <p className="text-base leading-relaxed text-gray-700">
                     {spot?.description || "Không có mô tả"}
                  </p>

                  {spot?.url && (
                     <img
                        src={spot.url}
                        alt={spot?.name || "No image available"}
                        className="rounded-md shadow w-full object-cover"
                     />
                  )}

                  <div>
                     <h4 className="font-semibold text-gray-600">📌 Địa điểm:</h4>
                     <p className="text-sm text-gray-800">{spot?.location}</p>
                  </div>

                  <div>
                     <h4 className="font-semibold text-gray-600">🏷️ Loại:</h4>
                     <p className="text-sm text-gray-800">{spot?.category}</p>
                  </div>
               </div>
            </ModalBody>
            <ModalFooter>
               <Button color="gray" onClick={() => setOpenModal(false)}>
                  Close
               </Button>
            </ModalFooter>
         </Modal>

         <div
            className='cursor-pointer'
            id="map"
            style={{ width: '100%', height: '100%' }}
         >
            {coordinates && (
               <div className="flex bg-white shadow-md rounded-md p-4 text-sm text-gray-800 border border-gray-100 -translate-y-20">
                  <p className="font-semibold text-gray-600">📍 Current Coordinates</p>
                  <div className="flex gap-4 mt-1">
                     <p><strong>Lon:</strong> {coordinates[0].toFixed(6)}</p>
                     <p><strong>Lat:</strong> {coordinates[1].toFixed(6)}</p>
                  </div>
               </div>
            )}

         </div>

         {/* {coordinates && (
            <div className="bg-white shadow-md rounded-md p-4 text-sm text-gray-800 border border-gray-100 translate-y-2">
               <p className="font-semibold text-gray-600">📍 Current Coordinates</p>
               <div className="flex gap-4 mt-1">
                  <p><strong>Lon:</strong> {coordinates[0].toFixed(6)}</p>
                  <p><strong>Lat:</strong> {coordinates[1].toFixed(6)}</p>
               </div>
            </div>
         )} */}
      </div>
   );
};

export default MapComponent;