"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mail, AlertTriangle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from "js-cookie";

// interface Threat {
//   id: string;
//   type: string;
//   description: string;
// }

const phishingEmails = [
  {
    id: 1,
    from: "support@amaz0n.com",
    subject: "Important: Verify Your Account!",
    date: "2025-01-15 9:00 AM",
    content: `Dear User,

We noticed unusual activity on your account. Please verify your account by clicking the link below:

https://amaz0n-security.com/verify

If you do not verify in the next 24 hours, your account will be locked.

Thank you, 
Amazon Support`,
    threats: [
      { id: "spoofed-domain", type: "Spoofed Domain", description: "The 'o' in 'Amazon' is replaced with '0'." },
      { id: "urgency", type: "False Urgency", description: "Forcing quick action with time pressure." },
      { id: "suspicious-link", type: "Suspicious Link", description: "Fake link not pointing to the official site." }
    ],
    points: 30
  },
  {
    id: 2,
    from: "bankalerts@secure-banking.com",
    subject: "Unauthorized Login Attempt!",
    date: "2025-01-14 4:30 PM",
    content: `Dear Customer,

Someone tried to log in to your bank account. If it wasn't you, please confirm your details here:

https://secure-banking.com/login

Failure to confirm may result in account deactivation.

Thank you, 
Your Bank`,
    threats: [
      { id: "fake-sender", type: "Fake Sender", description: "Sender not from an official bank domain." },
      { id: "suspicious-link", type: "Suspicious Link", description: "Link looks official but isn't." },
      { id: "urgency", type: "False Urgency", description: "Tries to scare the recipient into acting fast." }
    ],
    points: 30
  },
  {
    id: 3,
    from: "giveaway@prize-claims.com",
    subject: "Congratulations! You've Won a $1,000 Gift Card!",
    date: "2025-01-14 11:15 AM",
    content: `Hi there,

Congratulations! You've won a $1,000 gift card. Claim your prize by clicking the link below:

https://prize-claims.com/winner

Hurry, this offer expires soon!

Best regards, 
Prize Team`,
    threats: [
      { id: "too-good", type: "Too Good To Be True", description: "Unrealistic prize with no context." },
      { id: "generic-greeting", type: "Generic Greeting", description: "No specific recipient name mentioned." },
      { id: "urgency", type: "False Urgency", description: "Creates pressure to claim immediately." }
    ],
    points: 25
  },
  {
    id: 4,
    from: "schooladmin@report-cards.com",
    subject: "Access Your Report Card Now!",
    date: "2025-01-13 3:45 PM",
    content: `Dear Student,

Your report card is ready! Download it now by clicking the link below:

https://report-cards.com/student-login

Act fast to avoid losing access to this important document.

Best regards, 
School Admin`,
    threats: [
      { id: "spoofed-sender", type: "Spoofed Sender", description: "Looks like a school admin but is fake." },
      { id: "suspicious-link", type: "Suspicious Link", description: "Link does not belong to the school." },
      { id: "urgency", type: "False Urgency", description: "Tries to make the email seem critical." }
    ],
    points: 25
  },
  {
    id: 5,
    from: "gaming-rewards@onlinestore.net",
    subject: "Exclusive Offer: Free Game Points!",
    date: "2025-01-13 6:30 PM",
    content: `Hello Gamer,

You are selected to receive 500 free game points! Claim your reward here:

https://onlinestore.net/rewards-claim

Don't miss this once-in-a-lifetime offer.

Happy Gaming, 
Rewards Team`,
    threats: [
      { id: "too-good", type: "Too Good To Be True", description: "Promising something unrealistic for free." },
      { id: "suspicious-link", type: "Suspicious Link", description: "Fake link trying to collect personal details." },
      { id: "urgency", type: "False Urgency", description: "Claims it's a 'limited-time' offer." }
    ],
    points: 20
  },
  {
    id: 6,
    from: "helpdesk@schoolportal.net",
    subject: "Password Reset Request",
    date: "2025-01-12 10:15 AM",
    content: `Hi Student,

A password reset was requested for your account. If this was you, click the link below to reset:

https://schoolportal.net/reset-password

If this wasn’t you, please secure your account now!

Thank you, 
School Helpdesk`,
    threats: [
      { id: "spoofed-sender", type: "Spoofed Sender", description: "Sender address isn't the real school portal." },
      { id: "suspicious-link", type: "Suspicious Link", description: "Link tries to collect login credentials." },
      { id: "urgency", type: "False Urgency", description: "Creates panic about account safety." }
    ],
    points: 25
  },
  {
    id: 7,
    from: "events@freeconcert.com",
    subject: "Win Free Tickets to the Hottest Concert!",
    date: "2025-01-11 1:00 PM",
    content: `Hey there,

You're invited to win free tickets to this year's biggest concert! Click below to participate:

https://freeconcert.com/win-tickets

Hurry, only a few spots left!

Cheers, 
Event Team`,
    threats: [
      { id: "too-good", type: "Too Good To Be True", description: "Offering something valuable for free." },
      { id: "urgency", type: "False Urgency", description: "Says spots are limited to create panic." },
      { id: "suspicious-link", type: "Suspicious Link", description: "Redirects to a fake website." }
    ],
    points: 20
  },
  {
    id: 8,
    from: "friend@gamegiveaway.com",
    subject: "Friend Sent You a Gift Card!",
    date: "2025-01-10 5:00 PM",
    content: `Hi there,

Your friend sent you a $50 gift card. Redeem it here:

https://gamegiveaway.com/redeem-card

Don't wait! Claim before it expires.

Best regards, 
Game Giveaway`,
    threats: [
      { id: "fake-sender", type: "Fake Sender", description: "Pretending to be someone you know." },
      { id: "suspicious-link", type: "Suspicious Link", description: "Leads to a fake page asking for info." },
      { id: "urgency", type: "False Urgency", description: "Tries to make you act quickly." }
    ],
    points: 20
  },
  {
    id: 9,
    from: "delivery@packagetrack.com",
    subject: "Your Package is Delayed!",
    date: "2025-01-10 8:15 AM",
    content: `Dear Customer,

Your package delivery is delayed. Track your package now by clicking the link below:

https://packagetrack.com/delivery-status

We're sorry for any inconvenience caused.

Thank you, 
Delivery Team`,
    threats: [
      { id: "suspicious-link", type: "Suspicious Link", description: "Link mimics a real tracking service." },
      { id: "spoofed-sender", type: "Spoofed Sender", description: "Pretends to be a real delivery service." },
      { id: "urgency", type: "False Urgency", description: "Pushes for immediate action." }
    ],
    points: 25
  },
  {
    id: 10,
    from: "updates@schoolapp.co",
    subject: "Your Grades Have Been Updated!",
    date: "2025-01-09 9:30 PM",
    content: `Dear Student,

Your grades have been updated. Click below to view your progress:

https://schoolapp.co/view-grades

Best regards, 
School Updates`,
    threats: [
      { id: "spoofed-sender", type: "Spoofed Sender", description: "Fake sender mimicking a school portal." },
      { id: "suspicious-link", type: "Suspicious Link", description: "Tries to steal login credentials." },
      { id: "urgency", type: "False Urgency", description: "Creates a false need to check immediately." }
    ],
    points: 30
  }
];

type PhishingSchema = {
  id: string;
  field_agent_id: string | null;
  student_id: string;
  total_score: number | null;
  score:number | null;
  total_emails: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  last_activity: string;
};
const PhishingGame = () => {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();
  const [currentEmail, setCurrentEmail] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [identifiedThreats, setIdentifiedThreats] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const totalPoints = phishingEmails.reduce((sum, email) => sum + email.points, 0);
  const [userId, setUserId] = useState<string | null>(null);
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');
  const [progressRecord, setProgressRecord] = useState<PhishingSchema | null>(null);
  const [phishingCompleted, setIsphishingCompleted] = useState<boolean>(false);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (text) {
      setSelectedText(text);
      setShowDialog(true);
    }
  };

  const handleThreatIdentification = (threatId: string) => {
    const email = phishingEmails[currentEmail];
    const threat = email.threats.find(t => t.id === threatId);
    
    if (identifiedThreats.includes(threatId)) {
      // Remove the threat if already identified (toggle off)
      setIdentifiedThreats(prev => prev.filter(id => id !== threatId));
      setScore(prevScore => prevScore - (threat ? Math.ceil(email.points / email.threats.length) : 10));
    } else {
      // Add the threat if not identified (toggle on)
      setIdentifiedThreats(prev => [...prev, threatId]);
      setScore(prevScore => prevScore + (threat ? Math.ceil(email.points / email.threats.length) : 10));
    }
  };

  const handleNextEmail = async () => {
    if (currentEmail + 1 < phishingEmails.length) {
      setCurrentEmail(currentEmail + 1);
      setIdentifiedThreats([]);
    } else {
      setGameComplete(true);
      if (progressRecord?.id) {
        await supabase
          .from('phishing')
          .update({
            score: score,
            completed: true,
            completed_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          })
          .eq('id', progressRecord.id);
      }
    }
  };

 
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

  const initializeProgressRecord = async (studentId: string) => {
    try {
      const { data: computerBasicsData, error: computerBasicsError } = await supabase
        .from('computer_basics')
        .select('id')
        .eq('student_id', studentId)
        .single();

      if (computerBasicsError || !computerBasicsData) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Mouse_Movement?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      const { data: internet_safetyData, error: internet_safetyError } = await supabase
        .from('internet_safety')
        .select('id')
        .eq('computer_basics_id', computerBasicsData?.id)
        .eq('student_id', studentId)
        .single();

      if (internet_safetyError || !internet_safetyData) {
        router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent/passwords?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      const { data: questData, error:questError } = await supabase
        .from('field_agent')
        .select('id')
        .eq('internet_safety_id', internet_safetyData?.id)
        .eq('student_id', studentId)
        .single();

      if (questError || !questData) {
        router.push(`/Module_1/Computer_Basics/Internet_Safety/Field_Samurai/Antivirus?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      const { data: existingRecord } = await supabase
        .from('phishing')
        .select('*')
        .eq('field_agent_id', questData?.id)
        .eq('student_id', studentId)
        .single();

      if (existingRecord) {
        setProgressRecord(existingRecord);
      } else {
        const { data: newRecord, error: insertError } = await supabase
          .from('phishing')
          .insert([{
            field_agent_id: questData?.id,
            student_id: studentId,
            total_score: totalPoints,
            score:null,
            total_emails: 10,
            completed: false,
            started_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        if (newRecord) {
          setProgressRecord(newRecord);
        }
      }
    } catch (error) {
      console.log('Error in initializeProgressRecord:', error);
    }
  };

  const updateProgress = async () => {
    if (!progressRecord || !userId) return;

    try {
      const { error } = await supabase
        .from('phishing')
        .update({
          completed: true,
          last_activity: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', progressRecord.id);

      if (error) throw error;

      setIsphishingCompleted(true);
    } catch (error) {
      console.log('Error updating progress:', error);
    }
  };
  
  useEffect(() => {
    const checkCompletion = async (decryptedId: string) => {
      try {
        const { data: phishingData, error } = await supabase
          .from('phishing')
          .select('completed')
          .eq('student_id', decryptedId)
          .single();

        if (error) throw error;
        
        if (phishingData?.completed) {
          setIsphishingCompleted(true);
          router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        }
      } catch (error) {
        console.log('Error checking completion status:', error);
      }
    };

    

    if(Cookies.get('userId')) {
      const decryptedId = decryptData(Cookies.get('userId')!);
      console.log("Decrypted userId:", decryptedId);
      setUserId(decryptedId);
      checkCompletion(decryptedId);
      if (!phishingCompleted) {
        initializeProgressRecord(decryptedId);
      }
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)
    }
  },[userId])

  const email = phishingEmails[currentEmail];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Mail className="w-8 h-8 text-blue-500" />
              <CardTitle>Phishing Email Detection Training</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                Email {currentEmail + 1} of {phishingEmails.length}
              </Badge>
              <Badge variant="secondary">Score: {score}/{totalPoints}</Badge>
              <Progress 
                value={(currentEmail / phishingEmails.length) * 100} 
                className="w-32" 
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold">From: {email.from}</p>
                <p className="font-semibold">Subject: {email.subject}</p>
              </div>
              <p className="text-gray-500">{email.date}</p>
            </div>
            
            <Separator className="my-4" />
            
            <div 
              className="whitespace-pre-line min-h-[200px] p-4"
              onMouseUp={handleTextSelection}
            >
              {email.content}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Identify Threats (Click to toggle):</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {email.threats.map(threat => (
                <TooltipProvider key={threat.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={identifiedThreats.includes(threat.id) ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handleThreatIdentification(threat.id)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {threat.type}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{threat.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Alert className="w-full mr-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Select suspicious text to analyze potential threats
              </AlertDescription>
            </Alert>
            <Button onClick={handleNextEmail}>
              {currentEmail + 1 < phishingEmails.length ? 'Next Email' : 'Complete Training'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analyze Selected Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded my-2">
              &quot;{selectedText}&quot;
            </div>
            <DialogDescription>
              Why is this text suspicious?
            </DialogDescription>
            {email.threats.map(threat => (
              <Button
                key={threat.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  handleThreatIdentification(threat.id);
                  setShowDialog(false);
                }}
              >
                {threat.type}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {gameComplete && (
        <Dialog open={gameComplete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Training Complete!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>You&apos;ve successfully completed the phishing email detection training.</p>
              <p>Final Score: {score} out of {totalPoints}</p>
              <p>Emails Analyzed: {phishingEmails.length}</p>
              <Button onClick={updateProgress}>
                Start New Training
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const PhishingGameApp = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PhishingGame />
    </Suspense>
  );
};

export default PhishingGameApp;