import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Map from './Map';
import UserList from './UserList';
import { calculateDistance } from '../utils/distance';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const Dashboard = ({ username }) => {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Connection failed. Please try again later.');
    });

    newSocket.on('error', (errorMessage) => {
      console.error('Socket error:', errorMessage);
      setError(errorMessage);
    });

    if (navigator.geolocation) {
      const locationWatcher = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          const user = { username, location };
          setCurrentUser(user);
          if (newSocket.connected) {
            newSocket.emit('updateLocation', user);
          }
          setError(null);
        },
        (error) => {
          console.error('Location error:', error);
          setError('Location access required for this app to work.');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );

      newSocket.emit('login', username);

      newSocket.on('users', (updatedUsers) => {
        setUsers(updatedUsers);
        const currentUserData = updatedUsers.find(user => user.username === username);
        if (currentUserData) {
          setCurrentUser(currentUserData);
        }
        if (selectedUser) {
          const updatedSelectedUser = updatedUsers.find(user => user.username === selectedUser.username);
          setSelectedUser(updatedSelectedUser);
        }
      });

      return () => {
        navigator.geolocation.clearWatch(locationWatcher);
        newSocket.close();
      };
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, [username]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (currentUser?.location && user.location) {
      const info = calculateDistance(currentUser.location, user.location);
      setDistanceInfo(info);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <UserList
            users={users}
            currentUsername={username}
            onUserSelect={handleUserSelect}
            selectedUser={selectedUser}
          />
          {distanceInfo && selectedUser && (
            <div className="mt-4 p-4 bg-white rounded shadow">
              <h3 className="text-lg font-bold">Distance to {selectedUser.username}</h3>
              <p>Distance: {distanceInfo.distance.toFixed(2)} km</p>
              <p>Walking: {distanceInfo.timeByWalk.toFixed(0)} minutes</p>
              <p>Driving: {distanceInfo.timeByCar.toFixed(0)} minutes</p>
            </div>
          )}
        </div>
        <div className="col-span-3">
          <Map
            currentUser={currentUser}
            users={users}
            selectedUser={selectedUser}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;