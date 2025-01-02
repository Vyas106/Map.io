import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:4000');

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    // Socket event listeners
    socket.on('users', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('incidentAlert', (incident) => {
      toast.warning(`Traffic incident reported: ${incident.description}`);
    });

    socket.on('zoneEnter', (zone) => {
      toast.info(`Entered zone: ${zone.zoneName}`);
    });

    socket.on('zoneExit', (zone) => {
      toast.info(`Exited zone: ${zone.zoneName}`);
    });

    // Clean up on unmount
    return () => {
      socket.off('users');
      socket.off('incidentAlert');
      socket.off('zoneEnter');
      socket.off('zoneExit');
    };
  }, []);

  // Handle user login
  const handleLogin = (username) => {
    socket.emit('login', username);
    setUsername(username);
    setIsLoggedIn(true);

    // Start watching user's location
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          socket.emit('updateLocation', {
            location: newLocation,
            speed: position.coords.speed || 0
          });
        },
        (error) => {
          toast.error('Error getting location: ' + error.message);
        }
      );
    }
  };

  return (
    <div className="h-screen w-screen">
      <ToastContainer position="top-right" />
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard
          username={username}
          users={users}
          currentLocation={currentLocation}
          socket={socket}
        />
      )}
    </div>
  );
}