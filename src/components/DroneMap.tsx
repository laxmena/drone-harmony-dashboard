
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDroneContext } from '@/context/DroneContext';
import { Drone } from '@/types/drone';

// NOTE: In a real application, this would be stored in an environment variable
// For this demo we'll use a placeholder - you need to provide your Mapbox token
const MAPBOX_TOKEN = 'REPLACE_WITH_YOUR_MAPBOX_TOKEN';

interface DroneMapProps {
  className?: string;
}

const DroneMap: React.FC<DroneMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { drones, selectedDroneId, setSelectedDroneId } = useDroneContext();
  const [mapboxToken, setMapboxToken] = useState<string>(MAPBOX_TOKEN);
  
  // Initialize map on first render
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Check if we need to prompt for a token
    if (mapboxToken === 'REPLACE_WITH_YOUR_MAPBOX_TOKEN') {
      const token = prompt('Please enter your Mapbox token:');
      if (token) {
        setMapboxToken(token);
      }
    }
    
    if (mapboxToken === 'REPLACE_WITH_YOUR_MAPBOX_TOKEN') return;
    
    mapboxgl.accessToken = mapboxToken;
    
    // Create the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [drones[0]?.longitude || -0.09, drones[0]?.latitude || 51.505],
      zoom: 13,
      pitch: 45,
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    return () => {
      // Clean up map instance on unmount
      if (map.current) {
        Object.values(markers.current).forEach(marker => marker.remove());
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, drones]);

  // Update drone markers whenever drone data changes
  useEffect(() => {
    if (!map.current) return;
    
    drones.forEach(drone => {
      // Get the status color
      const getStatusColor = (status: string): string => {
        switch (status) {
          case 'Operational': return '#0EA5E9'; // Blue
          case 'Low Battery': return '#F97316'; // Orange
          case 'Critical': return '#ea384c'; // Red
          case 'Maintenance': 
          case 'Offline': 
          default: return '#8E9196'; // Gray
        }
      };
      
      // Create HTML for the marker
      const createMarkerElement = (drone: Drone) => {
        const element = document.createElement('div');
        element.className = 'relative';
        
        // Create drone icon
        const droneIcon = document.createElement('div');
        droneIcon.className = `w-5 h-5 rounded-full flex items-center justify-center ${
          selectedDroneId === drone.id ? 'ring-2 ring-white' : ''
        }`;
        droneIcon.style.backgroundColor = getStatusColor(drone.status);
        
        // Create pulse effect for critical drones
        if (drone.status === 'Critical') {
          droneIcon.className += ' animate-pulse-alert';
        }
        
        element.appendChild(droneIcon);
        
        return element;
      };
      
      // Create or update marker
      if (!markers.current[drone.id]) {
        // Create new marker
        const element = createMarkerElement(drone);
        
        const marker = new mapboxgl.Marker({
          element,
          anchor: 'center'
        })
          .setLngLat([drone.longitude, drone.latitude])
          .addTo(map.current);
        
        // Create popup
        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: '300px',
          className: 'drone-tooltip'
        }).setHTML(`
          <div class="drone-tooltip">
            <div class="drone-tooltip-title">${drone.name}</div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Status:</span>
              <span class="drone-tooltip-value" style="color: ${getStatusColor(drone.status)}">${drone.status}</span>
            </div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Battery:</span>
              <span class="drone-tooltip-value">${drone.batteryLevel.toFixed(1)}%</span>
            </div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Temperature:</span>
              <span class="drone-tooltip-value">${drone.sensors.temperature.toFixed(1)}°C</span>
            </div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Gas Level:</span>
              <span class="drone-tooltip-value">${drone.sensors.gasLevel.toFixed(0)} ppm</span>
            </div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Coordinates:</span>
              <span class="drone-tooltip-value">${drone.latitude.toFixed(5)}, ${drone.longitude.toFixed(5)}</span>
            </div>
          </div>
        `);
        
        marker.setPopup(popup);
        
        // Add click listener
        marker.getElement().addEventListener('click', () => {
          setSelectedDroneId(drone.id);
        });
        
        markers.current[drone.id] = marker;
      } else {
        // Update existing marker
        markers.current[drone.id].setLngLat([drone.longitude, drone.latitude]);
        
        // Update the marker element
        const element = createMarkerElement(drone);
        markers.current[drone.id].getElement().replaceWith(element);
        markers.current[drone.id].getElement().addEventListener('click', () => {
          setSelectedDroneId(drone.id);
        });
        
        // Update popup content
        const popup = markers.current[drone.id].getPopup();
        popup.setHTML(`
          <div class="drone-tooltip">
            <div class="drone-tooltip-title">${drone.name}</div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Status:</span>
              <span class="drone-tooltip-value" style="color: ${getStatusColor(drone.status)}">${drone.status}</span>
            </div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Battery:</span>
              <span class="drone-tooltip-value">${drone.batteryLevel.toFixed(1)}%</span>
            </div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Temperature:</span>
              <span class="drone-tooltip-value">${drone.sensors.temperature.toFixed(1)}°C</span>
            </div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Gas Level:</span>
              <span class="drone-tooltip-value">${drone.sensors.gasLevel.toFixed(0)} ppm</span>
            </div>
            <div class="drone-tooltip-row">
              <span class="drone-tooltip-label">Coordinates:</span>
              <span class="drone-tooltip-value">${drone.latitude.toFixed(5)}, ${drone.longitude.toFixed(5)}</span>
            </div>
          </div>
        `);
      }
    });
    
    // Center map on selected drone
    if (selectedDroneId) {
      const selectedDrone = drones.find(d => d.id === selectedDroneId);
      if (selectedDrone && map.current) {
        map.current.flyTo({
          center: [selectedDrone.longitude, selectedDrone.latitude],
          zoom: 15,
          duration: 1000
        });
      }
    }
    
  }, [drones, selectedDroneId, setSelectedDroneId]);

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${className || ''}`}>
      <div ref={mapContainer} className="absolute inset-0" />
      {mapboxToken === 'REPLACE_WITH_YOUR_MAPBOX_TOKEN' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card p-4 text-center">
          <p className="text-lg font-medium mb-4">Please enter your Mapbox token to enable the map</p>
          <input 
            type="text" 
            className="w-full max-w-md px-3 py-2 border border-input rounded-md mb-2"
            placeholder="Enter your Mapbox token"
            value={mapboxToken} 
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => {
              if (mapboxToken && mapboxToken !== 'REPLACE_WITH_YOUR_MAPBOX_TOKEN') {
                // Force re-render
                setMapboxToken(prev => prev);
              }
            }}
          >
            Set Token
          </button>
          <p className="text-sm text-muted-foreground mt-2">
            Get a token from <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Mapbox</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default DroneMap;
