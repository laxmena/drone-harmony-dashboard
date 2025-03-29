
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Drone, DroneCommandLog, Alert, DroneCommand, CommandStatus } from '@/types/drone';
import { 
  generateInitialDrones, 
  generateInitialCommandLogs, 
  generateInitialAlerts,
  updateDrones,
  checkForNewAlerts
} from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

interface DroneContextType {
  drones: Drone[];
  commandLogs: DroneCommandLog[];
  alerts: Alert[];
  selectedDroneId: string | null;
  setSelectedDroneId: (id: string | null) => void;
  sendCommand: (droneId: string, command: DroneCommand, parameters?: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  batteryHistory: Record<string, {timestamp: Date, value: number}[]>;
  sensorHistory: Record<string, {timestamp: Date, temperature: number, gasLevel: number}[]>;
}

const DroneContext = createContext<DroneContextType | undefined>(undefined);

export const DroneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [drones, setDrones] = useState<Drone[]>(() => generateInitialDrones());
  const [commandLogs, setCommandLogs] = useState<DroneCommandLog[]>(() => generateInitialCommandLogs());
  const [alerts, setAlerts] = useState<Alert[]>(() => generateInitialAlerts());
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [batteryHistory, setBatteryHistory] = useState<Record<string, {timestamp: Date, value: number}[]>>({});
  const [sensorHistory, setSensorHistory] = useState<Record<string, {timestamp: Date, temperature: number, gasLevel: number}[]>>({});
  
  const { toast } = useToast();

  // Initialize history objects
  useEffect(() => {
    const initialBatteryHistory: Record<string, {timestamp: Date, value: number}[]> = {};
    const initialSensorHistory: Record<string, {timestamp: Date, temperature: number, gasLevel: number}[]> = {};
    
    drones.forEach(drone => {
      initialBatteryHistory[drone.id] = [{ timestamp: new Date(), value: drone.batteryLevel }];
      initialSensorHistory[drone.id] = [{ 
        timestamp: new Date(), 
        temperature: drone.sensors.temperature, 
        gasLevel: drone.sensors.gasLevel 
      }];
    });
    
    setBatteryHistory(initialBatteryHistory);
    setSensorHistory(initialSensorHistory);
  }, []);

  // Update drone positions and data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(prevDrones => {
        const updatedDrones = updateDrones(prevDrones);
        
        // Update battery history
        updatedDrones.forEach(drone => {
          setBatteryHistory(prev => ({
            ...prev,
            [drone.id]: [
              ...prev[drone.id] || [],
              { timestamp: new Date(), value: drone.batteryLevel }
            ]
          }));
          
          // Update sensor history
          setSensorHistory(prev => ({
            ...prev,
            [drone.id]: [
              ...prev[drone.id] || [],
              { 
                timestamp: new Date(), 
                temperature: drone.sensors.temperature, 
                gasLevel: drone.sensors.gasLevel 
              }
            ]
          }));
        });
        
        return updatedDrones;
      });
      
      // Check for new alerts
      setAlerts(prevAlerts => {
        const updatedAlerts = checkForNewAlerts(drones, prevAlerts);
        
        // Show toast for new alerts
        updatedAlerts.forEach(alert => {
          if (!prevAlerts.some(a => a.id === alert.id)) {
            toast({
              title: `${alert.type} Alert`,
              description: alert.message,
              variant: alert.severity === 'critical' ? 'destructive' : 'default',
            });
            
            // Play sound for critical alerts
            if (alert.severity === 'critical') {
              const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-988.mp3');
              audio.play().catch(e => console.log('Error playing sound:', e));
            }
          }
        });
        
        return updatedAlerts;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [drones, toast]);

  // Function to send a command to a drone
  const sendCommand = (droneId: string, command: DroneCommand, parameters?: string) => {
    const newCommand: DroneCommandLog = {
      id: `cmd-${Date.now()}`,
      droneId,
      command,
      parameters,
      timestamp: new Date(),
      status: 'Sent'
    };
    
    setCommandLogs(prev => [...prev, newCommand]);
    
    // Simulate command acknowledgement after 2 seconds
    setTimeout(() => {
      setCommandLogs(prev => 
        prev.map(log => 
          log.id === newCommand.id 
            ? { ...log, status: 'Acknowledged' as CommandStatus } 
            : log
        )
      );
      
      // Simulate command completion after 5 seconds
      setTimeout(() => {
        setCommandLogs(prev => 
          prev.map(log => 
            log.id === newCommand.id 
              ? { ...log, status: 'Completed' as CommandStatus } 
              : log
          )
        );
        
        // Handle special commands
        if (command === 'Return to Base') {
          setDrones(prev => 
            prev.map(drone => 
              drone.id === droneId 
                ? { ...drone, status: 'Maintenance' } 
                : drone
            )
          );
        }
      }, 5000);
    }, 2000);
    
    toast({
      title: "Command Sent",
      description: `${command} command sent to Drone ${droneId.split('-')[1]}`,
    });
  };

  // Function to acknowledge an alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true } 
          : alert
      )
    );
  };

  return (
    <DroneContext.Provider value={{
      drones,
      commandLogs,
      alerts,
      selectedDroneId,
      setSelectedDroneId,
      sendCommand,
      acknowledgeAlert,
      batteryHistory,
      sensorHistory
    }}>
      {children}
    </DroneContext.Provider>
  );
};

export const useDroneContext = () => {
  const context = useContext(DroneContext);
  if (context === undefined) {
    throw new Error('useDroneContext must be used within a DroneProvider');
  }
  return context;
};
