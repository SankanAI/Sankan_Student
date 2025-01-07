"use client";
import React, { useState, useCallback, useMemo } from "react";
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

// Move constants outside component to prevent recreating on each render
const INITIAL_REQUIREMENTS: Requirement[] = [
  { id: "length", label: "At least 8 characters long", met: false },
  { id: "uppercase", label: "Contains uppercase letter", met: false },
  { id: "lowercase", label: "Contains lowercase letter", met: false },
  { id: "number", label: "Contains number", met: false },
  { id: "special", label: "Contains special character", met: false },
];

const COMPUTER_SPEEDS: ComputerSpeeds = {
  human: 1,
  computer: 1000000,
  supercomputer: 1000000000,
  quantum: 1000000000000,
};

const PasswordSamurai: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [strength, setStrength] = useState<number>(0);
  const [crackTimes, setCrackTimes] = useState<CrackTimes>({
    human: "",
    computer: "",
    supercomputer: "",
    quantum: "",
  });
  const [checklist, setChecklist] = useState<Requirement[]>(INITIAL_REQUIREMENTS);

  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
    return "Centuries";
  }, []);

  const calculateStrength = useCallback((pass: string): void => {
    const newChecklist = INITIAL_REQUIREMENTS.map(req => {
      const requirement = { ...req };
      switch (req.id) {
        case "length":
          requirement.met = pass.length >= 8;
          break;
        case "uppercase":
          requirement.met = /[A-Z]/.test(pass);
          break;
        case "lowercase":
          requirement.met = /[a-z]/.test(pass);
          break;
        case "number":
          requirement.met = /[0-9]/.test(pass);
          break;
        case "special":
          requirement.met = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
          break;
      }
      return requirement;
    });

    setChecklist(newChecklist);

    const metCount = newChecklist.filter((req) => req.met).length;
    setStrength(metCount * 20);

    // Calculate character space
    const possibleChars = 
      (newChecklist[1].met ? 26 : 0) + // uppercase
      (newChecklist[2].met ? 26 : 0) + // lowercase
      (newChecklist[3].met ? 10 : 0) + // numbers
      (newChecklist[4].met ? 30 : 0);  // special chars

    // Prevent 0^n calculation when no character types are selected
    if (possibleChars === 0 || pass.length === 0) {
      setCrackTimes({
        human: "Instantly",
        computer: "Instantly",
        supercomputer: "Instantly",
        quantum: "Instantly"
      });
      return;
    }

    const combinations = Math.pow(possibleChars, pass.length);

    const times: CrackTimes = {
      human: formatTime(combinations / COMPUTER_SPEEDS.human),
      computer: formatTime(combinations / COMPUTER_SPEEDS.computer),
      supercomputer: formatTime(combinations / COMPUTER_SPEEDS.supercomputer),
      quantum: formatTime(combinations / COMPUTER_SPEEDS.quantum),
    };

    setCrackTimes(times);
  }, [formatTime]);

  React.useEffect(() => {
    calculateStrength(password);
  }, [password, calculateStrength]);

  const getStrengthTitle = useCallback((): string => {
    if (strength <= 20) return "Novice";
    if (strength <= 40) return "Apprentice";
    if (strength <= 60) return "Warrior";
    if (strength <= 80) return "Master";
    return "Samurai";
  }, [strength]);

  const getStrengthColor = useCallback((): string => {
    if (strength <= 20) return "bg-red-500";
    if (strength <= 40) return "bg-orange-500";
    if (strength <= 60) return "bg-yellow-500";
    if (strength <= 80) return "bg-blue-500";
    return "bg-green-500";
  }, [strength]);

  const canProceed = useMemo(() => 
    checklist.every((req) => req.met),
    [checklist]
  );

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleNextStep = useCallback(() => {
    alert("Next Step");
  }, []);

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
              onChange={handlePasswordChange}
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
                  <Checkbox checked={requirement.met} readOnly />
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
              onClick={handleNextStep}
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