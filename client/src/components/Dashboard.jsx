import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { 
  FaUsers, 
  FaExclamationTriangle, 
  FaLocationArrow, 
  FaCar, 
  FaRoute,
  FaTimes,
  FaBars,
  FaSearch,
  FaMapMarkerAlt
} from 'react-icons/fa';

// Initialize Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: null,
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Constants
const ROUTE_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
];

// Utility Functions
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Components
const LocationTracker = ({ onLocationUpdate }) => {
  useEffect(() => {
    let watchId;
    
    const startTracking = () => {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed } = position.coords;
            onLocationUpdate({
              location: { lat: latitude, lng: longitude },
              speed: speed || 0
            });
          },
          (error) => console.error("Error getting location:", error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    };

    startTracking();
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [onLocationUpdate]);

  return null;
};

const MapController = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);

  return null;
};

const MultiRouteDisplay = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      routeWhileDragging: false,
      showAlternatives: true,
      altLineOptions: {
        styles: ROUTE_COLORS.map(color => ([{
          color,
          opacity: 0.8,
          weight: 4
        }])),
        missingRouteStyles: [{
          opacity: 0.8,
          weight: 4,
          color: '#6b7280'
        }]
      },
      createMarker: () => null,
      addWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{
          color: ROUTE_COLORS[0],
          opacity: 0.8,
          weight: 4
        }]
      }
    }).addTo(map);

    routingControl.options.numberOfAlternatives = 4;

    return () => map.removeControl(routingControl);
  }, [map, start, end]);

  return null;
};

const DraggableMarker = ({ position, icon, popupContent, onDragEnd }) => (
  <Marker 
    position={position} 
    icon={icon}
    draggable={true}
    eventHandlers={{
      dragend: (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        onDragEnd({ lat: position.lat, lng: position.lng });
      },
    }}
  >
    {popupContent}
  </Marker>
);

// Sidebar Components
const SidebarHeader = ({ username, activeRoute, clearRoute }) => (
  <div className="p-4 bg-indigo-600 text-white">
    <h2 className="text-xl font-bold flex items-center gap-2">
      <FaCar /> OpenTrack
    </h2>
    <p className="text-sm opacity-80">Welcome, {username}!</p>
    {activeRoute && (
      <button 
        onClick={clearRoute}
        className="mt-2 px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
      >
        Clear Active Route
      </button>
    )}
  </div>
);

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="p-4 border-b">
    <div className="relative">
      <FaSearch className="absolute left-3 top-3 text-gray-400" />
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
      />
    </div>
  </div>
);

const RouteLegend = () => (
  <div className="p-4 bg-gray-50 border-t">
    <h3 className="font-medium mb-2">Route Options</h3>
    <div className="space-y-2">
      {ROUTE_COLORS.map((color, index) => (
        <div key={color} className="flex items-center gap-2">
          <div 
            className="w-4 h-2 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-gray-600">
            Route Option {index + 1}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Main Dashboard Component
const Dashboard = ({ username, socket }) => {
  const [users, setUsers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRoute, setActiveRoute] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const handleLocationUpdate = useCallback((data) => {
    setCurrentLocation(data.location);
    socket.emit('updateLocation', data);
  }, [socket]);

  const handleMarkerDragEnd = useCallback((userId, newLocation) => {
    socket.emit('updateUserLocation', {
      userId,
      location: newLocation
    });
    
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.username === userId 
          ? { ...user, location: newLocation }
          : user
      )
    );

    if (selectedUser?.username === userId) {
      setActiveRoute(prev => prev ? {
        ...prev,
        end: newLocation
      } : null);
    }
  }, [socket, selectedUser]);

  const handleRouteSelect = (user) => {
    if (!currentLocation || !user.location) return;
    
    setActiveRoute({
      start: currentLocation,
      end: user.location
    });
    setSelectedUser(user);
  };

  const clearRoute = () => {
    setActiveRoute(null);
    setSelectedUser(null);
  };

  useEffect(() => {
    socket.on('users', (updatedUsers) => setUsers(updatedUsers));
    
    socket.on('incidentAlert', (incident) => {
      setNotifications(prev => [{
        id: Date.now(),
        message: `New ${incident.type} reported nearby: ${incident.description}`,
        type: 'incident'
      }, ...prev]);
    });

    return () => {
      socket.off('users');
      socket.off('incidentAlert');
    };
  }, [socket]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen w-full flex bg-gray-100">
      <LocationTracker onLocationUpdate={handleLocationUpdate} />
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transform transition-transform duration-300 ease-in-out
        w-80 bg-white shadow-xl fixed lg:relative h-full z-40 overflow-hidden flex flex-col`}>
        
        <SidebarHeader 
          username={username} 
          activeRoute={activeRoute} 
          clearRoute={clearRoute}
        />
        
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.username}
              className={`p-3 rounded-lg cursor-pointer transition-colors
                ${selectedUser?.username === user.username 
                  ? 'bg-indigo-50 border-indigo-200' 
                  : 'hover:bg-gray-50 border-gray-100'} 
                border shadow-sm`}
              onClick={() => handleRouteSelect(user)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{user.username}</span>
                {user.location && (
                  <div className="flex items-center gap-2">
                    <FaRoute className={
                      selectedUser?.username === user.username 
                        ? 'text-indigo-600' 
                        : 'text-gray-400'
                    } />
                    <FaLocationArrow className={
                      user.username === username 
                        ? 'text-green-500' 
                        : 'text-blue-500'
                    } />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {activeRoute && <RouteLegend />}
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer
          center={currentLocation || [51.505, -0.09]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {currentLocation && (
            <>
              <Marker 
                position={[currentLocation.lat, currentLocation.lng]}
                icon={createCustomIcon('green')}
              >
                <Popup>You are here</Popup>
              </Marker>
              <Circle 
                center={[currentLocation.lat, currentLocation.lng]}
                radius={100}
                pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }}
              />
            </>
          )}

          {users.map((user) => 
            user.username !== username && user.location ? (
              <DraggableMarker
                key={user.username}
                position={[user.location.lat, user.location.lng]}
                icon={createCustomIcon('blue')}
                onDragEnd={(newLocation) => handleMarkerDragEnd(user.username, newLocation)}
                popupContent={
                  <Popup>
                    <div className="space-y-2">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-600">
                        <FaMapMarkerAlt className="inline mr-1" />
                        Drag marker to update location
                      </div>
                      <button
                        onClick={() => handleRouteSelect(user)}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <FaRoute /> Show Routes
                      </button>
                    </div>
                  </Popup>
                }
              />
            ) : null
          )}

          {activeRoute && (
            <MultiRouteDisplay
              start={activeRoute.start}
              end={activeRoute.end}
            />
          )}

          {currentLocation && <MapController center={currentLocation} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default Dashboard;