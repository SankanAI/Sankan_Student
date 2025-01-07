"use client";

import { Separator } from "@/components/ui/separator";
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
import { useRouter } from "next/navigation";

interface SamuraiImage {
    id: string
    url: string
    name: string
    battlesFought: number
    battlesWon: number
}

const samuraiImages: SamuraiImage[] = [
    { 
      id: "1", 
      url: "https://cdn.usegalileo.ai/sdxl10/084d42d2-9b01-40e6-8e19-2d7211c851cd.png",
      name: "Miyamoto Musashi",
      battlesFought: 61,
      battlesWon: 61
    },
    { 
      id: "2", 
      url: "https://cdn.usegalileo.ai/sdxl10/68e94173-5002-44db-8d47-28b1dda4391a.png",
      name: "Oda Nobunaga",
      battlesFought: 45,
      battlesWon: 42
    },
    { 
      id: "3", 
      url: "https://cdn.usegalileo.ai/sdxl10/7a328040-18ee-42b1-91a9-8415f9765e04.png",
      name: "Tokugawa Ieyasu",
      battlesFought: 38,
      battlesWon: 35
    },
    { 
      id: "4", 
      url: "https://cdn.usegalileo.ai/sdxl10/0d810185-4a4b-4369-bd3c-c3b128a7b00a.png",
      name: "Date Masamune",
      battlesFought: 52,
      battlesWon: 48
    },
    { 
      id: "5", 
      url: "https://cdn.usegalileo.ai/sdxl10/19bbad5e-4b87-4225-aa2e-475c899af2ee.png",
      name: "Takeda Shingen",
      battlesFought: 49,
      battlesWon: 44
    },
    { 
      id: "6", 
      url: "https://cdn.usegalileo.ai/sdxl10/2ad907de-e02c-4e66-b48a-4e8e4fda6e7a.png",
      name: "Uesugi Kenshin",
      battlesFought: 41,
      battlesWon: 39
    },
    { 
      id: "7", 
      url: "https://cdn.usegalileo.ai/sdxl10/6bf8ada2-2a4f-4a80-ae14-bceabe444a10.png",
      name: "Sanada Yukimura",
      battlesFought: 35,
      battlesWon: 32
    },
    { 
      id: "8", 
      url: "https://cdn.usegalileo.ai/sdxl10/552ed8f5-f605-4a38-b72d-adbbf6738e78.png",
      name: "Honda Tadakatsu",
      battlesFought: 57,
      battlesWon: 57
    },
    { 
      id: "9", 
      url: "https://cdn.usegalileo.ai/sdxl10/4bcfe076-f1af-4b3f-ae88-1344c2af0524.png",
      name: "Hattori Hanzo",
      battlesFought: 33,
      battlesWon: 31
    },
    { 
      id: "10", 
      url: "https://cdn.usegalileo.ai/sdxl10/74f036fd-5d45-4577-a3e7-29f24567d5ec.png",
      name: "Mori Motonari",
      battlesFought: 42,
      battlesWon: 40
    },
    { 
      id: "11", 
      url: "https://cdn.usegalileo.ai/sdxl10/7657def4-dca6-4d81-97b7-fa598a35d3d5.png",
      name: "Shimazu Yoshihiro",
      battlesFought: 38,
      battlesWon: 35
    },
    { 
      id: "12", 
      url: "https://cdn.usegalileo.ai/sdxl10/a11cc31b-7806-4e1a-96c2-22fc16f9b53d.png",
      name: "Katakura Kojuro",
      battlesFought: 31,
      battlesWon: 28
    },
  ]

const SamuraiCard = ({ 
  samurai, 
  isSelected, 
  onClick 
}: { 
  samurai: SamuraiImage; 
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
        style={{ backgroundImage: `url("${samurai.url}")` }}
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
        <h3 className="text-lg font-bold">{samurai.name}</h3>
        <div className="mt-2 space-y-1 text-sm">
          <p>Battles Fought: {samurai.battlesFought}</p>
          <p>Battles Won: {samurai.battlesWon}</p>
          <p className="text-xs text-gray-300">
            Win Rate: {((samurai.battlesWon / samurai.battlesFought) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default function SamuraiGallery() {
  const [selectedSamurai, setSelectedSamurai] = useState<SamuraiImage | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [confirmingSamurai, setConfirmingSamurai] = useState<SamuraiImage | null>(null);
  const router=useRouter();

  const handleSamuraiClick = (samurai: SamuraiImage) => {
    setConfirmingSamurai(samurai);
    setShowDialog(true);
  };

  const handleConfirmSelection = () => {
    setSelectedSamurai(confirmingSamurai);
    setShowDialog(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#221111]">
      <div className="flex h-full grow flex-col">
        
        <div className="flex flex-1 justify-center px-40 py-0">
          <div className="flex w-[512px] flex-1 flex-col py-5">
            <div className="flex justify-between items-center px-4 pb-3 pt-5">
              <h2 className="text-left text-[28px] font-bold leading-tight tracking-tight text-white">
                Choose your samurai
              </h2>
              {selectedSamurai && (
                <p className="text-green-500 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Selected: {selectedSamurai.name}
                </p>
              )}
            </div>
            
            <div className="px-4 py-3">
              <div className="relative">
                 <Separator className="my-4" />
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(258px,1fr))] gap-3 p-4">
              {samuraiImages.map((samurai) => (
                <SamuraiCard 
                  key={samurai.id} 
                  samurai={samurai}
                  isSelected={selectedSamurai?.id === samurai.id}
                  onClick={() => handleSamuraiClick(samurai)}
                />
              ))}
            </div>

            <div className="flex justify-end px-4 py-3">
              <Button 
                className="h-10 min-w-[84px] max-w-[480px] bg-[#472424] font-bold tracking-tight"
                onClick={()=>{router.push('/Student_UI/Student_Flow/Teacher_Selection')}}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0f172a] text-white border-[#94a3b8]">
          <DialogHeader>
            <DialogTitle>Confirm Selection</DialogTitle>
            <DialogDescription className="text-[#c89393]">
              Are you sure you want to select {confirmingSamurai?.name}?
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
              variant="secondary"
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