
export type DroneStatus = 'Operational' | 'Low Battery' | 'Maintenance' | 'Offline' | 'Critical';

export type DroneCommand = 'Return to Base' | 'Move to Location' | 'Start Mission' | 'Stop Mission' | 'Scan Area';

export type CommandStatus = 'Pending' | 'Sent' | 'Acknowledged' | 'Completed' | 'Failed';

export interface SensorData {
  temperature: number; // in Celsius
  gasLevel: number;    // in ppm
  humidity?: number;   // in percentage
}

export interface Drone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  status: DroneStatus;
  sensors: SensorData;
  lastUpdated: Date;
}

export interface DroneCommandLog {
  id: string;
  droneId: string;
  command: DroneCommand;
  parameters?: string;
  timestamp: Date;
  status: CommandStatus;
}

export interface Alert {
  id: string;
  droneId: string;
  type: 'Low Battery' | 'High Temperature' | 'Gas Leak' | 'Connection Lost' | 'System Error';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
}

// New types for enhanced dashboard
export interface GroundBot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  status: DroneStatus;
  sensors: SensorData;
  assignedTask?: string;
  lastUpdated: Date;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  forecast: string;
  lastUpdated: Date;
}

export interface GISFeature {
  type: 'roadblock' | 'hazard' | 'safeZone' | 'evacuationRoute';
  coordinates: [number, number];
  radius?: number;
  description: string;
}

export interface StatusLog {
  id: string;
  timestamp: Date;
  agentId?: string;
  agentType: 'drone' | 'groundBot' | 'system';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  rawData?: any;
}

export interface HumanReport {
  id: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  reporter: string;
  message: string;
  type: 'sighting' | 'casualty' | 'hazard' | 'request';
  status: 'new' | 'acknowledged' | 'inProgress' | 'resolved';
}
