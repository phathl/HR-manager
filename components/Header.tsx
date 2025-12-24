import React from 'react';
import { Search } from 'lucide-react';

interface HeaderProps {
  onSearch?: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  return (
    <header className="h-14 bg-orange-500 flex items-center justify-between px-6 shadow-md fixed top-0 right-0 left-64 z-10">
      {/* Brand / Logo Area */}
      <div className="flex items-center text-white font-bold text-xl tracking-tight z-20">
        <span className="mr-1">Coffee</span><span className="font-light">HR</span>
      </div>

      {/* Search Bar - Centered Absolutely */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl px-4 z-10">
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Nhập nội dung tìm kiếm (Tên, SĐT...)" 
            className="w-full bg-white/20 text-white placeholder-white/70 border-none rounded-full py-1.5 pl-10 pr-4 focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all outline-none text-sm"
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={16} />
        </div>
      </div>
      
      {/* Spacer for right alignment if needed later */}
      <div className="w-20"></div>
    </header>
  );
};

export default Header;