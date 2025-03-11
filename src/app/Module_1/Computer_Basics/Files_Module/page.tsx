"use client";
import { Timeline } from "@/components/ui/timeline";
import { FolderOpen, FileText, Settings } from 'lucide-react';
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from "js-cookie";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCryptoUtils } from "@/lib/utils/cryptoUtils";

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
const fileManagementStatus = useModuleCompletion('file_management', userId);
const fileOperationsStatus = useModuleCompletion('file_operations', userId);
const automatedFileStatus = useModuleCompletion('automated_file_management', userId);

  const generateTimelineData = () => [
    {
      title: "File Operations",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to File Operations
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            Master essential file operations including creating, copying, moving, and deleting files. 
            Learn about file permissions, attributes, and how to perform basic file manipulations 
            efficiently.
          </p>
          <div className="mt-6 flex gap-4">
            <span className="rounded-full px-3 py-1 bg-emerald-400 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Basic Operations
            </span>
            <span className="rounded-full px-3 py-1 bg-orange-300 hover:bg-indigo-100 focus:ring focus:ring-indigo-100 cursor-pointer">
              File Permissions
            </span>
            <span className="rounded-full px-3 py-1 bg-amber-300 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              File Attributes
            </span>
          </div>
          <button 
            disabled={fileOperationsStatus.completed || fileOperationsStatus.loading}
            className={`rounded-full flex items-center gap-2 px-4 py-2 mt-5 ${
              fileOperationsStatus.completed || fileOperationsStatus.loading
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            onClick={() => router.push(`/Module_1/Computer_Basics/Files_Module/File_Operations?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <FileText /> 
            {fileOperationsStatus.completed ? "Completed" : "File Operations Journey"}
          </button>
        </div>
      ),
    },
    {
      title: "File Management",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to File Management
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            File management is the process of organizing, storing, and maintaining digital files efficiently. 
            Learn about file systems, directory structures, and best practices for organizing your digital workspace.
          </p>
          <div className="mt-6 flex gap-4">
            <span className="rounded-full px-3 py-1 bg-emerald-400 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              File Systems
            </span>
            <span className="rounded-full px-3 py-1 bg-orange-300 hover:bg-indigo-100 focus:ring focus:ring-indigo-100 cursor-pointer">
              Directory Structure
            </span> 
            <span className="rounded-full px-3 py-1 bg-amber-300 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Organization
            </span>
          </div>
          <button 
            disabled={fileManagementStatus.completed || fileManagementStatus.loading}
            className={`rounded-full flex items-center gap-2 px-4 py-2 mt-5 ${
              fileManagementStatus.completed || fileManagementStatus.loading
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            onClick={() => router.push(`/Module_1/Computer_Basics/Files_Module/File_Management?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <FolderOpen /> 
            {fileManagementStatus.completed ? "Completed" : "File Management Journey"}
          </button>
        </div>
      ),
    },
    {
      title: "Automated File Management",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Introduction to Automated File Management
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            Learn to automate file management tasks using scripts and tools. Explore file organization
            automation, batch processing, and scheduled file operations to improve workflow efficiency
            and maintain organized file systems automatically.
          </p>
          <div className="mt-6 flex gap-4">
            <span className="rounded-full px-3 py-1 bg-emerald-400 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Automation Scripts
            </span>
            <span className="rounded-full px-3 py-1 bg-orange-300 hover:bg-indigo-100 focus:ring focus:ring-indigo-100 cursor-pointer">
              Batch Processing
            </span>
            <span className="rounded-full px-3 py-1 bg-amber-300 hover:bg-yellow-600 focus:ring focus:ring-yellow-300 cursor-pointer">
              Scheduled Tasks
            </span>
          </div>
          <button 
            disabled={automatedFileStatus.completed || automatedFileStatus.loading}
            className={`rounded-full flex items-center gap-2 px-4 py-2 mt-5 ${
              automatedFileStatus.completed || automatedFileStatus.loading
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            onClick={() => router.push(`/Module_1/Computer_Basics/File_Management/Automation?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <Settings /> 
            {automatedFileStatus.completed ? "Completed" : "Automation Journey"}
          </button>
        </div>
      )
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

  return <Timeline data={generateTimelineData()} name="File Management Quest" />;
};

const FileManagementQuest = () => {
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

export default FileManagementQuest;