"use client";
import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Plus, Trophy, Hash, ArrowRight } from 'lucide-react';
import TeacherGuide from "@/app/AI_Guide/Teacher_Guide";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from "js-cookie";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


type FileOperationsRecord = {
  id: string;
  file_safety_quest_id: string;
  student_id: string;
  alphabetical_sort_completed: boolean;
  numerical_sort_completed: boolean;
  content_copy_completed: boolean;
  content_validation_completed: boolean;
  append_operation_completed: boolean;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  last_activity: string;
};

interface MouseKeyboardQuest {
  id: number;  // or string, depending on your id type
  completed: boolean;
}


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
  const [sortType, setSortType] = useState('numeric');
  const [sortError, setSortError] = useState('');
  const [showValidateButton, setShowValidateButton] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [sorting, setSorting]=useState<boolean>(false);
  const [copying, setCopying]=useState<boolean>(false);
  const [Append, setAppend]=useState<boolean>(false);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();
  
  // State management
  const [userId, setUserId] = useState<string | null>(null);
  const [progressRecord, setProgressRecord] = useState<FileOperationsRecord | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Get URL parameters
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

useEffect(() => {
  setIsClient(true);
}, []);

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
    const correctOrder = [...files].sort((a, b) => {
      if (sortType === 'alpha') {
        return a.name.localeCompare(b.name);
      } else {
        const numA = parseInt((a.name.match(/\d+/) || ['0'])[0]);
        const numB = parseInt((b.name.match(/\d+/) || ["0"])[0]);
        return numA - numB;
      }
    });

    const isCorrect = JSON.stringify(files) === JSON.stringify(correctOrder);
    
    if (isCorrect) {
      setCompletedTasks(prev => ({ ...prev, 1: true }));
      setSortError('');
      setShowValidateButton(false);
      // Automatically move to next task after a short delay
      setTimeout(() => {
        setActiveTask(2);
      }, 1500);
    } else {
      setSortError('The files are not correctly sorted. Try again!');
    }
    setSorting(isCorrect)
    return isCorrect;
  }, [files, sortType]);

  // Handle file reordering
  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
    setShowValidateButton(true);
    setSortError('');
  };

  // Reset sorting when changing sort type
  const handleSortTypeChange = (newSortType: string) => {
    setSortType(newSortType);
    setSortError('');
    setCompletedTasks(prev => ({ ...prev, 1: false }));
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
    setCopying(isMatch)
    setContentValidation({
      isValid: isMatch,
      message: isMatch ? 'Perfect match! Moving to next task...' : 'Contents do not match. Try again!'
    });

    if (isMatch) {
      setCompletedTasks(prev => ({ ...prev, 2: true }));
      setTimeout(() => {
        setActiveTask(3);
      }, 1500);
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
        message: 'Content appended successfully! Task completed!'
      });
      setCompletedTasks(prev => ({ ...prev, 3: true }));
      setAppend(true);
      return newContent;
    });
    setAppendContent('');
  };

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

      const { data: mouseKeyboardData, error: mouseKeyboardError  } = await supabase
      .from('mouse_keyboard_quest')
      .select('id')
      .eq('student_id', studentId)
      .single<MouseKeyboardQuest>();

      if (mouseKeyboardError || !mouseKeyboardData) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }
      else{
        if (!mouseKeyboardData?.completed) {
          router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
          return;
        }
      }

      // Check for existing file_safety record
      let { data: fileSafetyData } = await supabase
        .from('file_safety')
        .select('id')
        .eq('student_id', studentId)
        .single();

      if (!fileSafetyData) {
          const { data: newfileSafetyData, error: fileSafetyDataError } = await supabase
            .from('file_safety')
            .insert([{
              computer_basics_id: computerBasicsData?.id,
              student_id: studentId,
              started_at: new Date().toISOString(),
              last_activity: new Date().toISOString()
            }])
            .select()
            .single();
    
          if (fileSafetyDataError) throw fileSafetyDataError;
          fileSafetyData = newfileSafetyData;
      }

      // Check for existing file operations record
      const { data: existingRecord } = await supabase
        .from('file_operations')
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
        setIsCompleted(existingRecord.completed);
      } else {
        // Create new record if none exists
        const { data: newRecord, error: insertError } = await supabase
          .from('file_operations')
          .insert([{
            file_safety_quest_id: fileSafetyData?.id,
            student_id: studentId,
            alphabetical_sort_completed: false,
            numerical_sort_completed: false,
            content_copy_completed: false,
            content_validation_completed: false,
            append_operation_completed: false,
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

  // Update progress in database
  const updateProgress = async () => {
    if (!progressRecord || !userId) return;

    try {
      const { error } = await supabase
        .from('file_operations')
        .update({
          alphabetical_sort_completed:sorting,
          numerical_sort_completed:sorting,
          content_copy_completed:copying,
          content_validation_completed:copying,
          append_operation_completed:Append,
          last_activity: new Date().toISOString()
        })
        .eq('id', progressRecord.id);

      if (error) throw error;

      // Check if all tasks are completed
      const allCompleted = sorting && copying && Append;

      if (allCompleted) {
        const { error: completionError } = await supabase
          .from('file_operations')
          .update({
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', progressRecord.id);

        if (completionError) throw completionError;
        
        setIsCompleted(true);
        setShowCongrats(true);
      }
    } catch (error) {
      console.log('Error updating progress:', error);
    }
  };

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

  // Check completion status
  useEffect(() => {
    const checkCompletion = async (decryptedId: string) => {
      try {
        const { data: fileOpsData, error } = await supabase
          .from('file_operations')
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
  },  [sorting, copying, Append, userId]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tighter">File Management Tutorial</h1>
        {isClient && <TeacherGuide context='Hello world' pageId='hello'/>}
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
          {/* Navigation Controls */}
          <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setActiveTask(prev => Math.max(1, prev - 1))}
          disabled={activeTask === 1}
        >
          Previous Task
        </Button>
        {activeTask<3?(
              <Button
                onClick={() => setActiveTask(prev => Math.min(3, prev + 1))}
                disabled={activeTask === 3}
              >
                Next Task
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
        ):(
            <Button
              onClick={() => {updateProgress(); console.log(isCompleted)}}
              
            >
              Final Submit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        )}
      </div>

      {/* Sorting Task */}
      <Card className={activeTask === 1 ? 'ring-2 ring-blue-500' : ''}>
        <Dialog open={showCongrats}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Congratulations! 🎉</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>{"You've completed all file operations tasks!"}</p>
              </div>
              <Button onClick={() => router.push(`/Module_1/Computer_Basics/Files_Module?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}>
                Continue
              </Button>
            </DialogContent>
          </Dialog>
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
                variant={sortType === 'numeric' ? 'default' : 'outline'}
                onClick={() => handleSortTypeChange('numeric')}
              >
                <Hash className="mr-2 h-4 w-4" />
                Sort first alphabets, Then Numerical Files
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

            {showValidateButton && (
              <Button onClick={validateSorting} className="mt-4">
                Check Sorting
              </Button>
            )}

            {sortError && (
              <Alert variant="destructive">
                <AlertDescription>{sortError}</AlertDescription>
              </Alert>
            )}

            {completedTasks[1] && (
              <Alert className="bg-green-50">
                <Trophy className="h-4 w-4 text-green-500" />
                <AlertDescription>Perfect sorting! Moving to the next task...</AlertDescription>
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
    </div>
  );
};


const FileOperations = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <InteractiveFileTasks/>
    </Suspense>
  );
};

export default FileOperations;