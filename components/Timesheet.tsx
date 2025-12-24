import React, { useState } from 'react';
import { Candidate, CandidateStatus, AttendanceRecord, AttendanceStatus, LeaveType } from '../types';
import { 
  Users, 
  UserCheck, 
  UserX, 
  CalendarDays, 
  Clock, 
  Search, 
  X, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Calendar,
  PieChart
} from 'lucide-react';

interface TimesheetProps {
  candidates: Candidate[];
  searchTerm: string;
  attendanceData: AttendanceRecord[];
  onUpdateAttendance: (data: AttendanceRecord[]) => void;
}

const Timesheet: React.FC<TimesheetProps> = ({ candidates, searchTerm, attendanceData, onUpdateAttendance }) => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // State cho Modal Chấm công (Update)
  const [selectedEmployee, setSelectedEmployee] = useState<Candidate | null>(null);
  const [formState, setFormState] = useState<Partial<AttendanceRecord>>({
    status: 'PRESENT',
    leaveType: 'NONE',
    checkIn: '08:00',
    checkOut: '17:30',
    note: ''
  });

  // State cho Modal Tổng công (Summary)
  const [summaryEmployee, setSummaryEmployee] = useState<Candidate | null>(null);
  const [summaryMonth, setSummaryMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Lọc danh sách nhân viên: Chỉ lấy những người ĐÃ TUYỂN DỤNG
  const employees = candidates.filter(c => c.status === CandidateStatus.HIRED);
  
  // Lọc theo search term
  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.phone.includes(searchTerm)
  );

  // Thống kê Dashboard (Ngày hiện tại)
  const totalEmployees = employees.length;
  
  const presentToday = attendanceData.filter(
    r => r.date === currentDate && r.status === 'PRESENT' && employees.some(e => e.id === r.employeeId)
  ).length;

  const absentToday = attendanceData.filter(
    r => r.date === currentDate && r.status === 'ABSENT' && employees.some(e => e.id === r.employeeId)
  ).length;

  // --- LOGIC MODAL UPDATE ---
  const handleOpenAttendance = (employee: Candidate, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click row
    const existingRecord = attendanceData.find(r => r.employeeId === employee.id && r.date === currentDate);
    
    setSelectedEmployee(employee);
    if (existingRecord) {
      setFormState({
        status: existingRecord.status,
        leaveType: existingRecord.leaveType,
        checkIn: existingRecord.checkIn,
        checkOut: existingRecord.checkOut,
        note: existingRecord.note || ''
      });
    } else {
      setFormState({
        status: 'PRESENT',
        leaveType: 'NONE',
        checkIn: '08:00',
        checkOut: '17:30',
        note: ''
      });
    }
  };

  const handleSaveAttendance = () => {
    if (!selectedEmployee) return;

    const newRecord: AttendanceRecord = {
      id: `${selectedEmployee.id}_${currentDate}`,
      employeeId: selectedEmployee.id,
      date: currentDate,
      status: formState.status as AttendanceStatus,
      leaveType: formState.leaveType as LeaveType,
      checkIn: formState.status === 'PRESENT' ? formState.checkIn : undefined,
      checkOut: formState.status === 'PRESENT' ? formState.checkOut : undefined,
      note: formState.note
    };

    const updatedData = attendanceData.filter(r => !(r.employeeId === selectedEmployee.id && r.date === currentDate));
    onUpdateAttendance([...updatedData, newRecord]);
    
    setSelectedEmployee(null);
  };

  // --- LOGIC MODAL SUMMARY ---
  const handleViewSummary = (employee: Candidate) => {
    setSummaryEmployee(employee);
  };

  // Tính toán thống kê cho Modal Summary
  const calculateMonthlyStats = () => {
    if (!summaryEmployee) return { present: 0, absent: 0, leaveDays: 0, totalWorkDays: 0 };
    
    // Lọc record của nhân viên trong tháng được chọn
    const monthlyRecords = attendanceData.filter(r => 
      r.employeeId === summaryEmployee.id && 
      r.date.startsWith(summaryMonth)
    );

    const present = monthlyRecords.filter(r => r.status === 'PRESENT').length;
    const absent = monthlyRecords.filter(r => r.status === 'ABSENT').length;
    
    return {
      present,
      absent,
      totalRecords: monthlyRecords.length
    };
  };

  const monthlyStats = calculateMonthlyStats();

  // Helper
  const getRecord = (empId: string) => attendanceData.find(r => r.employeeId === empId && r.date === currentDate);

  const getStatusBadge = (record?: AttendanceRecord) => {
    if (!record) return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded border border-gray-200">Chưa chấm công</span>;
    if (record.status === 'PRESENT') return <span className="px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded font-medium border border-teal-200">Đi làm</span>;
    
    let leaveText = 'Nghỉ';
    let colorClass = 'bg-red-100 text-red-600 border-red-200';
    
    switch(record.leaveType) {
      case 'CO_PHEP': leaveText = 'Nghỉ có phép'; colorClass = 'bg-blue-100 text-blue-700 border-blue-200'; break;
      case 'KHONG_PHEP': leaveText = 'Nghỉ không phép'; colorClass = 'bg-red-100 text-red-700 border-red-200'; break;
      case 'OM': leaveText = 'Nghỉ ốm'; colorClass = 'bg-orange-100 text-orange-700 border-orange-200'; break;
      case 'PHEP_NAM': leaveText = 'Phép năm'; colorClass = 'bg-purple-100 text-purple-700 border-purple-200'; break;
      case 'THAI_SAN': leaveText = 'Thai sản'; colorClass = 'bg-pink-100 text-pink-700 border-pink-200'; break;
    }
    
    return <span className={`px-2 py-1 text-xs rounded font-medium border ${colorClass}`}>{leaveText}</span>;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 1. Header & Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-800">Bảng Công Tháng</h2>
           <p className="text-sm text-gray-500">Quản lý chấm công và ngày nghỉ của nhân sự</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg shadow-inner border border-gray-200">
           <button 
              className="p-2 hover:bg-gray-200 rounded text-teal-700 transition-colors"
              onClick={() => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 1);
                setCurrentDate(d.toISOString().split('T')[0]);
              }}
           >
             <ChevronLeft size={20} />
           </button>
           <div className="flex items-center gap-2 px-2 border-l border-r border-gray-300">
              <CalendarDays size={18} className="text-teal-600" />
              <input 
                type="date" 
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="font-bold text-teal-700 bg-transparent outline-none cursor-pointer"
              />
           </div>
           <button 
              className="p-2 hover:bg-gray-200 rounded text-teal-700 transition-colors"
              onClick={() => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() + 1);
                setCurrentDate(d.toISOString().split('T')[0]);
              }}
           >
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* 2. Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng nhân sự</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalEmployees}</h3>
            <p className="text-xs text-green-600 mt-1">Toàn công ty</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-green-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Hiện có</p>
            <h3 className="text-2xl font-bold text-gray-800">{presentToday}</h3>
            <p className="text-xs text-gray-400 mt-1">Nhân viên đi làm hôm nay</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Vắng mặt</p>
            <h3 className="text-2xl font-bold text-gray-800">{absentToday}</h3>
            <p className="text-xs text-gray-400 mt-1">Nghỉ phép / Không phép</p>
          </div>
        </div>
      </div>

      {/* 3. Employee List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
         <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Danh sách nhân viên</h3>
            <span className="text-xs text-gray-500 italic">* Click vào tên nhân viên để xem tổng công tháng</span>
         </div>
         
         <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold sticky top-0 z-10">
                <tr>
                  <th className="p-4 w-10">#</th>
                  <th className="p-4">Nhân viên</th>
                  <th className="p-4 text-center">Trạng thái chấm công</th>
                  <th className="p-4 text-center">Giờ vào</th>
                  <th className="p-4 text-center">Giờ ra</th>
                  <th className="p-4 text-center">Ghi chú</th>
                  <th className="p-4 text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      {employees.length === 0 
                        ? "Chưa có nhân viên nào được tuyển dụng. Vui lòng tuyển dụng thêm."
                        : "Không tìm thấy nhân viên phù hợp."}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, idx) => {
                    const record = getRecord(emp.id);
                    return (
                      <tr key={emp.id} className="hover:bg-teal-50/50 transition-colors">
                        <td className="p-4 text-gray-400">{idx + 1}</td>
                        {/* Click vào tên để mở Modal Tổng Công */}
                        <td 
                           className="p-4 cursor-pointer group"
                           onClick={() => handleViewSummary(emp)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                               <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:border-teal-400 transition-colors" />
                               <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow group-hover:block hidden">
                                  <PieChart size={12} className="text-teal-600"/>
                               </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 group-hover:text-teal-700 transition-colors">{emp.name}</div>
                              <div className="text-xs text-gray-500">{emp.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(record)}
                        </td>
                        <td className="p-4 text-center font-mono text-gray-600">
                           {record?.checkIn || '--:--'}
                        </td>
                        <td className="p-4 text-center font-mono text-gray-600">
                           {record?.checkOut || '--:--'}
                        </td>
                         <td className="p-4 text-center text-gray-500 max-w-[150px] truncate">
                           {record?.note || '-'}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={(e) => handleOpenAttendance(emp, e)}
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded text-xs font-medium border border-teal-200 transition-colors"
                          >
                            Cập nhật
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
         </div>
      </div>

      {/* 4. Attendance Modal */}
      {selectedEmployee && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
               <div className="bg-teal-600 p-4 flex justify-between items-center text-white">
                  <h3 className="font-bold flex items-center gap-2">
                     <Clock size={20} /> Cập nhật chấm công
                  </h3>
                  <button onClick={() => setSelectedEmployee(null)} className="text-white/80 hover:text-white">
                     <X size={24} />
                  </button>
               </div>

               <div className="p-6">
                  {/* Employee Info */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                     <img src={selectedEmployee.avatar} className="w-14 h-14 rounded-full border-2 border-teal-100 object-cover" />
                     <div>
                        <h4 className="font-bold text-teal-800 text-lg">{selectedEmployee.name}</h4>
                        <p className="text-sm text-teal-600 font-medium">{selectedEmployee.position} • ID: {selectedEmployee.id}</p>
                        <p className="text-xs text-teal-500 mt-1 font-medium bg-teal-50 inline-block px-2 py-0.5 rounded border border-teal-100">
                           Ngày: {new Date(currentDate).toLocaleDateString('vi-VN')}
                        </p>
                     </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-teal-700 mb-2">Trạng thái làm việc</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                              type="button"
                              onClick={() => setFormState({...formState, status: 'PRESENT', leaveType: 'NONE'})}
                              className={`py-2 px-4 rounded border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${formState.status === 'PRESENT' ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-teal-600 border-teal-200 hover:bg-teal-50'}`}
                           >
                              <UserCheck size={16} /> Đi làm
                           </button>
                           <button 
                              type="button"
                              onClick={() => setFormState({...formState, status: 'ABSENT'})}
                              className={`py-2 px-4 rounded border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${formState.status === 'ABSENT' ? 'bg-red-500 text-white border-red-500 shadow-md' : 'bg-white text-red-500 border-red-200 hover:bg-red-50'}`}
                           >
                              <UserX size={16} /> Nghỉ / Vắng
                           </button>
                        </div>
                     </div>

                     {formState.status === 'PRESENT' && (
                        <div className="grid grid-cols-2 gap-4 bg-teal-50 p-3 rounded-lg border border-teal-100">
                           <div>
                              <label className="block text-xs font-bold text-teal-700 mb-1">Giờ vào</label>
                              <input 
                                 type="time" 
                                 className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500 outline-none bg-white text-teal-800"
                                 value={formState.checkIn}
                                 onChange={(e) => setFormState({...formState, checkIn: e.target.value})}
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-teal-700 mb-1">Giờ ra</label>
                              <input 
                                 type="time" 
                                 className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500 outline-none bg-white text-teal-800"
                                 value={formState.checkOut}
                                 onChange={(e) => setFormState({...formState, checkOut: e.target.value})}
                              />
                           </div>
                        </div>
                     )}

                     {formState.status === 'ABSENT' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                           <label className="block text-sm font-bold text-teal-700 mb-1">Loại nghỉ</label>
                           <select 
                              className="w-full p-2 border border-red-300 rounded focus:ring-2 focus:ring-red-500 outline-none bg-white text-gray-700"
                              value={formState.leaveType}
                              onChange={(e) => setFormState({...formState, leaveType: e.target.value as LeaveType})}
                           >
                              <option value="NONE">-- Chọn lý do --</option>
                              <option value="CO_PHEP">Nghỉ có phép (Việc riêng)</option>
                              <option value="KHONG_PHEP">Nghỉ không phép</option>
                              <option value="OM">Nghỉ ốm (Có giấy BS)</option>
                              <option value="PHEP_NAM">Nghỉ phép năm</option>
                              <option value="THAI_SAN">Nghỉ thai sản</option>
                           </select>
                        </div>
                     )}

                     <div>
                        <label className="block text-sm font-bold text-teal-700 mb-1">Ghi chú</label>
                        <textarea 
                           rows={3}
                           className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500 outline-none bg-white text-sm text-gray-700"
                           placeholder="Nhập ghi chú chi tiết..."
                           value={formState.note}
                           onChange={(e) => setFormState({...formState, note: e.target.value})}
                        ></textarea>
                     </div>
                  </div>
               </div>

               <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                  <button 
                     onClick={() => setSelectedEmployee(null)}
                     className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 font-medium"
                  >
                     Hủy bỏ
                  </button>
                  <button 
                     onClick={handleSaveAttendance}
                     className="px-6 py-2 text-white bg-teal-600 rounded hover:bg-teal-700 font-bold shadow-md flex items-center gap-2"
                  >
                     <Save size={18} /> Lưu lại
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* 5. MODAL TỔNG CÔNG (NEW) */}
      {summaryEmployee && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center text-white">
                 <h3 className="font-bold flex items-center gap-2 text-lg">
                    <BarChart3 size={24} /> Tổng Hợp Công Tháng
                 </h3>
                 <button onClick={() => setSummaryEmployee(null)} className="text-white/80 hover:text-white bg-white/10 rounded-full p-1">
                    <X size={20} />
                 </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                 {/* Top Controls: Info & Month Filter */}
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                       <img src={summaryEmployee.avatar} className="w-16 h-16 rounded-full border-4 border-blue-50 shadow-sm object-cover"/>
                       <div>
                          <h2 className="text-2xl font-bold text-gray-800">{summaryEmployee.name}</h2>
                          <div className="flex gap-2 text-sm text-gray-500 font-medium">
                             <span>{summaryEmployee.position}</span>
                             <span>•</span>
                             <span>ID: {summaryEmployee.id}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                       <Calendar size={20} className="text-blue-600"/>
                       <input 
                          type="month"
                          value={summaryMonth}
                          onChange={(e) => setSummaryMonth(e.target.value)}
                          className="bg-transparent text-blue-800 font-bold outline-none"
                       />
                    </div>
                 </div>

                 {/* Stats Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                       <div className="text-sm font-semibold text-green-600 uppercase mb-1">Số ngày đi làm</div>
                       <div className="text-4xl font-extrabold text-green-700">{monthlyStats.present}</div>
                       <div className="text-xs text-green-500 mt-2">Ngày</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                       <div className="text-sm font-semibold text-red-600 uppercase mb-1">Số ngày nghỉ</div>
                       <div className="text-4xl font-extrabold text-red-700">{monthlyStats.absent}</div>
                       <div className="text-xs text-red-500 mt-2">Ngày (Phép/Không phép)</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                       <div className="text-sm font-semibold text-gray-500 uppercase mb-1">Tổng bản ghi</div>
                       <div className="text-4xl font-extrabold text-gray-700">{monthlyStats.totalRecords}</div>
                       <div className="text-xs text-gray-400 mt-2">Dữ liệu chấm công</div>
                    </div>
                 </div>

                 {/* Detail List (Simplified) */}
                 <div>
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                       <Clock size={16}/> Chi tiết chấm công tháng {summaryMonth}
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-gray-100 text-gray-600 font-semibold">
                             <tr>
                                <th className="p-3">Ngày</th>
                                <th className="p-3 text-center">Giờ vào</th>
                                <th className="p-3 text-center">Giờ ra</th>
                                <th className="p-3 text-center">Trạng thái</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {attendanceData
                                .filter(r => r.employeeId === summaryEmployee.id && r.date.startsWith(summaryMonth))
                                .sort((a, b) => a.date.localeCompare(b.date))
                                .map(record => (
                                   <tr key={record.id} className="hover:bg-gray-50">
                                      <td className="p-3 font-medium text-gray-700">{new Date(record.date).toLocaleDateString('vi-VN')}</td>
                                      <td className="p-3 text-center font-mono text-gray-500">{record.checkIn || '--:--'}</td>
                                      <td className="p-3 text-center font-mono text-gray-500">{record.checkOut || '--:--'}</td>
                                      <td className="p-3 text-center">{getStatusBadge(record)}</td>
                                   </tr>
                                ))
                             }
                             {monthlyStats.totalRecords === 0 && (
                                <tr>
                                   <td colSpan={4} className="p-8 text-center text-gray-400 italic">Không có dữ liệu chấm công cho tháng này</td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50 flex justify-end">
                 <button 
                    onClick={() => setSummaryEmployee(null)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-sm"
                 >
                    Đóng
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Timesheet;