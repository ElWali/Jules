import React, {useEffect} from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// fix default icon path (leaflet + vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

function MapCenter({pos}){
  const map = useMap();
  useEffect(()=>{ if(pos) map.setView(pos, 8); },[pos]);
  return null;
}

export default function MapView({sites=[], onMarkerClick, selected}){
  const defaultCenter = [31.5, -7.9];
  const center = selected && selected.lat && selected.lng ? [selected.lat, selected.lng] : defaultCenter;

  return (
    <div className="h-[60vh] rounded overflow-hidden border">
      <MapContainer center={center} zoom={6} style={{height: '100%', width: '100%'}}>
        <MapCenter pos={center} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {sites.map(s => s.lat && s.lng ? (
          <Marker key={s.id} position={[s.lat, s.lng]}>
            <Popup>
              <div>
                <div className="font-bold">{s.site}</div>
                <div className="text-xs">{s.labnr} — {s.bp} BP</div>
                <button className="mt-2 text-blue-600 underline" onClick={() => onMarkerClick(s)}>Open</button>
              </div>
            </Popup>
          </Marker>
        ) : null)}
      </MapContainer>
    </div>
  );
}