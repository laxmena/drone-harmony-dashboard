
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
