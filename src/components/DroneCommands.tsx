
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDroneContext } from '@/context/DroneContext';
import { format } from 'date-fns';
import { DroneCommand } from '@/types/drone';

interface DroneCommandsProps {
  className?: string;
}

const DroneCommands: React.FC<DroneCommandsProps> = ({ className }) => {
  const { drones, commandLogs, selectedDroneId, sendCommand } = useDroneContext();
  const [command, setCommand] = useState<DroneCommand>('Return to Base');
  const [parameters, setParameters] = useState('');
  
  const handleSendCommand = () => {
    if (!selectedDroneId) return;
    
    sendCommand(selectedDroneId, command, parameters);
    
    // Reset parameters field
    setParameters('');
  };
  
  const needsParameters = command === 'Move to Location' || command === 'Scan Area';

  return (
    <div className={`flex flex-col gap-5 ${className || ''}`}>
      <Card>
        <CardHeader>
          <CardTitle>Command Center</CardTitle>
          <CardDescription>
            {selectedDroneId 
              ? `Send commands to ${drones.find(d => d.id === selectedDroneId)?.name}`
              : 'Select a drone to send commands'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="command">Command</Label>
              <Select 
                value={command} 
                onValueChange={(value) => setCommand(value as DroneCommand)}
                disabled={!selectedDroneId}
              >
                <SelectTrigger id="command">
                  <SelectValue placeholder="Select command" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Return to Base">Return to Base</SelectItem>
                  <SelectItem value="Move to Location">Move to Location</SelectItem>
                  <SelectItem value="Start Mission">Start Mission</SelectItem>
                  <SelectItem value="Stop Mission">Stop Mission</SelectItem>
                  <SelectItem value="Scan Area">Scan Area</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {needsParameters && (
              <div className="space-y-2">
                <Label htmlFor="parameters">
                  {command === 'Move to Location' ? 'Coordinates (lat, lng)' : 'Area Identifier'}
                </Label>
                <Input
                  id="parameters"
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  placeholder={command === 'Move to Location' ? '51.505, -0.09' : 'Sector A1'}
                  disabled={!selectedDroneId}
                />
              </div>
            )}
            
            <Button 
              onClick={handleSendCommand} 
              disabled={!selectedDroneId || (needsParameters && !parameters)}
              className="w-full"
            >
              Send Command
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Command History */}
      <Card>
        <CardHeader>
          <CardTitle>Command History</CardTitle>
          <CardDescription>Recent commands sent to drones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-4 gap-2 p-3 border-b bg-secondary text-xs font-medium">
              <div>Drone</div>
              <div>Command</div>
              <div>Time</div>
              <div>Status</div>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {commandLogs.length > 0 ? (
                [...commandLogs]
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map(log => {
                    const drone = drones.find(d => d.id === log.droneId);
                    
                    // Get status color
                    const getStatusColor = () => {
                      switch (log.status) {
                        case 'Completed': return 'text-status-operational';
                        case 'Pending':
                        case 'Sent': 
                        case 'Acknowledged': return 'text-status-warning';
                        case 'Failed': return 'text-status-critical';
                        default: return 'text-muted-foreground';
                      }
                    };
                    
                    return (
                      <div key={log.id} className="grid grid-cols-4 gap-2 p-3 border-b text-xs">
                        <div className="truncate">{drone?.name || log.droneId}</div>
                        <div className="truncate" title={log.parameters ? `${log.command}: ${log.parameters}` : log.command}>
                          {log.command}
                          {log.parameters && <span className="text-muted-foreground"> ({log.parameters})</span>}
                        </div>
                        <div>{format(log.timestamp, 'HH:mm:ss')}</div>
                        <div className={getStatusColor()}>{log.status}</div>
                      </div>
                    );
                  })
              ) : (
                <div className="p-3 text-center text-muted-foreground text-xs">
                  No commands sent yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DroneCommands;
