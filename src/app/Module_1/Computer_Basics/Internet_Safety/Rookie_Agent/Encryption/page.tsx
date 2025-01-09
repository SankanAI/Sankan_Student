"use client";
import React, { useState } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ShieldCheck, Key, Lock, Link, Atom, Eye,  Swords, Fingerprint, Crown
} from "lucide-react";

// Define types for modules and challenges
type Challenge = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

type Game = {
  title: string;
  description: string;
  challenges: Challenge[];
};

type Content = {
  story: string;
  explanation: string;
  example: string;
};

type Module = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  content: Content;
  game: Game;
};

// Define props for functional components if needed
// type ModuleCardProps = {
//   module: Module;
//   progress: number;
//   onClick: () => void;
// };

const modules: Module[] = [
    {
      id: "basics",
      title: "Secret Message Basics",
      description: "Learn what encryption is and why we need it",
      icon: <Key className="h-6 w-6" />,
      color: "bg-amber-100",
      content: {
        story: "Imagine you're a young samurai who needs to send a secret message to your friend about where to meet for training. Just like how you might use a secret code with your friends, samurai used special ways to keep their messages safe!",
        explanation: "Encryption is like having a secret language between friends. When you write a normal message (called plaintext), you use a special rule to turn it into a secret message (called ciphertext). Only someone who knows the special rule can read it!",
        example: "Normal message (plaintext): MEET AT NOON\nSecret message (ciphertext): #@@& %& !$$!"
      },
      game: {
        title: "The Secret Scroll",
        description: "Help the young samurai protect their messages",
        challenges: [
          {
            question: "Which message is the plaintext (normal message)?",
            options: ["HELLO", "X@LL0", "H3LL0", "!@#$%"],
            correct: 0,
            explanation: "HELLO is the plaintext because it's readable without any special code!"
          }
        ]
      }
    },
    {
      id: "caesar",
      title: "The Caesar Cipher",
      description: "Move letters around to make secret codes",
      icon: <Crown className="h-6 w-6" />,
      color: "bg-blue-100",
      content: {
        story: "A powerful emperor named Caesar created a clever way to send secret messages. He would shift each letter in the alphabet by a certain number of steps!",
        explanation: "Pick a number (like 3). Move each letter forward that many steps. A becomes D, B becomes E, and so on. This is your secret key!",
        example: "Key = 3\nPlaintext: HELLO\nCiphertext: KHOOR"
      },
      game: {
        title: "Caesar's Challenge",
        description: "Can you decode the emperor's message?",
        challenges: [
          {
            question: "If we shift by 1, what does 'IFMMP' say?",
            options: ["HELLO", "WORLD", "NINJA", "SWORD"],
            correct: 0,
            explanation: "Moving each letter back by 1 step: I→H, F→E, M→L, M→L, P→O spells HELLO!"
          }
        ]
      }
    },
    {
      id: "substitution",
      title: "Secret Symbols",
      description: "Replace letters with special symbols",
      icon: <Swords className="h-6 w-6" />,
      color: "bg-green-100",
      content: {
        story: "The most skilled samurai created their own secret alphabets. Each letter had its own special symbol that only their allies knew!",
        explanation: "In a substitution cipher, you replace each letter with a different symbol. It's like creating your own secret alphabet!",
        example: "Your code:\nA = ★\nB = ◆\nC = ▲\nMessage 'CAB' becomes: ▲★◆"
      },
      game: {
        title: "Symbol Master",
        description: "Decode messages using secret symbols",
        challenges: [
          {
            question: "If A=X, B=Y, C=Z, decode: ZYX",
            options: ["ABC", "XYZ", "DEF", "MNO"],
            correct: 0,
            explanation: "Replace each symbol with its pair: Z→C, Y→B, X→A spells ABC!"
          }
        ]
      }
    },
    {
      id: "modern-encryption",
      title: "Modern Encryption Basics",
      description: "Understand the building blocks of secure communication",
      icon: <ShieldCheck className="h-6 w-6" />,
      color: "bg-purple-100",
      content: {
        story: "Today, encryption is used in almost every aspect of our digital lives, from protecting our passwords to securing online payments.",
        explanation: "Modern encryption relies on complex mathematics and algorithms. It uses techniques like XOR operations and block or stream ciphers to turn plaintext into secure ciphertext.",
        example: "Binary XOR operation example:\n1010 XOR 0110 = 1100"
      },
      game: {
        title: "Encryption Puzzle",
        description: "Test your knowledge of binary operations",
        challenges: [
          {
            question: "What is 1010 XOR 0011?",
            options: ["1101", "1001", "1111", "1011"],
            correct: 1,
            explanation: "Performing XOR bit by bit gives: 1 XOR 0 = 1, 0 XOR 0 = 0, 1 XOR 1 = 0, 0 XOR 1 = 1, resulting in 1001."
          }
        ]
      }
    },
    {
        id: "hashing",
        title: "What is Hashing?",
        description: "Learn how we can turn data into unique fingerprints",
        icon: <Fingerprint className="h-6 w-6" />,
        color: "bg-orange-100",
        content: {
          story: "Imagine you are a detective who needs to match fingerprints to identify someone. Each fingerprint is unique, just like a hash!",
          explanation: "Hashing takes your data (like a password) and turns it into a unique string of letters and numbers. If anything changes in the data, the hash will also change.",
          example: "Data: 'MyPassword'\nHash: 5f4dcc3b5aa765d61d8327deb882cf99"
        },
        game: {
          title: "Find the Match",
          description: "Can you match the hash to its original data?",
          challenges: [
            {
              question: "Which of these hashes matches the data 'HELLO'?",
              options: ["8b1a9953c4611296a827abf8c47804d7", "5d41402abc4b2a76b9719d911017c592", "d2d2d2f5dc2d2e9d9a5fa5a6f1f1f1a1", "9d5e3ecdeb27d7d5b1a9f3a9c7a6f2f2"],
              correct: 0,
              explanation: "'HELLO' hashed with MD5 produces 8b1a9953c4611296a827abf8c47804d7."
            }
          ]
        }
      },
      {
        id: "one_time_pad",
        title: "Unbreakable Secrets",
        description: "Learn about one-time pads and why they are so secure",
        icon: <ShieldCheck className="h-6 w-6" />,
        color: "bg-purple-100",
        content: {
          story: "The ancient samurai would carry secret scrolls that could only be used once to decode messages. These were their one-time pads!",
          explanation: "A one-time pad uses a random key to encrypt your message. The key must be as long as the message and never reused, making it impossible to break.",
          example: "Message: 'HELLO'\nKey: 'XMCKL'\nEncrypted: 'EQNVZ'"
        },
        game: {
          title: "The Perfect Code",
          description: "Create your own one-time pad",
          challenges: [
            {
              question: "Why is a one-time pad unbreakable?",
              options: [
                "It uses a random key that is as long as the message",
                "The key can be reused",
                "It is based on mathematics",
                "It uses a computer to generate codes"
              ],
              correct: 0,
              explanation: "A one-time pad is unbreakable because the key is random, as long as the message, and never reused."
            }
          ]
        }
      },
      {
        id: "steganography",
        title: "Hidden Messages",
        description: "Learn how to hide messages in plain sight",
        icon: <Eye className="h-6 w-6" />,
        color: "bg-teal-100",
        content: {
          story: "Samurai sometimes hid secret messages in paintings or poems. Only their allies knew where to look!",
          explanation: "Steganography is the art of hiding messages in ordinary objects, like an image or a song. The message is there, but you can't see it unless you know the trick.",
          example: "A picture of a cat might have a secret message hidden in its pixel colors!"
        },
        game: {
          title: "The Hidden Scroll",
          description: "Decode messages hidden in pictures",
          challenges: [
            {
              question: "Where can messages be hidden using steganography?",
              options: ["Images", "Songs", "Videos", "All of the above"],
              correct: 3,
              explanation: "Messages can be hidden in various media, like images, songs, and videos."
            }
          ]
        }
      },
      {
        id: "2fa",
        title: "Double the Security",
        description: "Learn how 2FA keeps your accounts safe",
        icon: <Lock className="h-6 w-6" />,
        color: "bg-yellow-100",
        content: {
          story: "Imagine a samurai needing two keys to open a treasure chest: one he has and one the village elder knows. This is like two-factor authentication!",
          explanation: "2FA adds an extra layer of security. Even if someone gets your password, they need a second key (like a code from your phone) to access your account.",
          example: "Step 1: Enter your password\nStep 2: Enter the code sent to your phone"
        },
        game: {
          title: "Double Defense",
          description: "Practice securing accounts with 2FA",
          challenges: [
            {
              question: "What is an example of a second factor in 2FA?",
              options: ["A fingerprint", "A password", "Your username", "Your email"],
              correct: 0,
              explanation: "A fingerprint is a physical key that adds a second layer of security."
            }
          ]
        }
      },
      {
        id: "quantum",
        title: "The Future of Secrets",
        description: "Learn about quantum cryptography and its possibilities",
        icon: <Atom className="h-6 w-6" />,
        color: "bg-indigo-100",
        content: {
          story: "Imagine samurai using a magical crystal to send messages instantly over great distances. This is like quantum cryptography!",
          explanation: "Quantum cryptography uses the laws of physics to secure messages. It ensures that if someone tries to eavesdrop, the message is instantly altered, making it secure.",
          example: "Quantum Key Distribution (QKD) allows two parties to share a secret key securely over a quantum channel."
        },
        game: {
          title: "The Quantum Quest",
          description: "Understand the basics of quantum cryptography",
          challenges: [
            {
              question: "What makes quantum cryptography secure?",
              options: [
                "It uses physics to detect eavesdropping",
                "It uses very complex math",
                "It uses faster computers",
                "It is unbreakable"
              ],
              correct: 0,
              explanation: "Quantum cryptography uses the laws of physics to ensure secure communication."
            }
          ]
        }
      },
      {
        id: "blockLink",
        title: "Building Blocks of Security",
        description: "Understand how blockLink uses encryption",
        icon: <Link className="h-6 w-6" />,
        color: "bg-gray-100",
        content: {
          story: "A group of samurai kept their scrolls in a Link of treasure chests, each locked with a unique code. This Link ensured the safety of their secrets.",
          explanation: "BlockLink is a series of records linked together securely using cryptography. Each block contains encrypted data and a reference to the previous block, making it tamper-proof.",
          example: "Block 1: 'HELLO'\nBlock 2: 'WORLD' (linked to Block 1)"
        },
        game: {
          title: "Block by Block",
          description: "Build a secure Link using encryption",
          challenges: [
            {
              question: "Why is blockLink secure?",
              options: [
                "It links blocks with cryptography",
                "It uses a single key",
                "It has a central authority",
                "It is stored in one place"
              ],
              correct: 0,
              explanation: "BlockLink uses cryptography to link blocks, making it tamper-proof."
            }
          ]
        }
      }
                                    
  ]

const EncryptionLearningPortal: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [currentChallenge, setCurrentChallenge] = useState(0);

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    setShowDialog(true);
    setCurrentChallenge(0);
  };

  const handleAnswerSubmit = (moduleId: string, isCorrect: boolean) => {
    if (isCorrect) {
      setProgress((prev) => ({
        ...prev,
        [moduleId]: (prev[moduleId] || 0) + 33,
      }));
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-4 tracking-tighter">
            Encryption Academy
          </h1>
          <p className="text-xl text-amber-700">
            Learn the ancient art of secret messages
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card
              key={module.id}
              className={`${module.color} hover:shadow-lg transition-shadow cursor-pointer`}
              onClick={() => handleModuleClick(module)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  {module.icon}
                  <Badge variant="outline">
                    {progress[module.id] || 0}% Complete
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-2">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Progress value={progress[module.id] || 0} className="w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-4xl">
            {selectedModule && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    {selectedModule.icon}
                    {selectedModule.title}
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="learn">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="learn">Learn</TabsTrigger>
                    <TabsTrigger value="practice">Practice</TabsTrigger>
                  </TabsList>

                  <TabsContent value="learn" className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-6">
                          <div className="bg-amber-50 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">The Story</h3>
                            <p>{selectedModule.content.story}</p>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">How It Works</h3>
                            <p>{selectedModule.content.explanation}</p>
                          </div>

                          <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">Example</h3>
                            <p className="font-mono whitespace-pre-wrap">
                              {selectedModule.content.example}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="practice">
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedModule.game.title}</CardTitle>
                        <CardDescription>
                          {selectedModule.game.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedModule.game.challenges[currentChallenge] && (
                          <div className="space-y-4">
                            <p className="text-lg font-semibold">
                              {
                                selectedModule.game.challenges[
                                  currentChallenge
                                ].question
                              }
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {selectedModule.game.challenges[
                                currentChallenge
                              ].options.map((option, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  className="text-lg py-8"
                                  onClick={() =>
                                    handleAnswerSubmit(
                                      selectedModule.id,
                                      idx ===
                                        selectedModule.game.challenges[
                                          currentChallenge
                                        ].correct
                                    )
                                  }
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EncryptionLearningPortal;
