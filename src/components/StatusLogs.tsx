
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDroneContext } from '@/context/DroneContext';
import { format } from 'date-fns';
import { AlertCircle, Info, Clock } from 'lucide-react';
import { StatusLog } from '@/types/drone';

interface StatusLogsProps {
  className?: string;
}

const StatusLogs: React.FC<StatusLogsProps> = ({ className }) => {
  const { statusLogs } = useDroneContext();
  
  // Get icon based on severity
  const getLogIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-status-critical" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-status-warning" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Status Logs
        </CardTitle>
        <CardDescription>
          Real-time system and agent status updates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4">
          <div className="space-y-4 pb-4">
            {statusLogs.length > 0 ? (
              statusLogs.map(log => (
                <div key={log.id} className="border-l-2 pl-3 py-1" 
                  style={{ 
                    borderColor: log.severity === 'critical' 
                      ? 'var(--status-critical)' 
                      : log.severity === 'warning' 
                        ? 'var(--status-warning)' 
                        : 'var(--status-operational)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getLogIcon(log.severity)}
                    <span className="text-sm font-medium">
                      {log.agentId ? `${log.agentType === 'drone' ? 'Drone' : 'Ground Bot'} ${log.agentId.split('-')[1]}` : 'System'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(log.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{log.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No status logs available
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StatusLogs;
