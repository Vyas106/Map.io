// backend/server.js


const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const geolib = require('geolib');
const moment = require('moment');

// Environment variables for configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trafficDB';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const PORT = process.env.PORT || 4000;
const NEARBY_INCIDENT_RADIUS_METERS = 5000;
const CONGESTION_UPDATE_INTERVAL_MS = 5 * 60 * 1000;
const RECENT_TRAFFIC_WINDOW_MINUTES = 5;

// Initialize Express app with security middleware
const app = express();
app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// MongoDB connection with proper error handling
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Improved MongoDB schemas with indexes and validation
const TrafficIncidentSchema = new mongoose.Schema({
  type: { 
    type: String,
    required: true,
    enum: ['accident', 'congestion', 'roadwork', 'hazard', 'other']
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coords) => coords.length === 2 &&
          coords[0] >= -180 && coords[0] <= 180 &&
          coords[1] >= -90 && coords[1] <= 90,
        message: 'Invalid coordinates'
      }
    }
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolved: {
    type: Boolean,
    default: false,
    index: true
  }
});

const ZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  polygon: {
    type: [[Number]],
    required: true,
    validate: {
      validator: (coords) => coords.length >= 3,
      message: 'Polygon must have at least 3 points'
    }
  },
  congestionLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  subscribers: [String]
});

const TrafficDataSchema = new mongoose.Schema({
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  speed: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  }
});

// Add indexes for geospatial queries
TrafficIncidentSchema.index({ location: '2dsphere' });
TrafficDataSchema.index({ location: '2dsphere' });

// Create models
const TrafficIncident = mongoose.model('TrafficIncident', TrafficIncidentSchema);
const Zone = mongoose.model('Zone', ZoneSchema);
const TrafficData = mongoose.model('TrafficData', TrafficDataSchema);

// Improved in-memory storage with TTL
const users = new Map();
const userActivityTimeout = 30 * 60 * 1000; // 30 minutes

// Enhanced utility functions with error handling
const isInZone = (userLocation, zonePolygon) => {
  try {
    return geolib.isPointInPolygon(
      { latitude: userLocation.lat, longitude: userLocation.lng },
      zonePolygon.map(coord => ({ latitude: coord[1], longitude: coord[0] }))
    );
  } catch (error) {
    console.error('Error in isInZone calculation:', error);
    return false;
  }
};

const calculateCongestion = async (zone) => {
  try {
    const recentData = await TrafficData.find({
      location: {
        $geoWithin: {
          $polygon: zone.polygon
        }
      },
      timestamp: { 
        $gte: moment().subtract(RECENT_TRAFFIC_WINDOW_MINUTES, 'minutes').toDate() 
      }
    }).lean();

    if (recentData.length === 0) return 0;

    const avgSpeed = recentData.reduce((acc, curr) => acc + curr.speed, 0) / recentData.length;
    return Math.max(0, Math.min(5, 5 - (avgSpeed / 20)));
  } catch (error) {
    console.error('Error calculating congestion:', error);
    return 0;
  }
};

// Socket.IO event handlers with error handling and rate limiting
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  let messageCount = 0;
  const messageLimit = 100;
  const resetInterval = setInterval(() => messageCount = 0, 60000);

  const handleSocketError = (error, event) => {
    console.error(`Socket error in ${event}:`, error);
    socket.emit('error', { message: 'An error occurred processing your request' });
  };

  socket.on('login', async (username) => {
    try {
      if (messageCount >= messageLimit) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }
      messageCount++;

      if (!username || typeof username !== 'string') {
        socket.emit('error', { message: 'Invalid username' });
        return;
      }

      users.set(socket.id, {
        username: username.trim(),
        location: null,
        subscribedZones: [],
        lastActivity: Date.now()
      });

      io.emit('users', Array.from(users.values()));
    } catch (error) {
      handleSocketError(error, 'login');
    }
  });

  socket.on('updateLocation', async (userData) => {
    try {
      if (messageCount >= messageLimit) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }
      messageCount++;

      const user = users.get(socket.id);
      if (!user) return;

      if (!userData.location || 
          typeof userData.location.lat !== 'number' || 
          typeof userData.location.lng !== 'number') {
        socket.emit('error', { message: 'Invalid location data' });
        return;
      }

      user.location = userData.location;
      user.lastActivity = Date.now();
      users.set(socket.id, user);

      await new TrafficData({
        location: {
          type: 'Point',
          coordinates: [userData.location.lng, userData.location.lat]
        },
        speed: Math.max(0, userData.speed || 0),
        timestamp: new Date(),
        userId: socket.id
      }).save();

      const zones = await Zone.find({}).lean();
      for (const zone of zones) {
        const wasInZone = user.subscribedZones.includes(zone._id.toString());
        const isNowInZone = isInZone(userData.location, zone.polygon);

        if (!wasInZone && isNowInZone) {
          user.subscribedZones.push(zone._id.toString());
          socket.emit('zoneEnter', {
            zoneName: zone.name,
            congestionLevel: zone.congestionLevel
          });
        } else if (wasInZone && !isNowInZone) {
          user.subscribedZones = user.subscribedZones.filter(id => 
            id !== zone._id.toString()
          );
          socket.emit('zoneExit', { zoneName: zone.name });
        }
      }

      io.emit('users', Array.from(users.values()));
    } catch (error) {
      handleSocketError(error, 'updateLocation');
    }
  });

  socket.on('reportIncident', async (incident) => {
    try {
      if (messageCount >= messageLimit) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }
      messageCount++;

      const newIncident = await new TrafficIncident({
        type: incident.type,
        location: {
          type: 'Point',
          coordinates: [incident.location.lng, incident.location.lat]
        },
        severity: incident.severity,
        description: incident.description,
        timestamp: new Date()
      }).save();

      for (const [socketId, user] of users.entries()) {
        if (user.location) {
          const distance = geolib.getDistance(
            { latitude: user.location.lat, longitude: user.location.lng },
            { latitude: incident.location.lat, longitude: incident.location.lng }
          );
          if (distance < NEARBY_INCIDENT_RADIUS_METERS) {
            io.to(socketId).emit('incidentAlert', newIncident);
          }
        }
      }
    } catch (error) {
      handleSocketError(error, 'reportIncident');
    }
  });

  socket.on('disconnect', () => {
    clearInterval(resetInterval);
    users.delete(socket.id);
    io.emit('users', Array.from(users.values()));
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// REST API endpoints with validation and error handling
app.get('/api/incidents', async (req, res) => {
  try {
    const incidents = await TrafficIncident.find({ 
      resolved: false,
      timestamp: { $gte: moment().subtract(24, 'hours').toDate() }
    }).lean();
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/zones', async (req, res) => {
  try {
    const zones = await Zone.find({}).lean();
    res.json(zones);
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/heatmap', async (req, res) => {
  try {
    const data = await TrafficData.find({
      timestamp: { $gte: moment().subtract(1, 'hour').toDate() }
    }).lean();
    res.json(data);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Periodic tasks with error handling
setInterval(async () => {
  try {
    const zones = await Zone.find({});
    for (const zone of zones) {
      zone.congestionLevel = await calculateCongestion(zone);
      await zone.save();

      zone.subscribers.forEach(socketId => {
        io.to(socketId).emit('congestionUpdate', {
          zoneId: zone._id,
          congestionLevel: zone.congestionLevel
        });
      });
    }
  } catch (error) {
    console.error('Error updating congestion levels:', error);
  }
}, CONGESTION_UPDATE_INTERVAL_MS);

// Clean up inactive users
setInterval(() => {
  const now = Date.now();
  for (const [socketId, user] of users.entries()) {
    if (now - user.lastActivity > userActivityTimeout) {
      users.delete(socketId);
    }
  }
}, 60000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));