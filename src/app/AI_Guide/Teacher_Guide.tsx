import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, MicOff, Send, Loader2} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition) => void) | null;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor;
        webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TeacherGuideProps {
  context: string;
  pageId: string;
}

const TeacherGuide: React.FC<TeacherGuideProps> = ({ context, pageId }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{question: string, answer: string}>>([]);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize speech synthesis
      speechRef.current = new SpeechSynthesisUtterance();
      speechRef.current.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-US';

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setUserInput(transcript);
        };

        recognition.onerror = (event: Event) => {
          setError('Speech recognition error occurred');
          console.log(event)
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage]);

  // Speech synthesis function
  const speak = useCallback((text: string) => {
    if (speechRef.current && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speechRef.current.text = text;
      console.log(pageId, response)
      speechRef.current.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(speechRef.current);
    }
  }, [selectedLanguage]);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
        speak('Listening for your question');
      } else {
        setError('Speech recognition not supported in this browser');
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare conversation context
      const conversationContext = `
        Page Context: ${context}
        Previous Conversations: ${chatHistory.map(chat => 
          `Q: ${chat.question}\nA: ${chat.answer}`).join('\n')}
        Current Question: ${userInput}
      `;

      // Get response from Supabase Edge Function
      const { data: { answer }, error } = await supabase.functions.invoke('get-ai-response', {
        body: { context: conversationContext }
      });

      if (error) throw error;

      // Update state and save to history
      setResponse(answer);
      setChatHistory(prev => [...prev, { question: userInput, answer }]);

      // Speak response
      speak(answer);

    } catch (error) {
      setError('Failed to get response. Please try again.');
      console.log('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="fixed bottom-4 right-4 shadow-lg hover:shadow-xl transition-shadow"
        >
          Ask Teacher
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your AI Teaching Assistant</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex gap-2">
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleListening}
              className={`flex-shrink-0 ${isListening ? 'bg-red-100' : ''}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>

          <div className="space-y-4">
            {chatHistory.map((chat, index) => (
              <div key={index} className="space-y-2">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-medium">Q: {chat.question}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p>A: {chat.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              className="flex-1 p-3 border rounded-md min-h-[100px] resize-none"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask your question..."
              rows={3}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !userInput.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Ask Question <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherGuide;