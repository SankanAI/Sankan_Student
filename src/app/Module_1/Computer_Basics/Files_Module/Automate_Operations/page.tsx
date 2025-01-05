"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Folder, CheckCircle, XCircle } from 'lucide-react';
import { FaReact } from "react-icons/fa";
import { SiFlask } from "react-icons/si";
import { PiAndroidLogoDuotone } from "react-icons/pi";
import { PiBrainDuotone } from "react-icons/pi";
import { RiNodejsLine } from "react-icons/ri";
import { IoLogoVue } from "react-icons/io5";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";


interface ProjectTemplate {
  name: string;
  description: string;
  color: string;
  icon:React.ReactNode;
  structure: ProjectStructure[];
}

interface ProjectStructure {
  name: string;
  type: 'folder' | 'file' | 'zip';
  required: boolean;
  children?: ProjectStructure[];
}

interface FolderItem {
  path: string;
  type: 'folder' | 'file' | 'zip';
}

const projectTemplates: Record<string, ProjectTemplate> = {
  'React': {
    name: 'React Project',
    description: 'Modern web application structure using React',
    color: 'bg-blue-500',
    icon: <FaReact className="h-6 w-6 text-white"/>,
    structure: [
      {
        name: 'src',
        type: 'folder',
        required: true,
        children: [
          { name: 'components', type: 'folder', required: true },
          { name: 'pages', type: 'folder', required: true },
          { name: 'styles', type: 'folder', required: true },
          { name: 'App.js', type: 'file', required: true },
          { name: 'index.js', type: 'file', required: true }
        ]
      },
      { name: 'public', type: 'folder', required: true },
      { name: 'package.json', type: 'file', required: true },
      { name: 'README.md', type: 'file', required: true }
    ]
  },
  'Flask': {
    name: 'Flask Project',
    description: 'Python web application using Flask framework',
    color: 'bg-green-500',
    icon: <SiFlask className="h-6 w-6 text-white"/>,
    structure: [
      {
        name: 'app',
        type: 'folder',
        required: true,
        children: [
          { name: 'templates', type: 'folder', required: true },
          { name: 'static', type: 'folder', required: true },
          { name: '__init__.py', type: 'file', required: true },
          { name: 'routes.py', type: 'file', required: true }
        ]
      },
      { name: 'config.py', type: 'file', required: true },
      { name: 'requirements.txt', type: 'file', required: true },
      { name: 'run.py', type: 'file', required: true }
    ]
  },
  'Android': {
    name: 'Android Project',
    description: 'Mobile application structure for Android',
    color: 'bg-green-600',
    icon: <PiAndroidLogoDuotone className="h-6 w-6 text-white"/>,
    structure: [
      {
        name: 'app',
        type: 'folder',
        required: true,
        children: [
          { name: 'src', type: 'folder', required: true },
          { name: 'res', type: 'folder', required: true },
          { name: 'AndroidManifest.xml', type: 'file', required: true }
        ]
      },
      { name: 'gradle', type: 'folder', required: true },
      { name: 'build.gradle', type: 'file', required: true }
    ]
  },
  'AI': {
    name: 'AI Project',
    description: 'Machine learning project structure',
    color: 'bg-purple-500',
    icon: <PiBrainDuotone className="h-6 w-6 text-white"/>,
    structure: [
      {
        name: 'data',
        type: 'folder',
        required: true,
        children: [
          { name: 'raw', type: 'folder', required: true },
          { name: 'processed', type: 'folder', required: true }
        ]
      },
      {
        name: 'models',
        type: 'folder',
        required: true,
        children: [
          { name: 'training.py', type: 'file', required: true },
          { name: 'evaluation.py', type: 'file', required: true }
        ]
      },
      { name: 'requirements.txt', type: 'file', required: true },
      { name: 'README.md', type: 'file', required: true }
    ]
  },
  'Node': {
    name: 'Node.js Project',
    description: 'Backend application using Node.js',
    color: 'bg-yellow-500',
    icon: <RiNodejsLine className="h-6 w-6 text-white"/>,
    structure: [
      {
        name: 'src',
        type: 'folder',
        required: true,
        children: [
          { name: 'routes', type: 'folder', required: true },
          { name: 'controllers', type: 'folder', required: true },
          { name: 'models', type: 'folder', required: true },
          { name: 'middleware', type: 'folder', required: true }
        ]
      },
      { name: 'config', type: 'folder', required: true },
      { name: 'package.json', type: 'file', required: true },
      { name: '.env', type: 'file', required: true }
    ]
  },
  'Vue': {
    name: 'Vue.js Project',
    description: 'Frontend application using Vue.js',
    color: 'bg-emerald-500',
    icon: <IoLogoVue className="h-6 w-6 text-white"/>,
    structure: [
      {
        name: 'src',
        type: 'folder',
        required: true,
        children: [
          { name: 'components', type: 'folder', required: true },
          { name: 'views', type: 'folder', required: true },
          { name: 'store', type: 'folder', required: true },
          { name: 'App.vue', type: 'file', required: true },
          { name: 'main.js', type: 'file', required: true }
        ]
      },
      { name: 'public', type: 'folder', required: true },
      { name: 'package.json', type: 'file', required: true },
      { name: 'vue.config.js', type: 'file', required: true }
    ]
  }
};
  

const ProjectStructureDisplay = ({ structure, level = 0 }: { structure: ProjectStructure[], level?: number }) => {
  return (
    <div className={`ml-${level * 4}`}>
      {structure.map((item, index) => (
        <div key={index} className="flex items-center gap-2 my-1">
          {item.type === 'folder' ? (
            <Folder className="h-4 w-4 text-blue-500" />
          ) : (
            <Terminal className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm">{item.name}</span>
          <span className="text-xs text-gray-500">
            {item.type === 'folder' ? 'mkdir -p' : 'touch'} {item.name}
          </span>
          {item.children && (
            <div className="ml-4">
              <ProjectStructureDisplay structure={item.children} level={level + 1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ProjectLearningInterface = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [items, setItems] = useState<FolderItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<string[]>([]);
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const executeCommand = (command: string) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);
    let output = '';

    const getCurrentFullPath = () => '/' + currentPath.join('/');

    switch (cmd) {
      case 'mkdir':
        if (args[0]) {
          const newPath = getCurrentFullPath() + '/' + args[0];
          setItems([...items, { path: newPath, type: 'folder' }]);
          output = `Created directory: ${args[0]}`;
        } else {
          output = 'mkdir: missing operand';
        }
        break;

      case 'touch':
        if (args[0]) {
          const newPath = getCurrentFullPath() + '/' + args[0];
          setItems([...items, { path: newPath, type: 'file' }]);
          output = `Created file: ${args[0]}`;
        } else {
          output = 'touch: missing operand';
        }
        break;

      case 'cd':
        if (args[0] === '..') {
          if (currentPath.length > 0) {
            setCurrentPath(prev => prev.slice(0, -1));
            output = `Changed directory to: ${currentPath.slice(0, -1).join('/') || '/'}`;
          }
        } else if (args[0]) {
          setCurrentPath(prev => [...prev, args[0]]);
          output = `Changed directory to: ${[...currentPath, args[0]].join('/')}`;
        }
        break;

      case 'ls':
        const currentFullPath = getCurrentFullPath();
        const dirItems = items.filter(item => {
          const itemDir = item.path.substring(0, item.path.lastIndexOf('/'));
          return itemDir === currentFullPath;
        });
        output = dirItems.map(item => item.path.split('/').pop()).join('  ');
        break;

      case 'pwd':
        output = getCurrentFullPath();
        break;

      case 'clear':
        setCommandHistory([]);
        return;

      case 'validate':
        validateStructure();
        return;

      default:
        output = `Command not found: ${cmd}`;
    }

    setCommandHistory(prev => [...prev, `$ ${command}`, output]);
  };

  const validateStructure = () => {
    if (!selectedProject) return;
    
    const errors: string[] = [];
    const template = projectTemplates[selectedProject].structure;
    
    const validateRecursive = (structure: ProjectStructure[], basePath: string = '') => {
      structure.forEach(required => {
        const path = basePath + '/' + required.name;
        if (required.required) {
          const exists = items.some(item => 
            item.path === path && item.type === required.type
          );
          if (!exists) {
            errors.push(`Missing ${required.type}: ${path}`);
          }
        }
        if (required.children) {
          validateRecursive(required.children, path);
        }
      });
    };

    validateRecursive(template);
    setValidationResults(errors);
    setShowValidationDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      executeCommand(inputValue);
      setInputValue('');
    }
  };

  if (mode === 'select') {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 tracking-tighter">Select a Project Structure to Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(projectTemplates).map(([key, project]) => (
            <Card 
              key={key}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedProject(key);
                setMode('create');
              }}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${project.color} mb-4 flex items-center justify-center`}>
                  {project.icon}
                </div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectStructureDisplay structure={project.structure} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Required Structure</CardTitle>
            <CardDescription>Create your folder structure using terminal commands</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProject && (
              <ProjectStructureDisplay structure={projectTemplates[selectedProject].structure} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terminal</CardTitle>
            <CardDescription>Use commands to create your structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm">
              <div className="text-green-400 mb-4">
                Available commands:
                <br />• mkdir [directory] - Create a new directory
                <br />• touch [file] - Create a new file
                <br />• cd [directory] - Change directory
                <br />• cd .. - Go up one directory
                <br />• ls - List contents
                <br />• pwd - Print working directory
                <br />• clear - Clear terminal
                <br />• validate - Check your structure
              </div>
              
              <div ref={terminalRef}>
                {commandHistory.map((line, i) => (
                  <div 
                    key={i} 
                    className={line.startsWith('$') ? 'text-white' : 'text-green-400'}
                  >
                    {line}
                  </div>
                ))}
                
                <form onSubmit={handleSubmit} className="flex items-center mt-2">
                  <span className="text-white mr-2">$</span>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 bg-transparent text-white outline-none border-none"
                    autoFocus
                  />
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Structure Validation Results</DialogTitle>
          </DialogHeader>
          {validationResults.length === 0 ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Perfect Match!</AlertTitle>
              <AlertDescription>
                Congratulations! Your project structure matches all requirements.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertTitle>Structure Incomplete</AlertTitle>
              <AlertDescription>
                <p className="mb-2">The following items are missing:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {validationResults.map((error, index) => (
                    <li key={index} className="text-red-600">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button onClick={() => setShowValidationDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectLearningInterface;