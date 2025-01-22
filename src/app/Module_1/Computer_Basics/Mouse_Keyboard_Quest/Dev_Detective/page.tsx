"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calculator, Code, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from "js-cookie";


// Type Definitions
type DevDetectiveRecord = {
  id: string;
  mouse_keyboard_quest_id: string;
  student_id: string;
  first_number: number | null;
  second_number: number | null;
  operation: '+' | '-' | '*' | '/' | null;
  result: number | null;
  generated_code: string | null;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
};


type Operation = '+' | '-' | '*' | '/';

const MathDetectiveContent = () => {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();
  
  // Route parameters
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

  // State management
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [firstNumber, setFirstNumber] = useState('');
  const [secondNumber, setSecondNumber] = useState('');
  const [operation, setOperation] = useState<Operation>('+');
  const [result, setResult] = useState<number | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [userId, setUserId] = useState('');
  const [progressRecord, setProgressRecord] = useState<DevDetectiveRecord | null>(null);
  const [isDevCompleted, setIsDevCompleted] = useState(false);

  // Refs
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Speech synthesis
  const speak = useCallback((text: string) => {
    if (speechRef.current && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speechRef.current.text = text;
      window.speechSynthesis.speak(speechRef.current);
    }
  }, []);

  // Voice command processing
  // const processVoiceCommand = useCallback((command: string) => {
  //   const numbers = command.match(/\d+/g);
  //   if (numbers && numbers.length >= 2) {
  //     setFirstNumber(numbers[0]);
  //     setSecondNumber(numbers[1]);
  //     speak(`Setting numbers to ${numbers[0]} and ${numbers[1]}`);
  //   }
  //   if (command.includes('plus') || command.includes('add')) {
  //     setOperation('+');
  //     speak('Setting operation to addition');
  //   }
  //   if (command.includes('minus') || command.includes('subtract')) {
  //     setOperation('-');
  //     speak('Setting operation to subtraction');
  //   }
  //   if (command.includes('multiply') || command.includes('times')) {
  //     setOperation('*');
  //     speak('Setting operation to multiplication');
  //   }
  //   if (command.includes('divide')) {
  //     setOperation('/');
  //     speak('Setting operation to division');
  //   }
  // }, [speak]);

  // Initialize speech recognition
  useEffect(() => {
    speechRef.current = new SpeechSynthesisUtterance();
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const initializeUser =async (decryptedId: string) => {
    try {
      // First, check if there's an existing dev_detective record that's completed
      const { data: existingComplete } = await supabase
        .from('dev_detective')
        .select('completed')
        .eq('student_id', decryptedId)
        .eq('completed', true)
        .single();

      if (existingComplete) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      // Check prerequisites
      const { data: computerBasicsData, error: computerBasicsError } = await supabase
        .from('computer_basics')
        .select('id')
        .eq('student_id', decryptedId)
        .single();

      if (computerBasicsError || !computerBasicsData) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Mouse_Movement?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      const { data: questData, error: questError } = await supabase
        .from('mouse_keyboard_quest')
        .select('id')
        .eq('computer_basics_id', computerBasicsData.id)
        .eq('student_id', decryptedId)
        .single();

      if (questError || !questData) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Mouse_Movement?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      // Check for existing incomplete record
      const { data: existingRecord} = await supabase
        .from('dev_detective')
        .select('*')
        .eq('mouse_keyboard_quest_id', questData.id)
        .eq('student_id', decryptedId)
        .single();

      if (existingRecord) {
        setProgressRecord(existingRecord);
      }
      else {
        const { data: newRecord, error: insertError } = await supabase
          .from('dev_detective')
          .insert([{
            mouse_keyboard_quest_id: questData.id,
            student_id: decryptedId,
            first_number: null,
            second_number: null,
            operation: null,
            result: null,
            generated_code: null,
            completed: false,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
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
      console.error('Error in initialization:', error);
    } 
    
  };

  useEffect(() => {

    const checkCompletion = async (decryptedId: string) => {
      try {
        const { data: KeyboardMovementData, error } = await supabase
          .from('dev_detective')
          .select('completed')
          .eq('student_id', decryptedId)
          .single();

        if (error) throw error;
        
        if (KeyboardMovementData?.completed) {
          setIsDevCompleted(true);
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
      if (!isDevCompleted) {
        initializeUser(decryptedId);
      }
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)
    }
  }, []);

  const updateProgress = async () => {
    if (!progressRecord || !userId) return;

    try {
      const { error } = await supabase
        .from('dev_detective')
        .update({
          first_number: parseInt(firstNumber),
          second_number: parseInt(secondNumber),
          operation: operation,
          result: result,
          generated_code: generatedCode,
          completed: true,
          completed_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', progressRecord.id);

      if (error) throw error;

      // Update mouse_keyboard_quest completion
      const { error: questError } = await supabase
        .from('mouse_keyboard_quest')
        .update({
          completed_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', progressRecord.mouse_keyboard_quest_id);

      if (questError) throw questError;

      try{
        const {error: computerBasicsError } = await supabase
            .from('mouse_keyboard_quest')
            .update({
              completed_at: new Date().toISOString(),
              completed: true
            })
            .eq('student_id', userId)
    
            if(computerBasicsError) throw computerBasicsError;
      }
      catch(error){
          console.log('Error While Updating Completion', error);
      }

      router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const calculateResult = () => {
    const a = parseFloat(firstNumber);
    const b = parseFloat(secondNumber);
    
    if (isNaN(a) || isNaN(b)) return;

    let calculatedResult;
    switch (operation) {
      case '+': calculatedResult = a + b; break;
      case '-': calculatedResult = a - b; break;
      case '*': calculatedResult = a * b; break;
      case '/': calculatedResult = b !== 0 ? a / b : null; break;
    }

    setResult(calculatedResult);
    speak(`The result is ${calculatedResult}`);
    setCurrentStep(4);
  };

  const generatePythonCode = async () => {
    const code = `a = ${firstNumber}
b = ${secondNumber}
c = a ${operation} b
print(c)  # Result: ${result}`;

    setGeneratedCode(code);
    speak('Python code has been generated');
    setShowSuccess(true);
    await updateProgress();
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return firstNumber !== '' && secondNumber !== '';
      case 2: return operation !== null;
      case 3: return result !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext()) {
      setCurrentStep(prev => prev + 1);
      speak(`Moving to step ${currentStep + 1}`);
    }
  };

  // Validation check
  if (!principalId || !schoolId || !teacherId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
        <Alert variant="destructive">
          <AlertDescription>Missing required parameters</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main JSX
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="w-2/4 ml-[25%] mx-auto space-y-4">
        {/* Instructions Dialog */}
        <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welcome to Math Detective! 🔢</DialogTitle>
              <AlertDescription className="space-y-4">
                <p>Follow these steps:</p>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Step 1: Enter two variables (a, b)</li>
                  <li>Step 2: Choose the operation</li>
                  <li>Step 3: Calculate the result</li>
                  <li>Step 4: Generate Python code</li>
                </ol>
                <Button onClick={() => {
                  setShowInstructions(false);
                  speak('Welcome to Math Detective! Let\'s get started with step 1');
                }}>
                  Get Started
                </Button>
              </AlertDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6 tracking-tighter">Math Detective</h1>
          {/* Step Progress */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step}
                className={`flex items-center ${step <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                  ${step <= currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  {step}
                </div>
                {step < 4 && <ArrowRight className="mx-2" />}
              </div>
            ))}
          </div>
          
          <div className="space-y-6">
            {/* Step 1: Variable Declaration */}
            {currentStep >= 1 && (
              <div className={`transition-opacity ${currentStep === 1 ? 'opacity-100' : 'opacity-70'}`}>
                <h2 className="text-lg font-semibold mb-4">Step 1: Declare Variables</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Variable a</label>
                    <input
                      type="number"
                      value={firstNumber}
                      onChange={(e) => setFirstNumber(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter first number"
                      disabled={currentStep !== 1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Variable b</label>
                    <input
                      type="number"
                      value={secondNumber}
                      onChange={(e) => setSecondNumber(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter second number"
                      disabled={currentStep !== 1}
                    />
                  </div>
                </div>
                {currentStep === 1 && (
                  <Button 
                    onClick={handleNext}
                    className="mt-4"
                    disabled={!canProceedToNext()}
                  >
                    Next Step
                  </Button>
                )}
              </div>
            )}

            {/* Step 2: Operation Selection */}
            {currentStep >= 2 && (
              <div className={`transition-opacity ${currentStep === 2 ? 'opacity-100' : 'opacity-70'}`}>
                <h2 className="text-lg font-semibold mb-4">Step 2: Choose Operation</h2>
                <div className="flex gap-2">
                  {(['+', '-', '*', '/'] as Operation[]).map((op) => (
                    <Button
                      key={op}
                      onClick={() => {
                        setOperation(op);
                        speak(`Selected operation ${op}`);
                      }}
                      variant={operation === op ? "default" : "outline"}
                      className="flex-1"
                      disabled={currentStep !== 2}
                    >
                      {op}
                    </Button>
                  ))}
                </div>
                {currentStep === 2 && (
                  <Button 
                    onClick={handleNext}
                    className="mt-4"
                    disabled={!canProceedToNext()}
                  >
                    Next Step
                  </Button>
                )}
              </div>
            )}

            {/* Step 3: Calculate */}
            {currentStep >= 3 && (
              <div className={`transition-opacity ${currentStep === 3 ? 'opacity-100' : 'opacity-70'}`}>
                <h2 className="text-lg font-semibold mb-4">Step 3: Calculate Result</h2>
                <Button 
                  onClick={calculateResult}
                  className="gap-2 w-full"
                  disabled={currentStep !== 3}
                >
                  <Calculator className="w-4 h-4" />
                  Calculate
                </Button>
                {result !== null && (
                  <Alert className="mt-4">
                    <AlertTitle>Result</AlertTitle>
                    <AlertDescription>
                      {firstNumber} {operation} {secondNumber} = {result}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 4: Generate Code */}
            {currentStep >= 4 && (
              <div className={`transition-opacity ${currentStep === 4 ? 'opacity-100' : 'opacity-70'}`}>
                <h2 className="text-lg font-semibold mb-4">Step 4: Generate Python Code</h2>
                <Button 
                  onClick={generatePythonCode}
                  className="gap-2 w-full"
                  disabled={result === null}
                >
                  <Code className="w-4 h-4" />
                  Generate Code
                </Button>
                {generatedCode && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Generated Python Code:</h3>
                    <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto">
                      <code>{generatedCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Congratulations! 🎉</DialogTitle>
              <AlertDescription>
                {"You've successfully completed all steps and generated the Python code! Feel free to try different numbers and operations."}
              </AlertDescription>
            </DialogHeader>
            <Button 
              onClick={() => router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
            >
              Next Level
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};


const MathDetective = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <MathDetectiveContent />
    </Suspense>
  );
};

export default MathDetective;