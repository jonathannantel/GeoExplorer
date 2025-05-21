// Fix: Add Google Maps API type declarations
declare global {
  interface Window {
    google?: { // Make it optional as it's checked for existence
      maps?: typeof google.maps; // Refer to the namespace below
    };
  }
}

declare namespace google {
  namespace maps {
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapId?: string;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      streetViewControl?: boolean;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      gestureHandling?: string;
    }

    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      addListener(eventName: string, handler: (event: MapMouseEvent) => void): { remove: () => void };
      panTo(latLng: LatLng | LatLngLiteral): void;
      // Define other methods if needed
    }

    interface MapMouseEvent {
      latLng: LatLng | null; // latLng can be null
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    namespace marker {
      interface AdvancedMarkerElementOptions {
        map?: Map;
        position?: LatLng | LatLngLiteral;
        title?: string;
        // content?: HTMLElement; // If you use content elements for markers
      }
      class AdvancedMarkerElement {
        constructor(options?: AdvancedMarkerElementOptions);
        set map(map: Map | null); 
        get map(): Map | null;
        // Add other properties/methods of AdvancedMarkerElement if used
      }
    }
  }
}

import React, { useEffect, useRef, useState } from 'react';
import { Coordinates } from '../types';

interface GoogleMapComponentProps {
  onMapClick: (coords: Coordinates) => void;
  selectedCoords: Coordinates | null;
  initialCenter?: Coordinates;
  initialZoom?: number;
}

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  onMapClick,
  selectedCoords,
  initialCenter = { lat: 0, lng: 0 }, // Default to center of the world
  initialZoom = 2,                     // Default zoom to see most of the world
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (mapRef.current && !map && window.google && window.google.maps && google.maps.marker) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        mapId: 'GEOINFO_EXPLORER_MAP', // mapId is required for Advanced Markers
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy', // Allows for better map interaction
      });
      setMap(newMap);

      newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });
    }
  }, [mapRef, map, initialCenter, initialZoom, onMapClick]);

  useEffect(() => {
    if (map && google.maps.marker) {
      // Clear existing marker
      if (marker) {
        marker.map = null; 
      }

      if (selectedCoords) {
        const newMarker = new google.maps.marker.AdvancedMarkerElement({
          map: map,
          position: selectedCoords,
          title: 'Selected Location',
        });
        setMarker(newMarker);
        map.panTo(selectedCoords); // Optionally pan to the new marker
      }
    }
  }, [map, selectedCoords]);
  
  // Handle map container style for responsiveness
  return <div ref={mapRef} className="map-container w-full h-full" aria-label="Interactive world map"></div>;
};
