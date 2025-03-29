
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDroneContext } from '@/context/DroneContext';
import { SendHorizonal, AlertTriangle, Map, Compass, ArrowLeft } from 'lucide-react';

interface ManualControlsProps {
  className?: string;
}

const ManualControls: React.FC<ManualControlsProps> = ({ className }) => {
  const { drones, groundBots, sendCommand } = useDroneContext();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [command, setCommand] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{lat: string, lng: string}>({lat: '', lng: ''});
  const [feedback, setFeedback] = useState<string>('');
  
  const allAgents = [
    ...(drones || []).map(d => ({ id: d.id, name: d.name, type: 'drone' })),
    ...(groundBots || []).map(b => ({ id: b.id, name: b.name, type: 'groundBot' }))
  ];

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId || !command) return;

    let parameters = '';
    if (command === 'Move to Location' && coordinates.lat && coordinates.lng) {
      parameters = `${coordinates.lat},${coordinates.lng}`;
    }

    sendCommand(selectedAgentId, command as any, parameters);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId || !feedback) return;

    // In a real app, this would send feedback to the agent or system
    console.log(`Feedback sent to ${selectedAgentId}: ${feedback}`);
    setFeedback('');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5" />
          Manual Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="commands">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="commands">Commands</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          
          <TabsContent value="commands">
            <form onSubmit={handleCommandSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Agent</label>
                <Select 
                  value={selectedAgentId} 
                  onValueChange={setSelectedAgentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Command</label>
                <Select 
                  value={command} 
                  onValueChange={setCommand}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a command" />
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
              
              <Button type="submit" className="w-full">
                <SendHorizonal className="mr-2 h-4 w-4" />
                Send Command
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="location">
            <form onSubmit={handleCommandSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Agent</label>
                <Select 
                  value={selectedAgentId} 
                  onValueChange={setSelectedAgentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={coordinates.lat}
                    onChange={(e) => setCoordinates({...coordinates, lat: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={coordinates.lng}
                    onChange={(e) => setCoordinates({...coordinates, lng: e.target.value})}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" onClick={() => setCommand('Move to Location')}>
                <Map className="mr-2 h-4 w-4" />
                Send to Location
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="feedback">
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Agent</label>
                <Select 
                  value={selectedAgentId} 
                  onValueChange={setSelectedAgentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Feedback</label>
                <Input
                  placeholder="Enter your feedback or instructions"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full">
                <SendHorizonal className="mr-2 h-4 w-4" />
                Send Feedback
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Manual commands override autonomous behavior. Use with caution in emergency situations.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ManualControls;
