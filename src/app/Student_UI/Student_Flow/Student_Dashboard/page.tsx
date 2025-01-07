import React from 'react';
import { ScrollText, Award, Sword, Target, BookOpen, Trophy, Star, Timer } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


// Mock data for the dashboard
const studentData = {
  name: "Takeshi Yamamoto",
  level: 7,
  rank: "Bronze Warrior",
  guide: {
    name: "Sensei Kaito",
    specialty: "Basic Math",
    image: "/api/placeholder/150/200"
  },
  stats: {
    problemsSolved: 156,
    accuracy: 84,
    averageTime: "4:30",
    streakDays: 12
  },
  rewards: [
    { id: 1, name: "Speed Master", description: "Solved 10 problems under 2 minutes", date: "2024-03-15", icon: Timer },
    { id: 2, name: "Perfect Accuracy", description: "100% accuracy in Basic Math", date: "2024-03-10", icon: Target },
    { id: 3, name: "Problem Solver", description: "Solved 150+ problems", date: "2024-03-05", icon: ScrollText },
  ],
  recentAchievements: [
    { id: 1, name: "Multiplication Master", score: "95%", date: "2024-03-20" },
    { id: 2, name: "Division Challenge", score: "88%", date: "2024-03-18" },
    { id: 3, name: "Word Problems Level 3", score: "92%", date: "2024-03-15" }
  ]
};

export default function StudentDashboard() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#221111]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#472424] px-10 py-3">
        <div className="flex items-center gap-4 text-white">
          <div className="size-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Samurai Profile</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#c89393]">Grade 6</span>
          <div className="size-10 rounded-full bg-[#472424]" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Left Column - Student Info & Guide */}
        <div className="flex w-80 flex-col gap-6">
          {/* Student Card */}
          <Card className="bg-[#472424] text-white border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Student Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-20 rounded-full bg-[#653434]" />
                  <div>
                    <h3 className="font-bold">{studentData.name}</h3>
                    <p className="text-sm text-[#c89393]">Level {studentData.level} • {studentData.rank}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-[#c89393]">Problems Solved</p>
                    <p className="font-bold">{studentData.stats.problemsSolved}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-[#c89393]">Accuracy</p>
                    <p className="font-bold">{studentData.stats.accuracy}%</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-[#c89393]">Avg. Time</p>
                    <p className="font-bold">{studentData.stats.averageTime}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-[#c89393]">Streak</p>
                    <p className="font-bold">{studentData.stats.streakDays} days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guide Card */}
          <Card className="bg-[#472424] text-white border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Your Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img 
                  src={studentData.guide.image} 
                  alt={studentData.guide.name}
                  className="w-16 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-bold">{studentData.guide.name}</h3>
                  <p className="text-sm text-[#c89393]">{studentData.guide.specialty}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Rewards & Achievements */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-[#472424] text-white border-none">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2">
                  <ScrollText className="size-8 text-amber-400" />
                  <p className="text-2xl font-bold">{studentData.stats.problemsSolved}</p>
                  <p className="text-sm text-[#c89393]">Problems Solved</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#472424] text-white border-none">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2">
                  <Target className="size-8 text-amber-400" />
                  <p className="text-2xl font-bold">{studentData.stats.accuracy}%</p>
                  <p className="text-sm text-[#c89393]">Accuracy</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#472424] text-white border-none">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2">
                  <Timer className="size-8 text-amber-400" />
                  <p className="text-2xl font-bold">{studentData.stats.averageTime}</p>
                  <p className="text-sm text-[#c89393]">Avg. Time</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#472424] text-white border-none">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2">
                  <Award className="size-8 text-amber-400" />
                  <p className="text-2xl font-bold">{studentData.rewards.length}</p>
                  <p className="text-sm text-[#c89393]">Rewards</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="bg-[#472424] text-white border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-5 text-amber-400" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.recentAchievements.map(achievement => (
                  <div key={achievement.id} className="flex items-center justify-between rounded-lg bg-[#653434] p-3">
                    <div className="flex items-center gap-3">
                      <Star className="size-5 text-amber-400" />
                      <div>
                        <p className="font-bold">{achievement.name}</p>
                        <p className="text-sm text-[#c89393]">{achievement.date}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-400">{achievement.score}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card className="bg-[#472424] text-white border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-5 text-amber-400" />
                Earned Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {studentData.rewards.map(reward => {
                  const Icon = reward.icon;
                  return (
                    <div key={reward.id} className="flex flex-col items-center rounded-lg bg-[#653434] p-4 text-center">
                      <Icon className="size-8 text-amber-400 mb-2" />
                      <h4 className="font-bold">{reward.name}</h4>
                      <p className="text-sm text-[#c89393] mt-1">{reward.description}</p>
                      <p className="text-xs text-[#c89393] mt-2">{reward.date}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}