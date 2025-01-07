"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sword, Shield, Scroll, Cpu, Brain, Server, Rocket } from "lucide-react";

interface Requirement {
  id: "length" | "uppercase" | "lowercase" | "number" | "special";
  label: string;
  met: boolean;
}

interface CrackTimes {
  human: string;
  computer: string;
  supercomputer: string;
  quantum: string;
}

interface ComputerSpeeds {
  human: number;
  computer: number;
  supercomputer: number;
  quantum: number;
}

const PasswordSamurai: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [strength, setStrength] = useState<number>(0);
  const [crackTimes, setCrackTimes] = useState<CrackTimes>({
    human: "",
    computer: "",
    supercomputer: "",
    quantum: "",
  });

  const requirements: Requirement[] = [
    { id: "length", label: "At least 8 characters long", met: false },
    { id: "uppercase", label: "Contains uppercase letter", met: false },
    { id: "lowercase", label: "Contains lowercase letter", met: false },
    { id: "number", label: "Contains number", met: false },
    { id: "special", label: "Contains special character", met: false },
  ];

  const [checklist, setChecklist] = useState<Requirement[]>(requirements);

  const formatTime = (seconds: number): string => {
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
    return "Centuries";
  };

  const calculateStrength = (pass: string): void => {
    const newChecklist: Requirement[] = [...checklist];

    newChecklist[0].met = pass.length >= 8;
    newChecklist[1].met = /[A-Z]/.test(pass);
    newChecklist[2].met = /[a-z]/.test(pass);
    newChecklist[3].met = /[0-9]/.test(pass);
    newChecklist[4].met = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    setChecklist(newChecklist);

    const metCount: number = newChecklist.filter((req) => req.met).length;
    setStrength(metCount * 20);

    // Calculate character space
    const possibleChars: number =
      (newChecklist[1].met ? 26 : 0) +
      (newChecklist[2].met ? 26 : 0) +
      (newChecklist[3].met ? 10 : 0) +
      (newChecklist[4].met ? 30 : 0);

    const combinations: number = Math.pow(possibleChars, pass.length);

    const speeds: ComputerSpeeds = {
      human: 1,
      computer: 1000000,
      supercomputer: 1000000000,
      quantum: 1000000000000,
    };

    const times: CrackTimes = {
      human: formatTime(combinations / speeds.human),
      computer: formatTime(combinations / speeds.computer),
      supercomputer: formatTime(combinations / speeds.supercomputer),
      quantum: formatTime(combinations / speeds.quantum),
    };

    setCrackTimes(times);
  };

  useEffect(() => {
    calculateStrength(password);
  }, [password, calculateStrength]);

  const getStrengthTitle = (): string => {
    if (strength <= 20) return "Novice";
    if (strength <= 40) return "Apprentice";
    if (strength <= 60) return "Warrior";
    if (strength <= 80) return "Master";
    return "Samurai";
  };

  const getStrengthColor = (): string => {
    if (strength <= 20) return "bg-red-500";
    if (strength <= 40) return "bg-orange-500";
    if (strength <= 60) return "bg-yellow-500";
    if (strength <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const canProceed = checklist.every((req) => req.met);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="border-2">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sword className="h-6 w-6" />
              Password Samurai Challenge
            </CardTitle>
            <Badge variant="outline" className="text-lg">
              {getStrengthTitle()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="text-lg"
            />
            <Progress value={strength} className={`h-2 ${getStrengthColor()}`} />
          </div>

          <Card className="bg-zinc-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5" />
              <h3 className="font-semibold">Password Requirements</h3>
            </div>
            <div className="space-y-2">
              {checklist.map((requirement) => (
                <div key={requirement.id} className="flex items-center space-x-2">
                  <Checkbox checked={requirement.met} />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {requirement.label}
                  </label>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-black text-green-500 p-4 font-mono text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Scroll className="h-5 w-5" />
              <h3 className="font-semibold">Password Cracking Analysis</h3>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" /> Human: {crackTimes.human}
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Computer: {crackTimes.computer}
              </div>
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" /> Supercomputer: {crackTimes.supercomputer}
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4" /> Quantum Computer: {crackTimes.quantum}
              </div>
            </div>
          </Card>

          {canProceed && (
            <button
              className="w-1/4 ml-[75%] mt-4 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => alert("Next Step")}
            >
              Next
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordSamurai;
