import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EVENTS = {
  click: 'Left Click',
  contextmenu: 'Right Click',
  dblclick: 'Double Click',
  mouseover: 'Mouse Over'
};

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

export default function EnhancedEmojiTrainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [emojis, setEmojis] = useState<EmojiBubble[]>([]);
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialBubbleCount = 5;

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
  }, [isPlaying]);

  const createEmoji = () => {
    const padding = 100;
    const eventType = Object.keys(EVENTS)[Math.floor(Math.random() * Object.keys(EVENTS).length)];

    return {
      id: Math.random().toString(36),
      x: Math.random() * (viewportSize.width - padding * 2) + padding - viewportSize.width / 2,
      y: Math.random() * (viewportSize.height - padding * 2) + padding - viewportSize.height / 2,
      size: Math.random() * 40 + 60,
      speed: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
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
  };

  return (
    <div ref={containerRef} className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
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
              Try using all different types of interactions! Each emoji can be interacted with in different ways.
            </AlertDescription>
          </Alert>
        )}

        {!isPlaying && !gameCompleted && (
          <Alert className="mb-4">
            <AlertTitle className="text-2xl font-bold ">Welcome to Event Practice!</AlertTitle>
            <AlertDescription>
              Practice different mouse events: left click, right click, double click, and mouse over.
              Watch for the instruction above each emoji to know which event to use!
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
              {eventStats.click<=0 && eventStats.dblclick<=0 && eventStats.mouseover<=0 && (
                  <Button onClick={startGame} className="w-full mt-4">
                    Try Again
                  </Button>
              )}
              {eventStats.click>0 && eventStats.dblclick>0 && eventStats.mouseover>0 && (
                <div className="flex gap-4">
                  <Button className="flex-1">
                    Try Again
                  </Button>
                  <Button  className="flex-1">
                      Next Level
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!isPlaying && !gameCompleted && (
          <Button onClick={startGame} className="w-full">
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