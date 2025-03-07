"use client";
import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Terminal, Folder, CheckCircle, XCircle,  ArrowRight } from 'lucide-react';
import { FaReact } from "react-icons/fa";
import { SiFlask } from "react-icons/si";
import { PiAndroidLogoDuotone } from "react-icons/pi";
import { PiBrainDuotone } from "react-icons/pi";
import { RiNodejsLine } from "react-icons/ri";
import { IoLogoVue } from "react-icons/io5";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
import { secureStorage } from '@/lib/storage';
import ChatForm from '@/app/AI_Guide/Teacher_Guide';
import { RightSidebar } from '@/components/ui/sidebar';

type FormatableValue = string | number | boolean | null | undefined | object | Array<FormatableValue>;

type FileManagement = {
  id: string;  // UUID
  file_safety_quest_id: string | null;  // UUID, nullable foreign key
  student_id: string | null;  // UUID, nullable foreign key
  
  // Project completion flags
  react_completion: boolean;
  flask_completion: boolean;
  android_completion: boolean;
  ai_completion: boolean;
  node_completion: boolean;
  vue_completion: boolean;
  
  // Overall completion status
  completed: boolean;
  
  // Timestamps
  started_at: string;  // ISO timestamp
  completed_at: string | null;  // ISO timestamp, nullable
  last_activity: string;  // ISO timestamp
};


interface DataSave {
    items: FolderItem[];
    currentPath: string[];
    commandHistory: string[];
};

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
  id?:string;
  name?:string;
  parentId?:string;
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
            {item.type === 'folder' ? 'mkdir' : 'touch'} {item.name}
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
  const [userId, setUserId] = useState<string | null>(null);
  const [ProjectObject, setProjectObject]=useState<Record<string, boolean>>({});
  const [progressRecord, setProgressRecord] = useState<FileManagement | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [contextPrefix, setcontextPrefix]=useState<string>('');

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      console.log(isCompleted);
    }
  }, []);


  const initialize_Completion=()=>{
    const keys=Object.keys(projectTemplates);
    for(let i=0;i<keys.length;i++){
      const storageKey = `${userId}-CompletedAutomation-${keys[i]}`;
      const savedData = secureStorage.getItem<boolean>(storageKey);
      if(savedData){  setProjectObject(prev => ({ ...prev, [keys[i]]: savedData    }))  }
      else{  setProjectObject(prev => ({  ...prev,  [keys[i]]: false })) }
    }
  }

  const formatObject=(obj: FormatableValue): string=> {
    if (obj === null || obj === undefined) return String(obj);
  
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return `[${obj.map(item => formatObject(item)).join(', ')}]`;
      } else {
        const entries = Object.entries(obj).map(
          ([key, value]) => `${key}:${formatObject(value)}`
        );
        return `{${entries.join(', ')}}`;
      }
    }
    
    return String(obj);
  }
  
  useEffect(()=>{
    setcontextPrefix(`In The File Management Application user has selected Project is ${formatObject(selectedProject)} and Items in Selected Project is ${formatObject(items)}`);
    console.log(contextPrefix)
  },[contextPrefix, selectedProject, items])

    // Initialize on component mount
    useEffect(() => {
      if (Cookies.get('userId')) {
        const decryptedId = decryptData(Cookies.get('userId')!);
        setUserId(decryptedId);
        initializeProgressRecord(decryptedId);
      } else {
        router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
      }
    },[]);

    useEffect(() => {
      const checkCompletion = async (decryptedId: string) => {
        try {
          const { data: fileOpsData, error } = await supabase
            .from('automated_file_management')
            .select('completed')
            .eq('student_id', decryptedId)
            .single();
  
          if (error) throw error;
          
          if (fileOpsData?.completed) {
            setIsCompleted(true);
            router.push(`/Module_1/Computer_Basics/Files_Module?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
          }
        } catch (error) {
          console.log('Error checking completion status:', error);
        }
      };
  
      if (userId) {
        checkCompletion(userId);
      }
    }, [userId]);

      // Decryption utility
  const decryptData = useCallback((encryptedText: string): string => {
    if (!process.env.NEXT_PUBLIC_SECRET_KEY) return '';
    const [ivBase64, encryptedBase64] = encryptedText.split('.');
    if (!ivBase64 || !encryptedBase64) return '';
    
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(process.env.NEXT_PUBLIC_SECRET_KEY).slice(0, 16);
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const decryptedBytes = encryptedBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
    
    return new TextDecoder().decode(decryptedBytes);
  }, []);

  const initializeProgressRecord = async (studentId: string) => {
    try {

      const { data: computerBasicsData, error:computerBasicsError  } = await supabase
      .from('computer_basics')
      .select('id')
      .eq('student_id', studentId)
      .single();

      if (computerBasicsError || !computerBasicsData) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      // Check for existing file_safety record
      const { data: fileSafetyData, error:fileSafetyError  } = await supabase
        .from('file_safety')
        .select('id')
        .eq('student_id', studentId)
        .single();

      if (!fileSafetyData || fileSafetyError ) {
        router.push(`/Module_1/Computer_Basics/Files_Module/File_Operations?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      // Check for existing file operations record
      const { data: existingRecord } = await supabase
        .from('automated_file_management')
        .select('*')
        .eq('file_safety_quest_id', fileSafetyData?.id)
        .eq('student_id', studentId)
        .single();

      // if (existingError && existingError.code !== 'PGRST116') {
      //   console.error('Error checking existing record:', existingError);
      //   return;
      // }

      if (existingRecord) {
        setProgressRecord(existingRecord);
        console.log(progressRecord);
        setIsCompleted(existingRecord.completed);
      } else {
        // Create new record if none exists
        const { data: newRecord, error: insertError } = await supabase
          .from('automated_file_management')
          .insert([{
            file_safety_quest_id: fileSafetyData?.id,
            student_id: studentId,
            react_completion: false,
            flask_completion: false,
            android_completion: false,
            ai_completion: false,
            node_completion: false,
            vue_completion: false,
            completed: false,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        if (newRecord) {
          setProgressRecord(newRecord);
          console.log(progressRecord);
        }
      }
    } catch (error) {
      console.log('Error in initializeProgressRecord:', error);
    }
  };
 

  const finalSubmit=async()=>{
    if (!progressRecord || !userId) return;
    
    try {
      const { error } = await supabase
        .from('automated_file_management')
        .update({
          react_completion: ProjectObject['React'],
          flask_completion: ProjectObject['Flask'],
          android_completion: ProjectObject['Android'],
          ai_completion: ProjectObject['AI'],
          node_completion: ProjectObject['Node'],
          vue_completion: ProjectObject['Vue'],
          completed: true,
          completed_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', progressRecord.id);

      if (error) throw error;

      router.push(`/Module_1/Computer_Basics/Files_Module?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    } catch (error) {
      console.log('Error submitting completion:', error);
    }
  }

  const loadProjectStructure = React.useCallback((projectName: string, userId: string) => {
    if (typeof window === 'undefined') return;
    
    const storageKey = `${userId}-terminal-project-${projectName}`;
    try {
      const savedData = secureStorage.getItem<{
        items: FolderItem[];
        currentPath: string[];
        commandHistory: string[];
      }>(storageKey);
      
      if (savedData) {
        setItems(savedData.items);
        setCurrentPath(savedData.currentPath);
        setCommandHistory(savedData.commandHistory);
        console.log(savedData.items);
      } else {
        // Reset state for new project
        setItems([]);
        setCurrentPath([]);
        setCommandHistory([]);
      }
    } catch (error) {
      console.log('Error loading project structure:', error);
      handleCorruptedData(storageKey);
    }
  }, []);

  const handleProjectSelect = (projectKey: string) => {
    setSelectedProject(projectKey);
    if (userId) {
      loadProjectStructure(projectKey, userId);
    }
    console.log(ProjectObject);
    setMode('create');
  };

  // Save project structure to storage
  const saveProjectStructure = React.useCallback((
    projectName: string, 
    newItems: FolderItem[], 
    newPath: string[], 
    newHistory: string[],
    userId: string
  ) => {
    if (typeof window === 'undefined') return;
    
    const storageKey = `${userId}-terminal-project-${projectName}`;
    const dataToSave = {
      items: newItems,
      currentPath: newPath,
      commandHistory: newHistory
    };
    secureStorage.setItem<DataSave>(storageKey, dataToSave);
  }, []);

  const handleCorruptedData = (storageKey: string) => {
    secureStorage.removeItem(storageKey);
    setItems([]);
    setCurrentPath([]);
    setCommandHistory([]);
    alert('Project data was corrupted and has been reset. Please try again.');
  };

  useEffect(() => {
    if (selectedProject && userId) {
      loadProjectStructure(selectedProject, userId);
    }
    initialize_Completion();
  }, [selectedProject, loadProjectStructure]);

  const executeCommand = (command: string) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);
    let output = '';

    const getCurrentFullPath = () => '/' + currentPath.join('/');

    let newItems = [...items];
    let newPath = [...currentPath];
    let newHistory = [...commandHistory, `$ ${command}`];

    switch (cmd) {
      case 'mkdir':
        if (args[0]) {
          const newFilePath = getCurrentFullPath() + '/' + args[0];
          const normalizedPath = newFilePath.replace(/^\/\//, '/');
          newItems = [...newItems, { path: normalizedPath, type: 'folder' }];
          output = `Created directory: ${args[0]}`;
        } else {
          output = 'mkdir: missing operand';
        }
        break;


      case 'touch':
        if (args[0]) {
          const newFilePath = getCurrentFullPath() + '/' + args[0];
          const normalizedPath = newFilePath.replace(/^\/\//, '/');
          newItems = [...newItems, { path: normalizedPath, type: 'file' }];
          output = `Created directory: ${args[0]}`;
        } else {
          output = 'mkdir: missing operand';
        }
        break;

        case 'cd':
          if (!args[0] || args[0] === '/') {
            // cd with no args or / goes to root
            newPath = [];
            output = 'Changed to root directory';
          } else if (args[0] === '..') {
            // Go up one level
            if (currentPath.length > 0) {
              newPath = currentPath.slice(0, -1);
              output = `Changed directory to: ${newPath.join('/') || '/'}`; 
            } else {
              output = 'Already at root directory';
            }
          } else {
            // Check if the directory exists
            const targetPath = getCurrentFullPath() + '/' + args[0];
            const normalizedTargetPath = targetPath.replace(/^\/\//, '/');
            
            const dirExists = items.some(item => 
              item.path === normalizedTargetPath && item.type === 'folder'
            );
  
            if (dirExists) {
              newPath = [...currentPath, args[0]];
              output = `Changed directory to: ${newPath.join('/')}`;
            } else {
              output = `cd: ${args[0]}: No such directory`;
              newPath = currentPath; // Keep current path unchanged
            }
          }
          break;

          case 'ls':
            const currentFullPath = getCurrentFullPath();
            const dirItems = items.filter(item => {
              const itemParentPath = item.path.substring(0, item.path.lastIndexOf('/'));
              const normalizedCurrentPath = currentFullPath === '' ? '/' : currentFullPath;
              const normalizedParentPath = itemParentPath === '' ? '/' : itemParentPath;
              return normalizedParentPath === normalizedCurrentPath;
            });
    
            if (dirItems.length === 0) {
              output = ''; // Empty directory
            } else {
              output = dirItems
                .map(item => {
                  const name = item.path.split('/').pop();
                  return item.type === 'folder' ? `${name}/` : name;
                })
                .join('  ');
            }
            break;

      case 'pwd':
        output = getCurrentFullPath();
        break;

      case 'clear':
        newHistory = [];
        break;

      case 'validate':
        validateStructure();
        break;

      default:
        output = `Command not found: ${cmd}`;
    }

    if (output) {
      newHistory = [...newHistory, output];
    }

    setItems(newItems);
    setCurrentPath(newPath);
    setCommandHistory(newHistory);

    // Save after each command
    if (selectedProject && userId) {
      saveProjectStructure(selectedProject, newItems, newPath, newHistory, userId);
    }
  };

  const validateStructure = () => {
    if (!selectedProject) return;
    
    const errors: string[] = [];
    const template = projectTemplates[selectedProject].structure;
    
    const validateRecursive = (structure: ProjectStructure[], currentPath: string = '') => {
      structure.forEach(required => {
        // Construct the expected path for this item
        const itemPath = currentPath ? `${currentPath}/${required.name}` : `/${required.name}`;
        
        if (required.required) {
          // Check if the item exists in our items array
          const exists = items.some(item => {
            // Normalize both paths for comparison
            const normalizedItemPath = item.path.endsWith('/') ? item.path.slice(0, -1) : item.path;
            const normalizedExpectedPath = itemPath.endsWith('/') ? itemPath.slice(0, -1) : itemPath;
            return normalizedItemPath === normalizedExpectedPath && item.type === required.type;
          });
          
          if (!exists) {
            errors.push(`Missing ${required.type}: ${itemPath}`);
          }
        }
        
        // If this item has children, recursively validate them
        if (required.children) {
          validateRecursive(required.children, itemPath);
        }
      });
    };

    validateRecursive(template);
    setValidationResults(errors);
    setShowValidationDialog(true);

    // Update progress if validation is successful
    if (errors.length === 0 && selectedProject && userId) {
      const storageKey = `${userId}-CompletedAutomation-${selectedProject}`;
      secureStorage.setItem<boolean>(storageKey, true);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {Object.entries(projectTemplates).map(([key, project]) => (
            <Card 
              key={key}
              className="cursor-pointer hover:shadow-lg transition-shadow p-4"
              onClick={() => {
                handleProjectSelect(key);
              }}
            >
              <div className="border p-4 rounded-md">
                <span className="text-sm text-gray-500">
                 {ProjectObject[key]?"Completed":"Waiting"}
                </span>  
               </div> 
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
        {Object.values(ProjectObject).some(Boolean) && (
          <div className="mt-6 flex justify-end">
            <Button className="gap-2" onClick={finalSubmit}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
        <Button variant="outline" onClick={() => {
            setMode('select');
            setItems([]);
            setSelectedProject('');
          }}>
            Back to Projects
          </Button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-5">
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
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="m-4 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 rounded-full fixed bottom-10 right-10 transition-colors"
      >
        Ask Teacher
      </button>

      <RightSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      >
        <ChatForm contextPrefix={contextPrefix}/>
      </RightSidebar>
    </div>
  );
};


const AutomatedFileOperations = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <ProjectLearningInterface/>
    </Suspense>
  );
};

export default AutomatedFileOperations;