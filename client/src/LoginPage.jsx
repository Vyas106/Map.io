import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        localStorage.setItem('username', username);
        navigate('/game');
      } else {
        const data = await response.json();
        setError(data.message || 'Username already taken');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl text-white mb-6 text-center">Enter the City</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-white mb-2">
              Choose your unique username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-cyan-500 focus:outline-none"
              placeholder="Enter username"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition-colors"
          >
            Start Driving
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;