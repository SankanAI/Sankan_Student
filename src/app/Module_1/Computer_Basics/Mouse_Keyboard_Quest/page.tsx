
"use client";
import { Timeline } from "@/components/ui/timeline";
// import BubbleTrainer from "./Mouse_Movement/page";
const timelineData = [
  {
    title: "2024",
    content: (
      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 mb-10">
        <h4 className="text-xl font-semibold mb-3">Major Platform Launch</h4>
        <p className="text-neutral-700 dark:text-neutral-300 mb-4">
          Successfully deployed the core platform with key features including real-time collaboration, 
          advanced authentication, and dynamic theming support. The initial response exceeded our expectations 
          with over 10,000 sign-ups in the first week.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">React</span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full text-sm">Node.js</span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-sm">TypeScript</span>
        </div>
      </div>
    )
  },
  {
    title: "2023",
    content: (
      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 mb-10">
        <h4 className="text-xl font-semibold mb-3">Architecture Overhaul</h4>
        <p className="text-neutral-700 dark:text-neutral-300 mb-4">
          Completely redesigned the system architecture to support scalability and improve performance. 
          Implemented microservices architecture and introduced containerization using Docker. 
          Reduced server response time by 60%.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900 rounded-full text-sm">Docker</span>
          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full text-sm">Kubernetes</span>
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-full text-sm">AWS</span>
        </div>
      </div>
    )
  },
  {
    title: "2022",
    content: (
      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 mb-10">
        <h4 className="text-xl font-semibold mb-3">Initial Concept</h4>
        <p className="text-neutral-700 dark:text-neutral-300 mb-4">
          Started the journey with a simple prototype. Focused on core functionality and user experience. 
          Conducted extensive market research and user interviews to validate the concept. 
          Secured initial seed funding based on the prototype.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 rounded-full text-sm">Research</span>
          <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 rounded-full text-sm">UX Design</span>
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 rounded-full text-sm">Prototyping</span>
        </div>
      </div>
    )
  }
];
export default function Home() {
    return <Timeline data={timelineData}/>;
  }