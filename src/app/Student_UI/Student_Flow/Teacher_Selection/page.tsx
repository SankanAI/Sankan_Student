"use client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {useRouter,  useSearchParams} from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Cookies from "js-cookie";

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
      name: "Miyamoto Musashi",
      specialty: "Katori Shinto-ryu",
      yearsTeaching: 50,
      studentsTrained: 334,
      notableStudents: ["Tsukahara Bokuden", "Matsumoto Bizen"]
    },
    { 
      id: "8", 
      url: "https://raw.githubusercontent.com/its-shashankY/filterImage/refs/heads/master/8thss.jpg",
      name: "Yagyū Munenori",
      specialty: "Tenshin Shinto-ryu",
      yearsTeaching: 50,
      studentsTrained: 334,
      notableStudents: ["Sanada Yukimura", "Matsumoto Bizen"]
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userid, setuserid]=useState<string>("");
  const supabase = createClientComponentClient();
  const secretKey= process.env.NEXT_PUBLIC_SECRET_KEY;
  const params = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  
  // Extract parameters from URL
  const principalId = params.get('principalId');
  const schoolId = params.get('schoolId');
  const teacherId = params.get('teacherId');

  const decryptData = (encryptedText: string): string => {
    const [ivBase64, encryptedBase64] = encryptedText.split('.');
    if (!ivBase64 || !encryptedBase64) return ''; 
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(secretKey).slice(0, 16); // Use the first 16 bytes for AES key
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const decryptedBytes = encryptedBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]); // XOR for decryption
    return new TextDecoder().decode(decryptedBytes);
  };

  const checkTeacherStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('teacher')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error checking teacher status:", error);
        throw error;
      }

      if (data && data.teacher !== "unassigned") {
        router.push(`/Student_UI/Student_Flow/Game_Map?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`);
      }
    } catch (err) {
      console.error("Error in checkAvatarStatus:", err);
      setError(err instanceof Error ? err.message : 'Failed to check avatar status');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(()=>{
    if(Cookies.get('userId')) {
      const decryptedId = decryptData(Cookies.get('userId')!);
      console.log("Decrypted userId:", decryptedId);
      setuserid(decryptedId);
      checkTeacherStatus(decryptedId);
    } else {
      router.push(`/Student_UI/Student_login?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)
    }
  },[userid, isChecking])

  const updateTeacherAvatar = async (TeacherName: string) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      console.log("Updating avatar for user:", userid);
      console.log("New avatar name:", TeacherName);
      
      const { data, error: updateError } = await supabase
        .from('students')
        .update({ teacher: TeacherName })
        .eq('id', userid)
        .select();
      
      console.log("Update response:", data);
      
      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }
      
      return true;
    } catch (err) {
      console.error("Error in updateStudentAvatar:", err);
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
      return false;
    } finally {
      setIsUpdating(false);
    }
};


  useEffect(()=>{ },[router])

  const handleTeacherClick = (teacher: TeacherProfile) => {
    setConfirmingTeacher(teacher);
    setShowDialog(true);
  };

  const handleConfirmSelection = async () => {
    if (!confirmingTeacher) return;
    
    const success = await updateTeacherAvatar(confirmingTeacher.name);
    
    if (success) {
      setSelectedTeacher(confirmingTeacher);
         setShowDialog(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#221111]">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-40 py-1">
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
                 <Separator className="my-4" />
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
              onClick={() => router.push(`/Student_UI/Student_Flow/Game_Map?principalId=${principalId}&schoolId=${schoolId}&teacherId=${teacherId}`)}
              disabled={!selectedTeacher || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Next'}
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