import React, { useState, useEffect } from 'react';
import { 
  FileSignature, 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  X, 
  Printer, 
  ShieldCheck, 
  User, 
  Calendar, 
  CreditCard, 
  CheckSquare, 
  Banknote, 
  ArrowRightCircle, 
  QrCode 
} from 'lucide-react';
import { Candidate, CandidateStatus, ContractRecord, ContractType, InvoiceRecord, AttendanceRecord, BonusRecordMap, BonusDetails, CompanySettings } from '../types';
import { VIETNAM_BANKS } from '../constants';

interface ContractsProps {
  candidates: Candidate[];
  contracts: ContractRecord[];
  invoices: InvoiceRecord[];
  onUpdateContracts: (contracts: ContractRecord[]) => void;
  onUpdateInvoices: (invoices: InvoiceRecord[]) => void;
  // New props for Salary Payment
  attendanceData: AttendanceRecord[];
  bonusRecords: BonusRecordMap;
  onUpdateBonusRecords: (records: BonusRecordMap) => void;
  companyInfo: CompanySettings;
}

// Chuẩn định dạng Input cho toàn bộ hệ thống Modal
const MODAL_INPUT_CLASS = "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-100 text-blue-700 font-medium placeholder-gray-400";

// Copy logic tính lương cơ bản từ Payroll để hiển thị số tiền cần chi
const POSITION_SALARY_MAP: Record<string, number> = {
  'Director': 50000000,
  'Manager': 35000000,
  'Developer': 20000000,
  'DevOps': 22000000,
  'Tester': 15000000,
  'BA': 18000000,
  'HR': 15000000,
  'Sales': 12000000,
  'Intern': 5000000,
};
const STANDARD_WORK_DAYS = 26;

const Contracts: React.FC<ContractsProps> = ({ 
  candidates, 
  contracts, 
  invoices, 
  onUpdateContracts, 
  onUpdateInvoices,
  attendanceData,
  bonusRecords,
  onUpdateBonusRecords,
  companyInfo
}) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'invoices' | 'salary_payment'>('contracts');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE FOR SALARY PAYMENT ---
  const [salaryMonth, setSalaryMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [paymentModalData, setPaymentModalData] = useState<{
    id: string;
    name: string;
    amount: number;
    bankName: string;
    bankAccount: string;
  } | null>(null);

  // --- STATE FOR CONTRACT MODAL (CREATE) ---
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [newContract, setNewContract] = useState<Partial<ContractRecord>>({
    type: 'PROBATION',
    salary: 10000000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ACTIVE'
  });

  // --- STATE FOR CONTRACT DETAIL MODAL (VIEW) ---
  const [viewContract, setViewContract] = useState<{contract: ContractRecord, employee: Candidate} | null>(null);

  // --- STATE FOR INVOICE MODAL (CREATE & VIEW) ---
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null); // Để xem chi tiết/duyệt
  const [newInvoice, setNewInvoice] = useState<Partial<InvoiceRecord>>({
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Thiết bị',
    status: 'PENDING'
  });

  // Lọc nhân viên đã tuyển dụng
  const hiredEmployees = candidates.filter(c => c.status === CandidateStatus.HIRED);

  // Helper formatting display currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper formatting number input (1.000.000)
  const formatNumberInput = (value: number | undefined) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Helper parsing number input (remove dots)
  const parseNumberInput = (value: string) => {
    return Number(value.replace(/\./g, ''));
  };

  const getContractTypeName = (type: ContractType) => {
    switch(type) {
      case 'PROBATION': return 'Hợp đồng Học việc / Thử việc';
      case '1_YEAR': return 'Hợp đồng Lao động (1 Năm)';
      case '3_YEAR': return 'Hợp đồng Lao động (3 Năm)';
      case 'INDEFINITE': return 'Hợp đồng Không thời hạn';
      default: return type;
    }
  };

  const hasInsurance = (type: ContractType) => {
    return ['1_YEAR', '3_YEAR', 'INDEFINITE'].includes(type);
  };

  // --- AUTO CALCULATE END DATE LOGIC ---
  useEffect(() => {
    if (isContractModalOpen && newContract.startDate && newContract.type) {
      const start = new Date(newContract.startDate);
      const end = new Date(start);

      switch (newContract.type) {
        case 'PROBATION':
          end.setDate(end.getDate() + 45); // + 45 ngày
          break;
        case '1_YEAR':
          end.setFullYear(end.getFullYear() + 1); // + 1 năm
          break;
        case '3_YEAR':
          end.setFullYear(end.getFullYear() + 3); // + 3 năm
          break;
        case 'INDEFINITE':
          end.setFullYear(end.getFullYear() + 1); // + 1 năm (theo yêu cầu)
          break;
      }
      
      setNewContract(prev => ({
        ...prev,
        endDate: end.toISOString().split('T')[0]
      }));
    }
  }, [newContract.startDate, newContract.type, isContractModalOpen]);


  // --- HANDLERS ---
  const handleCreateContract = () => {
    if (!newContract.employeeId || !newContract.startDate) {
      alert("Vui lòng chọn nhân viên và ngày bắt đầu");
      return;
    }

    const contract: ContractRecord = {
      id: `HĐ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      employeeId: newContract.employeeId,
      type: newContract.type as ContractType,
      startDate: newContract.startDate,
      endDate: newContract.endDate, // Đã tự động tính
      salary: Number(newContract.salary),
      status: 'ACTIVE',
      signedDate: new Date().toISOString().split('T')[0]
    };

    onUpdateContracts([contract, ...contracts]);
    setIsContractModalOpen(false);
    // Reset form
    setNewContract({
       type: 'PROBATION',
       salary: 10000000,
       startDate: new Date().toISOString().split('T')[0],
       status: 'ACTIVE'
    });
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.title || !newInvoice.amount) {
       alert("Vui lòng nhập nội dung và số tiền");
       return;
    }

    const invoice: InvoiceRecord = {
       id: `INV-${Date.now()}`,
       title: newInvoice.title || '',
       amount: Number(newInvoice.amount),
       date: newInvoice.date || new Date().toISOString().split('T')[0],
       category: newInvoice.category || 'Khác',
       status: newInvoice.status as 'PENDING' | 'PAID',
       employeeId: newInvoice.employeeId,
       notes: newInvoice.notes
    };

    onUpdateInvoices([invoice, ...invoices]);
    setIsInvoiceModalOpen(false);
    setNewInvoice({
       title: '',
       amount: 0,
       date: new Date().toISOString().split('T')[0],
       category: 'Thiết bị',
       status: 'PENDING'
    });
  };

  const handleViewContractDetail = (contract: ContractRecord) => {
    const emp = candidates.find(c => c.id === contract.employeeId);
    if (emp) {
      setViewContract({ contract, employee: emp });
    }
  };

  const handleViewInvoiceDetail = (invoice: InvoiceRecord) => {
    setSelectedInvoice(invoice);
  };

  const handleApproveInvoice = () => {
    if (selectedInvoice) {
      const updatedInvoices = invoices.map(inv => 
        inv.id === selectedInvoice.id ? { ...inv, status: 'PAID' as const } : inv
      );
      onUpdateInvoices(updatedInvoices);
      setSelectedInvoice(null);
    }
  };

  const handleDeleteInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
        onUpdateInvoices(invoices.filter(i => i.id !== id));
        if (selectedInvoice?.id === id) setSelectedInvoice(null);
    }
  };

  // --- LOGIC CHI LƯƠNG ---
  const getPayableData = () => {
    return hiredEmployees.map(emp => {
      // 1. Tính lương
      const monthlyRecords = attendanceData.filter(r => 
        r.employeeId === emp.id && 
        r.date.startsWith(salaryMonth)
      );
      const workDays = monthlyRecords.filter(r => r.status === 'PRESENT').length;
      const baseSalary = POSITION_SALARY_MAP[emp.position] || 10000000;
      const actualSalary = (baseSalary / STANDARD_WORK_DAYS) * workDays;

      // 2. Lấy thưởng
      const key = `${emp.id}_${salaryMonth}`;
      const bonusDetails = bonusRecords[key];
      
      let totalBonus = 0;
      let paymentStatus = 'UNPAID';

      if (bonusDetails) {
        totalBonus = (bonusDetails.kpiActual || 0) + 
                     (bonusDetails.attendance || 0) + 
                     (bonusDetails.transport || 0) + 
                     (bonusDetails.phone || 0) + 
                     (bonusDetails.childSupportActual || 0) + 
                     (bonusDetails.perDiem || 0) + 
                     (bonusDetails.other || 0);
        paymentStatus = bonusDetails.paymentStatus || 'UNPAID';
      } else {
        // Tạm tính nếu chưa chốt thưởng
        const estKpi = Math.round((2000000 / STANDARD_WORK_DAYS) * workDays);
        const estAttendance = workDays > 21 ? 600000 : 0;
        const estTransport = 500000;
        const estPhone = 200000;
        totalBonus = estKpi + estAttendance + estTransport + estPhone; 
      }

      const grossIncome = actualSalary + totalBonus;
      const taxableIncome = Math.max(0, grossIncome - 11000000);
      const tax = taxableIncome * 0.1;
      const netSalary = grossIncome - tax;

      return {
        ...emp,
        netSalary,
        paymentStatus,
        isBonusSaved: !!bonusDetails
      };
    }).filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleOpenPaymentModal = (employeeId: string, netSalary: number, employeeName: string, bankName: string | undefined, bankAccount: string | undefined) => {
    setPaymentModalData({
      id: employeeId,
      name: employeeName,
      amount: netSalary,
      bankName: bankName || '',
      bankAccount: bankAccount || ''
    });
  };

  const handleConfirmPayment = () => {
    if (!paymentModalData) return;

    // 1. Cập nhật Payment Status trong BonusRecordMap
    const key = `${paymentModalData.id}_${salaryMonth}`;
    const currentBonus = bonusRecords[key];
    
    const newBonusData: BonusDetails = currentBonus ? {
      ...currentBonus,
      paymentStatus: 'PAID'
    } : {
      // Giá trị mặc định nếu chưa chốt (fallback)
      kpiBase: 2000000,
      kpiActual: 0,
      attendance: 0,
      transport: 500000,
      phone: 200000,
      childSupportBase: 0,
      childSupportActual: 0,
      perDiem: 0,
      other: 0,
      paymentStatus: 'PAID',
      note: 'Thanh toán nhanh'
    };

    onUpdateBonusRecords({
      ...bonusRecords,
      [key]: newBonusData
    });

    // 2. Tạo Hóa đơn (Expense)
    const newInv: InvoiceRecord = {
      id: `SAL-${paymentModalData.id}-${Date.now()}`,
      title: `Chi lương T${salaryMonth.split('-')[1]} - ${paymentModalData.name}`,
      amount: paymentModalData.amount,
      date: new Date().toISOString().split('T')[0],
      category: 'Lương & Thưởng',
      status: 'PAID', // Auto Paid
      employeeId: paymentModalData.id,
      notes: 'Thanh toán lương tự động từ module Chi lương'
    };

    onUpdateInvoices([newInv, ...invoices]);
    setPaymentModalData(null);
    alert("Đã xác nhận thanh toán thành công!");
  };

  const printContract = () => {
     if (!viewContract) return;

     const printWindow = window.open('', '', 'height=800,width=1000');
     if (!printWindow) return;

     const { contract, employee } = viewContract;

     printWindow.document.write('<html><head><title>In Hợp Đồng - CoffeeHR</title>');
     printWindow.document.write('<style>');
     printWindow.document.write(`
         @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman:wght@400;700&display=swap');
         body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #000; }
         .contract-container { max-width: 800px; margin: 0 auto; }
         h1, h2, h3 { text-align: center; text-transform: uppercase; margin: 0; }
         h1 { font-size: 24px; margin-bottom: 20px; font-weight: bold; }
         h2 { font-size: 16px; margin-bottom: 5px; font-weight: bold; }
         h3 { font-size: 14px; margin-bottom: 5px; font-weight: bold; }
         .sub-header { text-align: center; font-style: italic; margin-bottom: 30px; font-size: 14px; text-decoration: underline; }
         .section-title { background-color: #f3f4f6; padding: 5px 10px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; font-size: 14px; border: 1px solid #ddd; -webkit-print-color-adjust: exact; }
         table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
         td { padding: 5px; vertical-align: top; }
         .label { font-weight: bold; width: 180px; }
         ul { margin: 0; padding-left: 25px; }
         li { margin-bottom: 5px; }
         .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
         .sig-block { text-align: center; width: 45%; }
         .sig-title { font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
         .sig-note { font-style: italic; font-size: 12px; margin-bottom: 60px; }
         .signed-mark { color: #cc0000; border: 2px solid #cc0000; padding: 5px; display: inline-block; transform: rotate(-10deg); font-weight: bold; margin-top: 10px; }
     `);
     printWindow.document.write('</style></head><body>');
     
     // Nội dung hợp đồng HTML
     printWindow.document.write(`
         <div class="contract-container">
             <h3>Cộng hòa xã hội chủ nghĩa Việt Nam</h3>
             <p class="sub-header">Độc lập - Tự do - Hạnh phúc</p>
             
             <h1>Hợp đồng lao động</h1>
             <p style="text-align: center; font-style: italic; margin-bottom: 20px;">Số: ${contract.id}</p>

             <p>Hôm nay, ngày ${new Date(contract.signedDate).getDate()} tháng ${new Date(contract.signedDate).getMonth() + 1} năm ${new Date(contract.signedDate).getFullYear()}, tại Văn phòng Công ty Cổ phần CoffeeHR, chúng tôi gồm:</p>

             <div class="section-title">Bên A: Người sử dụng lao động</div>
             <table>
                 <tr><td class="label">Tên doanh nghiệp:</td><td style="text-transform: uppercase;">${companyInfo.name}</td></tr>
                 <tr><td class="label">Đại diện:</td><td>Ông/Bà ${companyInfo.representativeName}</td></tr>
                 <tr><td class="label">Chức vụ:</td><td>${companyInfo.representativePosition}</td></tr>
                 <tr><td class="label">Địa chỉ:</td><td>${companyInfo.address}</td></tr>
             </table>

             <div class="section-title">Bên B: Người lao động</div>
             <table>
                 <tr><td class="label">Họ và tên:</td><td><b style="text-transform: uppercase;">${employee.name}</b></td></tr>
                 <tr><td class="label">Ngày sinh:</td><td>${new Date(employee.dob).toLocaleDateString('vi-VN')}</td></tr>
                 <tr><td class="label">Điện thoại:</td><td>${employee.phone}</td></tr>
                 <tr><td class="label">Email:</td><td>${employee.email}</td></tr>
                 <tr><td class="label">Địa chỉ:</td><td>Hà Nội, Việt Nam</td></tr>
             </table>

             <div class="section-title">Điều khoản hợp đồng</div>
             <ul>
                 <li><b>Loại hợp đồng:</b> ${getContractTypeName(contract.type)}</li>
                 <li><b>Thời hạn:</b> Từ ${new Date(contract.startDate).toLocaleDateString('vi-VN')} đến ${contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : '...'}</li>
                 <li><b>Địa điểm làm việc:</b> Tại văn phòng công ty.</li>
                 <li><b>Chức danh:</b> ${employee.position}</li>
                 <li><b>Mức lương:</b> ${formatCurrency(contract.salary)} / tháng</li>
                 <li><b>Bảo hiểm:</b> ${hasInsurance(contract.type) ? 'Được đóng BHXH, BHYT, BHTN theo luật định.' : 'Chưa bao gồm các khoản bảo hiểm bắt buộc.'}</li>
             </ul>

             <div class="signatures">
                 <div class="sig-block">
                     <div class="sig-title">Đại diện Bên B</div>
                     <div class="sig-note">(Ký và ghi rõ họ tên)</div>
                     <br/><br/>
                     <b>${employee.name}</b>
                 </div>
                 <div class="sig-block">
                     <div class="sig-title">Đại diện Bên A</div>
                     <div class="sig-note">(Ký và đóng dấu)</div>
                     ${contract.status === 'ACTIVE' ? '<div class="signed-mark">ĐÃ KÝ</div>' : ''}
                     <br/>
                     <b>${companyInfo.representativeName}</b>
                 </div>
             </div>
         </div>
     `);
     
     printWindow.document.write('</body></html>');
     printWindow.document.close();
     printWindow.print();
  };

  const payableList = activeTab === 'salary_payment' ? getPayableData() : [];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header Tabs */}
      <div className="flex justify-between items-center">
         <div className="flex bg-gray-200 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('contracts')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'contracts' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
               <FileSignature size={18} /> Quản lý Hợp đồng
            </button>
            <button 
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'invoices' ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
               <Receipt size={18} /> Hóa đơn & Chi phí
            </button>
            <button 
              onClick={() => setActiveTab('salary_payment')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'salary_payment' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
               <Banknote size={18} /> Chi lương
            </button>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={() => activeTab === 'contracts' ? setIsContractModalOpen(true) : setIsInvoiceModalOpen(true)}
              className={`px-4 py-2 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-colors ${activeTab === 'salary_payment' ? 'hidden' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
               <Plus size={18} /> {activeTab === 'contracts' ? 'Tạo hợp đồng' : 'Thêm hóa đơn'}
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
         {/* Filter Bar */}
         <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="relative w-64">
               {/* Ô tìm kiếm chữ xanh */}
               <input 
                  type="text" 
                  placeholder={activeTab === 'invoices' ? "Tìm hóa đơn..." : "Tìm nhân viên..."}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-blue-700 font-medium placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {activeTab === 'salary_payment' && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Tháng:</span>
                    <input 
                        type="month" 
                        value={salaryMonth} 
                        onChange={(e) => setSalaryMonth(e.target.value)}
                        className="p-1 border border-gray-300 rounded text-sm bg-white font-bold text-green-700 outline-none"
                    />
                </div>
            )}
            <button className="text-gray-500 hover:bg-gray-200 p-2 rounded">
               <Filter size={18} />
            </button>
         </div>

         {/* CONTENT: CONTRACTS */}
         {activeTab === 'contracts' && (
            <div className="overflow-auto flex-1">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 font-semibold text-xs sticky top-0">
                     <tr>
                        <th className="p-4">Mã HĐ</th>
                        <th className="p-4">Nhân viên</th>
                        <th className="p-4">Loại hợp đồng</th>
                        <th className="p-4 text-center">Thời hạn</th>
                        <th className="p-4 text-center">BHXH</th>
                        <th className="p-4 text-right">Lương thỏa thuận</th>
                        <th className="p-4 text-center">Trạng thái</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                     {contracts.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-400">Chưa có hợp đồng nào.</td></tr>
                     ) : (
                        contracts.filter(c => {
                           const emp = candidates.find(e => e.id === c.employeeId);
                           return emp?.name.toLowerCase().includes(searchTerm.toLowerCase());
                        }).map(contract => {
                           const emp = candidates.find(c => c.id === contract.employeeId);
                           const insured = hasInsurance(contract.type);
                           return (
                              <tr 
                                key={contract.id} 
                                onClick={() => handleViewContractDetail(contract)}
                                className="hover:bg-indigo-50 cursor-pointer transition-colors group"
                                title="Click để xem chi tiết hợp đồng"
                              >
                                 <td className="p-4 font-mono text-xs text-gray-500 group-hover:text-indigo-600 font-bold">{contract.id}</td>
                                 <td className="p-4">
                                    <div className="flex items-center gap-3">
                                       <img src={emp?.avatar} className="w-8 h-8 rounded-full border object-cover" />
                                       <div>
                                          <div className="font-bold text-gray-800">{emp?.name}</div>
                                          <div className="text-xs text-gray-500">{emp?.position}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-4 text-gray-700 font-medium text-xs">{getContractTypeName(contract.type)}</td>
                                 <td className="p-4 text-center text-gray-600 text-xs">
                                    <div>{new Date(contract.startDate).toLocaleDateString('vi-VN')}</div>
                                    <div className="text-gray-400">↓</div>
                                    <div className="font-semibold">{contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : '---'}</div>
                                 </td>
                                 <td className="p-4 text-center">
                                    {insured ? (
                                        <div className="flex justify-center" title="Được đóng BHXH">
                                            <ShieldCheck size={18} className="text-green-600"/>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center" title="Chưa hỗ trợ BHXH">
                                            <span className="w-4 h-4 rounded-full bg-gray-200 block"></span>
                                        </div>
                                    )}
                                 </td>
                                 <td className="p-4 text-right font-bold text-gray-800">{formatCurrency(contract.salary)}</td>
                                 <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${contract.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                       {contract.status === 'ACTIVE' ? 'Hiệu lực' : 'Đã hủy'}
                                    </span>
                                 </td>
                              </tr>
                           )
                        })
                     )}
                  </tbody>
               </table>
            </div>
         )}

         {/* CONTENT: INVOICES */}
         {activeTab === 'invoices' && (
            <div className="overflow-auto flex-1">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 font-semibold text-xs sticky top-0">
                     <tr>
                        <th className="p-4">Nội dung chi / Hóa đơn</th>
                        <th className="p-4">Phân loại</th>
                        <th className="p-4">Liên quan đến (NV)</th>
                        <th className="p-4 text-center">Ngày chi</th>
                        <th className="p-4 text-right">Số tiền</th>
                        <th className="p-4 text-center">Trạng thái</th>
                        <th className="p-4 text-center">Thao tác</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                     {invoices.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-400">Chưa có hóa đơn nào.</td></tr>
                     ) : (
                        invoices.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase())).map(invoice => {
                           const emp = candidates.find(e => e.id === invoice.employeeId);
                           return (
                              <tr 
                                key={invoice.id} 
                                onClick={() => handleViewInvoiceDetail(invoice)}
                                className="hover:bg-orange-50/50 cursor-pointer transition-colors"
                              >
                                 <td className="p-4 font-medium text-gray-800">{invoice.title}</td>
                                 <td className="p-4">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                                       {invoice.category}
                                    </span>
                                 </td>
                                 <td className="p-4 text-gray-600">
                                    {emp ? (
                                       <div className="flex items-center gap-2">
                                          <img src={emp.avatar} className="w-5 h-5 rounded-full" />
                                          <span className="text-xs">{emp.name}</span>
                                       </div>
                                    ) : '---'}
                                 </td>
                                 <td className="p-4 text-center text-gray-500">{new Date(invoice.date).toLocaleDateString('vi-VN')}</td>
                                 <td className="p-4 text-right font-bold text-red-600">-{formatCurrency(invoice.amount)}</td>
                                 <td className="p-4 text-center">
                                    {invoice.status === 'PAID' ? (
                                       <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold">
                                          <CheckCircle2 size={14} /> Đã chi
                                       </div>
                                    ) : (
                                       <div className="flex items-center justify-center gap-1 text-orange-500 text-xs font-bold">
                                          <Clock size={14} /> Chờ duyệt
                                       </div>
                                    )}
                                 </td>
                                 <td className="p-4 text-center">
                                    <button 
                                        onClick={(e) => handleDeleteInvoice(invoice.id, e)} 
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                 </td>
                              </tr>
                           )
                        })
                     )}
                  </tbody>
               </table>
            </div>
         )}

         {/* CONTENT: SALARY PAYMENT (NEW) */}
         {activeTab === 'salary_payment' && (
            <div className="overflow-auto flex-1">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 font-semibold text-xs sticky top-0">
                     <tr>
                        <th className="p-4">Nhân viên</th>
                        <th className="p-4">Ngân hàng</th>
                        <th className="p-4 text-center">Trạng thái dữ liệu</th>
                        <th className="p-4 text-right">Thực lĩnh (Net Salary)</th>
                        <th className="p-4 text-center">Trạng thái thanh toán</th>
                        <th className="p-4 text-right">Tác vụ</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                     {payableList.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-400">Không có dữ liệu lương phù hợp.</td></tr>
                     ) : (
                        payableList.map(item => (
                           <tr key={item.id} className="hover:bg-green-50/50">
                              <td className="p-4">
                                 <div className="flex items-center gap-3">
                                    <img src={item.avatar} className="w-9 h-9 rounded-full object-cover border" />
                                    <div>
                                       <div className="font-bold text-gray-800">{item.name}</div>
                                       <div className="text-xs text-gray-500">{item.position}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-4 text-gray-600 text-xs">
                                 {item.bankName ? (
                                     <div>
                                         <div className="font-bold">{item.bankName}</div>
                                         <div className="font-mono">{item.bankAccountNumber}</div>
                                     </div>
                                 ) : <span className="text-orange-500 italic">Chưa cập nhật</span>}
                              </td>
                              <td className="p-4 text-center">
                                 {item.isBonusSaved ? (
                                     <span className="text-green-600 text-xs font-bold border border-green-200 bg-green-50 px-2 py-1 rounded">Đã chốt lương</span>
                                 ) : (
                                     <span className="text-orange-500 text-xs italic border border-orange-200 bg-orange-50 px-2 py-1 rounded">Tạm tính</span>
                                 )}
                              </td>
                              <td className="p-4 text-right font-bold text-green-700 text-base">
                                 {formatCurrency(item.netSalary)}
                              </td>
                              <td className="p-4 text-center">
                                 {item.paymentStatus === 'PAID' ? (
                                     <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-xs uppercase">
                                         <CheckCircle2 size={16} /> Đã thanh toán
                                     </div>
                                 ) : (
                                     <div className="flex items-center justify-center gap-1 text-gray-400 font-medium text-xs uppercase">
                                         <Clock size={16} /> Chưa thanh toán
                                     </div>
                                 )}
                              </td>
                              <td className="p-4 text-right">
                                 {item.paymentStatus !== 'PAID' && (
                                     <button 
                                        onClick={() => handleOpenPaymentModal(item.id, item.netSalary, item.name, item.bankName, item.bankAccountNumber)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 ml-auto shadow-sm"
                                        title="Quét mã QR để thanh toán"
                                     >
                                         <QrCode size={14}/> Thanh toán
                                     </button>
                                 )}
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* --- MODAL XÁC NHẬN THANH TOÁN (QR CODE) --- */}
      {paymentModalData && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
               <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2">
                     <Banknote size={20}/> Thanh Toán Lương
                  </h3>
                  <button onClick={() => setPaymentModalData(null)} className="text-white/80 hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="p-6 flex flex-col items-center">
                  <div className="text-center mb-4">
                     <p className="text-gray-500 text-sm">Quét mã để chuyển khoản cho</p>
                     <h4 className="font-bold text-lg text-gray-800">{paymentModalData.name}</h4>
                     <div className="font-bold text-2xl text-green-600 mt-1">{formatCurrency(paymentModalData.amount)}</div>
                  </div>

                  {paymentModalData.bankName && paymentModalData.bankAccount ? (
                     <div className="bg-white p-2 border rounded-lg shadow-sm mb-4">
                        {/* VietQR API */}
                        <img 
                           src={`https://img.vietqr.io/image/${paymentModalData.bankName}-${paymentModalData.bankAccount}-compact.jpg?amount=${paymentModalData.amount}&addInfo=LUONG T${salaryMonth.split('-')[1]} ${paymentModalData.name}`} 
                           alt="QR Code" 
                           className="w-48 h-48 object-contain"
                        />
                     </div>
                  ) : (
                     <div className="w-48 h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-lg mb-4 text-xs text-center p-4">
                        <AlertCircle size={32} className="mb-2"/>
                        Chưa cập nhật thông tin ngân hàng cho nhân viên này.
                     </div>
                  )}

                  <div className="w-full bg-gray-50 p-3 rounded text-sm text-gray-600 space-y-1">
                     <div className="flex justify-between">
                        <span>Ngân hàng:</span>
                        <span className="font-bold">{VIETNAM_BANKS.find(b => b.code === paymentModalData.bankName)?.name || paymentModalData.bankName || '---'}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>STK:</span>
                        <span className="font-mono font-bold">{paymentModalData.bankAccount || '---'}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Nội dung:</span>
                        <span className="italic">LUONG T{salaryMonth.split('-')[1]} {paymentModalData.name}</span>
                     </div>
                  </div>
               </div>

               <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                  <button onClick={() => setPaymentModalData(null)} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100">Đóng</button>
                  <button 
                     onClick={handleConfirmPayment}
                     className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold shadow-md flex items-center gap-2"
                  >
                     <CheckCircle2 size={18}/> Xác nhận Đã Chuyển
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* --- MODAL TẠO HỢP ĐỒNG --- */}
      {isContractModalOpen && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in duration-200">
               <h3 className="text-xl font-bold text-gray-800 mb-4">Tạo Hợp Đồng Mới</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                     <select 
                        className={MODAL_INPUT_CLASS}
                        value={newContract.employeeId}
                        onChange={(e) => setNewContract({...newContract, employeeId: e.target.value})}
                     >
                        <option value="">-- Chọn nhân viên --</option>
                        {hiredEmployees.map(e => (
                           <option key={e.id} value={e.id}>{e.name} - {e.position}</option>
                        ))}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Loại hợp đồng</label>
                     <select 
                        className={MODAL_INPUT_CLASS}
                        value={newContract.type}
                        onChange={(e) => setNewContract({...newContract, type: e.target.value as ContractType})}
                     >
                        <option value="PROBATION">Học việc / Thử việc (45 ngày)</option>
                        <option value="1_YEAR">Hợp đồng 1 Năm</option>
                        <option value="3_YEAR">Hợp đồng 3 Năm</option>
                        <option value="INDEFINITE">Không thời hạn (Tái ký 1 năm)</option>
                     </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                        <input type="date" className={MODAL_INPUT_CLASS} value={newContract.startDate} onChange={(e) => setNewContract({...newContract, startDate: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                        <input 
                           type="date" 
                           className={`${MODAL_INPUT_CLASS} cursor-not-allowed`} 
                           value={newContract.endDate || ''} 
                           readOnly
                           title="Tự động tính toán theo loại hợp đồng"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Lương thỏa thuận (VNĐ)</label>
                     <input 
                        type="text" 
                        className={MODAL_INPUT_CLASS} 
                        value={formatNumberInput(newContract.salary)} 
                        onChange={(e) => setNewContract({...newContract, salary: parseNumberInput(e.target.value)})}
                     />
                  </div>
               </div>
               <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setIsContractModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Hủy</button>
                  <button onClick={handleCreateContract} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Lưu hợp đồng</button>
               </div>
            </div>
         </div>
      )}

      {/* --- MODAL CHI TIẾT HỢP ĐỒNG (PROFESSIONAL VIEW) --- */}
      {viewContract && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
              
              {/* Toolbar */}
              <div className="bg-gray-800 text-white p-3 flex justify-between items-center print:hidden">
                 <h3 className="font-medium flex items-center gap-2">
                    <FileSignature size={18}/> Chi tiết Hợp Đồng
                 </h3>
                 <div className="flex gap-2">
                    <button onClick={printContract} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm flex items-center gap-2">
                       <Printer size={16}/> In Hợp Đồng
                    </button>
                    <button onClick={() => setViewContract(null)} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm">
                       Đóng
                    </button>
                 </div>
              </div>

              {/* Document Paper */}
              <div className="flex-1 overflow-y-auto bg-gray-200 p-8">
                 <div className="bg-white shadow-lg p-10 max-w-[700px] mx-auto min-h-[800px] text-gray-800 font-serif leading-relaxed relative">
                    
                    {/* Watermark Status */}
                    <div className={`absolute top-10 right-10 border-4 ${viewContract.contract.status === 'ACTIVE' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}  font-black text-2xl uppercase p-2 transform rotate-12 opacity-30 select-none pointer-events-none`}>
                       {viewContract.contract.status === 'ACTIVE' ? 'ĐÃ KÝ KẾT' : 'ĐÃ HỦY BỎ'}
                    </div>

                    {/* Header Document */}
                    <div className="text-center mb-8">
                       <h3 className="font-bold text-sm uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</h3>
                       <p className="text-xs italic underline underline-offset-4 mb-4">Độc lập - Tự do - Hạnh phúc</p>
                       <h1 className="text-2xl font-bold uppercase mt-6 mb-2">Hợp đồng lao động</h1>
                       <p className="text-sm italic">Số: {viewContract.contract.id}</p>
                    </div>

                    <div className="mb-6">
                       <p>Hôm nay, ngày <span className="font-bold">{new Date(viewContract.contract.signedDate).getDate()}</span> tháng <span className="font-bold">{new Date(viewContract.contract.signedDate).getMonth() + 1}</span> năm <span className="font-bold">{new Date(viewContract.contract.signedDate).getFullYear()}</span>, tại Văn phòng Công ty Cổ phần CoffeeHR, chúng tôi gồm:</p>
                    </div>

                    {/* Party A */}
                    <div className="mb-6">
                       <h2 className="font-bold uppercase text-sm bg-gray-100 p-1 mb-2">Bên A: Người sử dụng lao động</h2>
                       <table className="w-full text-sm">
                          <tbody>
                             <tr>
                                <td className="w-32 font-bold py-1">Tên doanh nghiệp:</td>
                                <td style={{textTransform: 'uppercase'}}>{companyInfo.name}</td>
                             </tr>
                             <tr>
                                <td className="font-bold py-1">Đại diện:</td>
                                <td>Ông/Bà {companyInfo.representativeName}</td>
                             </tr>
                             <tr>
                                <td className="font-bold py-1">Chức vụ:</td>
                                <td>{companyInfo.representativePosition}</td>
                             </tr>
                             <tr>
                                <td className="font-bold py-1">Địa chỉ:</td>
                                <td>{companyInfo.address}</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>

                    {/* Party B */}
                    <div className="mb-6">
                       <h2 className="font-bold uppercase text-sm bg-gray-100 p-1 mb-2">Bên B: Người lao động</h2>
                       <div className="flex gap-4">
                          <img src={viewContract.employee.avatar} className="w-20 h-20 object-cover border border-gray-300 shadow-sm print:hidden"/>
                          <table className="w-full text-sm">
                             <tbody>
                                <tr>
                                   <td className="w-32 font-bold py-1">Họ và tên:</td>
                                   <td className="uppercase font-bold">{viewContract.employee.name}</td>
                                </tr>
                                <tr>
                                   <td className="font-bold py-1">Ngày sinh:</td>
                                   <td>{new Date(viewContract.employee.dob).toLocaleDateString('vi-VN')}</td>
                                </tr>
                                <tr>
                                   <td className="font-bold py-1">Điện thoại:</td>
                                   <td>{viewContract.employee.phone}</td>
                                </tr>
                                <tr>
                                   <td className="font-bold py-1">Địa chỉ email:</td>
                                   <td>{viewContract.employee.email}</td>
                                </tr>
                             </tbody>
                          </table>
                       </div>
                    </div>

                    {/* Terms */}
                    <div className="mb-6">
                       <h2 className="font-bold uppercase text-sm bg-gray-100 p-1 mb-2">Điều khoản hợp đồng</h2>
                       <ul className="list-decimal pl-5 space-y-2 text-sm">
                          <li>
                             <span className="font-bold">Loại hợp đồng:</span> {getContractTypeName(viewContract.contract.type)}.
                          </li>
                          <li>
                             <span className="font-bold">Thời hạn hợp đồng:</span> Từ ngày {new Date(viewContract.contract.startDate).toLocaleDateString('vi-VN')} đến ngày {viewContract.contract.endDate ? new Date(viewContract.contract.endDate).toLocaleDateString('vi-VN') : '...'}.
                          </li>
                          <li>
                             <span className="font-bold">Địa điểm làm việc:</span> Tại văn phòng công ty hoặc theo yêu cầu công việc.
                          </li>
                          <li>
                             <span className="font-bold">Chức danh chuyên môn:</span> {viewContract.employee.position}.
                          </li>
                          <li>
                             <span className="font-bold">Mức lương chính:</span> {formatCurrency(viewContract.contract.salary)} / tháng.
                          </li>
                          <li>
                             <span className="font-bold">Chế độ Bảo hiểm:</span> 
                             {hasInsurance(viewContract.contract.type) ? (
                                <span className="text-green-700 font-bold ml-1">
                                   Được tham gia BHXH, BHYT, BHTN theo quy định của pháp luật.
                                </span>
                             ) : (
                                <span className="text-gray-600 italic ml-1">
                                   Chưa bao gồm các khoản bảo hiểm bắt buộc (Giai đoạn thử việc/học việc).
                                </span>
                             )}
                          </li>
                       </ul>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between mt-12 mb-12">
                       <div className="text-center">
                          <p className="font-bold uppercase text-xs">Đại diện Bên B</p>
                          <p className="text-xs italic mb-8">(Ký và ghi rõ họ tên)</p>
                          <p className="font-bold mt-8">{viewContract.employee.name}</p>
                       </div>
                       <div className="text-center">
                          <p className="font-bold uppercase text-xs">Đại diện Bên A</p>
                          <p className="text-xs italic mb-8">(Ký và đóng dấu)</p>
                          <p className="font-bold text-red-600 border-2 border-red-600 inline-block p-1 transform -rotate-12 opacity-80 mt-4 rounded">ĐÃ KÝ</p>
                          <p className="font-bold mt-2">{companyInfo.representativeName}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL TẠO HÓA ĐƠN --- */}
      {isInvoiceModalOpen && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in duration-200">
               <h3 className="text-xl font-bold text-gray-800 mb-4">Quyết toán Chi phí / Hóa đơn</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi</label>
                     <input 
                        type="text" 
                        placeholder="VD: Mua laptop cho NV..."
                        className={MODAL_INPUT_CLASS}
                        value={newInvoice.title}
                        onChange={(e) => setNewInvoice({...newInvoice, title: e.target.value})}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
                        <input 
                           type="text" 
                           className={MODAL_INPUT_CLASS} 
                           value={formatNumberInput(newInvoice.amount)} 
                           onChange={(e) => setNewInvoice({...newInvoice, amount: parseNumberInput(e.target.value)})} 
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày chi</label>
                        <input type="date" className={MODAL_INPUT_CLASS} value={newInvoice.date} onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})} />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
                        <select className={MODAL_INPUT_CLASS} value={newInvoice.category} onChange={(e) => setNewInvoice({...newInvoice, category: e.target.value})}>
                           <option>Thiết bị</option>
                           <option>Văn phòng phẩm</option>
                           <option>Thưởng nóng</option>
                           <option>Team Building</option>
                           <option>Đào tạo</option>
                           <option>Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select className={MODAL_INPUT_CLASS} value={newInvoice.status} onChange={(e) => setNewInvoice({...newInvoice, status: e.target.value as any})}>
                           <option value="PENDING">Chờ duyệt</option>
                           <option value="PAID">Đã chi</option>
                        </select>
                      </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên liên quan (Optional)</label>
                     <select 
                        className={MODAL_INPUT_CLASS}
                        value={newInvoice.employeeId || ''}
                        onChange={(e) => setNewInvoice({...newInvoice, employeeId: e.target.value})}
                     >
                        <option value="">-- Không có --</option>
                        {hiredEmployees.map(e => (
                           <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                     </select>
                  </div>
               </div>
               <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Hủy</button>
                  <button onClick={handleCreateInvoice} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Lưu hóa đơn</button>
               </div>
            </div>
         </div>
      )}

      {/* --- MODAL DUYỆT HÓA ĐƠN (VIEW DETAIL) --- */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
               <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-black">Chi tiết Hóa đơn</h3>
                  <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-black"><X size={20}/></button>
               </div>
               
               <div className="space-y-4 text-black">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                     <span className="text-black text-sm font-bold">Mã hóa đơn:</span>
                     <span className="font-mono font-medium text-black">{selectedInvoice.id}</span>
                  </div>
                  <div>
                     <span className="text-black text-sm block mb-1 font-bold">Nội dung chi:</span>
                     <div className="font-medium text-black text-lg">{selectedInvoice.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <span className="text-black text-sm block mb-1 font-bold">Số tiền:</span>
                        <div className="font-bold text-green-600 text-lg">{formatCurrency(selectedInvoice.amount)}</div>
                     </div>
                     <div>
                        <span className="text-black text-sm block mb-1 font-bold">Ngày chi:</span>
                        <div className="font-medium text-black">{new Date(selectedInvoice.date).toLocaleDateString('vi-VN')}</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <span className="text-black text-sm block mb-1 font-bold">Phân loại:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm text-black">{selectedInvoice.category}</span>
                     </div>
                     <div>
                        <span className="text-black text-sm block mb-1 font-bold">Trạng thái:</span>
                        <span className="text-green-600 font-bold flex items-center gap-1">
                            {selectedInvoice.status === 'PAID' ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                            {selectedInvoice.status === 'PAID' ? 'Đã chi' : 'Chờ duyệt'}
                        </span>
                     </div>
                  </div>
                  {selectedInvoice.employeeId && (
                     <div>
                        <span className="text-black text-sm block mb-1 font-bold">Nhân viên liên quan:</span>
                        <div className="text-xl font-bold text-black">
                           {candidates.find(c => c.id === selectedInvoice.employeeId)?.name || 'Unknown'}
                        </div>
                     </div>
                  )}
               </div>

               <div className="mt-8 pt-4 border-t flex justify-end gap-3">
                  <button onClick={() => setSelectedInvoice(null)} className="px-4 py-2 bg-gray-100 text-black rounded hover:bg-gray-200">Đóng</button>
                  {selectedInvoice.status === 'PENDING' && (
                     <button 
                        onClick={handleApproveInvoice} 
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold flex items-center gap-2"
                     >
                        <CheckSquare size={18}/> DUYỆT CHI
                     </button>
                  )}
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;