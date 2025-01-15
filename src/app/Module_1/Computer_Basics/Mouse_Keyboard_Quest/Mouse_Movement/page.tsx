"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Cookies from "js-cookie";

const EVENTS = {
  click: 'Left Click',
  contextmenu: 'Right Click',
  dblclick: 'Double Click',
  mouseover: 'Mouse Over'
};

const INSTRUCTIONS = [
  {
    title: "Left Click",
    description: "Press the left mouse button once to interact with elements.",
    image: "/api/placeholder/400/300"
  },
  {
    title: "Right Click",
    description: "Press the right mouse button to open context menus or perform secondary actions.",
    image: "/api/placeholder/400/300"
  },
  {
    title: "Double Click",
    description: "Quickly press the left mouse button twice to perform special actions.",
    image: "/api/placeholder/400/300"
  },
  {
    title: "Mouse Over",
    description: "Move your cursor over elements to trigger hover effects and interactions.",
    image: "/api/placeholder/400/300"
  }
];

const EMOJIS = ['😊', '🤣', '👿', '🐻', '🎮', '🎲', '🎪', '😉', '👽', '😇', '🥶', '🐯'];

type EventStats = {
  [key: string]: number;
};

type EmojiBubble = {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: { x: number; y: number; };
  emoji: string;
  eventType: string;
};

type MouseRecord = {
  id: string;
  mouse_keyboard_quest_id: string;
  student_id: string;
  click_completed: boolean;
  dblclick_completed: boolean;
  context_menu_completed: boolean;
  mouse_over_completed: boolean;
  completed: boolean;
  started_at: string;  // TIMESTAMP WITH TIME ZONE will be returned as ISO string
  completed_at: string | null;  // Can be null if not completed
  last_activity: string;  // TIMESTAMP WITH TIME ZONE
};

export default function EnhancedEmojiTrainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [emojis, setEmojis] = useState<EmojiBubble[]>([]);
  const router = useRouter();
  const secretKey= process.env.NEXT_PUBLIC_SECRET_KEY;
  const [userId, setUserId] = useState<string | null>(null);
  const params = useSearchParams();
  const [progressRecord, setProgressRecord] = useState<MouseRecord | null>(null);
  const supabase = createClientComponentClient();
  const [eventStats, setEventStats] = useState<EventStats>({
    click: 0,
    contextmenu: 0,
    dblclick: 0,
    mouseover: 0
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [showHint, setShowHint] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isMouseMovementCompleted, setIsMouseMovementCompleted] = useState(false);
  const initialBubbleCount = 5;

  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

  const decryptData = (encryptedText: string): string => {
    const [ivBase64, encryptedBase64] = encryptedText.split('.');
    if (!ivBase64 || !encryptedBase64) return ''; 
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(secretKey).slice(0, 16); // Use the first 16 bytes for AES key
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const decryptedBytes = encryptedBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]); // XOR for decryption
    return new TextDecoder().decode(decryptedBytes);
  };


  const updateProgress = async (stats: EventStats) => {
    if (!progressRecord || !userId) return;

    const updates: Partial<MouseRecord> = {
      click_completed: stats.click > 0,
      dblclick_completed: stats.dblclick > 0,
      context_menu_completed: stats.contextmenu > 0,
      mouse_over_completed: stats.mouseover > 0,
      last_activity: new Date().toISOString()
    };

    // Check if all events are completed
    const allCompleted = Object.values(stats).every(count => count > 0);
    if (allCompleted) {
      updates.completed = true;
      updates.completed_at = new Date().toISOString();
    }

    try {
      const { error } = await supabase
        .from('mouse_movement')
        .update(updates)
        .eq('id', progressRecord.id);

      if (error) throw error;

      if (allCompleted) {
        // Update mouse_keyboard_quest completion if needed
        const { error: questError } = await supabase
          .from('mouse_keyboard_quest')
          .update({
            completed_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          })
          .eq('id', progressRecord.mouse_keyboard_quest_id);

        if (questError) throw questError;
      }
    } catch (error) {
      console.log('Error updating progress:', error);
    }
  };

  const initializeProgressRecord = async (studentId: string) => {
    try {
      // Check for existing computer_basics record
      let { data: computerBasicsData } = await supabase
        .from('computer_basics')
        .select('id')
        .eq('student_id', studentId)
        .single();
  
      // Create computer_basics record if it doesn't exist
      if (!computerBasicsData) {
        const { data: newComputerBasics, error: computerBasicsError } = await supabase
          .from('computer_basics')
          .insert([{
            student_id: studentId,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          }])
          .select()
          .single();
  
        if (computerBasicsError) throw computerBasicsError;
        computerBasicsData = newComputerBasics;
      }
  
      // Check for existing mouse_keyboard_quest record
      let { data: questData } = await supabase
        .from('mouse_keyboard_quest')
        .select('id')
        .eq('computer_basics_id', computerBasicsData?.id)
        .eq('student_id', studentId)
        .single();
  
      // Create mouse_keyboard_quest record if it doesn't exist
      if (!questData) {
        const { data: newQuest, error: questError } = await supabase
          .from('mouse_keyboard_quest')
          .insert([{
            computer_basics_id: computerBasicsData?.id,
            student_id: studentId,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          }])
          .select()
          .single();
  
        if (questError) throw questError;
        questData = newQuest;
      }
  
      // Check for existing mouse_movement record
      const { data: existingRecord } = await supabase
        .from('mouse_movement')
        .select('*')
        .eq('mouse_keyboard_quest_id', questData?.id)
        .eq('student_id', studentId)
        .single();
  
      if (existingRecord) {
        setProgressRecord(existingRecord);
      } else {
        // Create new mouse_movement record
        const { data: newRecord, error: movementError } = await supabase
          .from('mouse_movement')
          .insert([{
            mouse_keyboard_quest_id: questData?.id,
            student_id: studentId,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString(),
            click_completed: false,
            dblclick_completed: false,
            context_menu_completed: false,
            mouse_over_completed: false,
            completed: false
          }])
          .select()
          .single();
  
        if (movementError) throw movementError;
        if (newRecord) {
          setProgressRecord(newRecord);
        }
      }
    } catch (error) {
      console.log('Error initializing progress record:', error);
      // Handle error appropriately - maybe show an error message to the user
    }
  };

  useEffect(()=>{
    const checkCompletion = async (decryptedId: string) => {
      try {
        const { data: mouseMovementData, error } = await supabase
          .from('mouse_movement')
          .select('completed')
          .eq('student_id', decryptedId)
          .single();

        if (error) throw error;
        
        if (mouseMovementData?.completed) {
          setIsMouseMovementCompleted(true);
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
      if (!isMouseMovementCompleted) {
        initializeProgressRecord(decryptedId);
      }
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)
    }
  },[userId])

  useEffect(() => {
    speechRef.current = new SpeechSynthesisUtterance();
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleNextLevel = () => {
    updateProgress(eventStats)
    playSound('https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/game-bonus-144751 (1).mp3')
    setShowCongrats(true);
  };

  const proceedToNextLevel = () => {
    setShowCongrats(false);
    router.push('/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Keyboard');
  };

  const speakText = useCallback((text: string) => {
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      speechRef.current.text = text;
      speechRef.current.onend = () => {
        if (currentInstruction < INSTRUCTIONS.length - 1) {
          setCurrentInstruction(prev => prev + 1);
        } else {
          setShowInstructions(false);
          startGame();
        }
      };
      window.speechSynthesis.speak(speechRef.current);
    }
  }, [currentInstruction]);

  const playSound = (soundFile: string) => {
    const audio = new Audio(soundFile);
    audio.play();
  };
  

  useEffect(() => {
    if (showInstructions && INSTRUCTIONS[currentInstruction]) {
      speakText(INSTRUCTIONS[currentInstruction].description);
    }
  }, [currentInstruction, showInstructions]);

  const initializeInstructions = () => {
    setShowInstructions(true);
    setCurrentInstruction(0);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateViewportSize = () => {
      if (!containerRef.current) return;
      setViewportSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setGameCompleted(true);
            if (timerRef.current) clearInterval(timerRef.current);
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

  const createEmoji = () => {
    const padding = 100;
    const eventType = Object.keys(EVENTS)[Math.floor(Math.random() * Object.keys(EVENTS).length)];
    const baseSpeed = 1; // Define a constant base speed
  
    return {
      id: Math.random().toString(36),
      x: Math.random() * (viewportSize.width - padding * 2) + padding - viewportSize.width / 2,
      y: Math.random() * (viewportSize.height - padding * 2) + padding - viewportSize.height / 2,
      size: Math.random() * 40 + 60,
      speed: {
        x: (Math.random() - 0.5) * baseSpeed, // Use baseSpeed to control movement
        y: (Math.random() - 0.5) * baseSpeed,
      },
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      eventType,
    };
  };

  const handleEmojiEvent = (emojiId: string, eventType: string) => {
    if (!isPlaying) return;
    
    setEmojis(prev => {
      const emoji = prev.find(e => e.id === emojiId);
      if (emoji && emoji.eventType === eventType) {
        playSound('https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/select-sound-121244.mp3')
        setEventStats(stats => ({
          ...stats,
          [eventType]: stats[eventType] + 1
        }));

        // Create new emoji only if we're below the initial count
        const shouldCreateNew = prev.length <= initialBubbleCount;
        if (shouldCreateNew) {
          setTimeout(() => {
            setEmojis(current => [...current, createEmoji()]);
          }, 500);
        }

        // Check if student is focusing on just one type of event
        const totalEvents = Object.values(eventStats).reduce((a, b) => a + b, 0);
        if (totalEvents > 5) {
          const usedEvents = Object.values(eventStats).filter(count => count > 0).length;
          setShowHint(usedEvents < Object.keys(EVENTS).length);
        }

        return prev.filter(e => e.id !== emojiId);
      }
      return prev;
    });
  };

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      if (!isPlaying) return;
    
      setEmojis(prev => 
        prev.map(emoji => {
          const maxX = (viewportSize.width / 2) - emoji.size;
          const maxY = (viewportSize.height / 2) - emoji.size;
          let newX = emoji.x + emoji.speed.x;
          let newY = emoji.y + emoji.speed.y;
          let newSpeedX = emoji.speed.x;
          let newSpeedY = emoji.speed.y;
    
          // Add damping factor to prevent speed increase
          const dampingFactor = 1.0;
    
          if (Math.abs(newX) > maxX) {
            newX = maxX * Math.sign(newX);
            newSpeedX = -emoji.speed.x * dampingFactor;
          }
          if (Math.abs(newY) > maxY) {
            newY = maxY * Math.sign(newY);
            newSpeedY = -emoji.speed.y * dampingFactor;
          }
    
          return {
            ...emoji,
            x: newX,
            y: newY,
            speed: { 
              x: newSpeedX,
              y: newSpeedY
            }
          };
        })
      );
    
      requestAnimationFrame(animate);
    };

    animate();
  }, [isPlaying, viewportSize]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setGameCompleted(false);
    setEventStats({
      click: 0,
      contextmenu: 0,
      dblclick: 0,
      mouseover: 0
    });
    setTimeLeft(30);
    setShowHint(false);
    const initialEmojis = Array(initialBubbleCount)
      .fill(null)
      .map(() => createEmoji());
    setEmojis(initialEmojis);
  },[eventStats, timeLeft, showHint, emojis]);

  return (
    <div ref={containerRef} className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-">
       <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center tracking-tighter">🎉 Congratulations! 🎉</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-lg mb-4">
              {"You've mastered mouse events! Ready to take on keyboard challenges?"}
            </p>
            <div className="space-y-2">
              <p className="text-center font-semibold">Your Achievement:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(EVENTS).map(([key, label]) => (
                  <Badge key={key} variant="outline" className="justify-between">
                    {label}: {eventStats[key]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={proceedToNextLevel} className="w-full">
              Proceed to Keyboard Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Mouse Event Instructions</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <img
                src={INSTRUCTIONS[currentInstruction]?.image}
                alt={INSTRUCTIONS[currentInstruction]?.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <h3 className="text-xl font-bold mt-4">{INSTRUCTIONS[currentInstruction]?.title}</h3>
              <p className="mt-2">{INSTRUCTIONS[currentInstruction]?.description}</p>
            </Card>
            <Card className="p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold">Voice Instructions</h3>
                <p className="mt-2">Listen to the instructions being read aloud.</p>
              </div>
              <Progress 
                value={(currentInstruction / (INSTRUCTIONS.length - 1)) * 100} 
                className="w-full mt-4"
              />
              <p className="text-sm text-gray-500 mt-2">
                {currentInstruction + 1} of {INSTRUCTIONS.length}
              </p>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="relative z-10 p-4 w-1/2 mx-[25%]">
        {isPlaying && (
          <Card className="p-4 mb-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(EVENTS).map(([key, label]) => (
                  <Badge key={key} variant="outline" className="justify-between">
                    {label}: {eventStats[key]}
                  </Badge>
                ))}
              </div>
              <Progress value={(timeLeft / 30) * 100} className="w-full" />
              <div className="flex justify-between">
                <Badge variant="outline">Time: {timeLeft}s</Badge>
                <Badge variant="outline">Total: {Object.values(eventStats).reduce((a, b) => a + b, 0)}</Badge>
              </div>
            </div>
          </Card>
        )}

        {showHint && isPlaying && (
          <Alert className="mb-4">
            <AlertTitle>Reminder</AlertTitle>
            <AlertDescription>
             {" Try using all different types of interactions! Each emoji can be interacted with in different ways."}
            </AlertDescription>
          </Alert>
        )}

        {!isPlaying && !gameCompleted && (
          <Alert className="mb-4">
            <AlertTitle className="text-2xl font-bold ">Welcome to Event Practice!</AlertTitle>
            <AlertDescription>
              {"Practice different mouse events: left click, right click, double click, and mouse over.\nWatch for the instruction above each emoji to know which event to use!"}
            </AlertDescription>
          </Alert>
        )}

        {gameCompleted && (
          <Alert className="mb-4">
            <AlertTitle>Practice Session Complete! 🎉</AlertTitle>
            <AlertDescription className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(EVENTS).map(([key, label]) => (
                  <p key={key}>{label}: {eventStats[key]}</p>
                ))}
              </div>
              {(eventStats.click <= 0 || eventStats.dblclick <= 0 || eventStats.mouseover <= 0 || eventStats.contextmenu <= 0) && (
                <>
                  <p className="text-red-500">
                    {eventStats.click <= 0 && "You missed clicking. "}
                    {eventStats.dblclick <= 0 && "You missed double-clicking. "}
                    {eventStats.mouseover <= 0 && "You missed mouse-over. "}
                  </p>
                  <Button onClick={startGame} className="w-full mt-4">
                    Try Again
                  </Button>
                </>
              )}
              {eventStats.click>0 && eventStats.dblclick>0 && eventStats.mouseover>0 && eventStats.contextmenu >0 && (
                <div className="flex gap-4">
                  <Button className="flex-1" onClick={startGame}>
                    Try Again
                  </Button>
                  <Button  className="flex-1" onClick={()=>{handleNextLevel()}}>
                      Next Level
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!isPlaying && !gameCompleted && (
          <Button onClick={initializeInstructions} className="w-full">
            Start Practice
          </Button>
        )}
      </div>

      {isPlaying && emojis.map(emoji => (
        <div
          key={emoji.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 hover:cursor-custom-icon"
          style={{
            left: `${emoji.x + viewportSize.width / 2}px`,
            top: `${emoji.y + viewportSize.height / 2}px`,
            fontSize: `${emoji.size}px`
          }}
          onClick={() => handleEmojiEvent(emoji.id, 'click')}
          onContextMenu={(e) => {
            e.preventDefault();
            handleEmojiEvent(emoji.id, 'contextmenu');
          }}
          onDoubleClick={() => handleEmojiEvent(emoji.id, 'dblclick')}
          onMouseOver={() => handleEmojiEvent(emoji.id, 'mouseover')}
        >
          <div className="select-none">{emoji.emoji}</div>
          <div className="text-xs text-center absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/50 text-white px-2 py-1 rounded">
            {EVENTS[emoji.eventType as keyof typeof EVENTS]}
          </div>
        </div>
      ))}
    </div>
  );
}