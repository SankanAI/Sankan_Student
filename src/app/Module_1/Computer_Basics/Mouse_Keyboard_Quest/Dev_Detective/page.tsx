"use client";
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, FileText, GitBranch, Database } from 'lucide-react';

// Define core types
type TaskType = 'type' | 'click' | 'combined';

interface Task {
  id: string;
  type: TaskType;
  description: string;
  action: string;
  target?: string;
  completed: boolean;
}

interface GameLevel {
  id: number;
  name: string;
  description: string;
  tasks: Task[];
  timeLimit: number;
  requiredScore: number;
}

// Game levels configuration
const LEVELS: GameLevel[] = [
  {
    id: 1,
    name: "Basic Commands",
    description: "Learn basic development commands",
    tasks: [
      {
        id: "1-1",
        type: "type",
        description: "Print 'Hello World'",
        action: "console.log('Hello World')",
        completed: false
      },
      {
        id: "1-2",
        type: "click",
        description: "Run the application",
        action: "click",
        target: "Run",
        completed: false
      },
      {
        id: "1-3",
        type: "combined",
        description: "Save and commit changes",
        action: "git add . && git commit",
        completed: false
      }
    ],
    timeLimit: 60,
    requiredScore: 3
  }
];

export default function DevDetective() {
  // Core game state
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(LEVELS[0]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [taskHistory, setTaskHistory] = useState<string[]>([]);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  // Game control functions
  const endGame = () => {
    setIsPlaying(false);
    setGameCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const getNextTask = () => {
    const incompleteTasks = currentLevel.tasks.filter(task => !task.completed);
    if (incompleteTasks.length === 0) return null;
    return incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)];
  };

  const startGame = () => {
    // Reset game state
    setIsPlaying(true);
    setGameCompleted(false);
    setScore(0);
    setTimeLeft(currentLevel.timeLimit);
    setTaskHistory([]);
    // Reset task completion status
    currentLevel.tasks.forEach(task => task.completed = false);
    // Set first task
    setCurrentTask(getNextTask());
    setUserInput('');
    if (inputRef.current) inputRef.current.focus();
  };

  // Task handling functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying || !currentTask) return;
    setUserInput(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask || !isPlaying) return;

    if (currentTask.type === 'type' || currentTask.type === 'combined') {
      if (userInput.trim() === currentTask.action) {
        handleTaskComplete(currentTask);
      }
    }
  };

  const handleClick = (target: string) => {
    if (!currentTask || !isPlaying) return;

    if ((currentTask.type === 'click' || currentTask.type === 'combined') && 
        currentTask.target === target) {
      handleTaskComplete(currentTask);
    }
  };

  const handleTaskComplete = (task: Task) => {
    // Mark task as completed
    task.completed = true;
    // Update score and history
    setScore(prev => prev + 1);
    setTaskHistory(prev => [...prev, task.description]);
    
    // Check for level completion
    if (score + 1 >= currentLevel.requiredScore) {
      endGame();
      return;
    }

    // Get next task or end game if none left
    const nextTask = getNextTask();
    if (!nextTask) {
      endGame();
      return;
    }

    setCurrentTask(nextTask);
    setUserInput('');
  };

  const handleNextLevel = () => {
    const nextLevelIndex = LEVELS.findIndex(level => level.id === currentLevel.id) + 1;
    if (nextLevelIndex < LEVELS.length) {
      setCurrentLevel(LEVELS[nextLevelIndex]);
      setGameCompleted(false);
    }
  };

  // UI helper function
  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'type': return <Terminal className="w-5 h-5" />;
      case 'click': return <FileText className="w-5 h-5" />;
      case 'combined': return <GitBranch className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-4">Dev Detective</h1>
          
          {/* Game UI - Active Game */}
          {isPlaying && currentTask && (
            <div className="space-y-4">
              {/* Game Stats */}
              <div className="flex justify-between items-center">
                <Badge variant="outline">Level {currentLevel.id}</Badge>
                <Badge variant="outline">Score: {score}/{currentLevel.requiredScore}</Badge>
                <Badge variant="outline">Time: {timeLeft}s</Badge>
              </div>
              
              <Progress value={(timeLeft / currentLevel.timeLimit) * 100} className="w-full" />
              
              {/* Current Task */}
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getTaskIcon(currentTask.type)}
                  <span className="font-medium">{currentTask.description}</span>
                </div>
                
                {/* Task Input */}
                {(currentTask.type === 'type' || currentTask.type === 'combined') && (
                  <form onSubmit={handleInputSubmit}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={handleInputChange}
                      className="w-full p-2 font-mono border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your command here..."
                      autoFocus
                    />
                  </form>
                )}
                
                {/* Click Actions */}
                {(currentTask.type === 'click' || currentTask.type === 'combined') && (
                  <div className="flex gap-2 mt-2">
                    {currentTask.target && (
                      <Button onClick={() => handleClick(currentTask.target!)}>
                        {currentTask.target}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Task History */}
              <div className="mt-4">
                <h3 className="font-medium mb-2">Task History:</h3>
                <div className="bg-slate-50 p-2 rounded max-h-32 overflow-y-auto">
                  {taskHistory.map((task, index) => (
                    <div key={index} className="text-sm text-gray-600 mb-1">
                      ✓ {task}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Level Info */}
          {!isPlaying && !gameCompleted && (
            <Alert className="mb-4">
              <AlertTitle>{currentLevel.name}</AlertTitle>
              <AlertDescription>
                {currentLevel.description}
                <div className="mt-2">
                  Complete {currentLevel.requiredScore} tasks in {currentLevel.timeLimit} seconds
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Game Over */}
          {gameCompleted && (
            <Alert className="mb-4">
              <AlertTitle>
                {score >= currentLevel.requiredScore ? "Level Complete! 🎉" : "Try Again!"}
              </AlertTitle>
              <AlertDescription className="space-y-4">
                <div>
                  Final Score: {score}/{currentLevel.requiredScore}
                  <br />
                  Tasks Completed: {taskHistory.length}
                </div>
                <div className="flex gap-4">
                  <Button onClick={startGame} className="flex-1">
                    Try Again
                  </Button>
                  {score >= currentLevel.requiredScore && currentLevel.id < LEVELS.length && (
                    <Button onClick={handleNextLevel} className="flex-1">
                      Next Level
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Start Button */}
          {!isPlaying && !gameCompleted && (
            <Button onClick={startGame} className="w-full">
              Start Level {currentLevel.id}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}