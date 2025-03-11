"use client";
import { Timeline } from "@/components/ui/timeline";
import { ShieldCheck, BrickWall, Fish } from 'lucide-react';
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from "js-cookie";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCryptoUtils } from "@/lib/utils/cryptoUtils";

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
  const {decryptData} =useCryptoUtils();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userIdCookie = Cookies.get('userId');
    if (userIdCookie) {
      const decryptedId = decryptData(userIdCookie);
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
      title: "Antivirus",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Antivirus
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
         {" Antivirus software detects and removes malware, protecting devices from viruses, spyware, and ransomware. Keep it updated to ensure real-time protection and scan files regularly for threats."}
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
            onClick={() => router.push(`/Module_1/Computer_Basics/Internet_Safety/Field_Samurai/Antivirus?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <ShieldCheck /> {mouseStatus.completed ? "Completed" : "Antivirus Journey"}
          </button>
        </div>
      ),
    },
    {
      title: "Firewall",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Firewall
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
         {" A firewall monitors and controls network traffic to block unauthorized access. It acts as a barrier between your device and malicious networks, safeguarding sensitive data. Keep it enabled and updated."}
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
            onClick={() => router.push(`/Module_1/Computer_Basics/Internet_Safety/Field_Samurai/Firewall?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <BrickWall /> {keyboardStatus.completed ? "Completed" : "Firewall Journey"}
          </button>
        </div>
      ),
    },
    {
      title: "Phising",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Phising
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
          {"Phishing is a scam where attackers impersonate trusted entities to steal sensitive info. Avoid clicking unknown links, verify sender identities, and report suspicious emails."}
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
            onClick={() => router.push(`/Module_1/Computer_Basics/Internet_Safety/Field_Samurai/Phising?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <Fish /> {devDetectiveStatus.completed ? "Completed" : "Phising Journey"}
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

  return <Timeline data={generateTimelineData()} name="Field Samurai" />;
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