"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Book, Trophy, Brain, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Types
interface Scenario {
  id: number;
  title: string;
  description: string;
  type: ScenarioType;
  options: Option[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Option {
  id: number;
  text: string;
  feedback: string;
}

type ScenarioType = 'phishing' | 'impersonation' | 'baiting' | 'pretexting';

interface PlayerStats {
  level: number;
  xp: number;
  correctAnswers: number;
  defenseMastery: number;
  streak: number;
}

const SecurityDefender: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 1,
    xp: 0,
    correctAnswers: 0,
    defenseMastery: 0,
    streak: 0,
  });

  const scenarios: Scenario[] = [
    {
      id: 1,
      title: "Suspicious Email Alert",
      description: "You receive an urgent email from 'IT Support' requesting your login credentials for system maintenance. The email address is support.desk123@techhelp.com. What do you do?",
      type: "phishing",
      options: [
        {
          id: 1,
          text: "Provide the requested information immediately to avoid system issues",
          feedback: "Never share login credentials via email, even if it appears to be from IT support."
        },
        {
          id: 2,
          text: "Forward the email to your company's official IT security team for verification",
          feedback: "Excellent! Always verify suspicious requests through official channels."
        },
        {
          id: 3,
          text: "Reply asking for more details about the maintenance",
          feedback: "Engaging with potential phishing emails can confirm your email is active."
        }
      ],
      correctIndex: 1,
      explanation: "IT support will never ask for your credentials via email. This is a common phishing tactic.",
      difficulty: "easy"
    }
    // Add more scenarios here
  ];

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = optionIndex === scenarios[currentScenario].correctIndex;
    const newStats = { ...playerStats };
    
    if (isCorrect) {
      newStats.correctAnswers++;
      newStats.streak++;
      newStats.xp += 10 * newStats.streak;
      newStats.defenseMastery += 5;
      
      if (newStats.xp >= 100) {
        newStats.level++;
        newStats.xp = newStats.xp - 100;
      }
    } else {
      newStats.streak = 0;
    }
    
    setPlayerStats(newStats);
  };

  const getDefenseTitle = (): string => {
    if (playerStats.defenseMastery <= 20) return 'Rookie Defender';
    if (playerStats.defenseMastery <= 40) return 'Security Apprentice';
    if (playerStats.defenseMastery <= 60) return 'Defense Specialist';
    if (playerStats.defenseMastery <= 80) return 'Security Expert';
    return 'Master Guardian';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Social Engineering Defense Training
            </CardTitle>
            <Badge variant="outline" className="text-lg">
              {getDefenseTitle()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Level {playerStats.level}</Badge>
              <Badge variant="secondary">XP: {playerStats.xp}/100</Badge>
              <Badge variant="secondary">Streak: {playerStats.streak}</Badge>
            </div>
          </div>
          
          <Progress value={playerStats.defenseMastery} className="mt-2" />
        </CardHeader>

        <CardContent className="space-y-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-4">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {scenarios[currentScenario].title}
                  </h3>
                  <p className="text-gray-600">
                    {scenarios[currentScenario].description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {scenarios[currentScenario].options.map((option, index) => (
                  <Button
                    key={option.id}
                    variant={selectedOption === index ? "secondary" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => handleOptionSelect(index)}
                    disabled={showFeedback}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>

              {showFeedback && (
                <Alert className="mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Feedback</AlertTitle>
                  <AlertDescription>
                    {scenarios[currentScenario].options[selectedOption!].feedback}
                    <br />
                    <span className="font-semibold mt-2 block">
                      {scenarios[currentScenario].explanation}
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowFeedback(false);
                setSelectedOption(null);
                setCurrentScenario(prev => 
                  prev > 0 ? prev - 1 : scenarios.length - 1
                );
              }}
            >
              Previous Scenario
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowFeedback(false);
                setSelectedOption(null);
                setCurrentScenario(prev => 
                  prev < scenarios.length - 1 ? prev + 1 : 0
                );
              }}
            >
              Next Scenario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDefender;