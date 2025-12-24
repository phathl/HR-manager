import React, { useState, useRef } from 'react';
import { 
  Plus, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Circle, 
  Upload, 
  FileText, 
  X, 
  Save, 
  Target,
  BarChart3,
  Filter,
  User
} from 'lucide-react';
import { Candidate, CandidateStatus, Task, UserRole } from '../types';

interface DashboardProps {
  candidates: Candidate[];
  userRole: UserRole;
  // Dữ liệu cũ không dùng nhưng giữ lại trong interface nếu cần mở rộng sau
  attendanceData?: any; 
  contracts?: any;
}

// Dữ liệu mẫu ban đầu
const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Hoàn thiện tài liệu dự án CoffeeHR',
    description: 'Viết tài liệu hướng dẫn sử dụng cho module Tuyển dụng và Chấm công.',
    assigneeId: '1', // Trịnh Tuấn Linh
    dueDate: '2023-11-20',
    status: 'IN_PROGRESS',
    kpiPoints: 10
  },
  {
    id: 't2',
    title: 'Thiết kế banner sự kiện Year End Party',
    description: 'Thiết kế 3 options banner để duyệt.',
    assigneeId: '3', // Dương Văn Anh (BA - giả sử làm thêm)
    dueDate: '2023-11-15',
    status: 'TODO',
    kpiPoints: 5
  },
  {
    id: 't3',
    title: 'Tuyển dụng 2 Senior ReactJS',
    description: 'Sàng lọc CV và phỏng vấn vòng 1.',
    assigneeId: '7', // Nguyễn Thị Hồng Hạnh
    dueDate: '2023-11-30',
    status: 'DONE',
    kpiPoints: 20,
    reportFile: 'Danh_sach_ung_vien_V1.xlsx',
    reportNote: 'Đã phỏng vấn 5 ứng viên, chọn được 2 người vào vòng sau.',
    reportDate: '2023-11-10'
  }
];

const Dashboard: React.FC<DashboardProps> = ({ candidates, userRole }) => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<'tasks' | 'kpi'>('tasks');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // State Modal Giao việc
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: new Date().toISOString().split('T')[0],
    kpiPoints: 5,
    status: 'TODO'
  });

  // State Modal Báo cáo
  const [reportModalData, setReportModalData] = useState<{task: Task} | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportNote, setReportNote] = useState('');

  // Lọc nhân viên chính thức
  const employees = candidates.filter(c => c.status === CandidateStatus.HIRED);

  // Giả lập ID người dùng hiện tại (Demo: Nếu là USER thì giả định là nhân viên có ID '1' - Trịnh Tuấn Linh)
  const currentUserId = userRole === 'USER' ? '1' : 'ADMIN';

  // Chuẩn input
  const INPUT_CLASS = "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-100 text-blue-700 font-medium placeholder-gray-400";

  // --- ACTIONS ---

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assigneeId) {
      alert("Vui lòng nhập tên công việc và người thực hiện");
      return;
    }
    const t: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title || '',
      description: newTask.description || '',
      assigneeId: newTask.assigneeId,
      dueDate: newTask.dueDate || '',
      kpiPoints: Number(newTask.kpiPoints),
      status: 'TODO'
    };
    setTasks([t, ...tasks]);
    setIsTaskModalOpen(false);
    setNewTask({ title: '', description: '', assigneeId: '', dueDate: '', kpiPoints: 5, status: 'TODO' });
  };

  const handleSubmitReport = () => {
    if (!reportModalData) return;
    
    const updatedTasks = tasks.map(t => {
      if (t.id === reportModalData.task.id) {
        return {
          ...t,
          status: 'REVIEW' as const, // Chuyển sang trạng thái chờ duyệt
          reportFile: reportFile ? reportFile.name : t.reportFile,
          reportNote: reportNote,
          reportDate: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    setReportModalData(null);
    setReportFile(null);
    setReportNote('');
  };

  const handleApproveTask = (taskId: string) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'DONE' as const } : t);
    setTasks(updatedTasks);
    if (reportModalData?.task.id === taskId) setReportModalData(null);
  };

  const handleRejectTask = (taskId: string) => {
     // Manager từ chối, yêu cầu làm lại
     const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'IN_PROGRESS' as const } : t);
     setTasks(updatedTasks);
     if (reportModalData?.task.id === taskId) setReportModalData(null);
  };

  // Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO': return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">Chưa bắt đầu</span>;
      case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-200">Đang thực hiện</span>;
      case 'REVIEW': return <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-bold border border-orange-200">Chờ duyệt</span>;
      case 'DONE': return <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold border border-green-200">Hoàn thành</span>;
      default: return null;
    }
  };

  // Filter Tasks
  const displayedTasks = tasks.filter(t => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesUser = userRole === 'MANAGER' || userRole === 'ADMIN' ? true : t.assigneeId === currentUserId;
    return matchesStatus && matchesUser;
  });

  return (
    <div className="space-y-6">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="text-orange-600"/> Quản lý Công việc & KPI
           </h2>
           <p className="text-gray-500 text-sm">Giao việc, theo dõi tiến độ và đánh giá hiệu quả nhân sự</p>
        </div>
        <div className="flex bg-gray-200 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'tasks' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
               <ClipboardList size={16} /> Danh sách công việc
            </button>
            {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
              <button 
                onClick={() => setActiveTab('kpi')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'kpi' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                 <Target size={16} /> Tổng hợp KPI
              </button>
            )}
        </div>
      </div>

      {/* --- TAB: TASKS --- */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[600px]">
           {/* Filters & Actions */}
           <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-gray-300">
                    <Filter size={16} className="text-gray-400"/>
                    <select 
                      className="bg-transparent outline-none text-sm text-gray-700 font-medium cursor-pointer"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                       <option value="ALL">Tất cả trạng thái</option>
                       <option value="TODO">Chưa bắt đầu</option>
                       <option value="IN_PROGRESS">Đang thực hiện</option>
                       <option value="REVIEW">Chờ duyệt</option>
                       <option value="DONE">Hoàn thành</option>
                    </select>
                 </div>
              </div>
              
              {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
                >
                   <Plus size={18}/> Giao việc mới
                </button>
              )}
           </div>

           {/* Task List */}
           <div className="flex-1 overflow-auto p-4 space-y-3">
              {displayedTasks.length === 0 ? (
                 <div className="text-center py-10 text-gray-400">Không có công việc nào.</div>
              ) : (
                 displayedTasks.map(task => {
                    const assignee = employees.find(e => e.id === task.assigneeId);
                    return (
                       <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex justify-between items-start gap-4">
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                {getStatusBadge(task.status)}
                                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 font-bold">
                                   {task.kpiPoints} điểm KPI
                                </span>
                             </div>
                             <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                             <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                             
                             <div className="flex items-center gap-4 mt-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                   <Clock size={14}/> Hạn chót: <span className="font-semibold">{new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                   <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-300">
                                      <img src={assignee?.avatar || 'https://via.placeholder.com/20'} className="w-full h-full object-cover"/>
                                   </div>
                                   <span className="font-medium">{assignee?.name || 'Unknown'}</span>
                                </div>
                             </div>

                             {/* Report Preview info */}
                             {task.status !== 'TODO' && task.status !== 'IN_PROGRESS' && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                   <div className="text-sm flex items-center gap-2 text-blue-600 font-medium">
                                      <FileText size={14}/> Kết quả: {task.reportFile || 'Đã báo cáo (không đính kèm)'}
                                   </div>
                                   {task.reportNote && <p className="text-xs text-gray-500 mt-1 italic">"{task.reportNote}"</p>}
                                </div>
                             )}
                          </div>

                          <div className="flex flex-col gap-2">
                             {/* Nút cho Nhân viên (Báo cáo) */}
                             {userRole === 'USER' && task.status !== 'DONE' && task.status !== 'REVIEW' && (
                                <button 
                                  onClick={() => setReportModalData({task})}
                                  className="px-3 py-1.5 bg-white border border-blue-500 text-blue-600 rounded text-sm font-bold hover:bg-blue-50 flex items-center gap-1"
                                >
                                   <Upload size={14}/> Báo cáo
                                </button>
                             )}

                             {/* Nút cho Quản lý (Duyệt) */}
                             {(userRole === 'MANAGER' || userRole === 'ADMIN') && task.status === 'REVIEW' && (
                                <>
                                   <button 
                                     onClick={() => handleApproveTask(task.id)}
                                     className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 flex items-center gap-1 shadow-sm"
                                   >
                                      <CheckCircle2 size={14}/> Duyệt
                                   </button>
                                   <button 
                                     onClick={() => handleRejectTask(task.id)}
                                     className="px-3 py-1.5 bg-red-100 text-red-600 border border-red-200 rounded text-sm font-bold hover:bg-red-200"
                                   >
                                      Từ chối
                                   </button>
                                </>
                             )}
                             
                             {/* Nút Edit/Details chung */}
                             <button 
                                onClick={() => setReportModalData({task})}
                                className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded text-sm font-medium"
                             >
                                Chi tiết
                             </button>
                          </div>
                       </div>
                    )
                 })
              )}
           </div>
        </div>
      )}

      {/* --- TAB: KPI --- */}
      {activeTab === 'kpi' && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 size={20} className="text-purple-600"/> Tổng hợp hiệu suất nhân viên
               </h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white text-gray-500 text-xs font-semibold border-b border-gray-200 uppercase tracking-wider">
                     <tr>
                        <th className="p-4">Nhân viên</th>
                        <th className="p-4 text-center">Tổng việc</th>
                        <th className="p-4 text-center">Đã xong</th>
                        <th className="p-4 text-center">Chờ duyệt</th>
                        <th className="p-4 text-center">Đang làm</th>
                        <th className="p-4 text-right">Tổng điểm KPI</th>
                        <th className="p-4 text-center">Đánh giá</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                     {employees.map(emp => {
                        const empTasks = tasks.filter(t => t.assigneeId === emp.id);
                        const total = empTasks.length;
                        const done = empTasks.filter(t => t.status === 'DONE').length;
                        const review = empTasks.filter(t => t.status === 'REVIEW').length;
                        const progress = empTasks.filter(t => t.status === 'IN_PROGRESS').length;
                        const totalPoints = empTasks
                           .filter(t => t.status === 'DONE')
                           .reduce((sum, t) => sum + t.kpiPoints, 0);
                        
                        let rating = '---';
                        let ratingColor = 'text-gray-400';
                        if (total > 0) {
                           if (totalPoints >= 50) { rating = 'Xuất sắc'; ratingColor = 'text-purple-600 font-bold'; }
                           else if (totalPoints >= 30) { rating = 'Tốt'; ratingColor = 'text-green-600 font-bold'; }
                           else if (totalPoints >= 15) { rating = 'Khá'; ratingColor = 'text-blue-600 font-bold'; }
                           else { rating = 'Cần cố gắng'; ratingColor = 'text-orange-500 font-medium'; }
                        }

                        return (
                           <tr key={emp.id} className="hover:bg-gray-50">
                              <td className="p-4">
                                 <div className="flex items-center gap-3">
                                    <img src={emp.avatar} className="w-9 h-9 rounded-full object-cover border border-gray-200"/>
                                    <div>
                                       <div className="font-bold text-gray-800">{emp.name}</div>
                                       <div className="text-xs text-gray-500">{emp.position}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-4 text-center font-medium">{total}</td>
                              <td className="p-4 text-center text-green-600 font-bold">{done}</td>
                              <td className="p-4 text-center text-orange-500">{review}</td>
                              <td className="p-4 text-center text-blue-500">{progress}</td>
                              <td className="p-4 text-right">
                                 <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold border border-purple-200">
                                    {totalPoints}
                                 </span>
                              </td>
                              <td className={`p-4 text-center ${ratingColor}`}>{rating}</td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* --- MODAL GIAO VIỆC --- */}
      {isTaskModalOpen && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
               <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     <Plus size={20} className="text-blue-600"/> Giao việc mới
                  </h3>
                  <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
               </div>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Tên công việc</label>
                     <input 
                        type="text" 
                        className={INPUT_CLASS}
                        placeholder="VD: Viết báo cáo tháng..."
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                     <textarea 
                        className={INPUT_CLASS}
                        rows={3}
                        placeholder="Mô tả yêu cầu công việc..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện</label>
                        <select 
                           className={INPUT_CLASS}
                           value={newTask.assigneeId}
                           onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}
                        >
                           <option value="">-- Chọn nhân viên --</option>
                           {employees.map(e => (
                              <option key={e.id} value={e.id}>{e.name} - {e.position}</option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hạn hoàn thành</label>
                        <input 
                           type="date" 
                           className={INPUT_CLASS}
                           value={newTask.dueDate}
                           onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Điểm KPI (Trọng số)</label>
                     <input 
                        type="number" 
                        className={INPUT_CLASS}
                        value={newTask.kpiPoints}
                        onChange={(e) => setNewTask({...newTask, kpiPoints: Number(e.target.value)})}
                     />
                  </div>
               </div>

               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Hủy</button>
                  <button onClick={handleCreateTask} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 shadow-sm">Giao việc</button>
               </div>
            </div>
         </div>
      )}

      {/* --- MODAL BÁO CÁO / CHI TIẾT --- */}
      {reportModalData && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
               <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800">Chi tiết công việc</h3>
                  <button onClick={() => setReportModalData(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div>
                     <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">{reportModalData.task.title}</h2>
                        {getStatusBadge(reportModalData.task.status)}
                     </div>
                     <p className="text-gray-600 text-sm mt-2 p-3 bg-gray-50 rounded border border-gray-100">{reportModalData.task.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                        <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Người thực hiện</span>
                        <div className="flex items-center gap-2">
                           <User size={16} className="text-gray-400"/>
                           <span className="font-medium text-gray-800">
                              {employees.find(e => e.id === reportModalData.task.assigneeId)?.name || 'Unknown'}
                           </span>
                        </div>
                     </div>
                     <div>
                        <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Hạn chót</span>
                        <div className="flex items-center gap-2">
                           <Clock size={16} className="text-gray-400"/>
                           <span className="font-medium text-gray-800">{new Date(reportModalData.task.dueDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                     </div>
                  </div>

                  {/* Khu vực Báo cáo (Chỉ hiện khi user là assignee và chưa xong, hoặc đã báo cáo rồi) */}
                  <div className="pt-4 border-t border-gray-100">
                     <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Upload size={18} className="text-blue-600"/> Báo cáo kết quả
                     </h4>
                     
                     {/* Form Báo cáo (Nếu là User & Task chưa xong) */}
                     {userRole === 'USER' && reportModalData.task.assigneeId === currentUserId && reportModalData.task.status !== 'DONE' && reportModalData.task.status !== 'REVIEW' ? (
                        <div className="space-y-3 bg-blue-50 p-4 rounded border border-blue-100">
                           <div>
                              <label className="block text-sm font-medium text-blue-800 mb-1">Đính kèm file kết quả</label>
                              <div className="flex items-center gap-2">
                                 <label className="cursor-pointer bg-white border border-blue-300 text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50 flex items-center gap-2">
                                    <Upload size={14}/> Chọn file
                                    <input type="file" className="hidden" onChange={(e) => setReportFile(e.target.files ? e.target.files[0] : null)}/>
                                 </label>
                                 <span className="text-sm text-gray-600 truncate">{reportFile ? reportFile.name : 'Chưa chọn file'}</span>
                              </div>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-blue-800 mb-1">Ghi chú / Comment</label>
                              <textarea 
                                 className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                 rows={2}
                                 placeholder="Nhập ghi chú báo cáo..."
                                 value={reportNote}
                                 onChange={(e) => setReportNote(e.target.value)}
                              />
                           </div>
                           <button 
                              onClick={handleSubmitReport}
                              className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 shadow-sm"
                           >
                              Gửi Báo Cáo
                           </button>
                        </div>
                     ) : (
                        // Hiển thị kết quả đã báo cáo
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                           {reportModalData.task.reportFile || reportModalData.task.reportNote ? (
                              <div className="space-y-2">
                                 <div className="flex items-center gap-2 text-sm">
                                    <FileText size={16} className="text-gray-500"/> 
                                    <span className="font-medium text-blue-600 underline cursor-pointer">{reportModalData.task.reportFile || 'Không có file'}</span>
                                 </div>
                                 {reportModalData.task.reportNote && (
                                    <div className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-2">
                                       "{reportModalData.task.reportNote}"
                                    </div>
                                 )}
                                 <div className="text-xs text-gray-400 mt-2">Báo cáo ngày: {reportModalData.task.reportDate || '---'}</div>
                              </div>
                           ) : (
                              <p className="text-sm text-gray-500 italic">Chưa có nội dung báo cáo.</p>
                           )}
                        </div>
                     )}
                  </div>
               </div>

               {/* Footer Modal */}
               <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button onClick={() => setReportModalData(null)} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium">Đóng</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Dashboard;