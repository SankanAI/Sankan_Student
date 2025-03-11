"use client";
import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Worm, Eye, Lock, Zap, Network } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaHorseHead } from "react-icons/fa";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from "js-cookie";
import { useCryptoUtils } from "@/app/Custom_Hooks/cryptoUtils";

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


type AntivirusSchema = {
  id: string;
  field_agent_id: string | null;
  student_id: string;
  total_score: number | null;
  total_attempts: number | null;
  correct_attempts: number | null;
  incorrect_attempts: number | null;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  last_activity: string;
 };

const CyberGame = () => {
  const router=useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [selections, setSelections] = useState(Array(3).fill(false));
  const [IsAntivrusCompleted, setIsAntivrusCompleted]=useState<boolean>(false);
  const [showResults, setShowResults] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');
  const [progressRecord, setProgressRecord] = useState<AntivirusSchema | null>(null);
  const {decryptData} =useCryptoUtils();

  const handleFileSelect = (index:number) => {
    const newSelections = [...selections];
    newSelections[index] = !newSelections[index];
    setSelections(newSelections);
  };

  const handleSubmit = () => {
    const level = levels[currentLevel];
    let correctCount = 0;
    
    selections.forEach((selected, index) => {
      if (selected === level.solution[index]) {
        correctCount++;
      }
    });
    
    const levelScore = Math.round((correctCount / level.solution.length) * 100);
    setScore(score + levelScore);
    
    // Update tracking metrics
    setTotal(total + level.solution.length);
    setCorrect(correct + correctCount);
    setIncorrect(incorrect + (level.solution.length - correctCount));

    setShowResults(true);
  };

  const nextLevel = () => {
    if (currentLevel + 1 < levels.length) {
      setCurrentLevel(currentLevel + 1);
      setSelections(Array(3).fill(false));
      setShowResults(false);
    } else {
      setGameComplete(true);
    }
  };

  const level = levels[currentLevel];
  const Icon = level.icon;


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

      const { data: internet_safetyData, error: internet_safetyError } = await supabase
      .from('internet_safety')
      .select('id')
      .eq('computer_basics_id', computerBasicsData?.id)
      .eq('student_id', studentId)
      .single();

      if (internet_safetyError || !internet_safetyData) {
       router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent/passwords?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
       return;
      }

      let { data: questData } = await supabase
        .from('field_agent')
        .select('id')
        .eq('internet_safety_id', internet_safetyData?.id)
        .eq('student_id', studentId)
        .single();
  
      // Create mouse_keyboard_quest record if it doesn't exist
      if (!questData) {
        const { data: newQuest, error: questError } = await supabase
          .from('field_agent')
          .insert([{
            internet_safety_id: internet_safetyData?.id,
            student_id: studentId,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          }])
          .select()
          .single();
  
        if (questError) throw questError;
        questData = newQuest;
      }
  
      // Check for existing keyboard record
      const { data: existingRecord } = await supabase
        .from('antivirus')
        .select('*')
        .eq('field_agent_id', questData?.id)
        .eq('student_id', studentId)
        .single();
  
      if (existingRecord) {
        // If record exists, just update the state
        setProgressRecord(existingRecord);
      } else {
        // Only create new record if one doesn't exist
        const { data: newRecord, error: insertError } = await supabase
          .from('antivirus')
          .insert([{
            field_agent_id: questData?.id,
            student_id: studentId,
            total_score: null,
            total_attempts: null,
            correct_attempts: null,
            incorrect_attempts:null,
            completed: false,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          }])
          .select()
          .single();
  
        if (insertError) throw insertError;
  
        if (newRecord) {
          setProgressRecord(newRecord);
        }
      }
    } catch (error) {
      console.log('Error in initializeProgressRecord:', error);
      // Handle error appropriately - maybe show an error message to the user
    }
  };

   // Update progress in database
   const updateProgress = async () => {
    if (!progressRecord || !userId) return;

    try {
      const { error } = await supabase
        .from('antivirus')
        .update({
          total_score: Math.round(score / levels.length),
          total_attempts: total,
          correct_attempts: correct,
          incorrect_attempts: incorrect,
          completed: true,
          last_activity: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', progressRecord.id);

      if (error) throw error;

      setIsAntivrusCompleted(true);
    } catch (error) {
      console.log('Error updating progress:', error);
    }
  };


  useEffect(()=>{
    const checkCompletion = async (decryptedId: string) => {
      try {
        const { data: AntiVirusData, error } = await supabase
          .from('antivirus')
          .select('completed')
          .eq('student_id', decryptedId)
          .single();

        if (error) throw error;
        
        if (AntiVirusData?.completed) {
          setIsAntivrusCompleted(true);
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
      if (!IsAntivrusCompleted) {
        initializeProgressRecord(decryptedId);
      }
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)
    }
  },[userId])

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
                  onClick={() => handleFileSelect(index)}
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
            >
              Submit Analysis
            </Button>
          )}

          {gameComplete && (
            <div className="space-y-4">
              <Alert className="bg-green-50">
                <AlertDescription>
                  Training Complete! 
                  <div>Final Score: {Math.round(score / levels.length)}%</div>
                  <div>Total Attempts: {total}</div>
                  <div>Correct: {correct}</div>
                  <div>Incorrect: {incorrect}</div>
                </AlertDescription>
              </Alert>
              <Button onClick={updateProgress} className="w-full">
                Move to Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};




const CyberGameApp = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <CyberGame />
    </Suspense>
  );
};

export default CyberGameApp;