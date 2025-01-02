
// Models/TrafficData.js
const trafficDataSchema = new mongoose.Schema({
    gridX: Number,
    gridY: Number,
    vehicleCount: Number,
    averageSpeed: Number,
    timestamp: Date,
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    }
  });
  