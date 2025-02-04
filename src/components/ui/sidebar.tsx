// RightSidebar.tsx
import { FC, ReactNode } from 'react';
import { X } from 'lucide-react';

interface RightSidebarProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const RightSidebar: FC<RightSidebarProps> = ({ children, isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 transition-opacity duration-300 ease-in-out z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header with close button */}
        <div className="flex justify-end p-4 border-b">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
};
