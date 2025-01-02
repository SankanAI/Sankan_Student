"use client";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Check } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {useRouter} from "next/navigation";

interface TeacherProfile {
    id: string
    url: string
    name: string
    specialty: string
    yearsTeaching: number
    studentsTrained: number
    notableStudents: string[]
}

const teacherProfiles: TeacherProfile[] = [
    { 
      id: "1", 
      url: "https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/1sts.jpg",
      name: "Master Tsuramoto Tashizaki",
      specialty: "Kenjutsu",
      yearsTeaching: 45,
      studentsTrained: 312,
      notableStudents: ["Miyamoto Musashi", "Date Masamune"]
    },
    { 
      id: "2", 
      url: "https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/2nds.jpg",
      name: "Sensei Yagyu Muneyoshi",
      specialty: "Strategy & Swordsmanship",
      yearsTeaching: 38,
      studentsTrained: 245,
      notableStudents: ["Tokugawa Ieyasu", "Honda Tadakatsu"]
    },
    { 
      id: "3", 
      url: "https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/3rds.jpg",
      name: "Master Kamiizumi Nobutsuna",
      specialty: "Shinkage-ryū",
      yearsTeaching: 42,
      studentsTrained: 278,
      notableStudents: ["Yagyu Munenori", "Hojo Ujinaga"]
    },
    { 
      id: "4", 
      url: "https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/4ths.jpg",
      name: "Sensei Ito Ittosai",
      specialty: "Itto-ryu",
      yearsTeaching: 35,
      studentsTrained: 189,
      notableStudents: ["Ono Tadaaki", "Migogami Tenzen"]
    },
    { 
      id: "5", 
      url: "https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/5thss.jpg",
      name: "Master Toda Seigen",
      specialty: "Battle Tactics",
      yearsTeaching: 40,
      studentsTrained: 267,
      notableStudents: ["Sanada Yukimura", "Katakura Kojuro"]
    },
    { 
      id: "6", 
      url: "https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/6ths.jpg",
      name: "Sensei Iizasa Choisai",
      specialty: "Tenshin Shoden Katori Shinto-ryu",
      yearsTeaching: 50,
      studentsTrained: 334,
      notableStudents: ["Tsukahara Bokuden", "Matsumoto Bizen"]
    },
    { 
      id: "7", 
      url: "https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/7thss.jpg",
      name: "Sensei Iizasa Choisai",
      specialty: "Tenshin Shoden Katori Shinto-ryu",
      yearsTeaching: 50,
      studentsTrained: 334,
      notableStudents: ["Tsukahara Bokuden", "Matsumoto Bizen"]
    },
    { 
      id: "8", 
      url: "https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/8thss.jpg",
      name: "Sensei Iizasa Choisai",
      specialty: "Tenshin Shoden Katori Shinto-ryu",
      yearsTeaching: 50,
      studentsTrained: 334,
      notableStudents: ["Tsukahara Bokuden", "Matsumoto Bizen"]
    }
]

const TeacherCard = ({ 
  teacher, 
  isSelected, 
  onClick 
}: { 
  teacher: TeacherProfile; 
  isSelected: boolean;
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex flex-col gap-3 overflow-hidden rounded-xl cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div
        className="aspect-square w-full rounded-xl bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url("${teacher.url}")` }}
      >
        {isSelected && (
          <div className="absolute top-2 right-2 bg-black rounded-full p-1">
            <Check className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-white backdrop-blur-sm transition-transform duration-300 ease-in-out ${
          isHovered ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <h3 className="text-lg font-bold">{teacher.name}</h3>
        <div className="mt-2 space-y-1 text-sm">
          <p className="font-semibold text-amber-400">{teacher.specialty}</p>
          <p>Years Teaching: {teacher.yearsTeaching}</p>
          <p>Students Trained: {teacher.studentsTrained}</p>
          <p className="text-xs text-gray-300">
            Notable Students: {teacher.notableStudents.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function TeacherGallery() {
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [confirmingTeacher, setConfirmingTeacher] = useState<TeacherProfile | null>(null);
  const router=useRouter();

  const handleTeacherClick = (teacher: TeacherProfile) => {
    setConfirmingTeacher(teacher);
    setShowDialog(true);
  };

  const handleConfirmSelection = () => {
    setSelectedTeacher(confirmingTeacher);
    setShowDialog(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#221111]">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-40 py-5">
          <div className="flex w-[512px] flex-1 flex-col py-5">
            <div className="flex justify-between items-center px-4 pb-3 pt-5">
              <h2 className="text-left text-[28px] font-bold leading-tight tracking-tight text-white">
                Choose your master
              </h2>
              {selectedTeacher && (
                <p className="text-green-500 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Selected: {selectedTeacher.name}
                </p>
              )}
            </div>
            
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#c89393]" />
                <Input
                  placeholder="Search for a teacher"
                  className="h-12 w-full bg-[#472424] pl-10 text-white placeholder:text-[#c89393] focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(258px,1fr))] gap-3 p-4">
              {teacherProfiles.map((teacher) => (
                <TeacherCard 
                  key={teacher.id} 
                  teacher={teacher}
                  isSelected={selectedTeacher?.id === teacher.id}
                  onClick={() => handleTeacherClick(teacher)}
                />
              ))}
            </div>

            <div className="flex justify-end px-4 py-3">
              <Button 
                className="h-10 min-w-[84px] max-w-[480px] bg-[#472424] font-bold tracking-tight"
                onClick={()=>{router.push('/Student_UI/Student_Flow/Game_Map')}}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0f172a] text-white">
          <DialogHeader>
            <DialogTitle>Confirm Selection</DialogTitle>
            <DialogDescription className="text-[#c89393]">
              Are you sure you want to select {confirmingTeacher?.name} as your master?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start gap-3">
            <Button
              type="submit"
              onClick={handleConfirmSelection}
              className="bg-[#1e40af] hover:bg-[#331111]"
            >
              Confirm
            </Button>
            <Button
              type="button"
              onClick={() => setShowDialog(false)}
              className="text-white bg-[#be123c] hover:bg-[#331111]"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}