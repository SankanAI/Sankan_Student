
"use client";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import React, {useRef} from "react";
import {useRouter} from "next/navigation";

export default function backStory(){

  const video=useRef<HTMLVideoElement>(null);
  const router = useRouter()

    return <>
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <Card className="bg-gray-900 border-none">
          <h1 className="text-center text-5xl tracking-tighter animate-fade">
            Welcome to Sankan Kingdom
          </h1>
      <CardContent>
        <video onEnded={()=>{router.push('/Student_UI/Student_Flow/Avatar_Selection')}} ref={video} style={{width:"700px"}} className="rounded-[3vh] animate-fadeInCard">
          <source src="https://cdn.pixabay.com/video/2024/12/31/249884.mp4" type="video/mp4"/>
        </video>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="rounded-full" onClick={()=>{if(video.current){video.current.play();}}}>Play</Button>
        <Button className="bg-[#6d28d9] rounded-full" onClick={()=>{router.push('/Student_UI/Student_Flow/Avatar_Selection')}}>Skip</Button>
      </CardFooter>
    </Card>
    </div>
  </>
}