"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Flag from "react-world-flags";

// Leaflet 图标修复 (Next.js 中的常见问题)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// 自定义红色标记图标
const redIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon-red.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MarkerData {
  position: [number, number];
  popup: {
    country: string;
    city: string;
    ip: string;
    countryCode: string;
  };
}

interface GeoMapProps {
  markers: MarkerData[];
}

export default function GeoMap({ markers }: GeoMapProps) {
  // 默认中心点（世界地图中心）
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          icon={redIcon}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center space-x-2 mb-2">
                <Flag
                  code={marker.popup.countryCode}
                  className="w-6 h-4 rounded shadow-sm"
                  fallback={<span>🌍</span>}
                />
                <span className="font-semibold">{marker.popup.country}</span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">城市: </span>
                  <span>{marker.popup.city}</span>
                </div>
                <div>
                  <span className="font-medium">IP: </span>
                  <span className="font-mono text-xs bg-muted px-1 rounded">
                    {marker.popup.ip}
                  </span>
                </div>
                <div>
                  <span className="font-medium">坐标: </span>
                  <span className="text-xs text-muted-foreground">
                    {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    </div>
  );
}