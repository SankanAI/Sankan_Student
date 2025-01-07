"use client";
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';

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
    requiredScore: 15
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
    timeLimit: 60,
    requiredScore: 12
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
    timeLimit: 100,
    requiredScore: 10
  }
];

export default function TypingTriumph() {
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
  const router=useRouter();

  const getNewWord = () => {
    const randomIndex = Math.floor(Math.random() * currentLevel.words.length);
    return currentLevel.words[randomIndex];
  };

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

  const startGame = () => {
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
  };

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
      setCurrentLevel(LEVELS[nextLevelIndex]);
      setGameCompleted(false);
    }
    else{ setkeyComplete(true) }
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
                  {isLevelComplete && currentLevel.id < LEVELS.length && (
                    <Button onClick={handleNextLevel} className="flex-1">
                      Next Level
                    </Button>
                  )}
                 
                      <Button className="flex-1" onClick={()=>{router.push('/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Dev_Detective')}}>
                        Dev Detective
                      </Button>
                    
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