// pages/teacher/login.tsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
    svg += `<rect width="100%" height="100%" fill="#f0f0f0"/>`;

    for (let i = 0; i < 10; i++) {
      svg += `<line x1="${Math.random() * width}" y1="${Math.random() * height}" 
                   x2="${Math.random() * width}" y2="${Math.random() * height}" 
                   stroke="#${Math.floor(Math.random() * 16777215).toString(16)}" stroke-width="1"/>`;
    }

    text.split('').forEach((char, index) => {
      svg += `<text x="${30 * (index + 1)}" y="40" font-size="30" 
                   fill="#${Math.floor(Math.random() * 16777215).toString(16)}">${char}</text>`;
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
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Teacher Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <Label>Teacher ID</Label>
                <Input value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required />
              </div>
              <div>
              </div>
              <div>
                <Label>Captcha</Label>
                <div className="flex items-center">
                  <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                  <Button type="button" variant="outline" onClick={refreshCaptcha}>
                    <RefreshCw size={16} />
                  </Button>
                </div>
                <Input value={userCaptchaInput} onChange={(e) => setUserCaptchaInput(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
