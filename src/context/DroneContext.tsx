
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Drone, 
  DroneCommandLog, 
  Alert, 
  DroneCommand, 
  CommandStatus,
  GroundBot,
  WeatherData,
  GISFeature,
  StatusLog,
  HumanReport
} from '@/types/drone';
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
  groundBots: GroundBot[];
  commandLogs: DroneCommandLog[];
  alerts: Alert[];
  weatherData: WeatherData | null;
  gisFeatures: GISFeature[];
  statusLogs: StatusLog[];
  humanReports: HumanReport[];
  selectedDroneId: string | null;
  setSelectedDroneId: (id: string | null) => void;
  sendCommand: (agentId: string, command: DroneCommand, parameters?: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  acknowledgeHumanReport: (reportId: string) => void;
  batteryHistory: Record<string, {timestamp: Date, value: number}[]>;
  sensorHistory: Record<string, {timestamp: Date, temperature: number, gasLevel: number}[]>;
}

const DroneContext = createContext<DroneContextType | undefined>(undefined);

// Mock data generators
const generateInitialGroundBots = (): GroundBot[] => {
  return [
    {
      id: 'bot-1',
      name: 'Ground Bot Alpha',
      latitude: 51.505,
      longitude: -0.09,
      batteryLevel: 78,
      status: 'Operational',
      sensors: {
        temperature: 24.5,
        gasLevel: 15,
        humidity: 65
      },
      assignedTask: 'Search Grid A4',
      lastUpdated: new Date()
    },
    {
      id: 'bot-2',
      name: 'Ground Bot Beta',
      latitude: 51.503,
      longitude: -0.087,
      batteryLevel: 42,
      status: 'Low Battery',
      sensors: {
        temperature: 26.8,
        gasLevel: 35,
        humidity: 68
      },
      assignedTask: 'Assist Medical Team',
      lastUpdated: new Date()
    }
  ];
};

const generateWeatherData = (): WeatherData => {
  return {
    temperature: 22.4,
    humidity: 65,
    windSpeed: 12,
    windDirection: 'NW',
    precipitation: 0.2,
    forecast: 'Partly Cloudy',
    lastUpdated: new Date()
  };
};

const generateGISFeatures = (): GISFeature[] => {
  return [
    {
      type: 'roadblock',
      coordinates: [51.505, -0.09],
      description: 'Collapsed building blocking main road'
    },
    {
      type: 'hazard',
      coordinates: [51.503, -0.092],
      radius: 200,
      description: 'Gas leak detected'
    },
    {
      type: 'safeZone',
      coordinates: [51.507, -0.088],
      radius: 500,
      description: 'Emergency evacuation center'
    }
  ];
};

const generateStatusLogs = (): StatusLog[] => {
  return [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 120000),
      agentId: 'drone-1',
      agentType: 'drone',
      message: 'Detected unusual heat signature at building C, sending alert to command',
      severity: 'warning',
      rawData: { temperature: 85.2, location: [51.505, -0.09] }
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 300000),
      agentId: 'bot-1',
      agentType: 'groundBot',
      message: 'Identified potential casualty in sector A4, requesting medical team',
      severity: 'critical',
      rawData: { location: [51.503, -0.087], confidence: 0.89 }
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 600000),
      agentType: 'system',
      message: 'Weather alert: Wind speed increasing, potential impact on aerial operations',
      severity: 'info',
      rawData: { windSpeed: 25, direction: 'NW' }
    }
  ];
};

const generateHumanReports = (): HumanReport[] => {
  return [
    {
      id: 'report-1',
      timestamp: new Date(Date.now() - 900000),
      location: {
        latitude: 51.504,
        longitude: -0.091
      },
      reporter: 'Field Team Alpha',
      message: 'Group of civilians spotted at apartment building requiring evacuation',
      type: 'sighting',
      status: 'acknowledged'
    },
    {
      id: 'report-2',
      timestamp: new Date(Date.now() - 1500000),
      location: {
        latitude: 51.509,
        longitude: -0.093
      },
      reporter: 'Medical Team',
      message: 'Medical supplies needed at evacuation center',
      type: 'request',
      status: 'inProgress'
    }
  ];
};

export const DroneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [drones, setDrones] = useState<Drone[]>(() => generateInitialDrones());
  const [groundBots, setGroundBots] = useState<GroundBot[]>(() => generateInitialGroundBots());
  const [commandLogs, setCommandLogs] = useState<DroneCommandLog[]>(() => generateInitialCommandLogs());
  const [alerts, setAlerts] = useState<Alert[]>(() => generateInitialAlerts());
  const [weatherData, setWeatherData] = useState<WeatherData | null>(() => generateWeatherData());
  const [gisFeatures, setGisFeatures] = useState<GISFeature[]>(() => generateGISFeatures());
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>(() => generateStatusLogs());
  const [humanReports, setHumanReports] = useState<HumanReport[]>(() => generateHumanReports());
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
    
    groundBots.forEach(bot => {
      initialBatteryHistory[bot.id] = [{ timestamp: new Date(), value: bot.batteryLevel }];
      initialSensorHistory[bot.id] = [{ 
        timestamp: new Date(), 
        temperature: bot.sensors.temperature, 
        gasLevel: bot.sensors.gasLevel 
      }];
    });
    
    setBatteryHistory(initialBatteryHistory);
    setSensorHistory(initialSensorHistory);
  }, []);

  // Update drone positions and data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Update drones
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

      // Update ground bots
      setGroundBots(prevBots => {
        const updatedBots = prevBots.map(bot => {
          // Simulate bot movements and status changes
          const newBot = { ...bot };
          
          // Update location slightly
          newBot.latitude += (Math.random() - 0.5) * 0.001;
          newBot.longitude += (Math.random() - 0.5) * 0.001;
          
          // Update battery (slowly drain)
          newBot.batteryLevel = Math.max(0, newBot.batteryLevel - Math.random() * 0.3);
          
          // Update status based on battery
          if (newBot.batteryLevel < 10) {
            newBot.status = 'Critical';
          } else if (newBot.batteryLevel < 30) {
            newBot.status = 'Low Battery';
          }
          
          // Update sensor data
          newBot.sensors = {
            ...newBot.sensors,
            temperature: newBot.sensors.temperature + (Math.random() - 0.5),
            gasLevel: Math.max(0, newBot.sensors.gasLevel + (Math.random() - 0.5) * 5)
          };
          
          newBot.lastUpdated = new Date();
          
          return newBot;
        });
        
        // Update histories for bots
        updatedBots.forEach(bot => {
          setBatteryHistory(prev => ({
            ...prev,
            [bot.id]: [
              ...prev[bot.id] || [],
              { timestamp: new Date(), value: bot.batteryLevel }
            ]
          }));
          
          setSensorHistory(prev => ({
            ...prev,
            [bot.id]: [
              ...prev[bot.id] || [],
              { 
                timestamp: new Date(), 
                temperature: bot.sensors.temperature, 
                gasLevel: bot.sensors.gasLevel 
              }
            ]
          }));
        });
        
        return updatedBots;
      });
      
      // Update weather occasionally
      if (Math.random() > 0.8) {
        setWeatherData(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            temperature: prev.temperature + (Math.random() - 0.5),
            humidity: Math.min(100, Math.max(0, prev.humidity + (Math.random() - 0.5) * 3)),
            windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 2),
            lastUpdated: new Date()
          };
        });
      }
      
      // Generate new status log occasionally
      if (Math.random() > 0.7) {
        const allAgents = [...drones, ...groundBots];
        const randomAgent = allAgents[Math.floor(Math.random() * allAgents.length)];
        
        const newLog: StatusLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          agentId: randomAgent.id,
          agentType: randomAgent.id.startsWith('drone') ? 'drone' : 'groundBot',
          message: generateRandomStatusMessage(randomAgent),
          severity: Math.random() > 0.8 ? 'critical' : Math.random() > 0.5 ? 'warning' : 'info',
          rawData: { 
            temperature: randomAgent.sensors.temperature,
            gasLevel: randomAgent.sensors.gasLevel,
            location: [randomAgent.latitude, randomAgent.longitude]
          }
        };
        
        setStatusLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
        
        // For critical logs, show toast
        if (newLog.severity === 'critical') {
          toast({
            title: "Critical Status Update",
            description: newLog.message,
            variant: "destructive",
          });
        }
      }
      
      // Check for new alerts
      setAlerts(prevAlerts => {
        const updatedAlerts = checkForNewAlerts([...drones, ...groundBots], prevAlerts);
        
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
  }, [drones, groundBots, toast]);

  // Function to generate random status messages
  const generateRandomStatusMessage = (agent: Drone | GroundBot): string => {
    const messages = [
      `Completed scan of sector at ${agent.latitude.toFixed(4)}, ${agent.longitude.toFixed(4)}`,
      `Detected unusual heat signature of ${agent.sensors.temperature.toFixed(1)}°C`,
      `Gas level reading: ${agent.sensors.gasLevel.toFixed(0)} ppm`,
      `Moving to new search area`,
      `Battery level at ${agent.batteryLevel.toFixed(0)}%`,
      `Successfully identified objects in current location`,
      `Communication signal strength fluctuating`,
      `Environmental conditions stable`
    ];
    
    // Add critical messages for low battery or high gas levels
    if (agent.batteryLevel < 15) {
      return `CRITICAL: Battery level critical at ${agent.batteryLevel.toFixed(0)}%, initiating emergency protocols`;
    }
    
    if (agent.sensors.gasLevel > 50) {
      return `WARNING: Elevated gas levels detected (${agent.sensors.gasLevel.toFixed(0)} ppm), potentially hazardous environment`;
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Function to send a command to a drone or ground bot
  const sendCommand = (agentId: string, command: DroneCommand, parameters?: string) => {
    const newCommand: DroneCommandLog = {
      id: `cmd-${Date.now()}`,
      droneId: agentId,
      command,
      parameters,
      timestamp: new Date(),
      status: 'Sent'
    };
    
    setCommandLogs(prev => [...prev, newCommand]);
    
    // Add a status log for the command
    const agentType = agentId.startsWith('drone') ? 'drone' : 'groundBot';
    const agentName = agentType === 'drone' 
      ? drones.find(d => d.id === agentId)?.name 
      : groundBots.find(b => b.id === agentId)?.name;
    
    const newLog: StatusLog = {
      id: `log-cmd-${Date.now()}`,
      timestamp: new Date(),
      agentId: agentId,
      agentType: agentType,
      message: `Command sent: ${command}${parameters ? ` with parameters: ${parameters}` : ''}`,
      severity: 'info'
    };
    
    setStatusLogs(prev => [newLog, ...prev]);
    
    // Simulate command acknowledgement after 2 seconds
    setTimeout(() => {
      setCommandLogs(prev => 
        prev.map(log => 
          log.id === newCommand.id 
            ? { ...log, status: 'Acknowledged' as CommandStatus } 
            : log
        )
      );
      
      // Add acknowledgement log
      const ackLog: StatusLog = {
        id: `log-ack-${Date.now()}`,
        timestamp: new Date(),
        agentId: agentId,
        agentType: agentType,
        message: `${agentName} acknowledged command: ${command}`,
        severity: 'info'
      };
      
      setStatusLogs(prev => [ackLog, ...prev]);
      
      // Simulate command completion after 5 seconds
      setTimeout(() => {
        setCommandLogs(prev => 
          prev.map(log => 
            log.id === newCommand.id 
              ? { ...log, status: 'Completed' as CommandStatus } 
              : log
          )
        );
        
        // Add completion log
        const completeLog: StatusLog = {
          id: `log-complete-${Date.now()}`,
          timestamp: new Date(),
          agentId: agentId,
          agentType: agentType,
          message: `${agentName} completed command: ${command}`,
          severity: 'info'
        };
        
        setStatusLogs(prev => [completeLog, ...prev]);
        
        // Handle special commands
        if (command === 'Return to Base') {
          if (agentId.startsWith('drone')) {
            setDrones(prev => 
              prev.map(drone => 
                drone.id === agentId 
                  ? { ...drone, status: 'Maintenance' } 
                  : drone
              )
            );
          } else {
            setGroundBots(prev => 
              prev.map(bot => 
                bot.id === agentId 
                  ? { ...bot, status: 'Maintenance' } 
                  : bot
              )
            );
          }
        }
      }, 5000);
    }, 2000);
    
    toast({
      title: "Command Sent",
      description: `${command} command sent to ${agentName || agentId}`,
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
    
    // Add acknowledgement to status logs
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      const newLog: StatusLog = {
        id: `log-alert-ack-${Date.now()}`,
        timestamp: new Date(),
        agentId: alert.droneId,
        agentType: alert.droneId.startsWith('drone') ? 'drone' : 'groundBot',
        message: `Alert acknowledged: ${alert.type} - ${alert.message}`,
        severity: 'info'
      };
      
      setStatusLogs(prev => [newLog, ...prev]);
    }
  };

  // Function to acknowledge a human report
  const acknowledgeHumanReport = (reportId: string) => {
    setHumanReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, status: report.status === 'new' ? 'acknowledged' : 
                          report.status === 'acknowledged' ? 'inProgress' : 
                          report.status === 'inProgress' ? 'resolved' : report.status } 
          : report
      )
    );
  };

  return (
    <DroneContext.Provider value={{
      drones,
      groundBots,
      commandLogs,
      alerts,
      weatherData,
      gisFeatures,
      statusLogs,
      humanReports,
      selectedDroneId,
      setSelectedDroneId,
      sendCommand,
      acknowledgeAlert,
      acknowledgeHumanReport,
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
