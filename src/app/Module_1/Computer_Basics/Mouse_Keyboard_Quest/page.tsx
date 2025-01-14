"use client";
import { Timeline } from "@/components/ui/timeline";
import { Mouse, Keyboard, Sigma } from 'lucide-react';
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from "js-cookie";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define types for better type safety
type CompletionStatus = {
  completed: boolean;
  error: string | null;
  loading: boolean;
};

interface ModuleStatus {
  mouse_movement: CompletionStatus;
  keyboard: CompletionStatus;
  dev_detective: CompletionStatus;
}

interface QueryParams {
  principalId: string | null;
  schoolId: string | null;
  teacherId: string | null;
}

// Utility function to decrypt data
const decryptData = (encryptedText: string, secretKey: string): string => {
  try {
    const [ivBase64, encryptedBase64] = encryptedText.split('.');
    if (!ivBase64 || !encryptedBase64) return '';
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(secretKey).slice(0, 16);
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const decryptedBytes = encryptedBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

// Independent data fetching hooks
const useModuleCompletion = (tableName: string, studentId: string | null) => {
  const [status, setStatus] = useState<CompletionStatus>({
    completed: false,
    error: null,
    loading: true
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!studentId) return;
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('completed')
          .eq('student_id', studentId)
          .single();
        
        if (error) throw error;
        
        setStatus({
          completed: data?.completed || false,
          error: null,
          loading: false
        });
      } catch (error) {
        setStatus({
          completed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false
        });
      }
    };

    fetchStatus();
  }, [tableName, studentId, supabase]);

  return status;
};

const useQueryParams = (): QueryParams => {
  const params = useSearchParams();
  return {
    principalId: params.get('principalId'),
    schoolId: params.get('schoolId'),
    teacherId: params.get('teacherId')
  };
};

const Home = () => {
  const router = useRouter();
  const { principalId, schoolId, teacherId } = useQueryParams();
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || '';
  
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userIdCookie = Cookies.get('userId');
    if (userIdCookie) {
      const decryptedId = decryptData(userIdCookie, secretKey);
      setUserId(decryptedId);
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    }
  }, []);

  // Independent module status tracking
  const mouseStatus = useModuleCompletion('mouse_movement', userId);
  const keyboardStatus = useModuleCompletion('keyboard', userId);
  const devDetectiveStatus = useModuleCompletion('dev_detective', userId);

  const generateTimelineData = () => [
    {
      title: "Mouse Movement",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Mouse Movement
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            Mouse movement refers to the tracking of cursor motion across a screen, often used to enhance user interactions. By analyzing movement patterns, developers can improve UX, track engagement, and implement features like hover effects, drag-and-drop, or dynamic animations.
          </p>
          <div className="mt-6 flex gap-4">
            <span className="rounded-full px-3 py-1 bg-emerald-400 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Click
            </span>
            <span className="rounded-full px-3 py-1 bg-orange-300 hover:bg-indigo-100 focus:ring focus:ring-indigo-100 cursor-pointer">
              Double Click
            </span>
            <span className="rounded-full px-3 py-1 bg-amber-300 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Right Click
            </span>
            <span className="rounded-full px-3 py-1 bg-green-400 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Mouse Over
            </span>
          </div>
          <button 
            disabled={mouseStatus.completed || mouseStatus.loading}
            className={`rounded-full flex items-center gap-2 px-4 py-2 mt-5 ${
              mouseStatus.completed || mouseStatus.loading
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            onClick={() => router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Mouse_Movement?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <Mouse /> {mouseStatus.completed ? "Completed" : "Mouse Movement Journey"}
          </button>
        </div>
      ),
    },
    {
      title: "Keyboard",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Keyboard
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            A keyboard is an essential input device used to type text and execute commands on computers. 
            Master typing skills, keyboard shortcuts, and command inputs to enhance your productivity and 
            efficiency in computer operations.
          </p>
          <div className="mt-6 flex gap-4">
            <span className="rounded-full px-3 py-1 bg-emerald-400 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Character Typing
            </span>
            <span className="rounded-full px-3 py-1 bg-orange-300 hover:bg-indigo-100 focus:ring focus:ring-indigo-100 cursor-pointer">
              Keywords Typing
            </span>
            <span className="rounded-full px-3 py-1 bg-amber-300 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Commands Typing
            </span>
          </div>
          <button 
            disabled={keyboardStatus.completed || keyboardStatus.loading}
            className={`rounded-full flex items-center gap-2 px-4 py-2 mt-5 ${
              keyboardStatus.completed || keyboardStatus.loading
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            onClick={() => router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Keyboard?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <Keyboard /> {keyboardStatus.completed ? "Completed" : "Keyboard Journey"}
          </button>
        </div>
      ),
    },
    {
      title: "Dev Detective",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Dev Detective
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            Become a Dev Detective by mastering problem-solving skills in programming. Learn to analyze code,
            debug issues, and implement efficient solutions using algorithms and arithmetic operations.
            This module will enhance your analytical thinking and coding capabilities.
          </p>
          <div className="mt-6 flex gap-4">
            <span className="rounded-full px-3 py-1 bg-emerald-400 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Algorithm
            </span>
            <span className="rounded-full px-3 py-1 bg-orange-300 hover:bg-indigo-100 focus:ring focus:ring-indigo-100 cursor-pointer">
              Arithmetic Operation
            </span>
            <span className="rounded-full px-3 py-1 bg-amber-300 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Code Generation
            </span>
          </div>
          <button 
            disabled={devDetectiveStatus.completed || devDetectiveStatus.loading}
            className={`rounded-full flex items-center gap-2 px-4 py-2 mt-5 ${
              devDetectiveStatus.completed || devDetectiveStatus.loading
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            onClick={() => router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Dev_Detective?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <Sigma /> {devDetectiveStatus.completed ? "Completed" : "Dev Detective Journey"}
          </button>
        </div>
      ),
    }
  ];

  if (!principalId || !schoolId || !teacherId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
        <Alert variant="destructive">
          <AlertDescription>Missing required parameters</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <Timeline data={generateTimelineData()} name="Mouse keyboard Quest" />;
};

export default Home;