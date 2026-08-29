'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Les icônes par défaut de Leaflet référencent des fichiers image que les
// bundlers (Webpack/Next.js) ne résolvent pas automatiquement : on pointe
// explicitement vers les images hébergées par le CDN officiel de Leaflet.
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 12°19'14"N 1°30'28"W — Siège SEREIN-GE, Ouaga 2000, Ouagadougou
const SEREIN_GE_POSITION: [number, number] = [12.3206, -1.5078];

export default function ContactMap() {
  return (
    <MapContainer
      center={SEREIN_GE_POSITION}
      zoom={15}
      scrollWheelZoom={false}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={SEREIN_GE_POSITION} icon={markerIcon}>
        <Popup>
          <strong>SEREIN-GE</strong>
          <br />
          Avenue Pascal ZAGRÉ, Ouaga 2000
          <br />
          Ouagadougou, Burkina Faso
        </Popup>
      </Marker>
    </MapContainer>
  );
}
