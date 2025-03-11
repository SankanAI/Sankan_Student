"use client";
import React from 'react';
import { Timeline } from "@/components/ui/timeline";
import { Shield, ShieldAlert } from 'lucide-react';
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from "js-cookie";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCryptoUtils } from "@/app/Custom_Hooks/cryptoUtils";


const Home = () => {
  const router = useRouter();
  const params = useSearchParams();
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || '';
  const {decryptData} =useCryptoUtils();
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userIdCookie = Cookies.get('userId');
    if (userIdCookie) {
      const decryptedId = decryptData(userIdCookie);
      setUserId(decryptedId);
    } else {
      console.log(userId)
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    }
  }, []);

  const generateTimelineData = () => [
    {
      title: "Rookie Agent",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Rookie Agent: Internet Safety Fundamentals
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            Learn core internet safety skills and build your first line of digital defense.
          </p>
          <div className="mt-6 flex gap-4">
            <span className="rounded-full px-3 py-1 bg-emerald-400 hover:bg-emerald-500 cursor-pointer">
              4 Beginner Modules
            </span>
            <span className="rounded-full px-3 py-1 bg-orange-300 hover:bg-orange-400 cursor-pointer">
              Basic Protection Techniques
            </span>
          </div>
          <button 
            className="rounded-full flex items-center gap-2 px-4 py-2 mt-5 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <Shield /> Start Rookie Agent Journey
          </button>
        </div>
      ),
    },
    {
      title: "Field Samurai",
      content: (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight">
            Field Samurai: Advanced Cyber Defense
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">
            Elevate your cybersecurity skills with advanced defensive strategies.
          </p>
          <div className="mt-6 flex gap-4">
            <span className="rounded-full px-3 py-1 bg-red-400 hover:bg-red-500 cursor-pointer">
              3 Advanced Modules
            </span>
            <span className="rounded-full px-3 py-1 bg-purple-300 hover:bg-purple-400 cursor-pointer">
              Threat Mitigation
            </span>
          </div>
          <button 
            className="rounded-full flex items-center gap-2 px-4 py-2 mt-5 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => router.push(`/Module_1/Computer_Basics/Internet_Safety/Field_Samurai?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
          >
            <ShieldAlert /> Start Field Samurai Journey
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

  return <Timeline data={generateTimelineData()} name="Internet Safety Quest" />;
};

const InternetSafetyQuest = () => {
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

export default InternetSafetyQuest;