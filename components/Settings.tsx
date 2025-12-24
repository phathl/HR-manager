import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  Bell, 
  Lock, 
  Users, 
  Clock, 
  Upload, 
  Save, 
  Shield,
  UserCheck
} from 'lucide-react';
import { UserRole, CompanySettings } from '../types';

interface SettingsProps {
  userRole: UserRole;
  onUpdateRole: (role: UserRole) => void;
  companyInfo: CompanySettings;
  onUpdateCompanyInfo: (info: CompanySettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ userRole, onUpdateRole, companyInfo, onUpdateCompanyInfo }) => {
  const [localCompanyInfo, setLocalCompanyInfo] = useState<CompanySettings>(companyInfo);
  const [workConfig, setWorkConfig] = useState({
    checkIn: '08:00',
    checkOut: '17:30',
    standardDays: 26
  });

  const logoInputRef = useRef<HTMLInputElement>(null);

  // Standard Input Class (Gray bg, Blue text)
  const INPUT_CLASS = "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-100 text-blue-700 font-medium placeholder-gray-400";

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const logoUrl = URL.createObjectURL(file);
      setLocalCompanyInfo({ ...localCompanyInfo, logo: logoUrl });
    }
  };

  const handleSaveCompanyInfo = () => {
    onUpdateCompanyInfo(localCompanyInfo);
    alert("Đã lưu thông tin công ty thành công!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <SettingsIcon className="text-gray-600"/> Cài đặt Hệ thống
        </h2>
        <p className="text-gray-500">Quản lý thông tin công ty, cấu hình làm việc và phân quyền</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* LEFT COLUMN: COMPANY INFO */}
         <div className="lg:col-span-2 space-y-6">
            {/* 1. Company Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
               <div className="border-b border-gray-100 p-4 bg-gray-50 flex items-center gap-2 font-bold text-gray-700">
                  <Building size={18} /> Thông tin Công ty
               </div>
               <div className="p-6 space-y-4">
                  <div className="flex items-center gap-6 mb-4">
                     <div 
                        className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 relative overflow-hidden group"
                        onClick={() => logoInputRef.current?.click()}
                     >
                        {localCompanyInfo.logo ? (
                           <img src={localCompanyInfo.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                           <div className="text-center">
                              <Upload size={24} className="mx-auto text-gray-400"/>
                              <span className="text-xs text-gray-500">Logo</span>
                           </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-white text-xs font-medium">Thay đổi</span>
                        </div>
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange}/>
                     </div>
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên công ty</label>
                        <input 
                           type="text" 
                           className={INPUT_CLASS} 
                           value={localCompanyInfo.name} 
                           onChange={(e) => setLocalCompanyInfo({...localCompanyInfo, name: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                        <input 
                           type="text" 
                           className={INPUT_CLASS} 
                           value={localCompanyInfo.taxId} 
                           onChange={(e) => setLocalCompanyInfo({...localCompanyInfo, taxId: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input 
                           type="text" 
                           className={INPUT_CLASS} 
                           value={localCompanyInfo.phone} 
                           onChange={(e) => setLocalCompanyInfo({...localCompanyInfo, phone: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
                        <input 
                           type="email" 
                           className={INPUT_CLASS} 
                           value={localCompanyInfo.email} 
                           onChange={(e) => setLocalCompanyInfo({...localCompanyInfo, email: e.target.value})}
                        />
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ trụ sở</label>
                        <input 
                           type="text" 
                           className={INPUT_CLASS} 
                           value={localCompanyInfo.address} 
                           onChange={(e) => setLocalCompanyInfo({...localCompanyInfo, address: e.target.value})}
                        />
                     </div>
                  </div>
                  
                  {/* NEW: Representative Info */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                     <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <UserCheck size={16}/> Thông tin người đại diện (Ký hợp đồng)
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên người đại diện</label>
                            <input 
                                type="text" 
                                className={INPUT_CLASS} 
                                value={localCompanyInfo.representativeName} 
                                onChange={(e) => setLocalCompanyInfo({...localCompanyInfo, representativeName: e.target.value})}
                                placeholder="VD: Nguyễn Văn A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                            <input 
                                type="text" 
                                className={INPUT_CLASS} 
                                value={localCompanyInfo.representativePosition} 
                                onChange={(e) => setLocalCompanyInfo({...localCompanyInfo, representativePosition: e.target.value})}
                                placeholder="VD: Giám Đốc"
                            />
                        </div>
                     </div>
                  </div>
               </div>
               <div className="px-6 py-3 bg-gray-50 text-right border-t border-gray-100">
                  <button 
                     onClick={handleSaveCompanyInfo}
                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center gap-2 ml-auto"
                  >
                     <Save size={18}/> Lưu thông tin
                  </button>
               </div>
            </div>

            {/* 2. Work Config */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-100 p-4 bg-gray-50 flex items-center gap-2 font-bold text-gray-700">
                   <Clock size={18} /> Cấu hình Thời gian & Làm việc
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Giờ vào chuẩn</label>
                          <input 
                              type="time" 
                              className={INPUT_CLASS}
                              value={workConfig.checkIn}
                              onChange={(e) => setWorkConfig({...workConfig, checkIn: e.target.value})}
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Giờ ra chuẩn</label>
                          <input 
                              type="time" 
                              className={INPUT_CLASS}
                              value={workConfig.checkOut}
                              onChange={(e) => setWorkConfig({...workConfig, checkOut: e.target.value})}
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số công chuẩn</label>
                          <input 
                              type="number" 
                              className={INPUT_CLASS}
                              value={workConfig.standardDays}
                              onChange={(e) => setWorkConfig({...workConfig, standardDays: parseInt(e.target.value)})}
                          />
                       </div>
                    </div>
                </div>
            </div>
         </div>

         {/* RIGHT COLUMN: PERMISSIONS & NOTIFICATIONS */}
         <div className="space-y-6">
            {/* 3. Role & Permissions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-orange-500">
                <div className="border-b border-gray-100 p-4 bg-orange-50 flex items-center gap-2 font-bold text-orange-700">
                   <Shield size={18} /> Phân Quyền & Vai Trò
                </div>
                <div className="p-6 space-y-4">
                   <p className="text-sm text-gray-600">
                      Chọn vai trò để mô phỏng phân quyền trong ứng dụng.
                   </p>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò hiện tại</label>
                      <select 
                         className={INPUT_CLASS}
                         value={userRole}
                         onChange={(e) => onUpdateRole(e.target.value as UserRole)}
                      >
                         <option value="USER">User (Nhân viên)</option>
                         <option value="MANAGER">Manager (Quản lý)</option>
                         <option value="ADMIN">Admin (Quản trị viên)</option>
                      </select>
                   </div>
                   
                   <div className="bg-gray-50 p-3 rounded text-xs text-gray-500 space-y-1 border border-gray-200">
                      <p><span className="font-bold">User:</span> Chỉ xem Dashboard, Cài đặt.</p>
                      <p><span className="font-bold">Manager/Admin:</span> Toàn quyền truy cập.</p>
                   </div>
                </div>
            </div>

            {/* 4. Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-100 p-4 bg-gray-50 flex items-center gap-2 font-bold text-gray-700">
                   <Bell size={18} /> Thông báo
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-gray-700">Email khi có ứng viên mới</span>
                       <input type="checkbox" className="w-5 h-5 text-blue-600 rounded bg-gray-100 border-gray-300" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-gray-700">Thông báo chấm công</span>
                       <input type="checkbox" className="w-5 h-5 text-blue-600 rounded bg-gray-100 border-gray-300" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-gray-700">Nhắc nhở sinh nhật</span>
                       <input type="checkbox" className="w-5 h-5 text-blue-600 rounded bg-gray-100 border-gray-300" />
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;