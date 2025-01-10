"use client";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BackStory() {
  const video = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true); // State to track loading
  const router = useRouter();
  const params = useSearchParams();
  
  // Extract parameters from URL
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

  const handleVideoLoad = () => {
    setLoading(false); // Video has loaded
  };

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
    <>
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Card className="bg-gray-900 border-none">
          <h1 className="text-center text-5xl tracking-tighter animate-fade">
            Welcome to Sankan Kingdom
          </h1>
          <CardContent>
            {/* Show loading indicator while the video is loading */}
            {loading && (
              <div className="flex justify-center items-center h-[394px] w-[700px] rounded-[3vh] bg-gray-700">
                <p className="text-white animate-pulse">Loading...</p>
              </div>
            )}
            <video
              onLoadedData={handleVideoLoad} // Hide loading once video data is available
              onEnded={() => {
                router.push(`/Student_UI/Student_Flow/Avatar_Selection?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
              }}
              ref={video}
              style={{ width: "700px", display: loading ? "none" : "block" }} // Hide video until it's loaded
              className="rounded-[3vh] animate-fadeInCard"
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
              className="rounded-full"
              onClick={() => {
                if (video.current) {
                  video.current.play();
                }
              }}
            >
              Play
            </Button>
            <Button
              className="bg-[#6d28d9] rounded-full"
              onClick={() => {
                router.push(`/Student_UI/Student_Flow/Avatar_Selection?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
              }}
            >
              Skip
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
