"use client";
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle, Plus, Trophy, ArrowDownAZ, Hash, ArrowRight } from 'lucide-react';

const InteractiveFileTasks = () => {
  // Task and progress management
  const [activeTask, setActiveTask] = useState(1);
  const [completedTasks, setCompletedTasks] = useState({
    1: false,
    2: false,
    3: false
  });

  // Sorting task state
  const [files, setFiles] = useState([
    { id: 1, name: 'zebra.txt', type: 'text' },
    { id: 2, name: '15report.pdf', type: 'pdf' },
    { id: 3, name: 'apple.png', type: 'image' },
    { id: 4, name: '3notes.txt', type: 'text' }
  ]);
  const [sortType, setSortType] = useState('alpha');
  const [sortError, setSortError] = useState('');

  // File content task state
  const [sourceContent, setSourceContent] = useState('');
  const [targetContent, setTargetContent] = useState('');
  const [contentValidation, setContentValidation] = useState({
    isValid: false,
    message: ''
  });

  // File operation state
  const [appendContent, setAppendContent] = useState('');
  const [operationResult, setOperationResult] = useState({
    success: false,
    message: ''
  });

  // Sorting validation logic
  const validateSorting = useCallback(() => {
    const sortedFiles = [...files];
    const correctOrder = [...files].sort((a, b) => {
      if (sortType === 'alpha') {
        return a.name.localeCompare(b.name);
      } else {
        const numA = parseInt((a.name.match(/\d+/) || ['0'])[0]);
        const numB = parseInt((b.name.match(/\d+/) || ["0"])[0]);
        return numA - numB;
      }
    });

    const isCorrect = JSON.stringify(sortedFiles) === JSON.stringify(correctOrder);
    if (isCorrect) {
      setCompletedTasks(prev => ({ ...prev, 1: true }));
      setSortError('');
    } else {
      setSortError('The files are not correctly sorted. Try again!');
    }
    return isCorrect;
  }, [files, sortType]);

  // Handle file reordering
  const moveFile = (fromIndex:number, toIndex:number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
    validateSorting();
  };

  // Content validation handler
  const handleContentValidation = () => {
    const trimmedSource = sourceContent.trim();
    const trimmedTarget = targetContent.trim();

    if (!trimmedSource || !trimmedTarget) {
      setContentValidation({
        isValid: false,
        message: 'Both source and target content are required'
      });
      return;
    }

    const isMatch = trimmedSource === trimmedTarget;
    setContentValidation({
      isValid: isMatch,
      message: isMatch ? 'Perfect match!' : 'Contents do not match. Try again!'
    });

    if (isMatch) {
      setCompletedTasks(prev => ({ ...prev, 2: true }));
    }
  };

  // Append operation handler
  const handleAppendOperation = () => {
    if (!appendContent.trim()) {
      setOperationResult({
        success: false,
        message: 'Please enter content to append'
      });
      return;
    }

    setSourceContent(prev => {
      const newContent = prev + (prev ? '\n' : '') + appendContent.trim();
      setOperationResult({
        success: true,
        message: 'Content appended successfully!'
      });
      setCompletedTasks(prev => ({ ...prev, 3: true }));
      return newContent;
    });
    setAppendContent('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">File Management Tutorial</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Progress:</span>
          <div className="flex gap-1">
            {Object.entries(completedTasks).map(([task, completed]) => (
              <div
                key={task}
                className={`w-3 h-3 rounded-full ${
                  completed ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sorting Task */}
      <Card className={activeTask === 1 ? 'ring-2 ring-blue-500' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">1</span>
            File Sorting Exercise
          </CardTitle>
          <CardDescription>Sort files by clicking and dragging them into the correct order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                variant={sortType === 'alpha' ? 'default' : 'outline'}
                onClick={() => setSortType('alpha')}
              >
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                Alphabetical
              </Button>
              <Button 
                variant={sortType === 'numeric' ? 'default' : 'outline'}
                onClick={() => setSortType('numeric')}
              >
                <Hash className="mr-2 h-4 w-4" />
                Numerical
              </Button>
            </div>

            <div className="border rounded-lg divide-y">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 cursor-move"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{file.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => index > 0 && moveFile(index, index - 1)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => index < files.length - 1 && moveFile(index, index + 1)}
                      disabled={index === files.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {sortError && (
              <Alert variant="destructive">
                <AlertDescription>{sortError}</AlertDescription>
              </Alert>
            )}

            {completedTasks[1] && (
              <Alert className="bg-green-50">
                <Trophy className="h-4 w-4 text-green-500" />
                <AlertDescription>Perfect sorting! Move on to the next task.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Content Task */}
      <Card className={activeTask === 2 ? 'ring-2 ring-blue-500' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">2</span>
            Content Management
          </CardTitle>
          <CardDescription>Practice copying and validating file content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source File</label>
                <Textarea 
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Write content here..."
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

            <div className="flex gap-2">
              <Button onClick={() => setTargetContent(sourceContent)}>
                Copy Content
              </Button>
              <Button onClick={handleContentValidation}>
                Validate Match
              </Button>
            </div>

            {contentValidation.message && (
              <Alert className={contentValidation.isValid ? 'bg-green-50' : 'bg-red-50'}>
                <AlertDescription>{contentValidation.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Operations Task */}
      <Card className={activeTask === 3 ? 'ring-2 ring-blue-500' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">3</span>
            File Operations
          </CardTitle>
          <CardDescription>Learn to append content to existing files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={appendContent}
                onChange={(e) => setAppendContent(e.target.value)}
                placeholder="Type content to append..."
                className="flex-1"
              />
              <Button onClick={handleAppendOperation}>
                <Plus className="mr-2 h-4 w-4" />
                Append
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="font-medium mb-2">Current Content:</p>
              <pre className="whitespace-pre-wrap">{sourceContent || 'No content yet'}</pre>
            </div>

            {operationResult.message && (
              <Alert className={operationResult.success ? 'bg-green-50' : 'bg-red-50'}>
                <AlertDescription>{operationResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setActiveTask(prev => Math.max(1, prev - 1))}
          disabled={activeTask === 1}
        >
          Previous Task
        </Button>
        <Button
          onClick={() => setActiveTask(prev => Math.min(3, prev + 1))}
          disabled={activeTask === 3}
        >
          Next Task
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InteractiveFileTasks;