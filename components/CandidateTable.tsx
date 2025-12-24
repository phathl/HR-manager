import React, { useState } from 'react';
import { Candidate, CandidateStatus, CompanySettings } from '../types';
import { VIETNAM_BANKS } from '../constants';
import { 
  Plus, 
  CheckSquare, 
  Mail, 
  Trash2, 
  FileText,
  X,
  Save,
  UserPlus,
  Clock,
  Upload,
  Printer,
  Calendar,
  CreditCard
} from 'lucide-react';
import { generateCandidateEmail } from '../services/geminiService';

interface CandidateTableProps {
  candidates: Candidate[];
  onUpdateCandidates: (candidates: Candidate[]) => void;
  searchTerm: string;
  companyInfo: CompanySettings;
}

const STATUS_PRIORITY: Record<string, number> = {
  [CandidateStatus.PROCESSING]: 1,
  [CandidateStatus.WAITING]: 2,
  [CandidateStatus.APPROVED]: 3,
  [CandidateStatus.HIRED]: 4,
  [CandidateStatus.REJECTED]: 5,
};

const CandidateTable: React.FC<CandidateTableProps> = ({ candidates, onUpdateCandidates, searchTerm, companyInfo }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // State Modal Email
  const [generatedEmail, setGeneratedEmail] = useState<{content: string, recipient: string} | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // State Modal Thêm mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCandidateForm, setNewCandidateForm] = useState<Partial<Candidate>>({
    name: '',
    phone: '',
    email: '',
    position: 'Developer',
    dob: '2000-01-01', // Default DOB
    experience: 'Dưới 1 Năm',
    cvFile: '',
    bankName: '',
    bankAccountNumber: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State Modal Card Nhân viên
  const [selectedEmployeeForCard, setSelectedEmployeeForCard] = useState<Candidate | null>(null);

  const filteredCandidates = candidates
    .filter(candidate => 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.includes(searchTerm)
    )
    .sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.status] || 99;
      const priorityB = STATUS_PRIORITY[b.status] || 99;
      return priorityA - priorityB;
    });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất một ứng viên để xóa.");
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} ứng viên đã chọn?`)) {
      const remainingCandidates = candidates.filter(c => !selectedIds.includes(c.id));
      onUpdateCandidates(remainingCandidates);
      setSelectedIds([]);
    }
  };

  // Upload Avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Upload CV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setNewCandidateForm({...newCandidateForm, cvFile: file.name});
    }
  };

  // Thêm mới ứng viên
  const handleAddNewCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newId = Date.now().toString();
    const candidateToAdd: Candidate = {
      id: newId,
      name: newCandidateForm.name || 'Unknown',
      phone: newCandidateForm.phone || '',
      email: newCandidateForm.email || '',
      position: newCandidateForm.position || 'Developer',
      dob: newCandidateForm.dob || '2000-01-01',
      experience: newCandidateForm.experience || 'Dưới 1 Năm',
      avatar: avatarPreview || `https://picsum.photos/seed/${newId}/100/100`,
      dateApplied: new Date().toLocaleDateString('vi-VN'),
      status: CandidateStatus.PROCESSING,
      cvFile: selectedFile ? selectedFile.name : '',
      cvFileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      bankName: newCandidateForm.bankName,
      bankAccountNumber: newCandidateForm.bankAccountNumber
    };

    onUpdateCandidates([candidateToAdd, ...candidates]);
    setIsAddModalOpen(false);
    
    // Reset form
    setNewCandidateForm({
      name: '',
      phone: '',
      email: '',
      position: 'Developer',
      dob: '2000-01-01',
      experience: 'Dưới 1 Năm',
      cvFile: '',
      bankName: '',
      bankAccountNumber: ''
    });
    setAvatarPreview('');
    setSelectedFile(null);
  };

  const updateStatus = (id: string, newStatus: CandidateStatus) => {
    const updatedCandidates = candidates.map(c => c.id === id ? { ...c, status: newStatus } : c);
    onUpdateCandidates(updatedCandidates);
  };

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.PROCESSING: return 'text-purple-600 bg-purple-50 border-purple-200';
      case CandidateStatus.WAITING: return 'text-orange-600 bg-orange-50 border-orange-200';
      case CandidateStatus.APPROVED: return 'text-blue-600 bg-blue-50 border-blue-200';
      case CandidateStatus.HIRED: return 'text-green-600 bg-green-50 border-green-200';
      case CandidateStatus.REJECTED: return 'text-gray-500 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getExperienceColor = (exp: string) => {
    if (exp.includes('Dưới')) return 'bg-teal-500 text-white';
    if (parseInt(exp) > 5) return 'bg-yellow-400 text-white';
    return 'bg-blue-400 text-white';
  };

  const handleGenerateEmail = async (candidateId: string, type: 'interview' | 'rejection' | 'offer') => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    setLoadingEmail(true);
    const content = await generateCandidateEmail(candidate, type);
    setGeneratedEmail({ content, recipient: candidate.name });
    setLoadingEmail(false);
  };

  const handleOpenProfile = (candidate: Candidate) => {
    if (candidate.cvFileUrl) {
      window.open(candidate.cvFileUrl, '_blank');
    } else if (candidate.cvFile) {
       alert(`Đang mở file: ${candidate.cvFile}. (Trong thực tế file sẽ được tải về)`);
    } else {
      alert("Ứng viên chưa có hồ sơ đính kèm.");
    }
  };

  const handleRowClick = (candidate: Candidate, event: React.MouseEvent) => {
    if (
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
      (event.target as HTMLElement).closest('button') || 
      (event.target as HTMLElement).closest('.file-link')
    ) {
      return;
    }

    // Cho phép mở thẻ cho cả Trạng thái Đã tuyển dụng và Đã duyệt
    if (candidate.status === CandidateStatus.HIRED || candidate.status === CandidateStatus.APPROVED) {
      setSelectedEmployeeForCard(candidate);
    }
  };

  const handlePrintCard = () => {
    if (!selectedEmployeeForCard) return;

    const isHired = selectedEmployeeForCard.status === CandidateStatus.HIRED;
    const footerText = isHired ? "THẺ NHÂN VIÊN CHÍNH THỨC" : "THẺ NHÂN VIÊN THỬ VIỆC";
    const footerBg = isHired ? "#1e3a8a" : "#ffedd5"; // Xanh đậm hoặc Cam nhạt
    const footerColor = isHired ? "#ffffff" : "#000000"; // Trắng hoặc Đen

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>In Thẻ Nhân Viên</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fff; }
        
        .card-container {
            width: 500px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            padding: 15px 0;
            border-bottom: 2px solid #bbf7d0;
            background: #dcfce7;
        }

        .company-name {
            font-size: 18px;
            font-weight: 800;
            color: #ea580c;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .company-logo {
            width: 24px;
            height: 24px;
        }

        .card-body {
            display: flex;
            height: 220px;
        }

        .left-col {
            width: 160px;
            flex-shrink: 0;
            overflow: hidden;
        }

        .avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            display: block;
        }

        .right-col {
            flex: 1;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background-color: #f9fafb;
        }

        .emp-name {
            font-size: 20px;
            font-weight: 800;
            color: #111827;
            margin: 0 0 4px 0;
            text-transform: uppercase;
        }

        .emp-position {
            font-size: 14px;
            font-weight: 600;
            color: #ea580c;
            margin-bottom: 16px;
            text-transform: uppercase;
        }

        .info-row {
            font-size: 12px;
            margin-bottom: 8px;
            color: #374151;
            display: flex;
        }
        
        .info-label {
            font-weight: 600;
            width: 70px;
            color: #6b7280;
        }

        .footer {
            text-align: center;
            padding: 12px;
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            background-color: ${footerBg};
            color: ${footerColor};
        }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(`
        <div class="card-container">
            <div class="header">
                <div class="company-name">
                    ${companyInfo.logo ? `<img src="${companyInfo.logo}" class="company-logo" />` : ''}
                    ${companyInfo.name}
                </div>
            </div>
            
            <div class="card-body">
                <div class="left-col">
                    <img src="${selectedEmployeeForCard.avatar}" class="avatar-img" />
                </div>
                <div class="right-col">
                    <h2 class="emp-name">${selectedEmployeeForCard.name}</h2>
                    <div class="emp-position">${selectedEmployeeForCard.position}</div>
                    
                    <div class="info-row">
                        <span class="info-label">MÃ NV:</span>
                        <span>${selectedEmployeeForCard.id}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">SĐT:</span>
                        <span>${selectedEmployeeForCard.phone}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">EMAIL:</span>
                        <span>${selectedEmployeeForCard.email}</span>
                    </div>
                     <div class="info-row">
                        <span class="info-label">SINH:</span>
                        <span>${new Date(selectedEmployeeForCard.dob).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            <div class="footer">
                ${footerText}
            </div>
        </div>
      `);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const inputClass = "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-100 text-blue-700 font-medium placeholder-gray-400";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full relative">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-orange-600 uppercase tracking-wide">Quản Lý Tuyển Dụng</h2>
      </div>

      <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
           <div className="flex -space-x-px">
              <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-l hover:bg-gray-50 text-gray-600">
                  <FileText size={18} />
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 bg-teal-500 border border-teal-600 text-white font-medium flex items-center gap-1 hover:bg-teal-600 rounded-r"
              >
                  <Plus size={16} /> Thêm mới
              </button>
           </div>
        </div>

        <button 
          onClick={handleDeleteSelected}
          className={`px-3 py-1.5 border font-medium flex items-center gap-1 rounded transition-colors
            ${selectedIds.length > 0 
              ? 'bg-red-500 border-red-600 text-white hover:bg-red-600' 
              : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'}`}
          disabled={selectedIds.length === 0}
        >
          <Trash2 size={16} /> Xóa danh sách ({selectedIds.length})
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-200 sticky top-0 z-10">
              <th className="p-3 w-10 text-center bg-gray-50">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 w-64 bg-gray-50">Họ và Tên</th>
              <th className="p-3 w-32 border-l border-gray-200 bg-gray-50">Vị trí</th>
              <th className="p-3 w-32 border-l border-gray-200 bg-gray-50">Ngày tạo HS</th>
              <th className="p-3 w-32 border-l border-gray-200 bg-gray-50">Hồ sơ</th>
              <th className="p-3 w-32 border-l border-gray-200 bg-gray-50">Trạng thái</th>
              <th className="p-3 w-28 border-l border-gray-200 text-center bg-gray-50">Ngày sinh</th>
              <th className="p-3 w-28 border-l border-gray-200 text-center bg-gray-50">Kinh nghiệm</th>
              <th className="p-3 w-40 border-l border-gray-200 text-center bg-gray-50">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredCandidates.length === 0 ? (
               <tr>
                 <td colSpan={9} className="p-8 text-center text-gray-400">
                    {searchTerm ? `Không tìm thấy ứng viên nào khớp với "${searchTerm}"` : 'Không có dữ liệu ứng viên.'}
                 </td>
               </tr>
            ) : (
              filteredCandidates.map((candidate, index) => (
                <tr 
                  key={candidate.id} 
                  onClick={(e) => handleRowClick(candidate, e)}
                  className={`group border-b border-gray-100 transition-colors
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                    ${(candidate.status === CandidateStatus.HIRED || candidate.status === CandidateStatus.APPROVED) ? 'cursor-pointer hover:bg-green-50' : 'hover:bg-blue-50'}
                  `}
                >
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(candidate.id)}
                      onChange={() => toggleSelectOne(candidate.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={candidate.avatar} alt={candidate.name} className="w-10 h-10 rounded shadow-sm object-cover" />
                      <div>
                        <div className="font-bold text-gray-800 group-hover:text-blue-600">{candidate.name}</div>
                        <div className="text-xs text-gray-500">{candidate.phone}</div>
                        <div className="text-xs text-gray-400">{candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-l border-gray-200 text-gray-600 align-top pt-4">
                    {candidate.position || '---'}
                  </td>
                  <td className="p-3 border-l border-gray-200 text-gray-600 align-top pt-4">
                    {candidate.dateApplied}
                  </td>
                   <td className="p-3 border-l border-gray-200 text-gray-600 align-top pt-4">
                    {candidate.cvFile ? (
                      <div 
                        className="file-link flex items-center gap-1 text-blue-600 cursor-pointer hover:underline" 
                        title={candidate.cvFile}
                        onClick={() => handleOpenProfile(candidate)}
                      >
                         <FileText size={14} />
                         <span className="truncate max-w-[100px] text-xs font-medium">Mở hồ sơ</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chưa có</span>
                    )}
                  </td>
                  <td className="p-3 border-l border-gray-200 align-top pt-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="p-3 border-l border-gray-200 text-center align-top pt-4 text-gray-600">
                    {new Date(candidate.dob).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-3 border-l border-gray-200 text-center align-top pt-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getExperienceColor(candidate.experience)}`}>
                      {candidate.experience}
                    </span>
                  </td>
                  <td className="p-3 border-l border-gray-200 align-middle">
                    <div className="flex flex-col gap-1 items-center">
                        {candidate.status === CandidateStatus.PROCESSING && (
                           <button 
                             onClick={() => updateStatus(candidate.id, CandidateStatus.WAITING)}
                             className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded flex items-center justify-center gap-1 shadow-sm"
                           >
                             <Clock size={12}/> Chờ duyệt
                           </button>
                        )}
                        {candidate.status === CandidateStatus.WAITING && (
                           <button 
                             onClick={() => updateStatus(candidate.id, CandidateStatus.APPROVED)}
                             className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded flex items-center justify-center gap-1 shadow-sm"
                           >
                             ✓ Duyệt HS
                           </button>
                        )}
                        {candidate.status === CandidateStatus.APPROVED && (
                          <>
                             <button 
                               onClick={() => {
                                 handleGenerateEmail(candidate.id, 'offer');
                                 updateStatus(candidate.id, CandidateStatus.HIRED);
                               }}
                               className="w-full bg-teal-500 hover:bg-teal-600 text-white text-xs py-1 px-2 rounded flex items-center justify-center gap-1 shadow-sm"
                             >
                               <CheckSquare size={12}/> Tuyển
                             </button>
                             <button 
                               onClick={() => {
                                 handleGenerateEmail(candidate.id, 'rejection');
                                 updateStatus(candidate.id, CandidateStatus.REJECTED);
                               }}
                               className="w-full bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 text-xs py-1 px-2 rounded flex items-center justify-center gap-1 shadow-sm"
                             >
                               <X size={12}/> Loại
                             </button>
                          </>
                        )}
                        {(candidate.status === CandidateStatus.HIRED || candidate.status === CandidateStatus.REJECTED) && (
                           <div className="text-xs text-gray-400 italic">Đã hoàn tất</div>
                        )}
                        <button 
                          onClick={() => handleGenerateEmail(candidate.id, 'interview')}
                          title="AI Draft Email"
                          className="text-gray-400 hover:text-purple-600 text-[10px] flex items-center mt-1"
                        >
                          <Mail size={10} className="mr-1"/> AI Email
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL THÊM MỚI --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 flex justify-between items-center">
                 <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <UserPlus size={20} /> Thêm Hồ Sơ Ứng Viên
                 </h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">
                    <X size={24} />
                 </button>
              </div>
              
              <form onSubmit={handleAddNewCandidate} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                 <div className="flex gap-4 items-center mb-2 bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                    <div className="w-16 h-16 rounded overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 relative">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <UserPlus className="text-gray-400" />
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Ảnh đại diện</p>
                        <p className="text-xs text-gray-500">Nhấn vào ảnh để tải lên (JPG, PNG)</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                       <input 
                          type="text" 
                          required
                          className={inputClass}
                          placeholder="Nhập họ tên ứng viên"
                          value={newCandidateForm.name}
                          onChange={e => setNewCandidateForm({...newCandidateForm, name: e.target.value})}
                       />
                    </div>
                    
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                       <input 
                          type="tel" 
                          required
                          className={inputClass}
                          placeholder="09xx..."
                          value={newCandidateForm.phone}
                          onChange={e => setNewCandidateForm({...newCandidateForm, phone: e.target.value})}
                       />
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                       <input 
                          type="email" 
                          className={inputClass}
                          placeholder="abc@example.com"
                          value={newCandidateForm.email}
                          onChange={e => setNewCandidateForm({...newCandidateForm, email: e.target.value})}
                       />
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí ứng tuyển</label>
                       <select 
                          className={inputClass}
                          value={newCandidateForm.position}
                          onChange={e => setNewCandidateForm({...newCandidateForm, position: e.target.value})}
                       >
                          <option value="Developer">Developer</option>
                          <option value="Tester">Tester</option>
                          <option value="BA">BA</option>
                          <option value="Manager">Manager</option>
                          <option value="HR">HR</option>
                          <option value="Sales">Sales</option>
                       </select>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                       <div className="relative">
                          <input 
                             type="date" 
                             className={inputClass}
                             value={newCandidateForm.dob}
                             onChange={e => setNewCandidateForm({...newCandidateForm, dob: e.target.value})}
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-700 pointer-events-none" size={16}/>
                       </div>
                    </div>

                    <div className="col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
                       <select 
                          className={inputClass}
                          value={newCandidateForm.experience}
                          onChange={e => setNewCandidateForm({...newCandidateForm, experience: e.target.value})}
                       >
                          <option value="Dưới 1 Năm">Dưới 1 Năm</option>
                          <option value="1 Năm">1 Năm</option>
                          <option value="2 Năm">2 Năm</option>
                          <option value="3 Năm">3 Năm</option>
                          <option value="4 Năm">4 Năm</option>
                          <option value="5 Năm">5 Năm</option>
                          <option value="6 Năm">6 Năm</option>
                          <option value="Trên 10 Năm">Trên 10 Năm</option>
                       </select>
                    </div>

                    {/* NEW FIELDS: BANK INFO */}
                    <div className="col-span-2 pt-2 border-t border-gray-100 mt-2">
                       <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <CreditCard size={16} className="text-orange-500"/> Thông tin chuyển khoản
                       </h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Tên ngân hàng</label>
                             <select 
                                className={inputClass}
                                value={newCandidateForm.bankName}
                                onChange={e => setNewCandidateForm({...newCandidateForm, bankName: e.target.value})}
                             >
                                <option value="">-- Chọn ngân hàng --</option>
                                {VIETNAM_BANKS.map(bank => (
                                   <option key={bank.code} value={bank.code}>{bank.name} ({bank.code})</option>
                                ))}
                             </select>
                          </div>
                          <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Số tài khoản</label>
                             <input 
                                type="text" 
                                className={inputClass}
                                placeholder="VD: 1900xxxx"
                                value={newCandidateForm.bankAccountNumber}
                                onChange={e => setNewCandidateForm({...newCandidateForm, bankAccountNumber: e.target.value})}
                             />
                          </div>
                       </div>
                    </div>
                    
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đính kèm hồ sơ (CV)</label>
                        <div className="flex items-center gap-2">
                            <label className={`flex-1 flex items-center gap-2 p-2 border border-dashed rounded cursor-pointer hover:bg-gray-200 transition-colors ${inputClass}`}>
                                <Upload size={16} className="text-blue-700"/>
                                <span className="text-sm text-blue-700 truncate">
                                    {selectedFile ? selectedFile.name : "Chọn file hồ sơ..."}
                                </span>
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button 
                      type="button"
                      onClick={() => setIsAddModalOpen(false)} 
                      className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 text-white bg-teal-600 rounded hover:bg-teal-700 flex items-center gap-2 shadow-md"
                    >
                      <Save size={18} /> Lưu hồ sơ
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- MODAL CARD NHÂN VIÊN --- */}
      {selectedEmployeeForCard && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 relative flex flex-col">
              
              <button 
                  onClick={() => setSelectedEmployeeForCard(null)} 
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors z-20"
                >
                    <X size={24} />
              </button>

              <div className="py-4 border-b border-green-200 flex justify-center items-center bg-green-100">
                 <div className="flex items-center gap-2">
                     {companyInfo.logo && <img src={companyInfo.logo} className="w-8 h-8 object-contain" alt="Logo"/>}
                     <span className="font-extrabold text-lg text-orange-600 uppercase tracking-wide">{companyInfo.name}</span>
                 </div>
              </div>

              <div className="flex flex-row h-64">
                 <div className="w-1/3 h-full relative overflow-hidden bg-gray-100">
                     <img 
                        src={selectedEmployeeForCard.avatar} 
                        className="w-full h-full object-cover object-center" 
                        alt="Employee Avatar"
                     />
                 </div>

                 <div className="w-2/3 p-6 bg-gray-50 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase mb-1">{selectedEmployeeForCard.name}</h2>
                    <p className="text-orange-600 font-bold uppercase tracking-wide mb-6">{selectedEmployeeForCard.position}</p>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3 text-gray-700">
                           <span className="font-semibold text-gray-500 w-20 text-xs uppercase">Mã NV:</span>
                           <span className="font-medium">#{selectedEmployeeForCard.id}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                           <span className="font-semibold text-gray-500 w-20 text-xs uppercase">Điện thoại:</span>
                           <span className="font-medium">{selectedEmployeeForCard.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                           <span className="font-semibold text-gray-500 w-20 text-xs uppercase">Email:</span>
                           <span className="font-medium truncate">{selectedEmployeeForCard.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                           <span className="font-semibold text-gray-500 w-20 text-xs uppercase">Ngày sinh:</span>
                           <span className="font-medium">{new Date(selectedEmployeeForCard.dob).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                 </div>
              </div>

              {selectedEmployeeForCard.status === CandidateStatus.HIRED ? (
                 <div className="py-3 bg-blue-900 text-white text-center font-bold uppercase tracking-widest text-sm">
                    Thẻ nhân viên chính thức
                 </div>
              ) : (
                 <div className="py-3 bg-orange-100 text-black text-center font-bold uppercase tracking-widest text-sm">
                    Thẻ nhân viên thử việc
                 </div>
              )}

              <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                  <button 
                      onClick={handlePrintCard}
                      className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg flex items-center gap-2 shadow-md transition-all text-sm font-medium"
                    >
                       <Printer size={16}/> In thẻ
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL EMAIL --- */}
       {generatedEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="font-bold text-gray-800">Soạn Email - {generatedEmail.recipient} (AI Draft)</h3>
              <button onClick={() => setGeneratedEmail(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <textarea 
                className="w-full h-64 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                defaultValue={generatedEmail.content}
              ></textarea>
            </div>
            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-lg">
              <button onClick={() => setGeneratedEmail(null)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">Hủy</button>
              <button onClick={() => { alert('Email sent!'); setGeneratedEmail(null); }} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2">
                <Mail size={16}/> Gửi Email
              </button>
            </div>
          </div>
        </div>
       )}

       {loadingEmail && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Đang dùng AI soạn thảo email...</span>
            </div>
          </div>
       )}
    </div>
  );
};

export default CandidateTable;