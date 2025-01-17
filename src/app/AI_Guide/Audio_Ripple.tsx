import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

export default function Audio_Ripple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    // Function to generate random position within the button
    const generateRipplePosition = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      return {
        x: Math.random() * (rect.width - size),
        y: Math.random() * (rect.height - size),
        size,
      };
    };

    // Function to create a new ripple
    const createRipple = () => {
      const button = document.querySelector(".ripple-button");
      if (!button) return;

      const { x, y, size } = generateRipplePosition(button as HTMLElement);
      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
        size,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 2000);
    };

    // Create new ripples at regular intervals
    const intervalId = setInterval(createRipple, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <button
      className="ripple-button relative overflow-hidden bg-blue-500 text-white p-4 w-64 h-32"
    >
      Ask Teacher
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={cn(
            "absolute rounded-full bg-white opacity-50",
            "animate-[ripple_2s_ease-out_forwards]"
          )}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </button>
  );
}