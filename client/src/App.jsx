// client/src/App.js
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

const App = () => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
  };

  return (
    <div>
      {!isLoggedIn ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <Dashboard username={username} />
      )}
    </div>
  );
};

export default App;
