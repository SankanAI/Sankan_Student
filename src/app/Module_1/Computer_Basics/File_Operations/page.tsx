import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle, Plus, Trophy } from 'lucide-react';

const InteractiveFileTasks = () => {
  // Task completion state
  const [currentTask, setCurrentTask] = useState(1);
  const [taskCompleted, setTaskCompleted] = useState({
    sorting: false,
    fileContent: false,
    fileOperation: false,
    fileInfo: false
  });

  // Sorting task state
  const [items, setItems] = useState([
    { id: 1, name: 'zebra.txt', type: 'text', order: 'z' },
    { id: 2, name: '15report.pdf', type: 'pdf', order: '15' },
    { id: 3, name: 'apple.png', type: 'image', order: 'a' },
    { id: 4, name: '3notes.txt', type: 'text', order: '3' }
  ]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [sortingMode, setSortingMode] = useState('alpha'); // 'alpha' or 'numeric'

  // File content task state
  const [sourceContent, setSourceContent] = useState('');
  const [targetContent, setTargetContent] = useState('');
  const [isContentMatch, setIsContentMatch] = useState(false);

  // File operation state
  const [appendContent, setAppendContent] = useState('');

  // Check if sorting is correct
  const checkSortingOrder = () => {
    const orderedItems = [...items];
    if (sortingMode === 'alpha') {
      const correctOrder = orderedItems.slice().sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      return JSON.stringify(orderedItems) === JSON.stringify(correctOrder);
    } else {
      const correctOrder = orderedItems.slice().sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/) || [0]);
        const numB = parseInt(b.name.match(/\d+/) || [0]);
        return numA - numB;
      });
      return JSON.stringify(orderedItems) === JSON.stringify(correctOrder);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetItem) => {
    const newItems = [...items];
    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    const targetIndex = items.findIndex(item => item.id === targetItem.id);
    
    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    
    setItems(newItems);
    setDraggedItem(null);
    
    // Check if sorting is correct after drop
    if (checkSortingOrder()) {
      setTaskCompleted(prev => ({ ...prev, sorting: true }));
    }
  };

  // Validate content match
  const validateContent = () => {
    const matches = sourceContent === targetContent;
    setIsContentMatch(matches);
    if (matches) {
      setTaskCompleted(prev => ({ ...prev, fileContent: true }));
    }
  };

  // Append content handler
  const handleAppend = () => {
    setSourceContent(prev => prev + '\n' + appendContent);
    setAppendContent('');
    setTaskCompleted(prev => ({ ...prev, fileOperation: true }));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Learn File Management</h1>

      {/* Sorting Task Card */}
      <Card className={`${currentTask === 1 ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader>
          <CardTitle>Task 1: Sort Files</CardTitle>
          <CardDescription>
            Drag and drop files to sort them {sortingMode === 'alpha' ? 'alphabetically' : 'numerically'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Button 
                onClick={() => setSortingMode('alpha')}
                variant={sortingMode === 'alpha' ? 'default' : 'outline'}
              >
                Sort Alphabetically
              </Button>
              <Button 
                onClick={() => setSortingMode('numeric')}
                variant={sortingMode === 'numeric' ? 'default' : 'outline'}
              >
                Sort Numerically
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(item)}
                  className="flex justify-between items-center p-3 border-b last:border-0 bg-white cursor-move hover:bg-gray-50"
                >
                  <span className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
            {taskCompleted.sorting && (
              <Alert className="bg-green-50">
                <Trophy className="h-4 w-4" />
                <AlertDescription>Perfect! Files are correctly sorted. Move on to the next task!</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Content Task Card */}
      <Card className={`${currentTask === 2 ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader>
          <CardTitle>Task 2: File Content Management</CardTitle>
          <CardDescription>Write content in the source file and copy it to the target file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source File</label>
                <Textarea 
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Write your content here..."
                  className="h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target File</label>
                <Textarea 
                  value={targetContent}
                  onChange={(e) => setTargetContent(e.target.value)}
                  placeholder="Copy content here..."
                  className="h-32"
                />
              </div>
            </div>
            <Button onClick={validateContent}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Validate Content
            </Button>
            {isContentMatch && (
              <Alert className="bg-green-50">
                <Trophy className="h-4 w-4" />
                <AlertDescription>Perfect match! Move on to the next task!</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Operations Card */}
      <Card className={`${currentTask === 3 ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader>
          <CardTitle>Task 3: File Operations</CardTitle>
          <CardDescription>Practice appending content to files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content to Append</label>
              <div className="flex gap-2">
                <Input 
                  value={appendContent}
                  onChange={(e) => setAppendContent(e.target.value)}
                  placeholder="Type content to append..."
                />
                <Button onClick={handleAppend}>
                  <Plus className="mr-2 h-4 w-4" />
                  Append
                </Button>
              </div>
            </div>
            {taskCompleted.fileOperation && (
              <Alert className="bg-green-50">
                <Trophy className="h-4 w-4" />
                <AlertDescription>Great job appending content! Move on to the next task!</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Your Progress</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${taskCompleted.sorting ? 'text-green-500' : 'text-gray-300'}`} />
            <span>Sorting Task {taskCompleted.sorting ? '(Completed)' : '(In Progress)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${taskCompleted.fileContent ? 'text-green-500' : 'text-gray-300'}`} />
            <span>File Content Task {taskCompleted.fileContent ? '(Completed)' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${taskCompleted.fileOperation ? 'text-green-500' : 'text-gray-300'}`} />
            <span>File Operations Task {taskCompleted.fileOperation ? '(Completed)' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveFileTasks;