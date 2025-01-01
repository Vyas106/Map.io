
// client/src/utils/distance.js
// utils/distance.js
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * 
           Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  // Calculate estimated times
  const walkingSpeed = 5; // km/h
  const drivingSpeed = 50; // km/h

  return {
    distance,
    timeByWalk: (distance / walkingSpeed) * 60, // Convert to minutes
    timeByCar: (distance / drivingSpeed) * 60 // Convert to minutes
  };
};

const toRad = (value) => {
  return value * Math.PI / 180;
};