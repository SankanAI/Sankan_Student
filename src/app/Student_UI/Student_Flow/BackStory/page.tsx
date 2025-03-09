"use client";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {useCallback} from "react";
import { Button } from "@/components/ui/button";
import React, { useRef, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Cookies from "js-cookie";

function BackStory() {
  const video = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();
 
  // Extract parameters from URL
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

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

  useEffect(() => {
    const checkStudentTeacher = async () => {
      if (!principalId || !schoolId || !teacherId) {
        setIsChecking(false);
        return;
      }

      try {
        // Assuming you have a student_id to query
        // If not, you'll need to modify this to match your authentication logic
        // const studentId = localStorage.getItem('studentId');
        
        // if (!studentId) {
        //   setIsChecking(false);
        //   return;
        // }

        // You might need to decrypt the studentId if it's stored encrypted
        const studentId = decryptData(Cookies.get('userId')!);
        console.log(studentId)
        const { data, error } = await supabase
          .from('students')
          .select('teacher')
          .eq('id', studentId)
          .single();

        if (error) {
          console.log('Error fetching student data:', error);
          setIsChecking(false);
          return;
        }

        if (data && data.teacher !== 'unassigned') {
          // If teacher is assigned, redirect to Game_Map
          router.push(`/Student_UI/Student_Flow/Game_Map?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        } else {
          // Teacher is unassigned, continue with normal flow
          setIsChecking(false);
        }
      } catch (error) {
        console.log('Error in teacher check:', error);
        setIsChecking(false);
      }
    };

    checkStudentTeacher();
  }, [principalId, schoolId, teacherId, router]);

  const handleVideoLoad = () => {
    setLoading(false);
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <Card className="bg-gray-900 border-none">
        <h1 className="text-center text-5xl tracking-tighter animate-fade text-white">
          Welcome to Sankan Kingdom
        </h1>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center h-[394px] w-[700px] rounded-[3vh] bg-gray-700">
              <p className="text-white animate-pulse">Loading...</p>
            </div>
          )}
          <video
            onLoadedData={handleVideoLoad}
            onEnded={() => {
              router.push(`/Student_UI/Student_Flow/Avatar_Selection?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
            }}
            ref={video}
            style={{ width: "700px", display: loading ? "none" : "block" }}
            className="rounded-[3vh] animate-fadeInCard"
            autoPlay
          >
            <source
              src="https://cdn.pixabay.com/video/2024/12/31/249884.mp4"
              type="video/mp4"
            />
          </video>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            className="rounded-full text-white border-white hover:bg-gray-800"
            onClick={() => {
              if (video.current) {
                video.current.play();
              }
            }}
          >
            Play
          </Button>
          <Button
            className="bg-[#6d28d9] rounded-full hover:bg-[#5b21b6]"
            onClick={() => {
              router.push(`/Student_UI/Student_Flow/Avatar_Selection?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
            }}
          >
            Skip
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const Home = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    }>
      <BackStory />
    </Suspense>
  );
};

export default Home;