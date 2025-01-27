"use client";
import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

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

type ScenarioType =
  | 'phishing'
  | 'impersonation'
  | 'baiting'
  | 'pretexting'
  | 'access control'
  | 'malware'
  | 'account security'
  | 'social engineering'
  | 'network security';


interface PlayerStats {
  level: number;
  xp: number;
  correctAnswers: number;
  defenseMastery: number;
  streak: number;
}

interface GameState {
  currentScenario: number;
  isGameOver: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

const SecurityDefender: React.FC = () => {
  const scenarios: Scenario[] = [
    {
      id: 1,
      title: "Suspicious Email Alert",
      description:
        "You receive an urgent email from 'IT Support' requesting your login credentials for system maintenance. The email address is support.desk123@techhelp.com. What do you do?",
      type: "phishing",
      options: [
        {
          id: 1,
          text: "Provide the requested information immediately to avoid system issues",
          feedback:
            "Never share login credentials via email, even if it appears to be from IT support.",
        },
        {
          id: 2,
          text: "Forward the email to your company's official IT security team for verification",
          feedback: "Excellent! Always verify suspicious requests through official channels.",
        },
        {
          id: 3,
          text: "Reply asking for more details about the maintenance",
          feedback: "Engaging with potential phishing emails can confirm your email is active.",
        },
      ],
      correctIndex: 1,
      explanation:
        "IT support will never ask for your credentials via email. This is a common phishing tactic.",
      difficulty: "easy",
    },
    {
      id: 2,
      title: "Unexpected Phone Call",
      description:
        "Someone claiming to be from your bank calls and says there's a problem with your account. They request your social security number to verify your identity. What do you do?",
      type: "pretexting",
      options: [
        {
          id: 1,
          text: "Provide your social security number to resolve the issue quickly",
          feedback: "Never share sensitive personal information over an unsolicited phone call.",
        },
        {
          id: 2,
          text: "Hang up and call the bank's official number from your bank statement",
          feedback: "Correct! Always independently verify the caller's identity through official channels.",
        },
        {
          id: 3,
          text: "Ask the caller to email you the account details",
          feedback:
            "This could potentially expose you to further social engineering risks.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Legitimate organizations won't request sensitive information through unexpected calls.",
      difficulty: "medium",
    },
    {   
   id: 3,
      title: "USB Drive Discovery",
      description:
        "You find a USB drive in the parking lot with a label 'Confidential HR Files'. What do you do?",
      type: "baiting",
      options: [
        {
          id: 1,
          text: "Plug the USB drive into your work computer to see the contents",
          feedback: "This is extremely dangerous and could introduce malware to your system.",
        },
        {
          id: 2,
          text: "Give the USB drive to your IT security team for investigation",
          feedback: "Excellent response! Let professionals handle potential security risks.",
        },
        {
          id: 3,
          text: "Ignore the USB drive and leave it where you found it",
          feedback: "While not actively harmful, this doesn't address the potential security threat.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Unknown USB drives can contain malware designed to exploit your system's vulnerabilities.",
      difficulty: "hard",
    },
    {
      id: 4,
      title: "Social Media Friend Request",
      description:
        "You receive a friend request on social media from someone claiming to be a co-worker you don't recognize. They message you asking for help with accessing a company file. What do you do?",
      type: "social engineering",
      options: [
        {
          id: 1,
          text: "Accept the request and share the file they need to help them out",
          feedback: "Be cautious—this could be a social engineering attempt.",
        },
        {
          id: 2,
          text: "Ignore the request and report it to your IT security team",
          feedback: "Correct! Verify their identity through official channels first.",
        },
        {
          id: 3,
          text: "Ask them to prove their identity before sharing any files",
          feedback:
            "While better than sharing immediately, engaging could still put you at risk.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Attackers often impersonate trusted individuals to gain access to sensitive data.",
      difficulty: "easy",
    },
    {
      id: 5,
      title: "Public Wi-Fi Risks",
      description: "You are at a coffee shop and need to send an email with sensitive information. The shop offers free Wi-Fi with no password. What do you do?",
      type: "network security",
      options: [
        {
          id: 1,
          text: "Connect to the Wi-Fi and send the email as quickly as possible",
          feedback: "Public Wi-Fi networks can be intercepted by attackers.",
        },
        {
          id: 2,
          text: "Use a Virtual Private Network (VPN) before connecting to the Wi-Fi",
          feedback: "Excellent choice! VPNs encrypt your data for added security.",
        },
        {
          id: 3,
          text: "Wait until you're on a secured network to send the email",
          feedback: "This is a safe option, but may delay urgent communication.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Using a VPN on public Wi-Fi reduces the risk of your data being intercepted.",
      difficulty: "medium",
    },
    {
      id: 6,
      title: "Malicious Website Warning",
      description:
        "While browsing, you receive a pop-up warning about an 'urgent system update' with a download link. What do you do?",
      type: "malware",
      options: [
        {
          id: 1,
          text: "Click the link to download and install the update immediately",
          feedback: "This could install malware onto your device.",
        },
        {
          id: 2,
          text: "Close the browser tab and visit the official website of the software to verify updates",
          feedback: "Correct! Always verify updates from trusted sources.",
        },
        {
          id: 3,
          text: "Ignore the warning and continue browsing",
          feedback: "Ignoring could leave your system vulnerable.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Legitimate software updates will not be delivered through random pop-ups.",
      difficulty: "medium",
    },
  {
      id: 7,
      title: "Unexpected Package",
      description:
        "You receive a package at work with a USB device and a note claiming it contains 'important company data.' What do you do?",
      type: "baiting",
      options: [
        {
          id: 1,
          text: "Plug the USB into your work computer to check its contents",
          feedback: "This is risky; USB devices can be infected with malware.",
        },
        {
          id: 2,
          text: "Report the package to your IT security team immediately",
          feedback: "Correct! Always involve security when dealing with unknown devices.",
        },
        {
          id: 3,
          text: "Leave the package untouched and inform your manager",
          feedback: "This is a safe option but doesn't address the potential security risk.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Unknown USB devices can contain malware designed to compromise your system.",
      difficulty: "hard",
    },
    {
      id: 8,
      title: "Password Sharing Request",
      description:
        "A colleague asks for your password to access a system they can't log into. What do you do?",
      type: "access control",
      options: [
        {
          id: 1,
          text: "Share your password to help them complete their work quickly",
          feedback: "Passwords should never be shared, even with trusted colleagues.",
        },
        {
          id: 2,
          text: "Direct them to IT for access assistance",
          feedback: "Correct! IT can provide the appropriate access without security risks.",
        },
        {
          id: 3,
          text: "Temporarily change your password, share it, and change it back later",
          feedback:
            "Even temporary sharing compromises the security of your account.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Password sharing violates security policies and increases the risk of breaches.",
      difficulty: "medium",
    },
    {
      id: 9,
      title: "Suspicious Link in Chat",
      description:
        "A coworker sends you a link in a chat message asking you to review a document urgently. The URL looks unfamiliar. What do you do?",
      type: "phishing",
      options: [
        {
          id: 1,
          text: "Click the link to review the document immediately",
          feedback: "Clicking unknown links can expose your system to malware or phishing.",
        },
        {
          id: 2,
          text: "Verify the link with the sender through a different communication method",
          feedback: "Correct! Confirm authenticity through trusted channels.",
        },
        {
          id: 3,
          text: "Ignore the message and block the sender",
          feedback:
            "While safe, this could result in missing legitimate communication.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Always verify unexpected links before clicking to avoid phishing attempts.",
      difficulty: "medium",
    },
    {
      id: 10,
      title: "Unusual Login Notification",
      description:
        "You receive an email notifying you of a login to your account from an unknown device. What do you do?",
      type: "account security",
      options: [
        {
          id: 1,
          text: "Ignore the notification if nothing seems wrong with your account",
          feedback: "Ignoring may allow unauthorized access to persist.",
        },
        {
          id: 2,
          text: "Change your password and enable two-factor authentication (2FA) immediately",
          feedback: "Correct! This secures your account against unauthorized access.",
        },
        {
          id: 3,
          text: "Reply to the email asking for more details about the login",
          feedback: "This could be a phishing email designed to steal your credentials.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Promptly securing your account reduces the risk of unauthorized activity.",
      difficulty: "easy",
    },
    {
      id: 11,
      title: "Malware Warning on Website",
      description:
        "You visit a website, and your antivirus warns of potential malware. What do you do?",
      type: "malware",
      options: [
        {
          id: 1,
          text: "Ignore the warning and proceed to access the content",
          feedback: "Ignoring antivirus warnings can expose your device to malware.",
        },
        {
          id: 2,
          text: "Close the website and run a virus scan on your computer",
          feedback: "Correct! Address potential threats immediately.",
        },
        {
          id: 3,
          text: "Disable the antivirus temporarily and continue browsing",
          feedback: "Disabling antivirus removes a critical layer of protection.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Antivirus warnings should never be ignored; they help prevent threats.",
      difficulty: "easy",
    },
    {
      id: 12,
      title: "Unexpected Software Update",
      description:
        "A pop-up on your screen says you need to update critical software. The pop-up provides a download link. What do you do?",
      type: "malware",
      options: [
        {
          id: 1,
          text: "Download and install the update immediately",
          feedback: "This could be a malicious attempt to install malware.",
        },
        {
          id: 2,
          text: "Visit the official website of the software to verify the update",
          feedback: "Correct! Always update software from trusted sources.",
        },
        {
          id: 3,
          text: "Ignore the update completely",
          feedback: "Delaying updates could leave your system vulnerable.",
        },
      ],
      correctIndex: 1,
      explanation:
        "Software updates should only be downloaded from official websites.",
      difficulty: "medium",
    }
  ];
  

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 1,
    xp: 0,
    correctAnswers: 0,
    defenseMastery: 0,
    streak: 0,
  });

  const [gameState, setGameState] = useState<GameState>({
    currentScenario: 0,
    isGameOver: false,
    totalQuestions: scenarios.length,
    answeredQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0
  });

  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionSelect = (optionIndex: number) => {
    if (gameState.isGameOver) return;

    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const currentScenarioObj = scenarios[gameState.currentScenario];
    const isCorrect = optionIndex === currentScenarioObj.correctIndex;
    
    const newPlayerStats = { ...playerStats };
    const newGameState = { ...gameState };

    // Update game state
    newGameState.answeredQuestions++;
    if (isCorrect) {
      newGameState.correctAnswers++;
      newPlayerStats.correctAnswers++;
      newPlayerStats.streak++;
      newPlayerStats.xp += 10 * newPlayerStats.streak;
      newPlayerStats.defenseMastery += 5;
      
      if (newPlayerStats.xp >= 100) {
        newPlayerStats.level++;
        newPlayerStats.xp = newPlayerStats.xp - 100;
      }
    } else {
      newGameState.incorrectAnswers++;
      newPlayerStats.streak = 0;
    }

    // Check if game is over
    if (newGameState.answeredQuestions >= scenarios.length) {
      newGameState.isGameOver = true;
    }

    setPlayerStats(newPlayerStats);
    setGameState(newGameState);
  };

  const handleNextScenario = () => {
    if (gameState.isGameOver) return;

    setShowFeedback(false);
    setSelectedOption(null);
    setGameState(prev => ({
      ...prev,
      currentScenario: (prev.currentScenario + 1) % scenarios.length
    }));
  };

  const handlePreviousScenario = () => {
    if (gameState.isGameOver) return;

    setShowFeedback(false);
    setSelectedOption(null);
    setGameState(prev => ({
      ...prev,
      currentScenario: prev.currentScenario > 0 
        ? prev.currentScenario - 1 
        : scenarios.length - 1
    }));
  };

  const restartGame = () => {
    setPlayerStats({
      level: 1,
      xp: 0,
      correctAnswers: 0,
      defenseMastery: 0,
      streak: 0,
    });
    setGameState({
      currentScenario: 0,
      isGameOver: false,
      totalQuestions: scenarios.length,
      answeredQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0
    });
    setShowFeedback(false);
    setSelectedOption(null);
  };

  const getDefenseTitle = (): string => {
    const { defenseMastery } = playerStats;
    if (defenseMastery <= 20) return 'Rookie Defender';
    if (defenseMastery <= 40) return 'Security Apprentice';
    if (defenseMastery <= 60) return 'Defense Specialist';
    if (defenseMastery <= 80) return 'Security Expert';
    return 'Master Guardian';
  };

  if (gameState.isGameOver) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Game Over</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Your Security Defense Results</h2>
              <div className="flex justify-around">
                <div>
                  <p>Total Questions: {gameState.totalQuestions}</p>
                  <p>Correct Answers: {gameState.correctAnswers}</p>
                  <p>Incorrect Answers: {gameState.incorrectAnswers}</p>
                </div>
                <div>
                  <p>Defense Level: {getDefenseTitle()}</p>
                  <p>Current Level: {playerStats.level}</p>
                  <p>Total XP: {playerStats.xp}</p>
                </div>
              </div>
              <Button onClick={restartGame}>Restart Game</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    {scenarios[gameState.currentScenario].title}
                  </h3>
                  <p className="text-gray-600">
                    {scenarios[gameState.currentScenario].description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {scenarios[gameState.currentScenario].options.map((option, index) => (
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
                <Alert className={`mt-4 ${selectedOption === scenarios[gameState.currentScenario].correctIndex ? 'bg-green-50' : 'bg-red-50'}`}>
                  {selectedOption === scenarios[gameState.currentScenario].correctIndex ? 
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  <AlertTitle>Feedback</AlertTitle>
                  <AlertDescription>
                    {scenarios[gameState.currentScenario].options[selectedOption!].feedback}
                    <br />
                    <span className="font-semibold mt-2 block">
                      {scenarios[gameState.currentScenario].explanation}
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousScenario}
            >
              Previous Scenario
            </Button>
            <Button
              variant="default"
              onClick={handleNextScenario}
            >
              Next Scenario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


const SecurityDefenderApp = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <SecurityDefender />
    </Suspense>
  );
};


export default SecurityDefenderApp;