"use client";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Cookies from "js-cookie";

type GameLevel = {
  id: number;
  name: string;
  description: string;
  words: string[];
  timeLimit: number;
  requiredScore: number;
  codingTermsDescriptions: { [key: string]: string };
};


const LEVELS: GameLevel[] = [
  {
    id: 1,
    name: "Basic Characters",
    description: "Master the basic alphabet and numbers used in coding",
    words: [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
    ],
    codingTermsDescriptions: {
      a:'a',b: 'b',c: 'c',d: 'd',e: 'e',f: 'f',g: 'g',h: 'h',i: 'i',j: 'j',
      1:'1',2: '2',3: '3',4: '4', 5: '5',6: '6',7: '7',8: '8',9: '9',0: '0'
    },
    timeLimit: 20,
    requiredScore: 12
  },
  {
    id: 2,
    name: "Programming Keywords",
    description: "Practice common programming keywords and operators",
    words: [
      'switch', 'case', 'default', 'break', 'continue', 'do', 'try', 
      'catch', 'finally', 'throw', 'typeof', 'instanceof', 'delete', 
      'new', 'this', 'class', 'extends', 'super', 'import', 'export', 
      'async', 'await', 'yield', 'static', 'void', 'with', 'debugger', 
      'in', 'of', '&&', '||', '!', '>', '<', '>=', '<=', '++', '--', 
      '*', '/', '%', '-', '<<', '>>', '>>>', '&', '|', '^', '~', '?', ':'
    ],
    codingTermsDescriptions: {
      switch: "Checks multiple options and runs the code for the first match.",
      case: "Defines an option inside a 'switch' statement.",
      default: "Runs if no other 'case' matches in a 'switch' statement.",
      break: "Stops a loop or a 'switch' statement from running further.",
      continue: "Skips to the next step in a loop, ignoring the rest of the code in this step.",
      do: "Runs a block of code at least once, then keeps running if a condition is true.",
      try: "Tests a piece of code to see if it works without errors.",
      catch: "Handles any errors that happen in a 'try' block.",
      finally: "Runs code after 'try' and 'catch', no matter what happens.",
      throw: "Sends out an error message when something goes wrong.",
      typeof: "Checks the type of a value (like a number or a word).",
      instanceof: "Checks if an object belongs to a specific category.",
      delete: "Removes something, like a property from an object.",
      new: "Creates something new, like an object or an instance of a class.",
      this: "Refers to the current object or context being used.",
      class: "A blueprint for creating objects with similar features.",
      extends: "Lets a class borrow features from another class.",
      super: "Calls the parent class's features in a child class.",
      import: "Brings in code from another file or module.",
      export: "Shares code from this file to be used in another file.",
      async: "Prepares a function to handle tasks that take time (like loading a file).",
      await: "Waits for a task to finish before moving to the next step.",
      yield: "Pauses a function and returns a value, but it can continue later.",
      static: "Creates a function or property that belongs to the class itself, not its objects.",
      void: "Says a function doesn't return any value.",
      with: "Used to simplify working with objects, but not commonly used now.",
      debugger: "Stops the program so you can look at its steps and fix problems.",
      in: "Checks if a property exists in an object or array.",
      of: "Goes through the values of an array or object.",
      "&&": "Checks if two conditions are true.",
      "||": "Checks if at least one condition is true.",
      "!": "Reverses a condition; 'not true' becomes 'false'.",
      ">": "Checks if a number is bigger than another.",
      "<": "Checks if a number is smaller than another.",
      ">=": "Checks if a number is bigger or equal to another.",
      "<=": "Checks if a number is smaller or equal to another.",
      "++": "Adds 1 to a number.",
      "--": "Takes away 1 from a number.",
      "*": "Multiplies two numbers.",
      "/": "Divides one number by another.",
      "%": "Finds the remainder when dividing two numbers.",
      "-": "Subtracts one number from another.",
      "<<": "Shifts the binary digits of a number to the left.",
      ">>": "Shifts the binary digits of a number to the right.",
      ">>>": "Shifts the binary digits of a number to the right without keeping the sign.",
      "&": "Compares bits and returns 1 if both are 1.",
      "|": "Compares bits and returns 1 if either is 1.",
      "^": "Compares bits and returns 1 if only one is 1.",
      "~": "Flips all the bits of a number (0 becomes 1, and 1 becomes 0).",
      "?": "Used in a shortcut for 'if' and 'else' (conditional operator).",
      ":": "Part of the shortcut for 'if' and 'else' (used with '?')."
    },
    timeLimit: 180,
    requiredScore: 30
  },
  {
    id: 3,
    name: "Terminal Commands",
    description: "Master common terminal commands and flags",
    codingTermsDescriptions: {
      echo: "Displays a line of text or variables in the terminal.",
      touch: "Creates a new empty file.",
      cat: "Displays the content of a file.",
      nano: "Opens a simple text editor in the terminal.",
      vim: "Opens a more advanced text editor in the terminal.",
      exit: "Closes the terminal or ends a session.",
      clear: "Clears all text on the terminal screen.",
      sudo: "Runs a command with superuser (admin) permissions.",
      chmod: "Changes the permissions of a file or folder.",
      chown: "Changes the owner of a file or folder.",
      grep: "Searches for a specific word or phrase in files.",
      find: "Locates files or folders based on criteria.",
      locate: "Quickly finds files or folders by name.",
      diff: "Compares the content of two files and shows the differences.",
      wget: "Downloads files from the internet using a URL.",
      curl: "Transfers data to or from a server, like downloading a file.",
      tar: "Combines multiple files into one file (called an archive).",
      zip: "Compresses files into a smaller, single file.",
      unzip: "Extracts files from a compressed zip file.",
      man: "Displays the manual or help for a command.",
      ps: "Shows a list of all running programs (processes).",
      top: "Displays running programs and their resource usage.",
      kill: "Stops a running program or process.",
      ping: "Checks if a computer or website is reachable.",
      ifconfig: "Shows or configures network settings (older tool).",
      ip: "Shows or configures network settings (newer tool).",
      whoami: "Displays the current user's name.",
      ssh: "Connects securely to another computer over a network.",
      scp: "Copies files between computers securely.",
      rsync: "Synchronizes files and folders between computers or locations.",
      alias: "Creates shortcuts for commands to make them easier to use.",
      history: "Shows a list of recently used commands.",
      ln: "Creates shortcuts (links) to files or folders.",
      "-a": "Shows all files, including hidden ones.",
      "-l": "Displays files in a detailed list format.",
      "-h": "Shows file sizes in a human-readable format.",
      "-i": "Asks for confirmation before doing something.",
      "--all": "Includes all items in a command, even hidden ones.",
      "--force": "Makes the command run without asking for confirmation.",
      "--recursive": "Applies the command to folders and their contents.",
      "--interactive": "Asks for confirmation before each action.",
      "--dry-run": "Shows what the command would do without making changes.",
      "--quiet": "Runs the command without showing any messages."
    },
    words: [
      'echo', 'touch', 'cat', 'nano', 'vim', 'exit', 'clear', 
      'sudo', 'chmod', 'chown', 'grep', 'find', 'locate', 
      'diff', 'wget', 'curl', 'tar', 'zip', 'unzip', 'man', 
      'ps', 'top', 'kill', 'ping', 'ifconfig', 'ip', 'whoami', 
      'ssh', 'scp', 'rsync', 'alias', 'history', 'ln', '-a', 
      '-l', '-h', '-i', '--all', '--force', '--recursive', 
      '--interactive', '--dry-run', '--quiet'
    ],
    timeLimit: 240,
    requiredScore: 35
  }
];

type KeyboardRecord = {
  keyboard_id: string;
  mouse_keyboard_quest_id: string;
  student_id: string;
  completed: boolean;
  
  // Level 1 tracking
  level1_score: number | null;
  level1_time: number | null;  // INTERVAL will be returned as string
  
  // Level 2 tracking
  level2_score: number | null;
  level2_time: number | null;  // INTERVAL will be returned as string
  
  // Level 3 tracking
  level3_score: number | null;
  level3_time: number | null;  // INTERVAL will be returned as string
  
  // Timestamps
  created_at: string;   // TIMESTAMP WITH TIME ZONE returned as ISO string
  updated_at: string;   // TIMESTAMP WITH TIME ZONE returned as ISO string
};

function TypingTriumpContent() {
  const router=useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(LEVELS[0]);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [KeyComplete, setkeyComplete]=useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isKeyboardMovementCompleted, setIsKeyboardMovementCompleted] = useState(false);
  const [progressRecord, setProgressRecord] = useState<KeyboardRecord | null>(null);
 
  
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

   // Add new state for level completion times
   const [level1Time, setLevel1Time] = useState<number>(0);
   const [level2Time, setLevel2Time] = useState<number>(0);
   const [level3Time, setLevel3Time] = useState<number>(0);
   
   // Add state for level scores
   const [level1Score, setLevel1Score] = useState<number>(0);
   const [level2Score, setLevel2Score] = useState<number>(0);
   const [level3Score, setLevel3Score] = useState<number>(0);

  const getNewWord = () => {
    const randomIndex = Math.floor(Math.random() * currentLevel.words.length);
    return currentLevel.words[randomIndex];
  };

  // Utility functions
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
      // Check for existing computer_basics record
      const { data: computerBasicsData, error: computerBasicsError } = await supabase
        .from('computer_basics')
        .select('id')
        .eq('student_id', studentId)
        .single();
  
      if (computerBasicsError || !computerBasicsData) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Mouse_Movement?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }
  
      // Check for existing mouse_keyboard_quest record
      const { data: questData, error: questError } = await supabase
        .from('mouse_keyboard_quest')
        .select('id')
        .eq('computer_basics_id', computerBasicsData.id)
        .eq('student_id', studentId)
        .single();
  
      if (questError || !questData) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Mouse_Movement?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }
  
      // Check for existing keyboard record
      const { data: existingRecord, error: existingError } = await supabase
        .from('keyboard')
        .select('*')
        .eq('mouse_keyboard_quest_id', questData.id)
        .eq('student_id', studentId)
        .single();
  
      if (existingError && existingError.code !== 'PGRST116') {
        // Handle unexpected errors
        console.error('Error checking existing record:', existingError);
        return;
      }
  
      if (existingRecord) {
        // If record exists, just update the state
        setProgressRecord(existingRecord);
      } else {
        // Only create new record if one doesn't exist
        const { data: newRecord, error: insertError } = await supabase
          .from('keyboard')
          .insert([{
            mouse_keyboard_quest_id: questData.id,
            student_id: studentId,
            level1_score: null,
            level1_time: null,
            level2_score: null,
            level2_time: null,
            level3_score: null,
            level3_time: null,
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
  
        if (insertError) {
          console.error('Error creating new record:', insertError);
          return;
        }
  
        if (newRecord) {
          setProgressRecord(newRecord);
        }
      }
    } catch (error) {
      console.error('Error in initializeProgressRecord:', error);
      // Handle error appropriately - maybe show an error message to the user
    }
  };

  useEffect(()=>{
    const checkCompletion = async (decryptedId: string) => {
      try {
        const { data: mouseMovementData, error } = await supabase
          .from('keyboard')
          .select('completed')
          .eq('student_id', decryptedId)
          .single();

        if (error) throw error;
        
        if (mouseMovementData?.completed) {
          setIsKeyboardMovementCompleted(true);
          router.push(`Module_1/Computer_Basics/Mouse_Keyboard_Quest?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
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
      if (!isKeyboardMovementCompleted) {
        initializeProgressRecord(decryptedId);
      }
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)
    }
  },[userId, level1Score,level2Score,level3Score, level3Time, decryptData, initializeProgressRecord,isKeyboardMovementCompleted, principalId, teacherId, supabase, schoolId])

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
  }, [isPlaying, KeyComplete, timeLeft]);


  const finalSubmit=async(timing:number, scored:number)=>{
    if (!progressRecord || !userId) return;

    const updates: Partial<KeyboardRecord> = {
      level1_score: level1Score ,
      level1_time: level1Time , // INTERVAL will be returned as string
      level2_score: level2Score,
      level2_time: level2Time , // INTERVAL will be returned as string
      level3_score: scored ,
      level3_time: timing ,  // INTERVAL will be returned as string
    };

    setLevel3Score(scored);
    setLevel3Time(timing);
    const allCompleted=(level1Score>11 && level2Score>29 && scored> 34)?true:false;
    if(allCompleted){updates.completed=allCompleted;}

    try {
      const { error } = await supabase
        .from('keyboard')
        .update(updates)
        .eq('keyboard_id', progressRecord.keyboard_id);

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
}

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setGameCompleted(false);
    setScore(0);
    setTimeLeft(currentLevel.timeLimit);
    setCurrentWord(getNewWord());
    setUserInput('');
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setAccuracy(100);
    if (inputRef.current) inputRef.current.focus();
  },[isPlaying, gameCompleted, score, timeLeft, currentWord, userInput, totalAttempts, correctAttempts, accuracy]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying) return;
    
    const input = e.target.value;
    setUserInput(input);

    if (input === currentWord) {
      setScore(prev => prev + 1);
      setCorrectAttempts(prev => prev + 1);
      setTotalAttempts(prev => prev + 1);
      setAccuracy((correctAttempts + 1) / (totalAttempts + 1) * 100);
      setCurrentWord(getNewWord());
      setUserInput('');
    }
  };

  const handleNextLevel = () => {
    const nextLevelIndex = LEVELS.findIndex(level => level.id === currentLevel.id) + 1;
    if (nextLevelIndex < LEVELS.length) {
      if(currentLevel.id==1){setLevel1Time(currentLevel.timeLimit); setLevel1Score(score)}
      else if(currentLevel.id==2){setLevel2Time(currentLevel.timeLimit); setLevel2Score(score)}
      setCurrentLevel(LEVELS[nextLevelIndex]);
      setGameCompleted(false);
    }
    else{ 
      console.log("Completed")
      setkeyComplete(true)
      setGameCompleted(true);
     }
  };

  const isLevelComplete = score >= currentLevel.requiredScore;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-2 tracking-tighter">Typing Triumph</h1>
          <h3 className="text-sm text-center mb-3">Type what is displayed</h3>
          {isPlaying && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline">Level {currentLevel.id}</Badge>
                <Badge variant="outline">Score: {score}/{currentLevel.requiredScore}</Badge>
                <Badge variant="outline">Time: {timeLeft}s</Badge>
                <Badge variant="outline">Accuracy: {accuracy.toFixed(1)}%</Badge>
              </div>
              
              <Progress value={(timeLeft / currentLevel.timeLimit) * 100} className="w-full" />
              
              <div className="text-center space-y-4">
                <div className="text-3xl font-mono">{currentWord}</div>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full p-2 text-center text-lg font-mono border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {!isPlaying && !gameCompleted && (
            <Alert className="mb-4">
              <AlertTitle>{currentLevel.name}</AlertTitle>
              <AlertDescription>
                {currentLevel.description}
                <div className="mt-2">
                  Target: Score {currentLevel.requiredScore} points in {currentLevel.timeLimit} seconds
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Dialog open={showCongrats}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Congratulations! 🎉</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>{"You've mastered all typing levels! Ready for your next challenge?"}</p>
                </div>
                <Button onClick={() => router.push('/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Dev_Detective')}>
                  Continue to Dev Detective
                </Button>
              </DialogContent>
            </Dialog>

          {gameCompleted && (
            <Alert className="mb-4">
              <AlertTitle>
                {isLevelComplete ? "Level Complete! 🎉" : "Try Again!"}
              </AlertTitle>
              <AlertDescription className="space-y-4">
                <div>
                  Final Score: {score}/{currentLevel.requiredScore}
                  <br />
                  Accuracy: {accuracy.toFixed(1)}%
                </div>
                <div className="flex gap-4">
                  <Button onClick={startGame} className="flex-1">
                    Try Again
                  </Button>
                  {(isLevelComplete && currentLevel.id < LEVELS.length && !isKeyboardMovementCompleted) && (
                    <Button onClick={handleNextLevel} className="flex-1">
                      Next Level
                    </Button>
                  )}
                  {(currentLevel.id === LEVELS.length ) && (
                    <Button onClick={()=>{finalSubmit(currentLevel.timeLimit, score); setShowCongrats(true)}} className="flex-1">
                       Dev Detective
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!isPlaying && !gameCompleted && (
            <Button onClick={startGame} className="w-full">
              Start Level {currentLevel.id}
            </Button>
          )}
        </Card>

        {isPlaying && currentLevel.id>1 && (
         <Card className='px-4 py-6'>
          <code className="p-4 px-3 py-3 bg-[black] rounded-lg text-white">{currentWord}</code>
          <Alert className='mt-4 tracking-tighter'>
          <AlertTitle className="text-xl">What is it ?</AlertTitle>
          <AlertDescription>
            <div className="mt-2 text-lg">
              {currentLevel.codingTermsDescriptions[currentWord]}
            </div>
          </AlertDescription>
        </Alert>
         </Card>
        )}
      </div>
    </div>
  );
}

const TypingTriump = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <TypingTriumpContent />
    </Suspense>
  );
};


export default TypingTriump;