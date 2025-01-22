"use client";
import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaReact } from "react-icons/fa";
import { SiFlask } from "react-icons/si";
import { PiAndroidLogoDuotone } from "react-icons/pi";
import { PiBrainDuotone } from "react-icons/pi";
import { RiNodejsLine } from "react-icons/ri";
import { IoLogoVue } from "react-icons/io5";
import { PlusCircle, Folder, File, Archive, Plus, Trash2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { secureStorage } from '@/lib/storage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
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
import { Progress } from "@/components/ui/progress";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from "js-cookie";


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

interface ProjectTemplate {
  name: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  structure: ProjectStructure[];
}

interface ProjectStructure {
  name: string;
  type: 'folder' | 'file' | 'zip';
  required: boolean;
  children?: ProjectStructure[];
}

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'zip';
  parentId: string | null;
}

interface ValidationResult {
  message: string;
  type: 'error' | 'success';
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
          ) : item.type === 'zip' ? (
            <Archive className="h-4 w-4 text-yellow-500" />
          ) : (
            <File className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm">{item.name}</span>
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
  const [showDialog, setShowDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [completedProjects, setCompletedProjects] = useState<Record<string, boolean>>({});
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [items, setItems] = useState<FolderItem[]>([]);
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});
  const [progressRecord, setProgressRecord] = useState<FileManagement | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isReactComplete, setIsReactComplete] = useState(false);
  const [isFlaskComplete, setIsFlaskComplete] = useState(false);
  const [isAndroidComplete, setIsAndroidComplete] = useState(false);
  const [isAIComplete, setIsAIComplete] = useState(false);
  const [isNodeComplete, setIsNodeComplete] = useState(false);
  const [isVueComplete, setIsVueComplete] = useState(false);
  // const [allProjectsComplete, setAllProjectsComplete] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();


   
  // Get URL parameters
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');


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

  // Initialize progress record
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
      const { data: fileSafetyData } = await supabase
        .from('file_safety')
        .select('id')
        .eq('student_id', studentId)
        .single();

      // Check for existing file operations record
      const { data: existingRecord } = await supabase
        .from('file_management')
        .select('*')
        .eq('file_safety_quest_id', fileSafetyData?.id)
        .eq('student_id', studentId)
        .single();

      if (existingRecord) {
        setProgressRecord(existingRecord);
        setIsCompleted(existingRecord.completed);
      } else {
        // Create new record if none exists
        const { data: newRecord, error: insertError } = await supabase
          .from('file_management')
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
        }
      }
    } catch (error) {
      console.log('Error in initializeProgressRecord:', error);
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    if (!progressRecord || !userId) return;
    
    try {
      const { error } = await supabase
        .from('file_management')
        .update({
          react_completion: isReactComplete,
          flask_completion: isFlaskComplete,
          android_completion: isAndroidComplete,
          ai_completion: isAIComplete,
          node_completion: isNodeComplete,
          vue_completion: isVueComplete,
          completed: true,
          completed_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', progressRecord.id);

      if (error) throw error;

      router.push(`/Module_1/Computer_Basics/Files_Module?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    } catch (error) {
      console.error('Error submitting completion:', error);
    }
  };

  useEffect(() => {
    const checkCompletion = async (decryptedId: string) => {
      try {
        const { data: fileOpsData, error } = await supabase
          .from('file_management')
          .select('completed')
          .eq('student_id', decryptedId)
          .single();

        if (error) throw error;
        
        if (fileOpsData?.completed) {
          setIsCompleted(true);
          router.push(`/Module_1/Computer_Basics/Files_Module?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        }
      } catch (error) {
        console.log('Error checking completion status:', error, isCompleted);
      }
    };

   if (Cookies.get('userId')) {
      const decryptedId = decryptData(Cookies.get('userId')!);
      setUserId(decryptedId);
      loadAllProjectProgress(userId);
      checkCompletion(decryptedId);
      if (selectedProject && userId) {
        loadProjectStructure(selectedProject, userId);
      }
      if(!isCompleted){
        initializeProgressRecord(decryptedId);
      }
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    }
  }, []);

  const calculateProgress = (projectKey: string, currentItems: FolderItem[]) => {
    const template = projectTemplates[projectKey].structure;
    let totalRequired = 0;
    let foundRequired = 0;

    const countRequiredItems = (structure: ProjectStructure[]) => {
      structure.forEach(item => {
        if (item.required) {
          totalRequired++;
          if (item.children) {
            countRequiredItems(item.children);
          }
        }
      });
    };

    const countFoundItems = (structure: ProjectStructure[], parentId: string | null = null) => {
      structure.forEach(required => {
        if (required.required) {
          const found = currentItems.find(item => 
            item.name === required.name && 
            item.parentId === parentId &&
            item.type === required.type
          );
          if (found) {
            foundRequired++;
            if (required.children) {
              countFoundItems(required.children, found.id);
            }
          }
        }
      });
    };

    countRequiredItems(template);
    countFoundItems(template);

    return Math.round((foundRequired / totalRequired) * 100);
  };

  const validateStructure = () => {
    if (!selectedProject) return;
    
    const results: ValidationResult[] = [];
    const template = projectTemplates[selectedProject].structure;
    
    const findItem = (items: FolderItem[], name: string, parentId: string | null): FolderItem | undefined => {
      return items.find(item => item.name === name && item.parentId === parentId);
    };
    
    const validateRecursive = (template: ProjectStructure[], parentId: string | null = null, path: string = '') => {
      template.forEach(required => {
        if (required.required) {
          const item = findItem(items, required.name, parentId);
          if (!item) {
            results.push({
              message: `Missing ${required.type}: ${path}${required.name}`,
              type: 'error'
            });
          } else if (required.children) {
            validateRecursive(required.children, item.id, `${path}${required.name}/`);
          }
        }
      });
    };
  
    validateRecursive(template);
    setValidationResults(results);
    setShowValidationDialog(true);
    const isComplete = results.length === 0;
    switch (selectedProject) {
      case 'React':
        setIsReactComplete(isComplete);
        break;
      case 'Flask':
        setIsFlaskComplete(isComplete);
        break;
      case 'Android':
        setIsAndroidComplete(isComplete);
        break;
      case 'AI':
        setIsAIComplete(isComplete);
        break;
      case 'Node':
        setIsNodeComplete(isComplete);
        break;
      case 'Vue':
        setIsVueComplete(isComplete);
        break;
    }

    if (isComplete) {
      results.push({
        message: "All required files and folders are present",
        type: 'success'
      });
    }
  
    setCompletedProjects(prev => ({
      ...prev,
      [selectedProject]: isComplete
    }));
    
    setShowValidationDialog(true);
  };
  

  const loadProjectStructure = useCallback((projectName: string, userId: string) => {
    if (typeof window === 'undefined') return;
  
    const storageKey = `${userId}-project-${projectName}`;
    
    try {
      const savedItems = secureStorage.getItem<FolderItem[]>(storageKey);
      
      if (savedItems) {
        setItems(savedItems);
        
        // Calculate progress for the loaded project
        const progress = calculateProgress(projectName, savedItems);
        setProjectProgress(prev => ({
          ...prev,
          [projectName]: progress
        }));
  
        // Validate the structure and update completion status
        validateStructureOnLoad(projectName, savedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading project structure:', error);
      handleCorruptedData(storageKey);
    }
  }, []);

  const saveProjectStructure = useCallback((projectName: string, newItems: FolderItem[], userId: string) => {
    if (typeof window !== 'undefined') {
      const storageKey = `${userId}-project-${projectName}`;
      secureStorage.setItem<FolderItem[]>(storageKey, newItems);
    }
  }, []);

  const validateStructureOnLoad = (projectKey: string, currentItems: FolderItem[]) => {
    if (!projectKey) return;
    
    const template = projectTemplates[projectKey].structure;
    let isComplete = true;
    
    const findItem = (items: FolderItem[], name: string, parentId: string | null): FolderItem | undefined => {
      return items.find(item => item.name === name && item.parentId === parentId);
    };
    
    const validateRecursive = (template: ProjectStructure[], parentId: string | null = null) => {
      template.forEach(required => {
        if (required.required) {
          const item = findItem(currentItems, required.name, parentId);
          if (!item) {
            isComplete = false;
          } else if (required.children) {
            validateRecursive(required.children, item.id);
          }
        }
      });
    };
  
    validateRecursive(template);
  
    // Update completion status states
    switch (projectKey) {
      case 'React':
        setIsReactComplete(isComplete);
        break;
      case 'Flask':
        setIsFlaskComplete(isComplete);
        break;
      case 'Android':
        setIsAndroidComplete(isComplete);
        break;
      case 'AI':
        setIsAIComplete(isComplete);
        break;
      case 'Node':
        setIsNodeComplete(isComplete);
        break;
      case 'Vue':
        setIsVueComplete(isComplete);
        break;
    }
  
    setCompletedProjects(prev => ({
      ...prev,
      [projectKey]: isComplete
    }));
  };

  const loadAllProjectProgress = useCallback((userId: string) => {
    if (typeof window !== 'undefined') {
      const progress: Record<string, number> = {};
      
      Object.keys(projectTemplates).forEach(projectName => {
        const storageKey = `${userId}-project-${projectName}`;
        const savedItems = secureStorage.getItem<FolderItem[]>(storageKey);
        
        if (savedItems) {
          progress[projectName] = calculateProgress(projectName, savedItems);
          // Validate structure for each project
          validateStructureOnLoad(projectName, savedItems);
        } else {
          progress[projectName] = 0;
        }
      });
      
      setProjectProgress(progress);
    }
  }, []);

  const handleCorruptedData = (storageKey: string) => {
    // Remove only the corrupted project data
    secureStorage.removeItem(storageKey);
    setItems([]);
    
    // Optionally, show a user notification
    alert('Project data was corrupted and has been reset. Please refresh the page.');
  };

  const handleCreateItem = (type: 'folder' | 'file' | 'zip') => {
    const newItem: FolderItem = {
      id: Date.now().toString(),
      name: newItemName,
      type,
      parentId: selectedParentId
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    saveProjectStructure(selectedProject, newItems, userId);
    
    // Update progress for the current project
    const progress = calculateProgress(selectedProject, newItems);
    setProjectProgress(prev => ({
      ...prev,
      [selectedProject]: progress
    }));

    setNewItemName('');
    setShowDialog(false);
  };

  const handleDeleteItem = (id: string) => {
    const deleteRecursive = (itemId: string) => {
      const itemsToDelete = [itemId];
      items.forEach(item => {
        if (item.parentId === itemId) {
          itemsToDelete.push(...deleteRecursive(item.id));
        }
      });
      return itemsToDelete;
    };
    
    const idsToDelete = deleteRecursive(id);
    const newItems = items.filter(item => !idsToDelete.includes(item.id));
    setItems(newItems);
    saveProjectStructure(selectedProject, newItems, userId);
    
    // Update progress for the current project
    const progress = calculateProgress(selectedProject, newItems);
    setProjectProgress(prev => ({
      ...prev,
      [selectedProject]: progress
    }));
  };

  const handleProjectSelect = (projectKey: string) => {
    setSelectedProject(projectKey);
    if (userId) {
      loadProjectStructure(projectKey, userId);
    }
    setMode('create');
  };

  if (mode === 'select') {
    return (
      <div className="p-6">
        <h2 className="text-2xl mb-6 tracking-tighter">Select a Project Structure to Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(projectTemplates).map(([key, project]) => (
            <Card 
              key={key}
              className="cursor-pointer hover:shadow-lg transition-shadow p-4"
              onClick={() => handleProjectSelect(key)}
            >
              <div className="border p-4 rounded-md">
                <Progress value={projectProgress[key] || 0} className="w-full" />
                <span className="text-sm text-gray-500">
                 Progress: {projectProgress[key] || 0}%
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
        {/* {allProjectsComplete && (
          <div className="mt-6 flex justify-end">
            <Button 
              className="gap-2 bg-green-500 hover:bg-green-600"
            >
              Submit All Projects
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        )} */}
        {Object.values(completedProjects).every(Boolean) && (
          <div className="mt-6 flex justify-end">
            <Button className="gap-2" onClick={handleSubmit}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }



  const FolderStructure = ({ parentId = null }: { parentId?: string | null }) => {
    const folderItems = items.filter(item => item.parentId === parentId);
    
    return (
      <div className="ml-4">
        {folderItems.map(item => (
          <div key={item.id} className="flex items-center gap-2 my-2">
            {item.type === 'folder' ? (
              <>
                <Folder className="h-5 w-5 text-blue-500" />
                <span>{item.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setSelectedParentId(item.id);
                    setShowDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <FolderStructure parentId={item.id} />
              </>
            ) : (
              <>
                {item.type === 'zip' ? (
                  <Archive className="h-5 w-5 text-yellow-500" />
                ) : (
                  <File className="h-5 w-5 text-gray-500" />
                )}
                <span>{item.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => {
          setMode('select');
          setItems([]);
          setSelectedProject('');
        }}>
          Back to Projects
        </Button>
        <h2 className="text-2xl font-bold tracking-tighter">
          Creating {selectedProject ? projectTemplates[selectedProject].name : ''} Structure
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Required Structure</CardTitle>
            <CardDescription>Create your folder structure to match this template</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProject && (
              <ProjectStructureDisplay structure={projectTemplates[selectedProject].structure} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Structure</CardTitle>
            <CardDescription>Build your project structure here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={() => {
                  setSelectedParentId(null);
                  setShowDialog(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
              </Button>
              <Button 
                variant="outline"
                className='ml-2'
                onClick={validateStructure}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Check Structure
              </Button>
              <FolderStructure />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}placeholder="Enter name"
            className="mb-4"
          />
          <div className="grid grid-cols-1 gap-2">
            {[
              { type: 'folder', label: 'Create Folder', icon: Folder },
              { type: 'file', label: 'Create File', icon: File },
              { type: 'zip', label: 'Create ZIP', icon: Archive }
            ].map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant="outline"
                className="justify-start"
                onClick={() => handleCreateItem(type as 'folder' | 'file' | 'zip')}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                Congratulations! Your project structure matches all requirements. You&apos;re ready to start coding!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {validationResults.map((result, index) => (
                <Alert 
                  key={index} 
                  className={result.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                >
                  {result.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertTitle>
                    {result.type === 'success' ? 'Success' : 'Missing Item'}
                  </AlertTitle>
                  <AlertDescription>
                    {result.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
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


const FileManagement= () => {
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

export default FileManagement;