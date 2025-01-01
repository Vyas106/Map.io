// server.js
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ['GET', 'POST']
}));

// Store users in-memory (consider using Redis for production)
const users = new Map();

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Socket.io setup with error handling
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    upgradeTimeout: 30000,
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('login', (username) => {
      try {
        if (!username) throw new Error('Username required');
        users.set(socket.id, {
          username,
          location: null,
          lastActive: Date.now()
        });
        io.emit('users', Array.from(users.values()));
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    socket.on('updateLocation', (userData) => {
      try {
        const user = users.get(socket.id);
        if (!user) throw new Error('User not found');
        user.location = userData.location;
        user.lastActive = Date.now();
        users.set(socket.id, user);
        io.emit('users', Array.from(users.values()));
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    socket.on('disconnect', () => {
      users.delete(socket.id);
      io.emit('users', Array.from(users.values()));
      console.log(`Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error: ${error}`);
    });
  });

  // Cleanup inactive users periodically
  setInterval(() => {
    const now = Date.now();
    for (const [id, user] of users.entries()) {
      if (now - user.lastActive > 1800000) { // 30 minutes
        users.delete(id);
      }
    }
    io.emit('users', Array.from(users.values()));
  }, 300000); // every 5 minutes

  return io;
};

// Development server
if (process.env.NODE_ENV !== 'production') {
  const http = require('http');
  const server = http.createServer(app);
  initializeSocket(server);
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`Development server running on port ${PORT}`));
}

// Export for Vercel serverless function
module.exports = app;