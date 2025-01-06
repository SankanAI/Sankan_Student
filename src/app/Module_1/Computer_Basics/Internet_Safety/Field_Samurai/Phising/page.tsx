"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mail, AlertTriangle, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

interface Threat {
  id: string;
  type: string;
  description: string;
}

interface PhishingEmail {
  id: number;
  from: string;
  subject: string;
  date: string;
  content: string;
  threats: Threat[];
  points: number;
}

const phishingEmails: PhishingEmail[] = [
  {
    id: 1,
    from: 'security@app1e.com',
    subject: 'Urgent: Your Account Security is at Risk',
    date: '2024-01-06 10:30 AM',
    content: `Dear Valued Customer,

We've detected suspicious activity on your account. Click the link below immediately to verify your identity and secure your account:

https://app1e.security-verify.com/login

If you don't verify within 24 hours, your account will be suspended.

Best regards,
Security Team`,
    threats: [
      { id: 'spoofed-domain', type: 'Spoofed Domain', description: 'Notice the number "1" in Apple' },
      { id: 'urgency', type: 'False Urgency', description: 'Creating panic with time pressure' },
      { id: 'suspicious-link', type: 'Suspicious Link', description: 'Misleading URL in link' }
    ],
    points: 30
  },
  {
    id: 2,
    from: 'hr.department@company-careers.net',
    subject: 'Job Opportunity - Immediate Start',
    date: '2024-01-06 2:15 PM',
    content: `Hi there,

Based on your profile, we'd like to offer you a work-from-home position at our company.
Salary: $8,000 - $10,000 per month
Hours: Flexible

To start immediately, please fill out your details here:
www.company-careers.net/apply

Requirements:
- No experience needed
- Work from home
- Quick start

Best regards,
HR Department`,
    threats: [
      { id: 'too-good', type: 'Too Good To Be True', description: 'Unrealistic salary offer' },
      { id: 'generic-greeting', type: 'Generic Greeting', description: 'No specific recipient name' },
      { id: 'suspicious-sender', type: 'Suspicious Sender', description: 'Generic company name' }
    ],
    points: 25
  }
];

const PhishingGame = () => {
  const [currentEmail, setCurrentEmail] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [identifiedThreats, setIdentifiedThreats] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (text) {
      setSelectedText(text);
      setShowDialog(true);
    }
  };

  const handleThreatIdentification = (threatId: string) => {
    if (!identifiedThreats.includes(threatId)) {
      setIdentifiedThreats([...identifiedThreats, threatId]);
      setScore(score + 10);
    }
  };

  const handleNextEmail = () => {
    if (currentEmail + 1 < phishingEmails.length) {
      setCurrentEmail(currentEmail + 1);
      setIdentifiedThreats([]);
    } else {
      setGameComplete(true);
    }
  };

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
              <Badge variant="secondary">Score: {score}</Badge>
              <Progress value={(currentEmail / phishingEmails.length) * 100} className="w-32" />
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
            <h3 className="font-semibold">Identified Threats:</h3>
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
            <Button 
              onClick={handleNextEmail}
              disabled={identifiedThreats.length === 0}
            >
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
              "{selectedText}"
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
            <DialogDescription>
              Final Score: {score} points
            </DialogDescription>
            <p>You've successfully completed the phishing email detection training.</p>
            <Button onClick={() => window.location.reload()}>
              Start New Training
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PhishingGame;