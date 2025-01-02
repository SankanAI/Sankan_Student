import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LEVELS, EVENT_DESCRIPTIONS } from '@/lib/types';
import type { Level } from '@/lib/types';

type EmojiBubble = {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: { x: number; y: number; };
  emoji: string;
  eventType: string;
  burst: boolean;
};

const EMOJIS = ['😊', '🤣', '👿', '🐻', '🎮', '🎲', '🎪', '😉','👽','😇','🥶','🐯'];

export default function EmojiTrainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]);
  const [emojis, setEmojis] = useState<EmojiBubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
            setEmojis([]); // Clear emojis when game completes
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
  }, [isPlaying]);

  const createEmoji = () => {
    const padding = 100;
    const eventType = currentLevel.eventTypes[
      Math.floor(Math.random() * currentLevel.eventTypes.length)
    ];

    return {
      id: Math.random().toString(36),
      x: Math.random() * (viewportSize.width - padding * 2) + padding - viewportSize.width / 2,
      y: Math.random() * (viewportSize.height - padding * 2) + padding - viewportSize.height / 2,
      size: Math.random() * 40 + 60,
      speed: {
        x: (Math.random() - 0.5) * currentLevel.speedRange.max * 1.5,
        y: (Math.random() - 0.5) * currentLevel.speedRange.max * 1.5,
      },
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      eventType,
      burst: false,
    };
  };

  const handleEmojiEvent = (emojiId: string, eventType: string) => {
    if (!isPlaying) return; // Prevent interactions when game is not playing
    
    setEmojis(prev => {
      const emoji = prev.find(e => e.id === emojiId);
      if (emoji && emoji.eventType === eventType) {
        setScore(s => s + 1);
        setTimeout(() => {
          setEmojis(current => [...current, createEmoji()]);
        }, 500);
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

          if (Math.abs(newX) > maxX) {
            newX = maxX * Math.sign(newX);
            newSpeedX = -emoji.speed.x;
          }
          if (Math.abs(newY) > maxY) {
            newY = maxY * Math.sign(newY);
            newSpeedY = -emoji.speed.y;
          }

          return {
            ...emoji,
            x: newX,
            y: newY,
            speed: { x: newSpeedX, y: newSpeedY }
          };
        })
      );

      requestAnimationFrame(animate);
    };

    animate();
  }, [isPlaying, viewportSize]);

  const startGame = () => {
    setIsPlaying(true);
    setGameCompleted(false);
    setScore(0);
    setTimeLeft(currentLevel.timeLimit);
    const initialEmojis = Array(currentLevel.bubbleCount)
      .fill(null)
      .map(() => createEmoji());
    setEmojis(initialEmojis);
  };

  const handleNextLevel = () => {
    const nextLevelIndex = LEVELS.findIndex(level => level.id === currentLevel.id) + 1;
    if (nextLevelIndex < LEVELS.length) {
      setCurrentLevel(LEVELS[nextLevelIndex]);
      setGameCompleted(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="relative z-10 p-4 w-1/2 mx-[25%]">
        {/* Always show score and time during gameplay */}
        {isPlaying && (
          <Card className="p-4 mb-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline">Level {currentLevel.id}</Badge>
                <Badge variant="outline">Score: {score}</Badge>
                <Badge variant="outline">Time: {timeLeft}s</Badge>
              </div>
              <Progress value={(timeLeft / currentLevel.timeLimit) * 100} className="w-full" />
            </div>
          </Card>
        )}

        {/* Show game instructions before start */}
        {!isPlaying && !gameCompleted && (
          <Alert className="mb-4">
            <AlertTitle>{currentLevel.name}</AlertTitle>
            <AlertDescription>{currentLevel.description}</AlertDescription>
          </Alert>
        )}

        {/* Show game completion screen */}
        {gameCompleted && (
          <Alert className="mb-4">
            <AlertTitle>Level {currentLevel.id} Completed! 🎉</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>Final Score: {score}</p>
              <div className="flex gap-4">
                <Button onClick={startGame} className="flex-1">
                  Try Again
                </Button>
                {currentLevel.id < LEVELS.length && (
                  <Button onClick={handleNextLevel} className="flex-1">
                    Next Level
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Show start button only before game starts */}
        {!isPlaying && !gameCompleted && (
          <Button onClick={startGame} className="w-full">
            Start Level {currentLevel.id}
          </Button>
        )}
      </div>

      {/* Show emojis only during gameplay */}
      {isPlaying && emojis.map(emoji => (
        <div
          key={emoji.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
          style={{
            left: `${emoji.x + viewportSize.width / 2}px`,
            top: `${emoji.y + viewportSize.height / 2}px`,
            fontSize: `${emoji.size}px`,
            cursor: 'pointer',
          }}
          onClick={() => handleEmojiEvent(emoji.id, 'click')}
          onContextMenu={(e) => {
            e.preventDefault();
            handleEmojiEvent(emoji.id, 'contextmenu');
          }}
          onDoubleClick={() => handleEmojiEvent(emoji.id, 'dblclick')}
          onMouseOver={() => handleEmojiEvent(emoji.id, 'mouseover')}
          onMouseEnter={() => handleEmojiEvent(emoji.id, 'mouseenter')}
          onMouseLeave={() => handleEmojiEvent(emoji.id, 'mouseleave')}
          onMouseMove={() => handleEmojiEvent(emoji.id, 'mousemove')}
          onMouseDown={() => handleEmojiEvent(emoji.id, 'mousedown')}
          onMouseUp={() => handleEmojiEvent(emoji.id, 'mouseup')}
          onKeyDown={() => handleEmojiEvent(emoji.id, 'keydown')}
          draggable={emoji.eventType === 'drag'}
          onDragStart={() => handleEmojiEvent(emoji.id, 'drag')}
          onDrop={() => handleEmojiEvent(emoji.id, 'drop')}
        >
          <div className="select-none">{emoji.emoji}</div>
          <div className="text-xs text-center absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/50 text-white px-2 py-1 rounded">
            {EVENT_DESCRIPTIONS[emoji.eventType]}
          </div>
        </div>
      ))}
    </div>
  );
}