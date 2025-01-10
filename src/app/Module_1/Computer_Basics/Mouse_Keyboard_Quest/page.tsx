
"use client";
import { Timeline } from "@/components/ui/timeline";
import Image from "next/image";
// import BubbleTrainer from "./Mouse_Movement/page";

const timelineData = [
  {
    title: "Project Start",
    content: (
      <p className="text-neutral-700 dark:text-neutral-300">
        This marks the beginning of Aceternity. Brainstormed ideas, researched the market, and set the foundation for the project.
      </p>
    ),
  },
  {
    title: "First Milestone Achieved",
    content: (
      <p className="text-neutral-700 dark:text-neutral-300">
        Reached the first major milestone by completing the MVP. Tested core features and gathered feedback from early adopters.
      </p>
    ),
  },
  {
    title: "Scaling the Project",
    content: (
      <p className="text-neutral-700 dark:text-neutral-300">
        Expanded the team and started implementing advanced features. Focused on optimizing performance and user experience.
      </p>
    ),
  },
  {
    title: "Public Launch",
    content: (
      <p className="text-neutral-700 dark:text-neutral-300">
        Launched Aceternity to the public. Gained initial traction and started building a community of engaged users.
      </p>
    ),
  },
  {
    title: "Continuous Improvements",
    content: (
      <p className="text-neutral-700 dark:text-neutral-300">
        Regular updates based on user feedback. Enhanced features, fixed bugs, and added new integrations to expand functionality.
      </p>
    ),
  },
];

export default function Home() {
    return <Timeline data={timelineData} />;
  }