import React, { useEffect, useState } from 'react';
import { ImageWMS } from 'ol/source';


const MapComponent = () => {

   useEffect(() => {
      try {
         const wmsSource = new ImageWMS({
            url: 'geoserver/geoserver/cuoiky/wms',
            params: {
               'LAYERS': '	cuoiky:cuoiky',
               'VERSION': '1.1.0',
               'SRS': 'EPSG:4326',
               'FORMAT': 'image/png',
            },
            ratio: 1,
            serverType: 'geoserver',
         });
      } catch (error) {
         console.error('Error initializing WMS source:', error);
      }
   })

   return (
      <div>
         <h1>Map</h1>
      </div>
   )
}

export default MapComponent;