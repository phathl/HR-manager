import React from 'react';
import { MENU_ITEMS } from '../constants';
import { ViewState, UserRole, CompanySettings } from '../types';
import { Edit, Shield } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  userRole: UserRole;
  companyInfo: CompanySettings;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userRole, companyInfo }) => {
  // Lọc menu items dựa trên Role hiện tại
  const visibleMenuItems = MENU_ITEMS.filter(item => item.allowedRoles.includes(userRole));

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-20 overflow-y-auto">
      {/* Company Info Header */}
      <div className="h-14 flex items-center justify-center border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 font-bold text-xl text-orange-600 tracking-tight">
             {companyInfo.logo ? (
                 <img src={companyInfo.logo} alt="Logo" className="w-8 h-8 object-contain" />
             ) : (
                 <img src="https://img.icons8.com/fluency/96/coffee.png" alt="Logo" className="w-8 h-8" />
             )}
             <span>{companyInfo.name.split(' ')[0]}<span className="font-light text-gray-600">HR</span></span>
          </div>
      </div>

      {/* User Profile Section */}
      <div className="p-6 flex flex-col items-center border-b border-gray-100">
        <div className="relative">
          <img 
            src="https://picsum.photos/id/64/200/200" 
            alt="User Avatar" 
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
          <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow border border-gray-200 hover:bg-gray-50">
            <Edit size={12} className="text-gray-600" />
          </button>
        </div>
        <h3 className="mt-3 font-bold text-gray-800 text-lg">Đinh Phạm Diệu Tín</h3>
        <div className="flex items-center gap-1 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${userRole === 'ADMIN' ? 'bg-red-100 text-red-600 border-red-200' : userRole === 'MANAGER' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
                {userRole}
            </span>
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">Chuyên viên HCNS</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4">
        <ul>
          {visibleMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors duration-150
                  ${currentView === item.id 
                    ? 'text-orange-600 bg-orange-50 border-r-4 border-orange-500' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Decorative Illustration */}
      <div className="p-6 mt-auto">
        <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center border border-blue-100">
            <Shield size={32} className="text-blue-300 mb-2 opacity-50"/>
            <p className="text-xs text-gray-400 text-center font-mono">Ver 2.5.0 Lite</p>
            <p className="text-[10px] text-gray-300 text-center mt-1">© 2023 CoffeeHR</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;