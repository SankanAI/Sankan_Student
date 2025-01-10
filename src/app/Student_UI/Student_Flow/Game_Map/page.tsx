"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { 
  Monitor, 
  GamepadIcon, 
  Code2, 
  Brain, 
  Palette,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoadmapNode {
  id: number;
  title: string;
  x: number;
  y: number;
  color: string;
  moduleId: number;
}

interface Module {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const modules: Module[] = [
  {
    id: 1,
    title: "Digital Explorer",
    description: "Learn computer basics and internet safety fundamentals",
    icon: <Monitor className="h-4 w-4" />,
    color: "#fef9c3"
  },
  {
    id: 2,
    title: "Logic Games",
    description: "Develop problem-solving and logical thinking skills",
    icon: <GamepadIcon className="h-4 w-4" />,
    color: "#fef9c3"
  },
  {
    id: 3,
    title: "Block Commander",
    description: "Master visual programming and basic coding concepts",
    icon: <Code2 className="h-4 w-4" />,
    color: "#dcfce7"
  },
  {
    id: 4,
    title: "Algorithm Adventure",
    description: "Learn basic algorithms and computational thinking",
    icon: <Brain className="h-4 w-4" />,
    color: "#e9d5ff"
  },
  {
    id: 5,
    title: "Creative Coder",
    description: "Create interactive stories and simple games",
    icon: <Palette className="h-4 w-4" />,
    color: "#fbcfe8"
  }
];

const roadmapNodes: RoadmapNode[] = [
  // Digital Explorer
  { id: 1, title: "Internet safety", x: 15, y: 20, color: "#fef9c3", moduleId: 1 },
  { id: 2, title: "Using mouse & keyboard", x: 20, y: 25, color: "#fef9c3", moduleId: 1 },
  { id: 3, title: "File management", x: 25, y: 30, color: "#fef9c3", moduleId: 1 },
  
  // Logic Games
  { id: 4, title: "Sequencing challenges", x: 40, y: 20, color: "#fef9c3", moduleId: 2 },
  { id: 5, title: "Puzzle solving", x: 45, y: 25, color: "#fef9c3", moduleId: 2 },
  { id: 6, title: "Pattern recognition", x: 50, y: 30, color: "#fef9c3", moduleId: 2 },
  
  // Block Commander
  { id: 7, title: "Creating sequences", x: 65, y: 20, color: "#dcfce7", moduleId: 3 },
  { id: 8, title: "Simple loops", x: 70, y: 25, color: "#dcfce7", moduleId: 3 },
  { id: 9, title: "Understanding blocks", x: 75, y: 30, color: "#dcfce7", moduleId: 3 },
  { id: 10, title: "Visual Programming Basics", x: 65, y: 35, color: "#dcfce7", moduleId: 3 },
  { id: 11, title: "Character movement", x: 70, y: 40, color: "#dcfce7", moduleId: 3 },
  { id: 12, title: "Creative Challenges", x: 75, y: 45, color: "#dcfce7", moduleId: 3 },
  { id: 13, title: "Animated stories", x: 65, y: 50, color: "#dcfce7", moduleId: 3 },
  { id: 14, title: "Basic animations", x: 70, y: 55, color: "#dcfce7", moduleId: 3 },
  
  // Algorithm Adventure
  { id: 15, title: "Basic Algorithms", x: 15, y: 60, color: "#e9d5ff", moduleId: 4 },
  { id: 16, title: "Decision making", x: 20, y: 65, color: "#e9d5ff", moduleId: 4 },
  { id: 17, title: "Step-by-step thinking", x: 25, y: 70, color: "#e9d5ff", moduleId: 4 },
  { id: 18, title: "Simple repetition", x: 30, y: 75, color: "#e9d5ff", moduleId: 4 },
  { id: 19, title: "Problem Solving", x: 35, y: 70, color: "#e9d5ff", moduleId: 4 },
  { id: 20, title: "Simple games", x: 40, y: 75, color: "#e9d5ff", moduleId: 4 },
  
  // Creative Coder
  { id: 21, title: "Show and tell", x: 55, y: 60, color: "#fbcfe8", moduleId: 5 },
  { id: 22, title: "Code review", x: 60, y: 65, color: "#fbcfe8", moduleId: 5 },
  { id: 23, title: "Interactive stories", x: 65, y: 70, color: "#fbcfe8", moduleId: 5 },
  { id: 24, title: "Basic games", x: 70, y: 75, color: "#fbcfe8", moduleId: 5 }
];

const createCurve = (start: {x: number, y: number}, end: {x: number, y: number}): string => {
  const controlPoint1X = start.x + (end.x - start.x) / 2;
  const controlPoint1Y = start.y;
  const controlPoint2X = controlPoint1X;
  const controlPoint2Y = end.y;
  
  return `M ${start.x} ${start.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${end.x} ${end.y}`;
};

const CodingJourneyRoadmap = () => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const params = useSearchParams();

  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

  const connections = [
    [1, 2], [2, 3],
    [4, 5], [5, 6],
    [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14],
    [15, 16], [16, 17], [17, 18], [15, 19], [19, 20],
    [21, 22], [22, 23], [23, 24]
  ];

  if (!principalId || !schoolId || !teacherId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
        Missing required parameters
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden p-8">
      {/* Module Legend */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-gray-800 p-4 rounded-lg">
        {modules.map(module => (
          <TooltipProvider key={module.id}>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2 text-white">
                  {module.icon}
                  <span>{module.title}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{module.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <svg className="absolute inset-0 w-full h-full">
        {connections.map(([fromId, toId], index) => {
          const fromNode = roadmapNodes.find(n => n.id === fromId);
          const toNode = roadmapNodes.find(n => n.id === toId);
          
          if (!fromNode || !toNode) return null;
          
          return (
            <path
              key={`connection-${index}`}
              d={createCurve(
                { x: fromNode.x * 10, y: fromNode.y * 10 },
                { x: toNode.x * 10, y: toNode.y * 10 }
              )}
              stroke={hoveredNode === fromId || hoveredNode === toId ? "#fff" : "#4b5563"}
              strokeWidth="2"
              fill="none"
              className="transition-colors duration-300"
            />
          );
        })}
      </svg>
      
      <TooltipProvider>
        {roadmapNodes.map((node) => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{
              left: `${node.x * 10}px`,
              top: `${node.y * 10}px`,
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <Tooltip>
              <TooltipTrigger>
                <Card
                  className="p-3 cursor-pointer transition-transform duration-300 hover:scale-110 flex items-center gap-2"
                  style={{
                    backgroundColor: node.color,
                    transform: hoveredNode === node.id ? 'scale(1.1)' : 'scale(1)',
                    zIndex: hoveredNode === node.id ? 10 : 1
                  }}
                >
                  <Info className="h-4 w-4" />
                  <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {node.title}
                  </p>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Part of {modules.find(m => m.id === node.moduleId)?.title}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </TooltipProvider>
    </div>
  );
};

export default CodingJourneyRoadmap;