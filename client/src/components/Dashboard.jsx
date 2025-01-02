  import React, { useState, useEffect } from 'react';
  import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet-routing-machine';

  // Fix Leaflet marker icons
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: null,
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  // Routing Machine Control component
  function RoutingMachine({ start, end }) {
    const map = useMap();

    useEffect(() => {
      if (start && end) {
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(start.lat, start.lng),
            L.latLng(end.lat, end.lng)
          ],
          routeWhileDragging: true,
          showAlternatives: true,
          fitSelectedRoutes: true
        }).addTo(map);

        return () => map.removeControl(routingControl);
      }
    }, [map, start, end]);

    return null;
  }

  export default function Dashboard({ username, users, currentLocation, socket }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [incidentType, setIncidentType] = useState('accident');
    const [incidentDescription, setIncidentDescription] = useState('');

    const handleReportIncident = () => {
      if (currentLocation && incidentDescription) {
        socket.emit('reportIncident', {
          type: incidentType,
          location: currentLocation,
          severity: 3,
          description: incidentDescription
        });
        setIncidentDescription('');
      }
    };

    const defaultCenter = currentLocation || { lat: 51.505, lng: -0.09 };

    return (
      <div className="h-full w-full flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Welcome, {username}!</h2>
          
          {/* Users List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Online Users</h3>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.username}
                  className={`p-2 rounded cursor-pointer ${
                    selectedUser?.username === user.username
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  {user.username}
                </div>
              ))}
            </div>
          </div>

          {/* Incident Reporting */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Report Incident</h3>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="accident">Accident</option>
              <option value="congestion">Congestion</option>
              <option value="roadwork">Roadwork</option>
            </select>
            <textarea
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder="Describe the incident..."
              className="w-full p-2 border rounded"
              rows="3"
            />
            <button
              onClick={handleReportIncident}
              className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Report Incident
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={[defaultCenter.lat, defaultCenter.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Current user marker */}
            {currentLocation && (
              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {/* Other users markers */}
            {users.map((user) => 
              user.username !== username && user.location ? (
                <Marker
                  key={user.username}
                  position={[user.location.lat, user.location.lng]}
                >
                  <Popup>{user.username}</Popup>
                </Marker>
              ) : null
            )}

            {/* Route display */}
            {currentLocation && selectedUser?.location && (
              <RoutingMachine
                start={currentLocation}
                end={selectedUser.location}
              />
            )}
          </MapContainer>
        </div>
      </div>
    );
  }