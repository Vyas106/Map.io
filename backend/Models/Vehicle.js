
// Models/Vehicle.js
const vehicleSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true
  },
  position: {
    x: Number,
    y: Number
  },
  rotation: Number,
  speed: Number,
  lastUpdate: Date,
  path: [{
    position: {
      x: Number,
      y: Number
    },
    timestamp: Date,
    speed: Number
  }],
  violations: [{
    type: {
      type: String,
      enum: ['speedLimit', 'trafficLight', 'collision'],
    },
    timestamp: Date,
    location: {
      x: Number,
      y: Number
    }
  }]
});
