"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Network, Lock, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Types
interface Exercise {
  type: string;
  title: string;
  description: string;
  template?: Record<string, any>;
  solution?: Record<string, any>;
}

interface Module {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  exercises: Exercise[];
}

interface ModuleDialogProps {
  module: Module;
  open: boolean;
  onClose: () => void;
}

interface RuleCreationExerciseProps {
  exercise: Exercise;
  onComplete: (result: Record<string, any>) => void;
}

const modules: Module[] = [
  {
    id: 'access-control',
    title: 'Access Control Rules',
    icon: Shield,
    description: 'Configure basic firewall rules and policies',
    exercises: [
      {
        type: 'rule-creation',
        title: 'Create Access Rule',
        description: 'Create a rule to allow HTTP traffic (port 80) from specific IP',
        template: {
          source: '',
          destination: '',
          port: '',
          action: '',
          protocol: ''
        },
        solution: {
          source: '192.168.1.0/24',
          destination: 'any',
          port: '80',
          action: 'allow',
          protocol: 'tcp'
        }
      }
    ]
  },
  {
    id: 'network-zones',
    title: 'Network Zones',
    icon: Network,
    description: 'Configure DMZ and network segmentation',
    exercises: [
      {
        type: 'zone-config',
        title: 'DMZ Configuration',
        description: 'Set up DMZ for web server',
        template: {
          zone_name: '',
          security_level: '',
          interfaces: [],
          allowed_services: []
        }
      }
    ]
  },
  {
    id: 'security-policies',
    title: 'Security Policies',
    icon: Lock,
    description: 'Define default policies and traffic filtering',
    exercises: [
      {
        type: 'policy-config',
        title: 'Default Policy',
        description: 'Configure default deny policy with specific allows'
      }
    ]
  }
];

const ModuleDialog: React.FC<ModuleDialogProps> = ({ module, open, onClose }) => (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{module.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <DialogDescription>
            {module.description}
          </DialogDescription>
          <Alert>
            <AlertDescription>
              This module will teach you how to configure {module.title.toLowerCase()} 
              in a firewall. Complete the exercises to learn practical implementation.
            </AlertDescription>
          </Alert>
        </div>
        <Button onClick={onClose}>Start Module</Button>
      </DialogContent>
    </Dialog>
  );

const RuleCreationExercise: React.FC<RuleCreationExerciseProps> = ({ exercise, onComplete }) => {
  const [rule, setRule] = useState(exercise.template || {});

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-bold">{exercise.title}</h3>
      <p className="text-gray-600">{exercise.description}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Source IP</Label>
          <Input 
            placeholder="e.g. 192.168.1.0/24" 
            value={rule.source}
            onChange={(e) => setRule({...rule, source: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label>Destination</Label>
          <Input 
            placeholder="e.g. any" 
            value={rule.destination}
            onChange={(e) => setRule({...rule, destination: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label>Port</Label>
          <Input 
            placeholder="e.g. 80" 
            value={rule.port}
            onChange={(e) => setRule({...rule, port: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label>Protocol</Label>
          <Select 
            value={rule.protocol}
            onValueChange={(value) => setRule({...rule, protocol: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select protocol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tcp">TCP</SelectItem>
              <SelectItem value="udp">UDP</SelectItem>
              <SelectItem value="icmp">ICMP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Label>Action:</Label>
        <Select 
          value={rule.action}
          onValueChange={(value) => setRule({...rule, action: value})}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="allow">Allow</SelectItem>
            <SelectItem value="deny">Deny</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        className="w-full"
        onClick={() => onComplete(rule)}
      >
        Apply Rule
      </Button>
    </Card>
  );
};

const FirewallTraining: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  const handleModuleSelect = (module: Module) => {
    setCurrentModule(module);
    setShowDialog(true);
  };

  const handleExerciseComplete = (result: Record<string, any>) => {
    if (currentModule) {
      setProgress({
        ...progress,
        [currentModule.id]: true
      });
      // Add validation and feedback logic here
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-blue-500" />
              <CardTitle>Firewall Configuration Training</CardTitle>
            </div>
            <Progress 
              value={Object.keys(progress).length / modules.length * 100} 
              className="w-32"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card 
                  key={module.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    progress[module.id] ? 'border-green-500' : ''
                  }`}
                  onClick={() => handleModuleSelect(module)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 text-blue-500" />
                    <h3 className="font-bold">{module.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{module.description}</p>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {currentModule && (
        <ModuleDialog 
          module={currentModule}
          open={showDialog}
          onClose={() => setShowDialog(false)}
        />
      )}

      {currentModule && !showDialog && (
        <div className="space-y-4">
          {currentModule.exercises.map((exercise, index) => (
            <RuleCreationExercise
              key={index}
              exercise={exercise}
              onComplete={handleExerciseComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FirewallTraining;