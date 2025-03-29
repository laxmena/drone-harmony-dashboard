
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDroneContext } from '@/context/DroneContext';
import { Cloud, Thermometer, Droplets, Wind, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface WeatherDisplayProps {
  className?: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ className }) => {
  const { weatherData } = useDroneContext();
  
  if (!weatherData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <p className="text-muted-foreground">Weather data not available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center justify-between bg-card/60 rounded-lg p-3">
            <div className="flex flex-col">
              <span className="text-xl font-bold">{weatherData.temperature.toFixed(1)}°C</span>
              <span className="text-sm text-muted-foreground">{weatherData.forecast}</span>
            </div>
            <div className="text-4xl">
              {weatherData.forecast.includes('Rain') ? '🌧️' : 
               weatherData.forecast.includes('Cloud') ? '☁️' : 
               weatherData.forecast.includes('Sun') ? '☀️' : 
               weatherData.forecast.includes('Snow') ? '❄️' : '🌤️'}
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-card/60 rounded-lg p-3">
            <Droplets className="h-5 w-5 text-blue-400" />
            <div>
              <div className="text-sm font-medium">Humidity</div>
              <div className="text-lg">{weatherData.humidity}%</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-card/60 rounded-lg p-3">
            <Wind className="h-5 w-5 text-blue-300" />
            <div>
              <div className="text-sm font-medium">Wind</div>
              <div className="text-lg">
                {weatherData.windSpeed} km/h {weatherData.windDirection}
              </div>
            </div>
          </div>
          
          <div className="col-span-2 flex items-center gap-2 bg-card/60 rounded-lg p-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Updated: {format(weatherData.lastUpdated, 'HH:mm:ss, MMM do')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherDisplay;
