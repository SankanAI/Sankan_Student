"use client";
import React, { useState, useEffect, Suspense } from 'react';
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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from "js-cookie";
import { useCryptoUtils } from "@/app/Custom_Hooks/cryptoUtils";

// Updated Type Definitions
interface FirewallRule {
  source: string;
  destination: string;
  port: string;
  action: 'allow' | 'deny' | '';
  protocol: 'tcp' | 'udp' | 'icmp' | '';
}

interface ZoneConfig {
  zone_name: string;
  security_level: string;
  interfaces: string[];
  allowed_services: string[];
}

type ExerciseTemplate = Partial<FirewallRule> | Partial<ZoneConfig>;

interface Exercise {
  type: 'rule-creation' | 'zone-config' | 'policy-config';
  title: string;
  description: string;
  template?: ExerciseTemplate;
  solution?: ExerciseTemplate;
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
  onComplete: (result: FirewallRule) => void;
}

type Firewall = {
  id: string;
  field_agent_id: string | null;
  student_id: string;
  current_module: string | null;
  total_modules: number;
  started_at: string;
  last_activity: string;
  completed: boolean;
  completed_at: string | null;
};

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
  const [rule, setRule] = useState<FirewallRule>({
    source: (exercise.template as FirewallRule)?.source || '',
    destination: (exercise.template as FirewallRule)?.destination || '',
    port: (exercise.template as FirewallRule)?.port || '',
    action: (exercise.template as FirewallRule)?.action || '',
    protocol: (exercise.template as FirewallRule)?.protocol || ''
  });

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
            onValueChange={(value: 'tcp' | 'udp' | 'icmp') => setRule({...rule, protocol: value})}
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
          onValueChange={(value: 'allow' | 'deny') => setRule({...rule, action: value})}
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
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');
  const {decryptData} =useCryptoUtils();
  const [progressRecord, setProgressRecord] = useState<Firewall | null>(null);
  const [IsFirewallCompleted, setIsFirewallCompleted] = useState<boolean>(false);

  const handleModuleSelect = (module: Module) => {
    setCurrentModule(module);
    setShowDialog(true);
  };

  const handleExerciseComplete = () => {
    if (currentModule) {
      setProgress({
        ...progress,
        [currentModule.id]: true
      });
    }
    updateProgress();
  };

  const initializeProgressRecord = async (studentId: string) => {
    try {
      const { data: computerBasicsData, error: computerBasicsError } = await supabase
        .from('computer_basics')
        .select('id')
        .eq('student_id', studentId)
        .single();

      if (computerBasicsError || !computerBasicsData) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Mouse_Movement?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      const { data: internet_safetyData, error: internet_safetyError } = await supabase
        .from('internet_safety')
        .select('id')
        .eq('computer_basics_id', computerBasicsData?.id)
        .eq('student_id', studentId)
        .single();

      if (internet_safetyError || !internet_safetyData) {
        router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent/passwords?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      const { data: questData, error:questError } = await supabase
        .from('field_agent')
        .select('id')
        .eq('internet_safety_id', internet_safetyData?.id)
        .eq('student_id', studentId)
        .single();

      if (questError || !questData) {
        router.push(`/Module_1/Computer_Basics/Internet_Safety/Field_Samurai/Antivirus?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      const { data: existingRecord } = await supabase
        .from('firewall')
        .select('*')
        .eq('field_agent_id', questData?.id)
        .eq('student_id', studentId)
        .single();

      if (existingRecord) {
        setProgressRecord(existingRecord);
      } else {
        const { data: newRecord, error: insertError } = await supabase
          .from('firewall')
          .insert([{
            field_agent_id: questData?.id,
            student_id: studentId,
            current_module: currentModule?.id,
            total_modules: 3,
            completed: false,
            started_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        if (newRecord) {
          setProgressRecord(newRecord);
        }
      }
    } catch (error) {
      console.log('Error in initializeProgressRecord:', error);
    }
  };

  const updateProgress = async () => {
    if (!progressRecord || !userId) return;

    try {
      const { error } = await supabase
        .from('firewall')
        .update({
          current_module: currentModule?.id,
          completed: true,
          last_activity: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', progressRecord.id);

      if (error) throw error;

      setIsFirewallCompleted(true);
    } catch (error) {
      console.log('Error updating progress:', error);
    }
  };

  useEffect(() => {
    const checkCompletion = async (decryptedId: string) => {
      try {
        const { data: firewallData, error } = await supabase
          .from('firewall')
          .select('completed')
          .eq('student_id', decryptedId)
          .single();

        if (error) throw error;
        
        if (firewallData?.completed) {
          setIsFirewallCompleted(true);
          router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        }
      } catch (error) {
        console.log('Error checking completion status:', error);
      }
    };

    if(Cookies.get('userId')) {
      const decryptedId = decryptData(Cookies.get('userId')!);
      console.log("Decrypted userId:", decryptedId);
      setUserId(decryptedId);
      checkCompletion(decryptedId);
      if (!IsFirewallCompleted) {
        initializeProgressRecord(decryptedId);
      }
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)
    }
  },[userId])

  {/* Previous imports and type definitions remain the same */}

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
            exercise.type === 'rule-creation' ? (
              <RuleCreationExercise
                key={index}
                exercise={exercise}
                onComplete={handleExerciseComplete}
              />
            ) : null
          ))}
        </div>
      )}
    </div>
  );
};


const FirewallTrainingApp = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <FirewallTraining />
    </Suspense>
  );
};


export default FirewallTrainingApp;