"use client";
import React from 'react';
import { Shield, Lock, Globe, Users, ShieldAlert, Wifi, PhoneCall, LucideIcon } from 'lucide-react';
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from "js-cookie";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define interfaces for the module data structure
interface ModuleData {
  title: string;
  icon: LucideIcon;
  isCompleted?: boolean;
  onClick: () => void;
  category: string;
}

// Props interface for ModuleBox component
interface ModuleBoxProps extends ModuleData {
  isLast?: boolean;
}

// Props interface for ModuleRow component
interface ModuleRowProps {
  title: string;
  modules: ModuleData[];
}

// Interface for query parameters
interface QueryParams {
  principalId: string | null;
  schoolId: string | null;
  teacherId: string | null;
}

const ModuleBox: React.FC<ModuleBoxProps> = ({ 
  title, 
  icon: Icon, 
  isCompleted, 
  onClick, 
  isLast = false,
  category
}) => (
  <div className="flex items-center group">
    <div 
      className={`w-64 p-4 border-2 ${
        isCompleted ? 'bg-gray-200 border-gray-400' : 'bg-white hover:bg-blue-50 border-blue-500'
      } rounded-lg cursor-pointer transition-all duration-300 shadow-md`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`${isCompleted ? 'text-gray-500' : 'text-blue-500'}`} size={24} />
        <span className={`text-xs font-semibold ${
          isCompleted ? 'text-gray-500' : 'text-blue-600'
        }`}>{category}</span>
      </div>
      <h3 className={`font-semibold ${isCompleted ? 'text-gray-500' : 'text-gray-800'}`}>
        {title}
      </h3>
    </div>
    {!isLast && (
      <div className="w-8 h-0.5 bg-blue-300 group-hover:bg-blue-500 transition-colors duration-300" />
    )}
  </div>
);

const ModuleRow: React.FC<ModuleRowProps> = ({ title, modules }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
    <div className="flex flex-wrap gap-y-4">
      {modules.map((module, index) => (
        <ModuleBox
          key={module.title}
          {...module}
          isLast={index === modules.length - 1}
        />
      ))}
    </div>
  </div>
);

// Type for decryption function
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

const Home: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || '';
  
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

  const rookieAgentModules: ModuleData[] = [
    {
      title: "Encryption Basics",
      icon: Lock,
      isCompleted: false,
      onClick: () => router.push(`/Module_1/Internet_Safety/Rookie_Agent/Encryption?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`),
      category: "1a"
    },
    {
      title: "Password Security",
      icon: Shield,
      isCompleted: false,
      onClick: () => router.push(`/Module_1/Internet_Safety/Rookie_Agent/Password?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`),
      category: "1b"
    },
    {
      title: "Safe Browsing",
      icon: Globe,
      isCompleted: false,
      onClick: () => router.push(`/Module_1/Internet_Safety/Rookie_Agent/Safe_Browser?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`),
      category: "1c"
    },
    {
      title: "Social Engineering",
      icon: Users,
      isCompleted: false,
      onClick: () => router.push(`/Module_1/Internet_Safety/Rookie_Agent/Social_Engineering?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`),
      category: "1d"
    }
  ];

  const fieldSamuraiModules: ModuleData[] = [
    {
      title: "Antivirus Protection",
      icon: ShieldAlert,
      isCompleted: false,
      onClick: () => router.push(`/Module_1/Internet_Safety/Field_Samurai/Antivirus?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`),
      category: "2a"
    },
    {
      title: "Firewall Config",
      icon: Wifi,
      isCompleted: false,
      onClick: () => router.push(`/Module_1/Internet_Safety/Field_Samurai/Firewall?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`),
      category: "2b"
    },
    {
      title: "Phishing Defense",
      icon: PhoneCall,
      isCompleted: false,
      onClick: () => router.push(`/Module_1/Internet_Safety/Field_Samurai/Phishing?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`),
      category: "2c"
    }
  ];

  useEffect(() => {
    const userIdCookie = Cookies.get('userId');
    if (userIdCookie) {
      const decryptedId = decryptData(userIdCookie, secretKey);
      setUserId(decryptedId);
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    }
  }, [principalId, schoolId, teacherId, router, secretKey]);

  if (!principalId || !schoolId || !teacherId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
        <Alert variant="destructive">
          <AlertDescription>Missing required parameters</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Internet Safety Quest</h1>
      <ModuleRow title="Rookie Agent" modules={rookieAgentModules} />
      <ModuleRow title="Field Samurai" modules={fieldSamuraiModules} />
    </div>
  );
};

const InternetSafetyQuest: React.FC = () => {
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