
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useDroneContext } from '@/context/DroneContext';
import { format } from 'date-fns';

interface DroneMetricsProps {
  className?: string;
}

const DroneMetrics: React.FC<DroneMetricsProps> = ({ className }) => {
  const { drones, selectedDroneId, batteryHistory, sensorHistory } = useDroneContext();
  
  // Prepare battery history data for all drones
  const allBatteryData = [];
  
  // Get last 10 points for each drone
  Object.entries(batteryHistory).forEach(([droneId, history]) => {
    const drone = drones.find(d => d.id === droneId);
    if (!drone) return;
    
    const lastPoints = history.slice(-10);
    
    lastPoints.forEach((point, index) => {
      const existingPoint = allBatteryData[index] || { time: format(point.timestamp, 'HH:mm:ss') };
      existingPoint[drone.name] = point.value;
      if (!allBatteryData[index]) {
        allBatteryData[index] = existingPoint;
      }
    });
  });
  
  // Prepare sensor data for selected drone
  const selectedDroneSensorData = [];
  
  if (selectedDroneId && sensorHistory[selectedDroneId]) {
    const lastPoints = sensorHistory[selectedDroneId].slice(-10);
    
    lastPoints.forEach(point => {
      selectedDroneSensorData.push({
        time: format(point.timestamp, 'HH:mm:ss'),
        temperature: point.temperature,
        gasLevel: point.gasLevel / 10 // Scale down for better visualization
      });
    });
  }

  return (
    <div className={`flex flex-col gap-5 ${className || ''}`}>
      {/* Battery Levels Chart */}
      <Card className="col-span-12 lg:col-span-6">
        <CardHeader>
          <CardTitle>Battery Levels</CardTitle>
          <CardDescription>Battery percentage for all drones</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={allBatteryData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="time"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: 'none', borderRadius: '8px' }}
              />
              <Legend />
              {drones.map((drone, index) => (
                <Line
                  key={drone.id}
                  type="monotone"
                  dataKey={drone.name}
                  stroke={
                    drone.status === 'Operational' ? '#0EA5E9' :
                    drone.status === 'Low Battery' ? '#F97316' :
                    drone.status === 'Critical' ? '#ea384c' : '#8E9196'
                  }
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Sensor Data Chart (only for selected drone) */}
      <Card className="col-span-12 lg:col-span-6">
        <CardHeader>
          <CardTitle>Sensor Readings</CardTitle>
          <CardDescription>
            {selectedDroneId 
              ? `Temperature and gas levels for ${drones.find(d => d.id === selectedDroneId)?.name}`
              : 'Select a drone to view sensor data'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {selectedDroneId ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={selectedDroneSensorData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="time"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  orientation="left"
                  yAxisId="left"
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  orientation="right"
                  yAxisId="right"
                  unit=" ppm"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'gasLevel') return [`${(value * 10).toFixed(1)} ppm`, 'Gas Level'];
                    if (name === 'temperature') return [`${value.toFixed(1)}°C`, 'Temperature'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  yAxisId="left"
                  unit="°C"
                />
                <Line
                  type="monotone"
                  dataKey="gasLevel"
                  name="Gas Level"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a drone to view sensor data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DroneMetrics;
