
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDroneContext } from '@/context/DroneContext';
import { format } from 'date-fns';
import { CircleAlert } from 'lucide-react';

interface AlertPanelProps {
  className?: string;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ className }) => {
  const { drones, alerts, acknowledgeAlert } = useDroneContext();
  
  // Filter for only unacknowledged alerts, sorted by timestamp (newest first)
  const activeAlerts = alerts
    .filter(alert => !alert.acknowledged)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Get severity class
  const getSeverityClass = (severity: string) => {
    return severity === 'critical' ? 'bg-status-critical/10 border-status-critical' : 'bg-status-warning/10 border-status-warning';
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CircleAlert className="h-5 w-5 text-status-critical" />
            Alert System
          </CardTitle>
          <CardDescription>
            {activeAlerts.length === 0 
              ? 'No active alerts' 
              : `${activeAlerts.length} active alert${activeAlerts.length > 1 ? 's' : ''}`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-[256px] overflow-y-auto">
          {activeAlerts.length > 0 ? (
            activeAlerts.map(alert => {
              const drone = drones.find(d => d.id === alert.droneId);
              
              return (
                <div 
                  key={alert.id} 
                  className={`border rounded-md p-3 ${getSeverityClass(alert.severity)}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">
                      {alert.type}
                      {alert.severity === 'critical' && (
                        <span className="ml-2 text-status-critical animate-pulse-alert">CRITICAL</span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="h-6 text-xs"
                    >
                      Acknowledge
                    </Button>
                  </div>
                  <p className="text-sm mb-1">
                    {alert.message}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{drone?.name || alert.droneId}</span>
                    <span>{format(alert.timestamp, 'HH:mm:ss')}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              All systems operational
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertPanel;
