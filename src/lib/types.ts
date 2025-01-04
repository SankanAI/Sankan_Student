// lib/types.ts
export interface Bubble {
    id: string;
    x: number;
    y: number;
    size: number;
    speed: { x: number; y: number };
    color: string;
    eventType: string;
    burst: boolean;
  }
  
  export interface Level {
    id: number;
    name: string;
    description: string;
    eventTypes: string[];
    bubbleCount: number;
    timeLimit: number;
    speedRange: { min: number; max: number };
  }
  
  // lib/constants.ts
  export const LEVELS: Level[] = [
    {
      id: 1,
      name: "Basic Interactions",
      description: "Learn the fundamental mouse events like click, double-click, and right-click",
      eventTypes: ["click", "dblclick", "contextmenu", "mouseover"],
      bubbleCount: 5,
      timeLimit: 60,
      speedRange: { min: 0.5, max: 1 }
    }
  ];
  