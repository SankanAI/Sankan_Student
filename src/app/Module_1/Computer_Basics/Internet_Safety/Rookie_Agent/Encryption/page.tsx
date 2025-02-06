"use client";
import React, { useState, useCallback, Suspense, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, Key, Lock, Link, Atom, Eye, Swords, Fingerprint, Crown
} from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from "js-cookie";


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

interface Encryption {
  id: string; // UUID
  rookieAgentId?: string; // Optional UUID foreign key
  studentId: string; // UUID
  completed: boolean;
  startedAt: Date;
  completedAt?: string;
  lastActivity: string;
}

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
            question: "Which message is the ciphertext (secret message)?",
            options: ["HELLO", "@#$%!!", "MEET AT NOON", "123456"],
            correct: 1,
            explanation: "Ciphertext is a message that looks unreadable without knowing the encryption rule. '@#$%!!' fits this description."
          },
          {
            question: "What is the plaintext for this ciphertext if the rule shifts each letter by 3? Ciphertext: 'FRZDUGV'",
            options: ["FORWARDS", "BACKWARDS", "ONWARDS", "UPWARDS"],
            correct: 0,
            explanation: "By shifting each letter in 'FRZDUGV' backward by 3, you get the plaintext 'FORWARDS'."
          },
          {
            question: "Which of these keys was used to encrypt the message 'LIPPS' from 'HELLO'?",
            options: ["Key = 1", "Key = 4", "Key = 5", "Key = 2"],
            correct: 2,
            explanation: "Using a key of 5 shifts each letter in 'HELLO' forward by 5, resulting in 'LIPPS'."
          },
          {
            question: "Your friend decrypted a message using a Caesar cipher. Which one of these messages was NOT encrypted with a key of 2?",
            options: [
              "Plaintext: 'MEET' → Ciphertext: 'OGGV'",
              "Plaintext: 'TRAIN' → Ciphertext: 'VTCKP'",
              "Plaintext: 'BATTLE' → Ciphertext: 'DCVVNG'",
              "Plaintext: 'SWORD' → Ciphertext: 'UXQTF'"
            ],
            correct: 1,
            explanation: "The second message does not follow the Caesar cipher rule with a key of 2, as the shifts do not align properly."
          },
          {
            question: "If 'H3LL0' is your ciphertext, which of these is the correct plaintext?",
            options: ["HELLO", "HALL0", "HILL0", "HALLO"],
            correct: 0,
            explanation: "'H3LL0' replaces 'E' with '3' in a simple substitution cipher. The correct plaintext is 'HELLO'."
          },
          {
            question: "You scrambled a message and sent it to your friend. The scrambled message is 'TIRNAGIN'. What is the plaintext?",
            options: ["TRAINING", "TRIGGERING", "TIERING", "TARGETING"],
            correct: 0,
            explanation: "Rearranging 'TIRNAGIN' gives the plaintext 'TRAINING'."
          },
          {
            question: "What is the correct ciphertext if the encryption rule shifts each letter forward by 4? Plaintext: 'SAMURAI'",
            options: ["WEQYVEFM", "SAMURAYI", "WEOYVEM", "WEQYWEM"],
            correct: 3,
            explanation: "Shifting each letter in 'SAMURAI' forward by 4 gives the ciphertext 'WEQYWEM'."
          },
          {
            question: "You intercepted four encrypted messages. Only one of them is valid ciphertext. Which one is it?",
            options: ["TRAINING", "!@#$%^", "MEET ME HERE", "HELLO123"],
            correct: 1,
            explanation: "Ciphertext looks unreadable and doesn't resemble the original plaintext. '!@#$%^' is the valid ciphertext."
          },
          {
            question: "Decrypt the following ciphertext: 'XUBBE MEET'. Rule: Shift each letter back by 5.",
            options: ["TRAIN MEET", "MEET HERE", "SAMURAI MEET", "HELLO MEET"],
            correct: 3,
            explanation: "Shifting each letter in 'XUBBE MEET' back by 5 gives 'HELLO MEET'."
          },
          {
            question: "Which message uses a substitution cipher? (Each letter is replaced with another letter.)",
            options: ["PLMNO PQRS", "!@#$% ^&*()", "GDKKN VNQKC", "12345 67890"],
            correct: 2,
            explanation: "'GDKKN VNQKC' is the only option that uses a substitution cipher. Each letter in 'HELLO WORLD' is shifted backward by 1."
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
          },
          {
            question: "Using a shift of 2, decode 'KHOOR'. What does it say?",
            options: ["HELLO", "WORLD", "CAESAR", "PEACE"],
            correct: 0,
            explanation: "Moving each letter back by 2 steps: K→H, H→E, O→L, O→L, R→O spells HELLO!"
          },
          {
            question: "What is the ciphertext of 'TRAIN' with a shift of 4?",
            options: ["UWBJS", "VXEMR", "XVEIR", "WYFMS"],
            correct: 3,
            explanation: "Shifting each letter forward by 4: T→W, R→Y, A→F, I→M, N→S results in 'WYFMS'."
          },
          {
            question: "If the ciphertext is 'FRZDUGV' with a shift of 3, what is the plaintext?",
            options: ["FORWARDS", "BACKWARDS", "ONWARDS", "UPWARDS"],
            correct: 0,
            explanation: "Shifting each letter back by 3: F→C, R→O, Z→W, D→A, U→R, G→D, V→S spells 'FORWARDS'."
          },
          {
            question: "What does 'NZDMF' decode to if the key is 1?",
            options: ["MYSTIC", "MEET", "MAGIC", "MYSELF"],
            correct: 3,
            explanation: "Shifting each letter back by 1: N→M, Z→Y, D→S, M→E, F→L spells 'MYSELF'."
          },
          {
            question: "What is the plaintext for the ciphertext 'SZWLY' if the shift is 5?",
            options: ["PLAIN", "SHIFT", "START", "CIPHER"],
            correct: 0,
            explanation: "Shifting each letter back by 5: S→P, Z→L, W→A, L→I, Y→N spells 'PLAIN'."
          },
          {
            question: "Decode 'WKH VHFUHW' with a shift of 3. What does it say?",
            options: ["THE SECRET", "WITH SECRET", "WE SECRET", "SEE SECRET"],
            correct: 0,
            explanation: "Shifting each letter back by 3: W→T, K→H, H→E, V→S, H→E, F→C, U→R, H→E, W→T spells 'THE SECRET'."
          },
          {
            question: "Encode 'SECRET' using a shift of 7. What is the ciphertext?",
            options: ["XJIZVW", "UIVOXL", "ZJOLZY", "YKJVYZ"],
            correct: 0,
            explanation: "Shifting each letter forward by 7: S→X, E→J, C→I, R→Z, E→V, T→W results in 'XJIZVW'."
          },
          {
            question: "What does 'DSOHG' mean with a shift of 3?",
            options: ["ALERT", "PLANE", "SPOKE", "TABLE"],
            correct: 3,
            explanation: "Shifting each letter back by 3: D→A, S→L, O→P, H→E, G→D spells 'TABLE'."
          },
          {
            question: "If the ciphertext is 'VJG OQTG', what is the plaintext using a shift of 2?",
            options: ["THE MORE", "THE LESS", "THE CODE", "THE NOTE"],
            correct: 0,
            explanation: "Shifting each letter back by 2: V→T, J→H, G→E, O→M, Q→O, T→R, G→E spells 'THE MORE'."
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
          },
          {
            question: "Using the code A=★, B=◆, C=▲, decode: ▲◆★◆",
            options: ["CABC", "CAB", "CBAB", "ABAC"],
            correct: 1,
            explanation: "Replace each symbol with its pair: ▲→C, ◆→B, ★→A spells CAB."
          },
          {
            question: "If M=♣, N=♦, O=♥, decode: ♣♦♥",
            options: ["MON", "MNO", "NOM", "OMN"],
            correct: 1,
            explanation: "Replace each symbol with its pair: ♣→M, ♦→N, ♥→O spells MNO."
          },
          {
            question: "If A=X, B=Y, C=Z, what is the ciphertext for 'BAC'?",
            options: ["YZX", "XYZ", "YXZ", "XZY"],
            correct: 2,
            explanation: "Replace each letter with its pair: B→Y, A→X, C→Z spells YXZ."
          },
          {
            question: "Decode ★▲◆★▲ using the code A=★, B=◆, C=▲.",
            options: ["ACAAC", "AABCA", "CABAC", "CBAAC"],
            correct: 0,
            explanation: "Replace each symbol with its pair: ★→A, ▲→C, ◆→B spells ACAAC."
          },
          {
            question: "If E=⚡, F=☀, G=❄, decode: ⚡☀❄☀⚡",
            options: ["EFFEF", "EFEFE", "EFGFE", "EFGFF"],
            correct: 1,
            explanation: "Replace each symbol with its pair: ⚡→E, ☀→F, ❄→G spells EFEFE."
          },
          {
            question: "If H=♠, I=♣, J=♦, encode: HIJIH",
            options: ["♠♣♦♣♠", "♦♣♠♠♣", "♣♠♠♣♦", "♠♦♠♣♣"],
            correct: 0,
            explanation: "Replace each letter with its symbol: H→♠, I→♣, J→♦ spells ♠♣♦♣♠."
          },
          {
            question: "If A=★, B=◆, C=▲, and D=■, decode: ▲■◆★",
            options: ["CADB", "CBAD", "DABC", "DCBA"],
            correct: 3,
            explanation: "Replace each symbol with its pair: ▲→C, ■→D, ◆→B, ★→A spells DCBA."
          },
          {
            question: "Using the code A=☆, B=♢, C=☽, decode: ☆♢☽☽☆",
            options: ["ABCCA", "ACBCA", "ACCBA", "ABACB"],
            correct: 0,
            explanation: "Replace each symbol with its pair: ☆→A, ♢→B, ☽→C spells ABCCA."
          },
          {
            question: "If P=☺, Q=☹, R=☻, encode: QPRPQ",
            options: ["☹☺☻☺☹", "☻☺☹☺☻", "☹☹☺☻☹", "☻☻☺☹☺"],
            correct: 0,
            explanation: "Replace each letter with its symbol: Q→☹, P→☺, R→☻ spells ☹☺☻☺☹."
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
          },
          {
            question: "What is 1111 XOR 0000?",
            options: ["0000", "1111", "1010", "1001"],
            correct: 1,
            explanation: "XOR with 0 leaves the bits unchanged, so the result is 1111."
          },
          {
            question: "What is 1100 XOR 1010?",
            options: ["0110", "1110", "0011", "0101"],
            correct: 0,
            explanation: "Performing XOR bit by bit: 1 XOR 1 = 0, 1 XOR 0 = 1, 0 XOR 1 = 1, 0 XOR 0 = 0, resulting in 0110."
          },
          {
            question: "What is 0110 XOR 0110?",
            options: ["0000", "1111", "1010", "1001"],
            correct: 0,
            explanation: "Any number XORed with itself results in 0, so the answer is 0000."
          },
          {
            question: "What is 1001 XOR 0101?",
            options: ["1100", "0011", "1111", "1010"],
            correct: 1,
            explanation: "Performing XOR bit by bit: 1 XOR 0 = 1, 0 XOR 1 = 1, 0 XOR 0 = 0, 1 XOR 1 = 0, resulting in 0011."
          },
          {
            question: "Which binary number, when XORed with 1010, results in 1111?",
            options: ["0101", "1101", "0111", "0011"],
            correct: 2,
            explanation: "Performing XOR: 1 XOR 0 = 1, 0 XOR 1 = 1, 1 XOR 1 = 0, 0 XOR 1 = 1, so the answer is 0111."
          },
          {
            question: "What is 0101 XOR 1010?",
            options: ["1111", "0000", "1101", "0010"],
            correct: 0,
            explanation: "Performing XOR bit by bit gives: 0 XOR 1 = 1, 1 XOR 0 = 1, 0 XOR 1 = 1, 1 XOR 0 = 1, resulting in 1111."
          },
          {
            question: "Which binary number, when XORed with 1111, results in 0000?",
            options: ["1111", "0000", "1010", "1100"],
            correct: 0,
            explanation: "Any number XORed with itself results in 0, so the answer is 1111."
          },
          {
            question: "What is 101010 XOR 110110?",
            options: ["011100", "111100", "001100", "100000"],
            correct: 2,
            explanation: "Performing XOR bit by bit gives: 1 XOR 1 = 0, 0 XOR 1 = 1, 1 XOR 0 = 1, 0 XOR 1 = 1, 1 XOR 1 = 0, 0 XOR 0 = 0, resulting in 001100."
          },
          {
            question: "If 1001 XOR X = 1110, what is X?",
            options: ["0111", "1101", "1011", "0101"],
            correct: 0,
            explanation: "To find X, XOR both sides of the equation with 1001: 1001 XOR 1110 = 0111."
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
              question: "Which of these hashes matches the data 'HELLO'?",
              options: [
                "8b1a9953c4611296a827abf8c47804d7",
                "5d41402abc4b2a76b9719d911017c592",
                "d2d2d2f5dc2d2e9d9a5fa5a6f1f1f1a1",
                "9d5e3ecdeb27d7d5b1a9f3a9c7a6f2f2"
              ],
              correct: 0,
              explanation: "'HELLO' hashed with MD5 produces 8b1a9953c4611296a827abf8c47804d7."
            },
            {
              question: "What happens if you hash 'hello' instead of 'HELLO'?",
              options: [
                "The hash stays the same.",
                "The hash is completely different.",
                "The hash changes slightly.",
                "Hashing doesn't work for lowercase letters."
              ],
              correct: 1,
              explanation: "Hashes are case-sensitive, so 'HELLO' and 'hello' produce completely different hashes."
            },
            {
              question: "Which of these hashes is produced by the data '12345' using MD5?",
              options: [
                "827ccb0eea8a706c4c34a16891f84e7b",
                "098f6bcd4621d373cade4e832627b4f6",
                "5d41402abc4b2a76b9719d911017c592",
                "7b8b965ad4bca0e41ab51de7b31363a1"
              ],
              correct: 0,
              explanation: "'12345' hashed with MD5 produces 827ccb0eea8a706c4c34a16891f84e7b."
            },
            {
              question: "If the hash of 'PASSWORD' is 319f4d26e3c536b5dd871bb2c52e3178, what happens if you add a space at the end?",
              options: [
                "The hash remains the same.",
                "The hash changes completely.",
                "The hash changes slightly.",
                "Hashing doesn't work with spaces."
              ],
              correct: 1,
              explanation: "Even a tiny change, like adding a space, results in a completely different hash."
            },
            {
              question: "Which of these hashes is likely to be a SHA-256 hash?",
              options: [
                "5d41402abc4b2a76b9719d911017c592",
                "098f6bcd4621d373cade4e832627b4f6",
                "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
                "9d5e3ecdeb27d7d5b1a9f3a9c7a6f2f2"
              ],
              correct: 2,
              explanation: "SHA-256 hashes are longer (64 characters) compared to MD5 hashes, which are 32 characters."
            },
            {
              question: "If two files produce the same hash, what does that mean?",
              options: [
                "They are the same file.",
                "They are different files.",
                "Hashing is broken.",
                "They might be the same file (collision)."
              ],
              correct: 3,
              explanation: "If two files produce the same hash, it's called a collision. However, it's rare in secure hashing algorithms."
            },
            {
              question: "What is the purpose of hashing passwords in databases?",
              options: [
                "To store passwords securely.",
                "To make them easy to remember.",
                "To encrypt them for later retrieval.",
                "To generate random passwords."
              ],
              correct: 0,
              explanation: "Hashing passwords ensures they are stored securely, and the original password cannot be retrieved."
            },
            {
              question: "Which data produces this hash: '098f6bcd4621d373cade4e832627b4f6'?",
              options: [
                "HELLO",
                "12345",
                "TEST",
                "test"
              ],
              correct: 3,
              explanation: "'test' hashed with MD5 produces 098f6bcd4621d373cade4e832627b4f6."
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
              question: "Why is a one-time pad unbreakable?",
              options: [
                "It uses a random key that is as long as the message",
                "The key can be reused",
                "It is based on mathematics",
                "It uses a computer to generate codes"
              ],
              correct: 0,
              explanation: "A one-time pad is unbreakable because the key is random, as long as the message, and never reused."
            },
            {
              question: "What happens if the key is reused in a one-time pad?",
              options: [
                "The encryption remains secure",
                "The encryption can be easily broken",
                "It becomes a two-time pad",
                "It generates a new key automatically"
              ],
              correct: 1,
              explanation: "If the key is reused, patterns can emerge, making the encryption vulnerable to attacks."
            },
            {
              question: "What is the primary requirement for the key in a one-time pad?",
              options: [
                "It must be longer than the message",
                "It must be random and as long as the message",
                "It must be generated using a computer",
                "It must be easy to remember"
              ],
              correct: 1,
              explanation: "The key must be completely random and the same length as the message for the encryption to be unbreakable."
            },
            {
              question: "What is an example of a one-time pad application?",
              options: [
                "Banking transactions",
                "World War II cipher communication",
                "Modern email encryption",
                "Data compression algorithms"
              ],
              correct: 1,
              explanation: "One-time pads were famously used for secure communication during World War II."
            },
            {
              question: "Why must the key in a one-time pad never be shared publicly?",
              options: [
                "It would make decryption too easy",
                "It could be used to encrypt more messages",
                "It would no longer be a random key",
                "Public sharing is against the rules"
              ],
              correct: 0,
              explanation: "If the key is shared publicly, an attacker can use it to decrypt the message, compromising security."
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
            },
            {
              question: "Which of the following is NOT a valid 2FA method?",
              options: [
                "A one-time code sent via SMS",
                "A secure password",
                "An authenticator app",
                "A hardware security key"
              ],
              correct: 1,
              explanation: "A password is the first factor, not a second factor, in two-factor authentication."
            },
            {
              question: "Why is 2FA more secure than just using a password?",
              options: [
                "It uses encryption.",
                "It requires two pieces of information to access an account.",
                "It hides your username.",
                "It replaces passwords entirely."
              ],
              correct: 1,
              explanation: "2FA is more secure because it requires both a password and a second factor, making it harder for attackers to gain access."
            },
            {
              question: "What should you do if you lose access to your 2FA method?",
              options: [
                "Disable 2FA completely.",
                "Use a backup code or recovery method.",
                "Create a new account.",
                "Share your login details with a friend."
              ],
              correct: 1,
              explanation: "Most platforms provide backup codes or recovery options to regain access if you lose your 2FA method."
            },
            {
              question: "Which of these is an example of a physical 2FA factor?",
              options: [
                "A PIN code",
                "A hardware security key",
                "An email verification code",
                "A phone call"
              ],
              correct: 1,
              explanation: "A hardware security key is a physical device that can be used as a second authentication factor."
            },
            {
              question: "What does 'two-factor' mean in 2FA?",
              options: [
                "Using two passwords",
                "Using two different authentication methods",
                "Using two email addresses",
                "Using two usernames"
              ],
              correct: 1,
              explanation: "'Two-factor' means combining two distinct methods, such as something you know (password) and something you have (code or key)."
            },
            {
              question: "Which of the following is the weakest form of 2FA?",
              options: [
                "SMS codes",
                "Authenticator apps",
                "Hardware keys",
                "Biometrics"
              ],
              correct: 0,
              explanation: "SMS codes are considered weaker because they can be intercepted or exploited through SIM swapping attacks."
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
            },
            {
              question: "What happens if someone tries to eavesdrop on a quantum communication channel?",
              options: [
                "The eavesdropper can intercept the message undetected",
                "The communication becomes faster",
                "The message is instantly altered",
                "Nothing happens; it remains secure"
              ],
              correct: 2,
              explanation: "Quantum cryptography ensures that any eavesdropping attempt alters the message, making it detectable."
            },
            {
              question: "What is Quantum Key Distribution (QKD)?",
              options: [
                "A method to share a secret key using quantum mechanics",
                "A way to encrypt messages using quantum computers",
                "A type of quantum teleportation",
                "A process for faster communication"
              ],
              correct: 0,
              explanation: "QKD is a secure method of sharing a secret key over a quantum channel using the principles of quantum mechanics."
            },
            {
              question: "What is the main advantage of quantum cryptography over classical cryptography?",
              options: [
                "It is faster",
                "It requires no keys",
                "It detects eavesdropping",
                "It uses simpler algorithms"
              ],
              correct: 2,
              explanation: "Quantum cryptography's primary advantage is its ability to detect eavesdropping using the principles of quantum mechanics."
            },
            {
              question: "What is a key concept in quantum mechanics used in quantum cryptography?",
              options: [
                "Entanglement",
                "Relativity",
                "Wave-particle duality",
                "Superposition"
              ],
              correct: 3,
              explanation: "Superposition is one of the key concepts in quantum mechanics, used to ensure the security of quantum cryptography."
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
              question: "Why is BlockLink secure?",
              options: [
                "It links blocks with cryptography",
                "It uses a single key",
                "It has a central authority",
                "It is stored in one place"
              ],
              correct: 0,
              explanation: "BlockLink uses cryptography to link blocks, making it tamper-proof."
            },
            {
              question: "What makes a BlockLink chain tamper-proof?",
              options: [
                "The data is encrypted",
                "The blocks are connected using cryptographic hashes",
                "It uses a centralized server",
                "All blocks are stored on a single device"
              ],
              correct: 1,
              explanation: "The blocks in BlockLink are connected using cryptographic hashes, making it very difficult to tamper with."
            },
            {
              question: "What happens if a single block in the BlockLink chain is changed?",
              options: [
                "Only the block itself changes.",
                "The entire chain becomes invalid.",
                "The previous block is also changed.",
                "No effect on the chain."
              ],
              correct: 1,
              explanation: "If a single block is altered, the reference to the previous block changes, making the entire chain invalid and tamper-proof."
            },
            {
              question: "Which of the following could be a potential use for BlockLink technology?",
              options: [
                "Creating a secure online voting system",
                "Designing a one-time password system",
                "Sending an encrypted email",
                "Encrypting a single file"
              ],
              correct: 0,
              explanation: "BlockLink can be used to create secure systems, like an online voting platform, where data integrity is crucial."
            },
            {
              question: "What is the main advantage of using BlockLink over a traditional database?",
              options: [
                "Centralized control",
                "Easier to manage",
                "Decentralized and tamper-proof",
                "Requires less storage space"
              ],
              correct: 2,
              explanation: "BlockLink is decentralized and tamper-proof, making it ideal for situations where data integrity and security are crucial."
            },
            {
              question: "Which cryptographic concept is often used in BlockLink technology to link blocks?",
              options: [
                "Symmetric encryption",
                "Public-key encryption",
                "Hash functions",
                "Asymmetric encryption"
              ],
              correct: 2,
              explanation: "Hash functions are commonly used in BlockLink to link each block to the previous one securely."
            },
            {
              question: "What is the role of cryptographic hashes in BlockLink?",
              options: [
                "To encrypt data",
                "To verify the integrity of data",
                "To store data",
                "To track ownership of data"
              ],
              correct: 1,
              explanation: "Cryptographic hashes are used to verify the integrity of data in BlockLink by creating a unique reference for each block."
            }
          ]
        }
      }
                                    
  ]
const EncryptionLearningPortal: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const [showDialog, setShowDialog] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challengeResult, setChallengeResult] = useState<{
    isCorrect: boolean | null;
    explanation: string;
  }>({ isCorrect: null, explanation: "" });
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string>('');
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');
  const [IsEncryptionCompleted, setIsEncryptionCompleted]=useState<boolean>(false);
  const [ProgressRecord, setProgressRecord]=useState<Encryption| null>(null);
  
  // New state for progress tracking
  const [moduleProgress, setModuleProgress] = useState<{
    [moduleId: string]: {
      progress: number;
      currentQuestion: number;
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      lastAttempted: string;
    }
  }>({});

  

  const UpdateProgress=()=>{
    const KeysSubject=Object.keys(moduleProgress);
    if(KeysSubject.length==10){
      let Completed=false;
      KeysSubject.forEach(function(element) {
        let res=moduleProgress[element]["totalQuestions"]- moduleProgress[element]["correctAnswers"]
        if(res>5){ Completed=false; console.log(`${element} is not yet Completed`)}
        else{ Completed=true; finalSubmit()}
      });
    }
    else{
      console.log(moduleProgress)
      console.log("Complete all Modules");
    }
  }


  
  const finalSubmit=async()=>{
    if (!ProgressRecord || !userId) return;
    
    const updates: Partial<Encryption> = {
      completed: true,
      completedAt:new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('encryption')
        .update(updates)
        .eq('id', ProgressRecord.id)
        .eq('rookie_agent_id',ProgressRecord.rookieAgentId)

      if (error) throw error;
    } catch (error) {
      console.log('Error updating progress:', error);
  }
}
  

  const decryptData = (encryptedText: string): string => {
    if (!process.env.NEXT_PUBLIC_SECRET_KEY) return '';
    const [ivBase64, encryptedBase64] = encryptedText.split('.');
    if (!ivBase64 || !encryptedBase64) return '';
    
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(process.env.NEXT_PUBLIC_SECRET_KEY).slice(0, 16);
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const decryptedBytes = encryptedBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
    
    return new TextDecoder().decode(decryptedBytes);
  };

  const initializeProgressRecord = async (studentId: string) => {
    try {
      // Check for existing computer_basics record
      const { data: computerBasicsData } = await supabase
        .from('computer_basics')
        .select('id')
        .eq('student_id', studentId)
        .single();
  
      // Create computer_basics record if it doesn't exist
      if (!computerBasicsData) {
        router.push(`/Module_1/Computer_Basics/Mouse_Keyboard_Quest/Mouse_Movement?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }

      // Initialize or check existing rookie_agent record
      let { data: rookieAgentData } = await supabase
        .from('rookie_agent')
        .select('*')
        .eq('student_id', studentId)
        .single();
  
      if (!rookieAgentData) {
        router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        return;
      }
  
      // Check or initialize encryption record
      const { data: encryptionData } = await supabase
        .from('encryption')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if(encryptionData){
        setProgressRecord(encryptionData);
      }
      else {
        const { data: encryptionData, error: encryptionError } = await supabase
          .from('encryption')
          .insert([{
            rookie_agent_id: rookieAgentData.id,
            student_id: studentId,
            completed: false,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          }])
          .select()
          .single();
        if (encryptionError) throw encryptionError;
        if(encryptionData){
          setProgressRecord(encryptionData);
        }
      }
    } catch (error) {
      console.log('Error initializing progress record:', error);
    }
  };

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    setShowDialog(true);
    
    // Initialize or load module progress
    if (!moduleProgress[module.id]) {
      setModuleProgress(prev => ({
        ...prev,
        [module.id]: {
          progress: 0,
          currentQuestion: 0,
          totalQuestions: module.game.challenges.length,
          correctAnswers: 0,
          incorrectAnswers: 0,
          lastAttempted: new Date().toISOString()
        }
      }));
    }
    
    setCurrentChallenge(moduleProgress[module.id]?.currentQuestion || 0);
    setChallengeResult({ isCorrect: null, explanation: "" });
  };

  const handleAnswerSubmit = useCallback((moduleId: string, selectedIndex: number) => {
    if (!selectedModule) return;

    const currentChal = selectedModule.game.challenges[currentChallenge];
    const isCorrect = selectedIndex === currentChal.correct;

    // Update progress
    setModuleProgress(prev => {
      const moduleStats = prev[moduleId] || {
        progress: 0,
        currentQuestion: 0,
        totalQuestions: selectedModule.game.challenges.length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        lastAttempted: new Date().toISOString()
      };

      return {
        ...prev,
        [moduleId]: {
          ...moduleStats,
          correctAnswers: isCorrect ? moduleStats.correctAnswers + 1 : moduleStats.correctAnswers,
          incorrectAnswers: !isCorrect ? moduleStats.incorrectAnswers + 1 : moduleStats.incorrectAnswers,
          currentQuestion: currentChallenge + 1,
          progress: Math.round(((currentChallenge + 1) / selectedModule.game.challenges.length) * 100),
          lastAttempted: new Date().toISOString()
        }
      };
    });

    setChallengeResult({
      isCorrect,
      explanation: currentChal.explanation
    });

    // Move to next challenge after delay
    setTimeout(() => {
      if (currentChallenge + 1 < selectedModule.game.challenges.length) {
        setCurrentChallenge(prev => prev + 1);
        setChallengeResult({ isCorrect: null, explanation: "" });
      }
    }, 2000);
  }, [selectedModule, currentChallenge]);

  useEffect(() => {
    const checkCompletion = async (decryptedId: string) => {
      try {
        const { data: encryptionData, error } = await supabase
          .from('encryption')
          .select('completed')
          .eq('student_id', decryptedId)
          .single();

        if (error) throw error;
        
        if (encryptionData?.completed) {
          setIsEncryptionCompleted(true);
          router.push(`/Module_1/Computer_Basics/Internet_Safety/Rookie_Agent?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
        }
      } catch (error) {
        console.log('Error checking completion status:', error);
      }
    };
   
    if (Cookies.get('userId')) {
      const decryptedId = decryptData(Cookies.get('userId')!);
      setUserId(decryptedId);
      checkCompletion(userId)
      if(!IsEncryptionCompleted){ initializeProgressRecord(decryptedId); }
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
    }
  }, [userId]);

  const renderProgressIndicator = (moduleId: string) => {
    const stats = moduleProgress[moduleId];
    if (!stats) return null;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Badge variant="outline">
            Question {stats.currentQuestion} of {stats.totalQuestions}
          </Badge>
          <Badge variant="outline" className="bg-green-100">
            Correct: {stats.correctAnswers}
          </Badge>
          <Badge variant="outline" className="bg-red-100">
            Incorrect: {stats.incorrectAnswers}
          </Badge>
        </div>
        <Progress value={stats.progress} className="w-full" />
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8">
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
                    {moduleProgress[module.id]?.progress || 0}% Complete
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-2">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <div className="w-full space-y-2">
                  <Progress value={moduleProgress[module.id]?.progress || 0} className="w-full" />
                  {moduleProgress[module.id] && (
                    <div className="text-sm text-gray-600">
                      Correct: {moduleProgress[module.id].correctAnswers} / 
                      Total: {moduleProgress[module.id].totalQuestions}
                    </div>
                  )}
                </div>
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
                            <pre className="font-mono whitespace-pre-wrap">
                              {selectedModule.content.example}
                            </pre>
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
                        {renderProgressIndicator(selectedModule.id)}
                      </CardHeader>
                      <CardContent>
                        {selectedModule.game.challenges[currentChallenge] && (
                          <div className="space-y-4">
                            <p className="text-lg font-semibold">
                              {selectedModule.game.challenges[currentChallenge].question}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {selectedModule.game.challenges[currentChallenge].options.map((option, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  className="text-lg py-8"
                                  onClick={() => handleAnswerSubmit(selectedModule.id, idx)}
                                  disabled={challengeResult.isCorrect !== null}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                            {challengeResult.isCorrect !== null && (
                              <div className={`p-4 rounded-lg ${
                                challengeResult.isCorrect ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                <p className="font-semibold">
                                  {challengeResult.isCorrect ? "Correct!" : "Incorrect"}
                                </p>
                                <p>{challengeResult.explanation}</p>
                              </div>
                            )}
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
        <button onClick={UpdateProgress}>Submit</button>
      </div>
    </div>
  );
};

const EncryptionLearningPortalApp = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <EncryptionLearningPortal />
    </Suspense>
  );
};

export default EncryptionLearningPortalApp;