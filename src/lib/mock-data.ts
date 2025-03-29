
import { Drone, DroneCommandLog, Alert, DroneStatus } from "@/types/drone";

// Constants for mock data generation
const MOCK_CENTER = { lat: 51.505, lng: -0.09 }; // London
const DRONE_COUNT = 5;
const UPDATE_INTERVAL = 3000; // ms

// Helper function to generate random coordinates around a center point
const getRandomCoordinate = (center: { lat: number, lng: number }, radiusKm: number) => {
  // Earth's radius in km
  const earthRadius = 6371;
  
  // Convert radius from km to radians
  const radiusInRadian = radiusKm / earthRadius;
  
  // Random angle
  const randomAngle = Math.random() * Math.PI * 2;
  
  // Random distance within the radius
  const randomDistance = Math.random() * radiusInRadian;
  
  // Calculate offset
  const lat = center.lat + (randomDistance * Math.cos(randomAngle) * (180 / Math.PI));
  const lng = center.lng + (randomDistance * Math.sin(randomAngle) * (180 / Math.PI) / Math.cos(center.lat * Math.PI / 180));
  
  return { lat, lng };
};

// Generate initial drone data
export const generateInitialDrones = (): Drone[] => {
  return Array.from({ length: DRONE_COUNT }).map((_, index) => {
    const coords = getRandomCoordinate(MOCK_CENTER, 2);
    const batteryLevel = Math.floor(Math.random() * 60) + 40; // 40-100%
    
    let status: DroneStatus = 'Operational';
    if (batteryLevel < 20) status = 'Low Battery';
    else if (batteryLevel < 10) status = 'Critical';
    else if (Math.random() < 0.1) status = 'Maintenance';
    
    return {
      id: `drone-${index + 1}`,
      name: `Rescue Drone ${index + 1}`,
      latitude: coords.lat,
      longitude: coords.lng,
      batteryLevel,
      status,
      sensors: {
        temperature: Math.floor(Math.random() * 25) + 15, // 15-40°C
        gasLevel: Math.floor(Math.random() * 300), // 0-300 ppm
        humidity: Math.floor(Math.random() * 60) + 30, // 30-90%
      },
      lastUpdated: new Date()
    };
  });
};

// Mock command logs
export const generateInitialCommandLogs = (): DroneCommandLog[] => {
  return [
    {
      id: "cmd-1",
      droneId: "drone-1",
      command: "Start Mission",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      status: "Completed"
    },
    {
      id: "cmd-2",
      droneId: "drone-2",
      command: "Scan Area",
      parameters: "Quadrant B3",
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      status: "Completed"
    },
    {
      id: "cmd-3",
      droneId: "drone-3",
      command: "Move to Location",
      parameters: "51.507, -0.115",
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      status: "Acknowledged"
    }
  ];
};

// Mock alerts
export const generateInitialAlerts = (): Alert[] => {
  return [
    {
      id: "alert-1",
      droneId: "drone-2",
      type: "Low Battery",
      message: "Battery level below 15%",
      severity: "warning",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      acknowledged: true
    },
    {
      id: "alert-2",
      droneId: "drone-4",
      type: "High Temperature",
      message: "Temperature exceeds normal operating range",
      severity: "warning",
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      acknowledged: false
    },
    {
      id: "alert-3",
      droneId: "drone-3",
      type: "Gas Leak",
      message: "Dangerous gas levels detected in sector C2",
      severity: "critical",
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      acknowledged: false
    }
  ];
};

// Function to update drone positions and data
export const updateDrones = (drones: Drone[]): Drone[] => {
  return drones.map(drone => {
    // Only update position if drone is operational
    if (drone.status === 'Operational' || drone.status === 'Low Battery') {
      const movement = {
        lat: (Math.random() - 0.5) * 0.001,
        lng: (Math.random() - 0.5) * 0.001
      };
      
      // Decrease battery by 0-1% per update
      const batteryDecrease = Math.random() * 1;
      let newBatteryLevel = Math.max(0, drone.batteryLevel - batteryDecrease);
      
      // Update status based on battery level
      let newStatus = drone.status;
      if (newBatteryLevel <= 5) newStatus = 'Critical';
      else if (newBatteryLevel <= 15) newStatus = 'Low Battery';
      
      // Random sensor fluctuations
      const tempChange = (Math.random() - 0.5) * 2;
      const gasChange = (Math.random() - 0.5) * 15;
      
      return {
        ...drone,
        latitude: drone.latitude + movement.lat,
        longitude: drone.longitude + movement.lng,
        batteryLevel: newBatteryLevel,
        status: newStatus,
        sensors: {
          ...drone.sensors,
          temperature: Math.max(0, drone.sensors.temperature + tempChange),
          gasLevel: Math.max(0, drone.sensors.gasLevel + gasChange)
        },
        lastUpdated: new Date()
      };
    }
    
    return drone;
  });
};

// Function to generate a new alert based on drone conditions
export const checkForNewAlerts = (drones: Drone[], existingAlerts: Alert[]): Alert[] => {
  const newAlerts: Alert[] = [];

  drones.forEach(drone => {
    // Check for critical battery levels
    if (drone.batteryLevel < 10 && !existingAlerts.some(a => 
      a.droneId === drone.id && a.type === 'Low Battery' && !a.acknowledged)) {
      newAlerts.push({
        id: `alert-${Date.now()}-${drone.id}-battery`,
        droneId: drone.id,
        type: 'Low Battery',
        message: `${drone.name} battery critically low at ${drone.batteryLevel.toFixed(1)}%`,
        severity: drone.batteryLevel < 5 ? 'critical' : 'warning',
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    // Check for high temperature
    if (drone.sensors.temperature > 35 && !existingAlerts.some(a => 
      a.droneId === drone.id && a.type === 'High Temperature' && !a.acknowledged)) {
      newAlerts.push({
        id: `alert-${Date.now()}-${drone.id}-temp`,
        droneId: drone.id,
        type: 'High Temperature',
        message: `${drone.name} temperature at ${drone.sensors.temperature.toFixed(1)}°C`,
        severity: drone.sensors.temperature > 40 ? 'critical' : 'warning',
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    // Check for gas levels
    if (drone.sensors.gasLevel > 200 && !existingAlerts.some(a => 
      a.droneId === drone.id && a.type === 'Gas Leak' && !a.acknowledged)) {
      newAlerts.push({
        id: `alert-${Date.now()}-${drone.id}-gas`,
        droneId: drone.id,
        type: 'Gas Leak',
        message: `${drone.name} detected high gas concentration: ${drone.sensors.gasLevel.toFixed(0)} ppm`,
        severity: drone.sensors.gasLevel > 250 ? 'critical' : 'warning',
        timestamp: new Date(),
        acknowledged: false
      });
    }
  });

  return [...existingAlerts, ...newAlerts];
};
