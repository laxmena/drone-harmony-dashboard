
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDroneContext } from '@/context/DroneContext';
import { 
  Bell, 
  BellOff, 
  CircleCheck, 
  CircleAlert, 
  CircleX, 
  Thermometer, 
  Zap, 
  ZapOff,
  MapPin
} from 'lucide-react';

interface DroneStatusProps {
  className?: string;
}

const DroneStatus: React.FC<DroneStatusProps> = ({ className }) => {
  const { drones, selectedDroneId, setSelectedDroneId } = useDroneContext();

  // Get status color based on drone status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Operational': return 'text-status-operational';
      case 'Low Battery': return 'text-status-warning';
      case 'Critical': return 'text-status-critical';
      case 'Maintenance': 
      case 'Offline': 
      default: return 'text-status-offline';
    }
  };

  // Get battery color based on level
  const getBatteryColor = (level: number): string => {
    if (level <= 10) return 'bg-status-critical';
    if (level <= 30) return 'bg-status-warning';
    return 'bg-status-operational';
  };

  // Get status icon based on drone status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Operational': 
        return <CircleCheck className="w-5 h-5 text-status-operational" />;
      case 'Low Battery': 
        return <ZapOff className="w-5 h-5 text-status-warning" />;
      case 'Critical': 
        return <CircleAlert className="w-5 h-5 text-status-critical animate-pulse-alert" />;
      case 'Maintenance': 
        return <Bell className="w-5 h-5 text-status-offline" />;
      case 'Offline': 
      default: 
        return <BellOff className="w-5 h-5 text-status-offline" />;
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
      {drones.map(drone => (
        <Card 
          key={drone.id} 
          className={`cursor-pointer transition-colors duration-200 hover:bg-secondary/50 ${
            selectedDroneId === drone.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedDroneId(drone.id)}
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{drone.name}</h3>
              {getStatusIcon(drone.status)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Battery</span>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(drone.status)}`}>
                {drone.batteryLevel.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={drone.batteryLevel} 
              max={100} 
              className="h-2"
              indicatorClassName={getBatteryColor(drone.batteryLevel)}
            />
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
              <div className="flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Temp</span>
              </div>
              <span className="text-xs font-medium text-right">
                {drone.sensors.temperature.toFixed(1)}°C
              </span>
              
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Coordinates</span>
              </div>
              <span className="text-xs font-medium text-right truncate" title={`${drone.latitude.toFixed(5)}, ${drone.longitude.toFixed(5)}`}>
                {drone.latitude.toFixed(4)}, {drone.longitude.toFixed(4)}
              </span>
              
              <div className="flex items-center gap-1">
                <CircleAlert className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Gas Level</span>
              </div>
              <span className="text-xs font-medium text-right">
                {drone.sensors.gasLevel.toFixed(0)} ppm
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DroneStatus;
