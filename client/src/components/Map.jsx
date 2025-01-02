import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

const createCustomIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const RouteComponent = ({ start, end }) => {
  const map = useMap();
  
  useEffect(() => {
    if (start && end) {
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(start.lat, start.lng),
          L.latLng(end.lat, end.lng)
        ],
        routeWhileDragging: true,
        show: false,
        lineOptions: {
          styles: [{ color: '#6366F1', weight: 4 }]
        }
      }).addTo(map);

      return () => map.removeControl(routingControl);
    }
  }, [map, start, end]);

  return null;
};

const Map = ({ currentUser, users, selectedUser }) => {
  const defaultPosition = [0, 0];
  const mapRef = useRef(null);

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: '700px', width: '100%' }}
      ref={mapRef}
    >
      <MapController 
        center={currentUser?.location ? [currentUser.location.lat, currentUser.location.lng] : defaultPosition}
        zoom={13}
      />
      
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='OpenTrack'
      />
      
      {currentUser?.location && (
        <Marker 
          position={[currentUser.location.lat, currentUser.location.lng]}
          icon={createCustomIcon('blue')}
        >
          <Popup>{currentUser.username} (You)</Popup>
        </Marker>
      )}

      {users.map((user, index) => (
        user.location && user.username !== currentUser?.username && (
          <Marker
            key={index}
            position={[user.location.lat, user.location.lng]}
            icon={createCustomIcon('red')}
          >
            <Popup>{user.username}</Popup>
          </Marker>
        )
      ))}

      {currentUser?.location && selectedUser?.location && (
        <RouteComponent
          start={currentUser.location}
          end={selectedUser.location}
        />
      )}
    </MapContainer>
  );
};

export default Map;