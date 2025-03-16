"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Cookies from "js-cookie";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function Home() {
  const router = useRouter();
  const params = useSearchParams();
  
  // Extract parameters from URL
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

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

  const handleLogin = async () => {
    if (!studentId.trim() || !password.trim()) {
      setError("Please enter both student ID and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Verify if the student exists with the given studentId
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('password', password)
        .eq('student_id', studentId)
        .eq('principle_id', principalId)
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .eq('status', 'active')
        .single();

      if (studentError || !student) {
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

      // Redirect to dashboard
      router.push(`/Student_UI/Student_Flow/BackStory?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid student ID or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show error if required parameters are missing
  if (!principalId || !schoolId || !teacherId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Missing required parameters. Please use a valid login link.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
      
      {/* Content container */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-5xl tracking-tighter font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            Sankan Academy
          </h1>
          <p className="text-slate-400">Welcome to your learning journey</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-slate-800 pb-5">
            <CardTitle className="text-2xl font-bold text-slate-100">Student Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900 text-red-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-sm font-medium text-slate-300">
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your student ID"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-700"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-700"
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const Login = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="h-16 w-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-b-transparent border-l-transparent border-r-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-r-purple-400 border-t-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    }>
      <Home />
    </Suspense>
  );
};

export default Login;