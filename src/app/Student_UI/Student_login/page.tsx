"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams} from "next/navigation";
import { useState, Suspense } from "react";
import Cookies from "js-cookie";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';



function Home() {

  const router = useRouter();
  const params = useSearchParams();
  
  // Extract parameters from URL
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

  const [studentId, setstudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const secretKey= process.env.NEXT_PUBLIC_SECRET_KEY;

  const encryptData = (text: string): string => {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(secretKey).slice(0, 16); // Use the first 16 bytes for AES key
    const iv = crypto.getRandomValues(new Uint8Array(16)); // Initialization vector
    const ivString = btoa(String.fromCharCode(...iv));
    
    const textBytes = encoder.encode(text);
    const encryptedBytes = textBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]); // XOR for encryption
    
    const encryptedString = btoa(String.fromCharCode(...encryptedBytes));
    return `${ivString}.${encryptedString}`;
  };

  // const decryptData = (encryptedText: string): string => {
  //   const [ivBase64, encryptedBase64] = encryptedText.split('.');
  //   if (!ivBase64 || !encryptedBase64) return ''; 
  //   const encoder = new TextEncoder();
  //   const keyBytes = encoder.encode(secretKey).slice(0, 16); // Use the first 16 bytes for AES key
  //   const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  //   const decryptedBytes = encryptedBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]); // XOR for decryption
  //   return new TextDecoder().decode(decryptedBytes);
  // };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      // First, verify if the student exists with the given studentId
      const { data: student, error: studentError } = await supabase
        .from('students')  // Assuming you have a students table
        .select('id')
        .eq('password', password)
        .eq('student_id', studentId)
        .eq('principle_id', principalId)
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .eq('status', 'active')
        .single();

      if (studentError || !student) {
        console.log(studentError, student)
        throw new Error('Invalid credentials');
      }

      // Encrypt the user ID before storing in cookie
      const encryptedId = encryptData(student.id);
      
      // Set cookies with encrypted ID and role
      Cookies.set("userId", encryptedId, {
        expires: 1/24,
        secure: true,
        sameSite: "strict"
      });

      Cookies.set("userRole", "student", {
        expires: 1/24,
        secure: true,
        sameSite: "strict"
      });

      // Store additional information if needed

      // Redirect to dashboard
      router.push(`/Student_UI/Student_Flow/BackStory?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    } catch (err) {
      console.log("Some error",err);
       setError("Some Error")
    } finally {
      setLoading(false);
      console.log(loading)
    }
  };

  // Add validation for required parameters
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
    <div className="relative min-h-screen flex-col bg-gray-950 w-full ">
    <main className="justify-center px-4 sm:px-40 py-5">
      <div className="w-full lg:w-full md:w-[450px] py-5">
        <div 
          className="rounded-xl bg-cover bg-center w-full min-h-[700px] md:min-h-[700px] lg:min-h-[700px] relative"
          style={{
            backgroundImage: `url("https://cdn.usegalileo.ai/sdxl10/6b462333-622b-4954-a109-51445dde8827.png")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
            <div className="flex flex-col gap-6 items-center justify-center ">
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl mt-[3vh] w-[390px] lg:w-[full] p-2 rounded-[1vh]" style={{background:`url("https://cdn.pixabay.com/photo/2015/06/20/07/24/color-815550_960_720.png")`}}>
                  Welcome to Sankan Academy
                </h1>
              </div>

              <div 
                className="bg-[#0A0A0B] rounded-lg opacity-85 text-white p-4 w-[500px] sm:w-[390px] lg:rounded-[3vh] rounded-0 mt-[0vh] py-13"
              >
                {/* Create Account Section */}
                <div className="space-y-6 bg-[#111113] rounded-lg p-6 mb-4 ">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Login into account</h2>
                    <p className="text-gray-400">Enter your email below to create your account</p>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm mb-4">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none" htmlFor="email">
                        Student Id
                      </label>
                      <Input
                        id="name"
                        placeholder="student_id"
                        type="email"
                        value={studentId}
                        onChange={(e) => setstudentId(e.target.value)}
                        className="bg-[#1C1C1E] border-none text-white placeholder:text-gray-400 border border-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none" htmlFor="password">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-[#1C1C1E] border-none text-white"
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleLogin}
                  >
                    Login into account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const login = () => {
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

export default login;