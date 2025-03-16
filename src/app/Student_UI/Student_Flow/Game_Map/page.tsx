"use client";// RoadmapTypes.ts
export interface SubTopic {
  title: string;
}

export interface Topic {
  title: string;
  subtopics: string[];
}

export interface Module {
  title: string;
  topics: Topic[];
}

// RoadmapComponent.tsx
import React, { useState, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface RoadmapItemProps {
  title: string;
  children?: ReactNode;
  level?: 1 | 2 | 3;
  defaultOpen?: boolean;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({ 
  title, 
  children, 
  level = 1, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  
  const textSizeClasses = {
    1: "text-xl font-bold",
    2: "text-lg font-semibold",
    3: "text-base font-medium"
  };
  
  const bgClasses = {
    1: "bg-slate-900 border-slate-700",
    2: "bg-slate-800 border-slate-700",
    3: "bg-slate-800/80 border-slate-700"
  };
  
  return (
    <div className={`roadmap-item level-${level} w-full ${level > 1 ? 'ml-4' : ''}`}>
      <Card className={`mb-3 shadow-md ${bgClasses[level]}`}>
        <CardHeader className="py-3 px-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center justify-between">
            <CardTitle className={`${textSizeClasses[level]} text-slate-100`}>
              {title}
            </CardTitle>
            {children && (
              isOpen ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </CardHeader>
        
        {isOpen && children && (
          <CardContent className="py-2 px-4">
            {children}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

interface SubTopicListProps {
  items: string[];
}

const SubTopicList: React.FC<SubTopicListProps> = ({ items }) => (
  <div className="grid grid-cols-1 gap-2 ml-2">
    {items.map((item, index) => (
      <div key={index} className="flex items-start space-x-2 w-[95%]">
        <div className="min-w-2 h-2 w-2 rounded-full bg-purple-500 mt-2"></div>
        <span className="text-slate-300 w-[95%]">{item}</span>
      </div>
    ))}
  </div>
);

const CurriculumRoadmap: React.FC = () => {
  const roadmapData: Module[] = [
    {
      title: "1: Digital Explorer",
      topics: [
        {
          title: "Computer Basics",
          subtopics: [
            "Using mouse & keyboard",
            "Internet safety",
            "File management"
          ]
        },
        {
          title: "Logic Games",
          subtopics: [
            "Pattern recognition",
            "Puzzle solving",
            "Sequencing challenges"
          ]
        }
      ]
    },
    {
      title: "2: Block Commander",
      topics: [
        {
          title: "Visual Programming Basics",
          subtopics: [
            "Understanding blocks",
            "Simple loops",
            "Creating sequences"
          ]
        },
        {
          title: "Creative Challenges",
          subtopics: [
            "Character movement",
            "Basic animations",
            "Animated stories"
          ]
        }
      ]
    },
    {
      title: "3: Algorithm Adventure",
      topics: [
        {
          title: "Basic Adventure",
          subtopics: [
            "Decision Making",
            "Simple Repetition",
            "Step-By-Step Thinking"
          ]
        },
        {
          title: "Problem Solving",
          subtopics: [
            "Pattern Creation",
            "Simple games",
            "Maze Navigation"
          ]
        }
      ]
    },
    {
      title: "4: Creative Coder",
      topics: [
        {
          title: "Project Based",
          subtopics: [
            "Simple Animation",
            "Interactive Stories",
            "Simple Animation"
          ]
        },
        {
          title: "Team Challenges",
          subtopics: [
            "Code Review",
            "Show and Tell",
            "Pair Programming"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-left text-white mb-8">
          Roadmap
        </h1>
        
        <div className="space-y-2">
          {roadmapData.map((module, moduleIndex) => (
            <React.Fragment key={moduleIndex}>
              <RoadmapItem title={module.title} level={1} defaultOpen={moduleIndex === 0}>
                <div className="space-y-2">
                  {module.topics.map((topic, topicIndex) => (
                    <RoadmapItem key={topicIndex} title={topic.title} level={2}>
                      <SubTopicList items={topic.subtopics} />
                    </RoadmapItem>
                  ))}
                </div>
              </RoadmapItem>
              
              {moduleIndex < roadmapData.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-8 h-8">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-purple-500">
                      <path fill="currentColor" d="M12 4l1.41 1.41L7.83 12l5.58 5.59L12 19l-7-7 7-7z" transform="rotate(270 12 12)"/>
                    </svg>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurriculumRoadmap;