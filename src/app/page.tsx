// pages/teacher/login.tsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Initialize Supabase client (replace with your actual Supabase URL and anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TeacherLogin() {
  const [teacherId, setTeacherId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const [captchaText, setCaptchaText] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');

  const router = useRouter();

  const generateCaptchaText = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  const generateCaptchaSvg = useCallback((text: string) => {
    const width = 220;
    const height = 60;
    // Using lighter colors for better visibility against dark background
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
    svg += `<rect width="100%" height="100%" fill="#1e293b"/>`; // Dark blue-gray background

    // Add noise lines in lighter colors
    for (let i = 0; i < 10; i++) {
      const color = `#${Math.floor(Math.random() * 0x999999 + 0x666666).toString(16)}`;
      svg += `<line x1="${Math.random() * width}" y1="${Math.random() * height}" 
                   x2="${Math.random() * width}" y2="${Math.random() * height}" 
                   stroke="${color}" stroke-width="1"/>`;
    }

    // Add text in light colors
    text.split('').forEach((char, index) => {
      const color = `#${Math.floor(Math.random() * 0x666666 + 0x999999).toString(16)}`;
      svg += `<text x="${30 * (index + 1)}" y="40" font-size="30" 
                   fill="${color}" font-family="monospace">${char}</text>`;
    });

    svg += '</svg>';
    return svg;
  }, []);

  const refreshCaptcha = useCallback(() => {
    const newCaptchaText = generateCaptchaText();
    setCaptchaText(newCaptchaText);
    setCaptchaSvg(generateCaptchaSvg(newCaptchaText));
    setUserCaptchaInput('');
  }, [generateCaptchaText, generateCaptchaSvg]);

  useEffect(() => {
    refreshCaptcha();
    const storedAttempts = localStorage.getItem('loginAttempts');
    if (storedAttempts) setLoginAttempts(parseInt(storedAttempts));

    const lockoutTime = localStorage.getItem('lockoutEndTime');
    if (lockoutTime && new Date(lockoutTime) > new Date()) {
      setIsLocked(true);
      setTimeout(() => unlockAccount(), new Date(lockoutTime).getTime() - new Date().getTime());
    }
  }, [refreshCaptcha]);

  const unlockAccount = () => {
    setIsLocked(false);
    setLoginAttempts(0);
    localStorage.removeItem('lockoutEndTime');
    localStorage.setItem('loginAttempts', '0');
  };

  const handleFailedLogin = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('loginAttempts', newAttempts.toString());

    if (newAttempts >= 5) {
      setIsLocked(true);
      const lockoutEnd = new Date(new Date().getTime() + 15 * 60 * 1000);
      localStorage.setItem('lockoutEndTime', lockoutEnd.toISOString());
      alert('Account temporarily locked due to too many failed attempts. Please try again after 15 minutes.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      alert('Your account is locked due to too many failed login attempts. Please try again later.');
      return;
    }

    if (!teacherId.trim()) {
      alert('Teacher ID is required.');
      return;
    }

    if (userCaptchaInput !== captchaText) {
      alert('CAPTCHA verification failed. Please enter the correct characters.');
      refreshCaptcha();
      return;
    }

    try {
      setIsLoading(true);
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('id, principle_id, school_id')
        .eq('teacher_id', teacherId)
        .single();

      if (error || !teacher) {
        handleFailedLogin();
        alert('Invalid Teacher ID');
        refreshCaptcha();
        return;
      }
      router.push(
        `/Student_UI/Student_login?principalId=${teacher.principle_id}&schoolId=${teacher.school_id}&teacherId=${teacherId}`
      );
    } catch (err) {
      alert(`An unexpected error occurred. Please try again later.${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="border-slate-800 bg-slate-950 shadow-lg">
          <CardHeader className="border-b border-slate-800 pb-5">
            <CardTitle className="text-3xl font-bold text-slate-100">Teacher Login</CardTitle>
            <CardDescription className="text-slate-400">Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="teacherId" className="text-sm font-medium text-slate-300">Teacher ID</Label>
                <Input 
                  id="teacherId"
                  value={teacherId} 
                  onChange={(e) => setTeacherId(e.target.value)} 
                  className="bg-slate-900 border-slate-800 text-slate-100 focus-visible:ring-slate-700"
                  placeholder="Enter your ID"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="captcha" className="text-sm font-medium text-slate-300">Security Verification</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-16 flex-grow rounded overflow-hidden border border-slate-800" 
                       dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    className="h-10 w-10 border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
                    onClick={refreshCaptcha}
                  >
                    <RefreshCw size={18} />
                  </Button>
                </div>
                <Input 
                  id="captcha"
                  value={userCaptchaInput} 
                  onChange={(e) => setUserCaptchaInput(e.target.value)} 
                  className="bg-slate-900 border-slate-800 text-slate-100 focus-visible:ring-slate-700"
                  placeholder="Enter the characters you see above"
                  required 
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}