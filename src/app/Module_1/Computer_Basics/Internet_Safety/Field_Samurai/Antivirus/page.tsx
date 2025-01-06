"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Worm, Eye, Lock, Zap, Network } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaHorseHead } from "react-icons/fa";

const levels = [
  {
    id: 1,
    title: 'Basic Malware Detection',
    description: 'Learn signature-based detection',
    icon: Worm,
    challenge: 'Identify infected files using virus signatures',
    targets: ['infected_file.exe', 'safe_doc.pdf', 'malware.dll'],
    solution: [true, false, true]
  },
  {
    id: 2,
    title: 'Spyware and Adware',
    description: 'Detect hidden threats',
    icon: Eye,
    challenge: 'Find suspicious applications',
    targets: ['free_game.exe', 'system_utility.exe', 'browser_addon.js'],
    solution: [true, true, false]
  },
  {
    id: 3,
    title: 'Trojan Horses',
    description: 'Investigate suspicious files',
    icon: FaHorseHead,
    challenge: 'Identify Trojan-infected programs',
    targets: ['update.exe', 'discord.exe', 'antivirus.exe'],
    solution: [true, false, true]
  },
  {
    id: 4,
    title: 'Ransomware Attack',
    description: 'Protect against encryption',
    icon: Lock,
    challenge: 'Secure critical files',
    targets: ['financial_data.xlsx', 'backup_store.zip', 'system32.dll'],
    solution: [true, true, true]
  },
  {
    id: 5,
    title: 'Zero-Day Exploits',
    description: 'Use behavior analysis',
    icon: Zap,
    challenge: 'Detect unknown threats',
    targets: ['unknown_process.exe', 'new_driver.sys', 'startup.bat'],
    solution: [true, false, true]
  },
  {
    id: 6,
    title: 'Network-Wide Attack',
    description: 'Final challenge',
    icon: Network,
    challenge: 'Defend entire network',
    targets: ['gateway.exe', 'dns_server.exe', 'mail_server.exe'],
    solution: [true, true, true]
  }
];

const CyberGame = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [selections, setSelections] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

//   const handleFileSelect = (index) => {
//     const newSelections = [...selections];
//     newSelections[index] = !newSelections[index];
//     setSelections(newSelections);
//   };

  const handleSubmit = () => {
    const level = levels[currentLevel];
    const correct = selections.reduce((acc, selected, index) => {
      return acc + (selected === level.solution[index] ? 1 : 0);
    }, 0);
    
    const levelScore = Math.round((correct / level.solution.length) * 100);
    setScore(score + levelScore);
    setShowResults(true);
  };

  const nextLevel = () => {
    if (currentLevel + 1 < levels.length) {
      setCurrentLevel(currentLevel + 1);
      setSelections([]);
      setShowResults(false);
    } else {
      setGameComplete(true);
    }
  };

  const level = levels[currentLevel];
  const Icon = level.icon;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-blue-500" />
            <CardTitle>Cybersecurity Training Simulator</CardTitle>
          </div>
          <Progress value={(currentLevel / levels.length) * 100} className="mt-2" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Icon className="w-12 h-12 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold">Level {level.id}: {level.title}</h2>
              <p className="text-gray-600">{level.description}</p>
            </div>
          </div>

          <Alert className="bg-blue-50">
            <AlertDescription>{level.challenge}</AlertDescription>
          </Alert>

          <div className="space-y-4">
            {level.targets.map((target, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50">
                <span className="font-mono">{target}</span>
                <Button
                  variant={selections[index] ? "destructive" : "outline"}
                //   onClick={() => handleFileSelect(index)}
                >
                  {selections[index] ? 'Mark as Infected' : 'Mark as Safe'}
                </Button>
              </div>
            ))}
          </div>

          {showResults ? (
            <div className="space-y-4">
              <Alert className="bg-green-50">
                <AlertDescription>
                  Level Score: {Math.round((selections.reduce((acc, selected, index) => 
                    acc + (selected === level.solution[index] ? 1 : 0), 0) / level.solution.length) * 100)}%
                </AlertDescription>
              </Alert>
              <Button onClick={nextLevel} className="w-full">
                {currentLevel + 1 < levels.length ? 'Next Level' : 'Complete Training'}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={selections.length !== level.targets.length}
            >
              Submit Analysis
            </Button>
          )}

          {gameComplete && (
            <Alert className="bg-green-50">
              <AlertDescription>
                Training Complete! Final Score: {Math.round(score / levels.length)}%
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CyberGame;