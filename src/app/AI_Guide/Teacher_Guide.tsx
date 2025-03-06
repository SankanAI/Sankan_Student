import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Language configuration with proper typing
type LanguageCode = 'en-US' | 'kn-IN' | 'ta-IN' | 'hi-IN';

interface LanguageInfo {
  name: string;
  code: string;
}

const LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  'en-US': { name: 'English', code: 'en' },
  'kn-IN': { name: 'ಕನ್ನಡ (Kannada)', code: 'kn' },
  'ta-IN': { name: 'தமிழ் (Tamil)', code: 'ta' },
  'hi-IN': { name: 'हिंदी (Hindi)', code: 'hi' }
};

// Add interface for component props
interface ChatFormProps {
  contextPrefix: string; // The context to prepend to user queries
}

// Define SpeechRecognition types since they're not in standard lib
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionError extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
  onend: (() => void) | null;
}

// Update window interface to include the Speech API
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

// Response type for translation API
interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
    }>;
  };
}

// Response type for chat API
interface ChatResponse {
  answer: string;
}

export default function ChatForm({ contextPrefix }: ChatFormProps) {
  const [query, setQuery] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en-US');
  const [error, setError] = useState<string | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
      
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      }
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionError) => {
        console.log('Speech recognition error:', event.error);
        setError('Error recognizing speech. Please try again.');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSpeak = () => {
    setError('');
    if (!speechSynthesis || !answer) return;

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const newUtterance = new SpeechSynthesisUtterance(answer);
    newUtterance.lang = selectedLanguage;
    newUtterance.rate = 1;
    newUtterance.pitch = 1;
    
    newUtterance.onend = () => {
      setIsPlaying(false);
    };

    newUtterance.onerror = () => {
      if(isPlaying){setError('Error playing speech. Please try again.');}
      setIsPlaying(false);
    };

    setUtterance(newUtterance);
    setIsPlaying(true);
    speechSynthesis.speak(newUtterance);
  };

  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [speechSynthesis]);

  const translateText = async (text: string, from: string, to: string): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
      if (!apiKey) {
        throw new Error('Translation API key is missing');
      }
      
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: from,
          target: to,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as TranslationResponse;
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.log('Translation error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (speechSynthesis && isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }

    try {
      // Combine context with user query
      const fullQuery = `${contextPrefix} ${query}`.trim();
      
      // Translate combined query to English if not already in English
      let englishQuery = fullQuery;
      if (selectedLanguage !== 'en-US') {
        englishQuery = await translateText(
          fullQuery,
          LANGUAGES[selectedLanguage].code,
          'en'
        );
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          queryEmbedding: [],
          query: englishQuery
        }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as ChatResponse;
      
      // Translate answer back to selected language if not English
      let translatedAnswer = data.answer;
      if (selectedLanguage !== 'en-US') {
        translatedAnswer = await translateText(
          data.answer,
          'en',
          LANGUAGES[selectedLanguage].code
        );
      }

      setAnswer(translatedAnswer);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your request.');
      setAnswer('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      {answer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Answer
              <Button
                onClick={handleSpeak}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={isPlaying ? 'Stop speaking' : 'Speak answer'}
              >
                {isPlaying ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {answer}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Educational Apps Assistant
            <Select
              value={selectedLanguage}
              onValueChange={(value: LanguageCode) => setSelectedLanguage(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(LANGUAGES) as [LanguageCode, LanguageInfo][]).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Ask about Mouse Event Training or Typing Triumph applications..."
                value={query}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuery(e.target.value)}
                className="min-h-32 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={toggleListening}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5 text-red-500" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Ask Question'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}