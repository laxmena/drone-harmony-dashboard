
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useDroneContext } from '@/context/DroneContext';
import { Battery, Thermometer, MapPin, Activity, User } from 'lucide-react';
import { format } from 'date-fns';

interface AgentStatusTableProps {
  className?: string;
}

const AgentStatusTable: React.FC<AgentStatusTableProps> = ({ className }) => {
  const { drones, groundBots } = useDroneContext();
  
  // Get status color based on agent status
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Agent Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID/Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Battery</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Task</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drones.map(drone => (
              <TableRow key={drone.id}>
                <TableCell className="font-medium">{drone.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Drone</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`${getStatusColor(drone.status)}`}>
                    {drone.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Battery className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-medium">
                        {drone.batteryLevel.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={drone.batteryLevel} 
                      max={100} 
                      className="h-1"
                      indicatorClassName={getBatteryColor(drone.batteryLevel)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {drone.latitude.toFixed(4)}, {drone.longitude.toFixed(4)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(drone.lastUpdated, 'HH:mm:ss')}
                </TableCell>
                <TableCell>Active Patrol</TableCell>
              </TableRow>
            ))}
            {groundBots && groundBots.map(bot => (
              <TableRow key={bot.id}>
                <TableCell className="font-medium">{bot.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Ground Bot</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`${getStatusColor(bot.status)}`}>
                    {bot.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Battery className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-medium">
                        {bot.batteryLevel.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={bot.batteryLevel} 
                      max={100} 
                      className="h-1"
                      indicatorClassName={getBatteryColor(bot.batteryLevel)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {bot.latitude.toFixed(4)}, {bot.longitude.toFixed(4)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(bot.lastUpdated, 'HH:mm:ss')}
                </TableCell>
                <TableCell>{bot.assignedTask || 'Standby'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AgentStatusTable;
