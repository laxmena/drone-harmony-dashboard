
import React from 'react';
import { DroneProvider } from '@/context/DroneContext';
import DroneMap from '@/components/DroneMap';
import DroneStatus from '@/components/DroneStatus';
import DroneMetrics from '@/components/DroneMetrics';
import DroneCommands from '@/components/DroneCommands';
import AlertPanel from '@/components/AlertPanel';

const Index = () => {
  return (
    <DroneProvider>
      <div className="min-h-screen p-4 md:p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Drone Harmony Dashboard</h1>
          <p className="text-muted-foreground">Multi-Agent Drone Disaster Recovery System</p>
        </header>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Map Section - Full width on mobile, 8 cols on desktop */}
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Map */}
              <div className="col-span-12 h-[350px] lg:h-[500px]">
                <DroneMap className="h-full w-full" />
              </div>
              
              {/* Metrics */}
              <div className="col-span-12">
                <DroneMetrics />
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Full width on mobile, 4 cols on desktop */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Drone Status Cards */}
            <div>
              <h2 className="text-xl font-bold mb-3">Drone Fleet Status</h2>
              <DroneStatus />
            </div>
            
            {/* Command Section */}
            <DroneCommands />
            
            {/* Alert Panel */}
            <AlertPanel />
          </div>
        </div>
      </div>
    </DroneProvider>
  );
};

export default Index;
