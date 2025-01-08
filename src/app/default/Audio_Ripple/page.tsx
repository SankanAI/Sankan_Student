"use client";

import React, { useState, MouseEvent } from "react";
import { cn } from "@/lib/utils"; // Ensure ShadCN utility is properly typed

// Define the Ripple type
type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

export default function RippleEffect() {
  // State to manage ripples
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Handler to create ripple
  const createRipple = (event: MouseEvent<HTMLDivElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 500); // Remove ripple after animation
  };

  return (
    <div
      className="relative overflow-hidden bg-gray-100 rounded-full w-80 h-80 flex items-center justify-center"
      onClick={createRipple}
    >
      <p className="text-lg font-medium text-gray-600">Ripple</p>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={cn(
            "absolute bg-gray-400 opacity-30 rounded-full animate-ripple"
          )}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </div>
  );
}
