"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
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
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Folder, File, Search, Trash2, CheckCircle2 } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  isDeleted: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const tasks: Task[] = [
  {
    id: 1,
    title: "Create Folder Structure",
    description: "Create three folders named: 'Documents', 'Images', and 'Projects'",
    completed: false
  },
  {
    id: 2,
    title: "File Operations",
    description: "Create a text file, rename it, then move it to the Documents folder",
    completed: false
  },
  {
    id: 3,
    title: "Copy and Paste",
    description: "Copy a file using Ctrl+C and paste it using Ctrl+V",
    completed: false
  },
  {
    id: 4,
    title: "Delete and Restore",
    description: "Delete a file using the Delete key and restore it from the Recycle Bin",
    completed: false
  },
  {
    id: 5,
    title: "Search Function",
    description: "Create multiple files and use the search function to find a specific file",
    completed: false
  }
];

const FileManagerWithTasks = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [clipboard, setClipboard] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');
  const [showBin, setShowBin] = useState(false);
  const [currentTasks, setCurrentTasks] = useState<Task[]>(tasks);
  const [currentTaskId, setCurrentTaskId] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedFile && !showRenameDialog) {
        if (e.ctrlKey && e.key === 'c') copyFile(selectedFile);
        if (e.ctrlKey && e.key === 'x') cutFile(selectedFile);
        if (e.ctrlKey && e.key === 'v' && clipboard) pasteFile();
        if (e.key === 'Delete') deleteFile(selectedFile);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, clipboard]);

  const checkTaskCompletion = () => {
    const currentTask = currentTasks.find(t => t.id === currentTaskId);
    if (!currentTask) return;

    switch (currentTaskId) {
      case 1:
        if (files.filter(f => 
          f.type === 'folder' && 
          ['Documents', 'Images', 'Projects'].includes(f.name)
        ).length === 3) {
          completeTask(currentTaskId);
        }
        break;
      case 2:
        const hasTextFile = files.some(f => f.type === 'file' && f.name.endsWith('.txt'));
        const inDocuments = files.some(f => 
          f.type === 'file' && 
          f.name.endsWith('.txt') && 
          files.find(folder => folder.name === 'Documents')
        );
        if (hasTextFile && inDocuments) {
          completeTask(currentTaskId);
        }
        break;
      // Add similar checks for other tasks
    }
  };

  const completeTask = (taskId: number) => {
    setCurrentTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    ));
    if (taskId < 5) setCurrentTaskId(taskId + 1);
  };

  // File operations
  const copyFile = (file: FileItem) => {
    setClipboard({ ...file });
    if (currentTaskId === 3) completeTask(3);
  };

  const cutFile = (file: FileItem) => {
    setClipboard({ ...file });
    deleteFile(file);
  };

  const pasteFile = () => {
    if (clipboard) {
      setFiles([...files, { ...clipboard, id: Date.now().toString() }]);
      setClipboard(null);
    }
  };

  const deleteFile = (file: FileItem) => {
    setFiles(files.map(f => f.id === file.id ? { ...f, isDeleted: true } : f));
    if (currentTaskId === 4) {
      setTimeout(() => completeTask(4), 1000);
    }
  };

  const restoreFile = (file: FileItem) => {
    setFiles(files.map(f => f.id === file.id ? { ...f, isDeleted: false } : f));
  };

  // Components
  const TaskList = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Tasks Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {currentTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 mb-2">
            <Badge >
              {task.completed ? <CheckCircle2 className="h-4 w-4" /> : task.id}
            </Badge>
            <div className={task.id === currentTaskId ? "font-bold" : ""}>
              {task.title}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const FileIcon = ({ file }: { file: FileItem }) => (
    <div 
      className="p-4 border rounded hover:bg-gray-100 cursor-pointer"
      draggable
      onDragStart={(e) => {
        setSelectedFile(file);
        e.dataTransfer.setData('text/plain', file.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (selectedFile && file.type === 'folder') pasteFile();
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="flex flex-col items-center">
            {file.type === 'folder' ? <Folder size={40} /> : <File size={40} />}
            <span className="mt-2">{file.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>New</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => {
                setFiles([...files, { 
                  id: Date.now().toString(),
                  name: 'New Folder',
                  type: 'folder',
                  isDeleted: false
                }]);
                checkTaskCompletion();
              }}>Folder</ContextMenuItem>
              <ContextMenuItem onClick={() => {
                setFiles([...files, {
                  id: Date.now().toString(),
                  name: 'New File.txt',
                  type: 'file',
                  isDeleted: false
                }]);
                checkTaskCompletion();
              }}>File</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem onClick={() => {
            setSelectedFile(file);
            setNewName(file.name);
            setShowRenameDialog(true);
          }}>Rename</ContextMenuItem>
          <ContextMenuItem onClick={() => copyFile(file)}>Copy</ContextMenuItem>
          <ContextMenuItem onClick={() => cutFile(file)}>Cut</ContextMenuItem>
          {clipboard && <ContextMenuItem onClick={pasteFile}>Paste</ContextMenuItem>}
          <ContextMenuItem onClick={() => deleteFile(file)}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );

  const filteredFiles = files.filter(f => 
    !showBin ? !f.isDeleted : f.isDeleted && 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-50">
      <TaskList />
      
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (currentTaskId === 5 && e.target.value.length > 0) {
              completeTask(5);
            }
          }}
          className="max-w-sm"
        />
        <Button 
          variant={showBin ? "destructive" : "outline"}
          onClick={() => setShowBin(!showBin)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {showBin ? "Exit Recycle Bin" : "Recycle Bin"}
        </Button>
      </div>

      <Card className="flex-1 overflow-auto">
        <CardContent className="p-4">
          <div className="grid grid-cols-6 gap-4">
            {filteredFiles.map(file => (
              <FileIcon key={file.id} file={file} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New name"
          />
          <DialogFooter>
            <Button onClick={() => {
              if (selectedFile && newName) {
                setFiles(files.map(f => 
                  f.id === selectedFile.id ? { ...f, name: newName } : f
                ));
                setShowRenameDialog(false);
                checkTaskCompletion();
              }
            }}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManagerWithTasks;