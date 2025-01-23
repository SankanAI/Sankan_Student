"use client";
import { Timeline } from "@/components/ui/timeline";
import { GlobeLock,KeySquare, Chrome, HardHat } from 'lucide-react';
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from "js-cookie";
import { Alert, AlertDescription } from "@/components/ui/alert";


//Updated
// Define types for better type safety
type CompletionStatus = {
  completed: boolean;
  error: string | null;
  loading: boolean;
};

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
      title: "Encryption",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Encryption
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
         {" Encryption is a process of converting plaintext data into a coded form (ciphertext) to protect it from unauthorized access. It uses algorithms and keys to ensure that only authorized users with the correct decryption key can access the original data. Encryption secures sensitive data in transit and storage."}
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
            onClick={() => router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent/Encryption?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <GlobeLock /> {mouseStatus.completed ? "Completed" : "Encryption Journey"}
          </button>
        </div>
      ),
    },
    {
      title: "Password",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Passwords
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
         {" A password is a secret string of characters used to authenticate a user and secure access to systems, apps, or accounts. It should be strong—containing a mix of letters, numbers, and symbols—to resist hacking. Avoid sharing passwords and use a password manager for safe storage and unique combinations."}
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
            onClick={() => router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent/passwords?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <KeySquare/> {keyboardStatus.completed ? "Completed" : "Passwords Journey"}
          </button>
        </div>
      ),
    },
    {
      title: "Safe Browser",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Safe Browser
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
          {"A safe browser ensures secure internet browsing by protecting against malware, phishing, and data theft. It includes features like HTTPS, ad blockers, and anti-tracking tools. Keep it updated, avoid suspicious links, and use extensions sparingly to maintain privacy and security while online."}
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
            onClick={() => router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent/Safe_Browser?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <Chrome /> {devDetectiveStatus.completed ? "Completed" : "Safe Browser Journey"}
          </button>
        </div>
      ),
    },
    {
      title: "Social Engineering",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Social Engineering
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
         {" Social engineering is a manipulation technique where attackers trick people into revealing sensitive information, like passwords or financial details. Common tactics include phishing, pretexting, or baiting. Stay vigilant, verify requests, avoid sharing private info, and educate yourself to prevent attacks."}
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
            onClick={() => router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent/Social_Engineering?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <HardHat /> {devDetectiveStatus.completed ? "Completed" : "Social Engineering Journey"}
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

  return <Timeline data={generateTimelineData()} name="Rookie Agent" />;
};

const MousekeyboardQuest = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <Home />
    </Suspense>
  );
};


export default MousekeyboardQuest;