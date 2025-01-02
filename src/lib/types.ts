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
  
  // lib/eventDescriptions.ts
  export const EVENT_DESCRIPTIONS: Record<string, string> = {
    click: "Click once on the bubble to burst it!",
    dblclick: "Double-click quickly to pop this bubble!",
    contextmenu: "Right-click on the bubble to burst it!",
    mouseover: "Move your mouse over the bubble to pop it!",
    mouseenter: "Enter the bubble area to make it burst!",
    mouseleave: "Enter and leave the bubble to pop it!",
    mousemove: "Move your mouse inside the bubble to burst it!",
    mousedown: "Press and hold your mouse button on the bubble!",
    mouseup: "Press and release your mouse button to pop it!",
    keydown: "Focus the bubble and press any key!",
    drag: "Click and drag the bubble to its target!",
    drop: "Drag and drop on the target zone!"
  };