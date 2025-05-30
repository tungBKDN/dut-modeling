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
import { ImageWMS, Vector } from 'ol/source';
import { Image as ImageLayer } from 'ol/layer';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import Text from 'ol/style/Text.js';
import PanoramaView from './PanoramaView';

const MapComponent = () => {
   const [coordinates, setCoordinates] = useState([0, 0]);
   const [mapInstance, setMapInstance] = useState(null);
   const [spot, setSpot] = useState(null);
   const [loading, setLoading] = useState(false);
   const geojsonSourceRef = useRef(null);
   const [isView, setIsView] = useState(false);
   const [img, setImg] = useState("http://localhost:3000/media/IMG_4154");

   const handleCloseView = () => {
      setIsView(false);
      setLoading(false);
      // console.log(isView);
   }

   useEffect(() => {
      // Create GeoJSON vector source
      const geojsonSource = new VectorSource({
         url: `${config.BACKEND_URL}/places`, // Use environment variable for API URL
         format: new GeoJSON({
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
         }),
      });

      console.log("GeoJSON Source created:", geojsonSource);

      // Store reference for later use
      geojsonSourceRef.current = geojsonSource;

      // Create vector layer with dynamic styling
      const geojsonLayer = new VectorLayer({
         source: geojsonSource,
         style: (feature, resolution) => {
         const name = feature.get('name') || '';
         const iconUrl = "https://cdn-icons-png.flaticon.com/512/684/684908.png";

         // Label visibility logic (similar to buildings)
         let showLabel = false;
         // Always show label for important categories (customize as needed)
         const importantCategories = ['Khu F', 'Hồ F', 'Khoa CNTT', 'Cổng chính Bách Khoa', 'Khu A'];
         if (importantCategories.includes(name)) {
            showLabel = true;
         }
         // Show every 5th label at medium zoom
         if (!showLabel && resolution < 2.5) {
            const fid = feature.getId() || feature.ol_uid || 0;
            if (parseInt(fid.toString().replace(/\D/g, ''), 10) % 5 === 0) {
            showLabel = true;
            }
         }
         // Show all labels when very zoomed in
         if (!showLabel && resolution < 1.2) {
            showLabel = true;
         }

         const styles = [
            new Style({
            image: new Icon({
               anchor: [0.5, 1],
               scale: 0.05,
               src: iconUrl,
            }),
            }),
         ];

         if (showLabel) {
            styles.push(
            new Style({
               text: new Text({
               text: name,
               font: 'bold 13px Arial',
               fill: new Fill({ color: '#222' }),
               stroke: new Stroke({ color: '#fff', width: 3 }),
               offsetY: -25,
               overflow: true,
               }),
            })
            );
         }

         return styles;
         },
      });

      // Boundaries layer
      const geoJSONSourceBoundaries = new VectorSource({
         url: 'http://127.0.0.1:8080/geoserver/cuoiky/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cuoiky:boundaries&outputFormat=application/json',
         format: new GeoJSON({
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
         }),
      });
      const geoJsonLayerBoundaries = new VectorLayer({
         source: geoJSONSourceBoundaries,
         style: new Style({
            stroke: new Stroke({
               color: '#ff0000',
               width: 2,
               lineDash: [8, 6], // Dashed line: 8px dash, 6px gap
            }),
            fill: new Fill({
               color: 'rgba(128, 128, 128, 0.9)', // Gray background with some transparency
            }),
         }),
      });

      // Buildings layer
      const geoJsonSourceBuildings = new VectorSource({
         url: 'http://127.0.0.1:8080/geoserver/cuoiky/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cuoiky:buildings&outputFormat=application/json',
         format: new GeoJSON({
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
         }),
      });

      const geoJsonLayerBuildings = new VectorLayer({
         source: geoJsonSourceBuildings,
         style: (feature, resolution) => {
         // Only show labels for some buildings depending on zoom/resolution
         // For example, show labels only for "important" buildings or every Nth building at higher resolutions
         const buildingName = feature.get('building') || '';
         let showLabel = false;

         // Example: Always show label for specific important buildings
         const importantBuildings = ['Khu A', 'Tòa S', 'Khu F', 'Viện cơ khí', 'PFIEV'];
         if (importantBuildings.includes(buildingName)) {
            showLabel = true;
         }

         // Example: Show label for every 10th feature at medium zoom
         if (!showLabel && resolution < 2.5) {
            // Use feature id or index to stagger labels
            const fid = feature.getId() || feature.ol_uid || 0;
            if (parseInt(fid.toString().replace(/\D/g, ''), 10) % 10 === 0) {
            showLabel = true;
            }
         }

         // Example: Show all labels only when very zoomed in
         if (!showLabel && resolution < 1.2) {
            showLabel = true;
         }

         const styles = [
            new Style({
            stroke: new Stroke({
               color: '#ff6600',
               width: 2,
            }),
            fill: new Fill({
               color: 'rgba(255, 165, 0, 0.95)',
            }),
            }),
         ];
         if (showLabel) {
            styles.push(
            new Style({
               text: new Text({
               text: buildingName,
               font: 'italic 10px Arial',
               fill: new Fill({ color: '#222' }),
               stroke: new Stroke({ color: '#fff', width: 2 }),
               overflow: true,
               }),
            })
            );
         }
         return styles;
         },
      });

      // Road layer
      const geoJSONSourceRoads = new VectorSource({
         url: 'http://127.0.0.1:8080/geoserver/cuoiky/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cuoiky:road&outputFormat=application/json',
         format: new GeoJSON({
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
         }),
      });
      const geoJsonLayerRoads = new VectorLayer({
         source: geoJSONSourceRoads,
         style: new Style({
            stroke: new Stroke({
               color: '#0000ff',
               width: 2,
               lineDash: [10, 5], // Dashed line for roads
            }),
         }),
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
            // new ImageLayer({ source: wmsSource }),
            geoJsonLayerBoundaries, // Temporary layer for boundaries
            geoJsonLayerBuildings, // Temporary layer for buildings
            geoJsonLayerRoads, // Temporary layer for roads
            geojsonLayer,
         ],
         view: new View({
            center: fromLonLat([108.153, 16.076]),  // Center on Da Nang
            zoom: 17,
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
            console.log('Clicked feature properties:', properties);
            setIsView(true);
            setImg(properties.image_url);
            console.log('Clicked feature:', properties.image_url);
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
      <div className='flex border-2 border-gray-500 rounded-2xl' style={{ width: '100vw%', height: '100vh' }}>
         {loading && (
            <div className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white/70 p-4 rounded shadow-lg flex gap-4">
               <Spinner color="info" size="lg" aria-label="Loading map" />
               <p className="text-center mt-2 text-sm text-gray-600">Loading map...</p>
            </div>
         )}

         <div
            className='cursor-pointer'
            id="map"
            style={{ width: '100%', height: '100%' }}
         >
         </div>
         {coordinates && (
            <div
               className="absolute bg-white shadow-md rounded-md p-3 text-sm text-gray-800 border border-gray-100 m-2 font-mo">
               <p className="font-semibold text-gray-600">Coordiate:</p>
               <div className="flex gap-4 mt-1">
                  <p><strong>Lon:</strong> {coordinates[0].toFixed(4)}</p>
                  <p><strong>Lat:</strong> {coordinates[1].toFixed(4)}</p>
               </div>
            </div>
         )}
         <PanoramaView isView={isView} onClose={handleCloseView} url={"http://localhost:3000/media/" + img} className="absolute w-80 "/>
      </div>
   );
};

export default MapComponent;