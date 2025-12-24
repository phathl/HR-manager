import React, { useState } from 'react';
import { Candidate, CandidateStatus, AttendanceRecord, BonusRecordMap, BonusDetails, CompanySettings } from '../types';
import { 
  Banknote, 
  TrendingUp, 
  Wallet, 
  CalendarDays, 
  Download, 
  Filter,
  Coins,
  X,
  Save,
  Calculator,
  Briefcase,
  Baby,
  Smartphone,
  Home,
  Star,
  Printer,
  FileText,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface PayrollProps {
  candidates: Candidate[];
  attendanceData: AttendanceRecord[];
  bonusRecords: BonusRecordMap;
  onUpdateBonusRecords: (records: BonusRecordMap) => void;
  searchTerm: string;
  companyInfo: CompanySettings;
}

// Map lương cơ bản theo vị trí (Giả lập)
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

const Payroll: React.FC<PayrollProps> = ({ candidates, attendanceData, bonusRecords, onUpdateBonusRecords, searchTerm, companyInfo }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  // State cho Modal Bonus
  const [selectedEmpForBonus, setSelectedEmpForBonus] = useState<{emp: Candidate, workDays: number} | null>(null);
  const [bonusForm, setBonusForm] = useState<BonusDetails>({
    kpiBase: 2000000,
    kpiActual: 0,
    attendance: 0,
    transport: 500000,
    phone: 200000,
    childSupportBase: 200000,
    childSupportActual: 0,
    perDiem: 0,
    other: 0,
    paymentStatus: 'UNPAID',
    note: ''
  });

  // State cho Modal Payslip (Phiếu lương)
  const [previewPayslip, setPreviewPayslip] = useState<any | null>(null);

  const STANDARD_WORK_DAYS = 26; // Số ngày công chuẩn trong tháng

  // Format tiền tệ display
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

  // --- LOGIC XỬ LÝ MODAL THƯỞNG ---

  const handleOpenBonusModal = (emp: Candidate, workDays: number) => {
    const key = `${emp.id}_${selectedMonth}`;
    const existingBonus = bonusRecords[key];
    
    if (existingBonus) {
      setBonusForm({
          ...existingBonus,
          paymentStatus: existingBonus.paymentStatus || 'UNPAID'
      });
    } else {
      // Logic tính toán mặc định khi chưa có dữ liệu
      const kpiBase = 2000000;
      const childBase = 0; // Mặc định là 0 (chưa biết có con hay không), user tự nhập nếu có

      // Tự động tính các giá trị dựa trên công thức
      const calculatedAttendance = workDays > 21 ? 600000 : 0;
      const calculatedKPI = Math.round((kpiBase / STANDARD_WORK_DAYS) * workDays);
      const calculatedChild = Math.round((childBase / STANDARD_WORK_DAYS) * workDays);
      
      setBonusForm({
        kpiBase: kpiBase,
        kpiActual: calculatedKPI,
        attendance: calculatedAttendance,
        transport: 500000,
        phone: 200000,
        childSupportBase: childBase,
        childSupportActual: calculatedChild,
        perDiem: 0,
        other: 0,
        paymentStatus: 'UNPAID',
        note: ''
      });
    }
    setSelectedEmpForBonus({ emp, workDays });
  };

  const handleRecalculateBonusForm = (field: keyof BonusDetails, value: number) => {
    if (!selectedEmpForBonus) return;
    
    const workDays = selectedEmpForBonus.workDays;
    let newForm = { ...bonusForm, [field]: value };

    // Tự động tính lại các trường phụ thuộc
    if (field === 'kpiBase') {
       newForm.kpiActual = Math.round((value / STANDARD_WORK_DAYS) * workDays);
    }
    if (field === 'childSupportBase') {
       newForm.childSupportActual = Math.round((value / STANDARD_WORK_DAYS) * workDays);
    }

    setBonusForm(newForm);
  };

  const handleSaveBonus = () => {
    if (!selectedEmpForBonus) return;
    const key = `${selectedEmpForBonus.emp.id}_${selectedMonth}`;
    onUpdateBonusRecords({
      ...bonusRecords,
      [key]: bonusForm
    });
    setSelectedEmpForBonus(null);
  };

  const getTotalBonusFromForm = (form: BonusDetails) => {
    return (form.kpiActual || 0) + 
           (form.attendance || 0) + 
           (form.transport || 0) + 
           (form.phone || 0) + 
           (form.childSupportActual || 0) + 
           (form.perDiem || 0) + 
           (form.other || 0);
  };

  // --- LOGIC IN PHIẾU LƯƠNG ---
  const handlePrintPayslip = () => {
    if (!previewPayslip) return;
    
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) return;

    const { emp, baseSalary, workDays, actualSalary, bonusDetails, tax, netSalary, totalIncome } = previewPayslip;
    const monthYear = new Date(selectedMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });

    printWindow.document.write('<html><head><title>Phiếu Lương - CoffeeHR</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      body { font-family: 'Roboto', sans-serif; background: #fff; color: #1f2937; -webkit-print-color-adjust: exact; }
      .container { max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #e5e7eb; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
      .company-info h1 { margin: 0; color: #ea580c; font-size: 24px; text-transform: uppercase; }
      .company-info p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }
      .payslip-title { text-align: right; }
      .payslip-title h2 { margin: 0; font-size: 28px; color: #111827; }
      .payslip-title p { margin: 5px 0 0; color: #0f766e; font-weight: bold; font-size: 16px; }
      
      .employee-section { display: flex; margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 8px; }
      .avatar-box { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; margin-right: 20px; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .avatar-box img { width: 100%; height: 100%; object-fit: cover; }
      .emp-details { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .info-row { font-size: 14px; }
      .info-label { font-weight: bold; color: #4b5563; width: 100px; display: inline-block; }
      
      .salary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
      .panel { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
      .panel-header { background: #f3f4f6; padding: 10px 15px; font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
      .panel-body { padding: 15px; }
      .item-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 5px; }
      .item-row:last-child { border-bottom: none; }
      .total-row { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 15px; }
      
      .income-header { color: #059669; background: #ecfdf5; }
      .deduct-header { color: #dc2626; background: #fef2f2; }
      
      .net-salary-box { background: #0f766e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 40px; }
      .net-label { font-size: 16px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
      .net-value { font-size: 36px; font-weight: bold; margin-top: 5px; }
      
      .footer { display: flex; justify-content: space-between; text-align: center; font-size: 14px; }
      .signature-box { margin-top: 60px; font-weight: bold; border-top: 1px solid #9ca3af; width: 150px; display: inline-block; padding-top: 5px; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(`
      <div class="container">
        <div class="header">
           <div class="company-info">
              <h1>${companyInfo.name}</h1>
              <p>${companyInfo.address}</p>
              <p>Hotline: ${companyInfo.phone}</p>
           </div>
           <div class="payslip-title">
              <h2>PHIẾU LƯƠNG</h2>
              <p>Tháng ${monthYear}</p>
           </div>
        </div>

        <div class="employee-section">
           <div class="avatar-box">
              <img src="${emp.avatar}" alt="Avatar" />
           </div>
           <div class="emp-details">
              <div class="info-row"><span class="info-label">Họ tên:</span> ${emp.name}</div>
              <div class="info-row"><span class="info-label">Mã NV:</span> ${emp.id}</div>
              <div class="info-row"><span class="info-label">Vị trí:</span> ${emp.position}</div>
              <div class="info-row"><span class="info-label">Phòng ban:</span> Tech Dept</div>
              <div class="info-row"><span class="info-label">Ngày công:</span> ${workDays}/${STANDARD_WORK_DAYS}</div>
              <div class="info-row"><span class="info-label">Kỳ lương:</span> ${monthYear}</div>
           </div>
        </div>

        <div class="salary-grid">
           <!-- Earnings -->
           <div class="panel">
              <div class="panel-header income-header">Khoản Thu Nhập</div>
              <div class="panel-body">
                 <div class="item-row">
                    <span>Lương cơ bản</span>
                    <span>${formatCurrency(baseSalary)}</span>
                 </div>
                 <div class="item-row">
                    <span>Lương thực tế (theo công)</span>
                    <span>${formatCurrency(actualSalary)}</span>
                 </div>
                 <div class="item-row">
                    <span>Thưởng KPI</span>
                    <span>${formatCurrency(bonusDetails?.kpiActual || 0)}</span>
                 </div>
                 <div class="item-row">
                    <span>Phụ cấp Chuyên cần</span>
                    <span>${formatCurrency(bonusDetails?.attendance || 0)}</span>
                 </div>
                 <div class="item-row">
                    <span>Phụ cấp Đi lại/Nhà ở</span>
                    <span>${formatCurrency(bonusDetails?.transport || 0)}</span>
                 </div>
                 <div class="item-row">
                    <span>Phụ cấp Điện thoại</span>
                    <span>${formatCurrency(bonusDetails?.phone || 0)}</span>
                 </div>
                  <div class="item-row">
                    <span>Hỗ trợ Con nhỏ</span>
                    <span>${formatCurrency(bonusDetails?.childSupportActual || 0)}</span>
                 </div>
                 <div class="item-row">
                    <span>Thưởng khác</span>
                    <span>${formatCurrency((bonusDetails?.perDiem || 0) + (bonusDetails?.other || 0))}</span>
                 </div>
                 <div class="total-row" style="color: #059669">
                    <span>Tổng Thu Nhập</span>
                    <span>${formatCurrency(totalIncome)}</span>
                 </div>
              </div>
           </div>

           <!-- Deductions -->
           <div class="panel">
              <div class="panel-header deduct-header">Khoản Khấu Trừ</div>
              <div class="panel-body">
                 <div class="item-row">
                    <span>BHXH (8%)</span>
                    <span>0 ₫</span>
                 </div>
                 <div class="item-row">
                    <span>BHYT (1.5%)</span>
                    <span>0 ₫</span>
                 </div>
                 <div class="item-row">
                    <span>BHTN (1%)</span>
                    <span>0 ₫</span>
                 </div>
                 <div class="item-row">
                    <span>Thuế TNCN</span>
                    <span>${formatCurrency(tax)}</span>
                 </div>
                 <div class="item-row">
                    <span>Công đoàn phí</span>
                    <span>0 ₫</span>
                 </div>
                 <div class="item-row">
                    <span>Tạm ứng</span>
                    <span>0 ₫</span>
                 </div>
                 
                 <div class="total-row" style="color: #dc2626; margin-top: 85px;">
                    <span>Tổng Khấu Trừ</span>
                    <span>${formatCurrency(tax)}</span>
                 </div>
              </div>
           </div>
        </div>

        <div class="net-salary-box">
           <div class="net-label">Thực Lĩnh (Net Salary)</div>
           <div class="net-value">${formatCurrency(netSalary)}</div>
        </div>

        <div class="footer">
           <div style="text-align: left">
              <p>Ngày ..... tháng ..... năm 2023</p>
              <p><strong>Người Lập Biểu</strong></p>
              <div class="signature-box">Ký Tên</div>
           </div>
           <div style="text-align: right">
              <p>Ngày ..... tháng ..... năm 2023</p>
              <p><strong>Người Lao Động</strong></p>
              <div class="signature-box">Ký Tên</div>
           </div>
        </div>
      </div>
    `);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const openPayslipPreview = (p: any) => {
    // Tính lại chi tiết để truyền vào view
    const key = `${p.id}_${selectedMonth}`;
    const bonusDetails = bonusRecords[key];
    
    // Ước tính nếu chưa lưu (giống logic render)
    let bDetails = bonusDetails;
    if (!bDetails) {
       // Tạo object tạm để hiển thị
       bDetails = {
          kpiBase: 2000000,
          kpiActual: Math.round((2000000 / STANDARD_WORK_DAYS) * p.workDays),
          attendance: p.workDays > 21 ? 600000 : 0,
          transport: 500000,
          phone: 200000,
          childSupportBase: 0,
          childSupportActual: 0,
          perDiem: 0,
          other: 0,
          paymentStatus: 'UNPAID',
          note: ''
       };
    }

    setPreviewPayslip({
      emp: p,
      baseSalary: p.baseSalary,
      actualSalary: (p.baseSalary / STANDARD_WORK_DAYS) * p.workDays,
      workDays: p.workDays,
      bonusDetails: bDetails,
      tax: p.tax,
      netSalary: p.netSalary,
      totalIncome: (p.baseSalary / STANDARD_WORK_DAYS) * p.workDays + p.bonus // p.bonus đã tính tổng trong map
    });
  };

  // --- TÍNH TOÁN BẢNG LƯƠNG (Giữ nguyên logic cũ) ---
  const employees = candidates.filter(c => c.status === CandidateStatus.HIRED);
  
  const payrollData = employees.map(emp => {
    const monthlyRecords = attendanceData.filter(r => 
      r.employeeId === emp.id && 
      r.date.startsWith(selectedMonth)
    );
    
    const workDays = monthlyRecords.filter(r => r.status === 'PRESENT').length;
    const baseSalary = POSITION_SALARY_MAP[emp.position] || 10000000;
    
    const actualSalary = (baseSalary / STANDARD_WORK_DAYS) * workDays;
    
    const key = `${emp.id}_${selectedMonth}`;
    const bonusDetails = bonusRecords[key];
    
    let totalBonus = 0;
    if (bonusDetails) {
      totalBonus = getTotalBonusFromForm(bonusDetails);
    } else {
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
      baseSalary,
      workDays,
      bonus: totalBonus,
      tax,
      netSalary,
      isBonusSaved: !!bonusDetails,
      paymentStatus: bonusDetails?.paymentStatus || 'UNPAID'
    };
  });

  const filteredPayroll = payrollData.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  const totalNetSalary = payrollData.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalTax = payrollData.reduce((acc, curr) => acc + curr.tax, 0);
  const totalBonus = payrollData.reduce((acc, curr) => acc + curr.bonus, 0);

  // Class chung cho các ô input nền xám chữ xanh
  const inputClass = "w-full p-2 border border-gray-300 rounded text-right font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-gray-100 text-teal-700";

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h2 className="text-xl font-bold text-gray-800">Bảng Lương Tháng</h2>
            <p className="text-sm text-gray-500">Tự động tính toán dựa trên bảng công</p>
         </div>

         <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                 <CalendarDays size={18} className="text-indigo-600"/>
                 <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="font-bold text-gray-700 outline-none bg-transparent text-sm"
                 />
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm transition-colors">
                 <Download size={18}/> Xuất Excel
             </button>
         </div>
      </div>

      {/* 2. Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Tổng thực lãnh */}
         <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2 opacity-90">
                  <Wallet size={20}/>
                  <span className="text-sm font-medium uppercase tracking-wider">Tổng Thực Lãnh</span>
               </div>
               <div className="text-3xl font-bold">{formatCurrency(totalNetSalary)}</div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
               <Wallet size={120}/>
            </div>
         </div>

         {/* Tổng Thuế */}
         <div className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-1.5 h-full absolute left-0 top-0 bg-orange-500"></div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
               <Banknote size={24}/>
            </div>
            <div>
               <p className="text-sm text-gray-500 font-medium">Tổng Thuế TNCN</p>
               <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totalTax)}</h3>
               <p className="text-xs text-orange-600 mt-1">Đã khấu trừ</p>
            </div>
         </div>

         {/* Tổng Thưởng */}
         <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-1.5 h-full absolute left-0 top-0 bg-blue-500"></div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
               <TrendingUp size={24}/>
            </div>
            <div>
               <p className="text-sm text-gray-500 font-medium">Tổng Thưởng</p>
               <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totalBonus)}</h3>
               <p className="text-xs text-blue-600 mt-1">Gồm KPI, Chuyên cần...</p>
            </div>
         </div>
      </div>

      {/* 3. Payroll Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
         <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
               <Filter size={16} className="text-gray-400"/> Chi tiết bảng lương
            </h3>
            <span className="text-xs text-gray-500">Đơn vị: VNĐ</span>
         </div>
         
         <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
               <thead className="bg-gray-50 text-gray-500 text-xs font-semibold sticky top-0 z-10 uppercase tracking-wider">
                  <tr>
                     <th className="p-4">Nhân viên</th>
                     <th className="p-4 text-right">Lương Cơ Bản</th>
                     <th className="p-4 text-center">Công</th>
                     <th className="p-4 text-right text-blue-600 cursor-help" title="Click để xem chi tiết thưởng">Thưởng & PC</th>
                     <th className="p-4 text-right text-orange-600">Thuế TNCN</th>
                     <th className="p-4 text-right">Thực Lãnh</th>
                     <th className="p-4 text-center">Trạng thái</th>
                     <th className="p-4 text-center">Phiếu Lương</th>
                  </tr>
               </thead>
               <tbody className="text-sm divide-y divide-gray-100">
                  {filteredPayroll.length === 0 ? (
                     <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400">
                           {employees.length === 0 
                              ? "Chưa có nhân viên nào. Vui lòng tuyển dụng trước." 
                              : "Không tìm thấy dữ liệu lương phù hợp."}
                        </td>
                     </tr>
                  ) : (
                     filteredPayroll.map(p => (
                        <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                           <td className="p-4">
                              <div className="flex items-center gap-3">
                                 <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                                 <div>
                                    <div className="font-bold text-gray-800">{p.name}</div>
                                    <div className="text-xs text-gray-500">{p.position}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4 text-right font-medium text-gray-600">
                              {formatCurrency(p.baseSalary)}
                           </td>
                           <td className="p-4 text-center">
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                                 {p.workDays}/{STANDARD_WORK_DAYS}
                              </span>
                           </td>
                           {/* CỘT THƯỞNG CLICKABLE */}
                           <td className="p-4 text-right">
                              <button 
                                 onClick={() => handleOpenBonusModal(p, p.workDays)}
                                 className={`font-bold hover:underline decoration-dashed decoration-blue-400 underline-offset-4 ${p.isBonusSaved ? 'text-blue-700' : 'text-blue-400 italic'}`}
                              >
                                 {p.bonus > 0 ? `+${formatCurrency(p.bonus)}` : '0 đ'}
                              </button>
                           </td>
                           <td className="p-4 text-right font-medium text-orange-600">
                              {p.tax > 0 ? `-${formatCurrency(p.tax)}` : '-'}
                           </td>
                           <td className="p-4 text-right">
                              <span className="text-green-700 font-bold text-base">
                                 {formatCurrency(p.netSalary)}
                              </span>
                           </td>
                           <td className="p-4 text-center">
                              {p.paymentStatus === 'PAID' ? (
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase border border-green-200">
                                      Đã thanh toán
                                  </span>
                              ) : (
                                  <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase border border-gray-200">
                                      Chưa thanh toán
                                  </span>
                              )}
                           </td>
                           <td className="p-4 text-center">
                              <button 
                                onClick={() => openPayslipPreview(p)}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Xem phiếu lương"
                              >
                                <FileText size={18} />
                              </button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
               {filteredPayroll.length > 0 && (
                  <tfoot className="bg-gray-50 font-bold text-gray-700 border-t border-gray-200">
                     <tr>
                        <td className="p-4 text-right uppercase text-xs" colSpan={3}>Tổng cộng</td>
                        <td className="p-4 text-right text-blue-600">{formatCurrency(totalBonus)}</td>
                        <td className="p-4 text-right text-orange-600">{formatCurrency(totalTax)}</td>
                        <td className="p-4 text-right text-green-700 text-lg">{formatCurrency(totalNetSalary)}</td>
                        <td colSpan={2}></td>
                     </tr>
                  </tfoot>
               )}
            </table>
         </div>
      </div>

      {/* --- MODAL THƯỞNG CHI TIẾT --- */}
      {selectedEmpForBonus && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
               {/* Header Modal */}
               <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 flex justify-between items-center text-white">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-white/20 rounded-full">
                        <Coins size={20} className="text-yellow-300" />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg">Chi Tiết Thưởng & Phụ Cấp</h3>
                        <p className="text-xs text-indigo-100">{selectedEmpForBonus.emp.name} • {selectedEmpForBonus.workDays} công thực tế</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedEmpForBonus(null)} className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full">
                     <X size={20} />
                  </button>
               </div>

               {/* Body Modal */}
               <div className="p-6 overflow-y-auto space-y-5 bg-gray-50/50">
                  
                  {/* KPI */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                     <div className="flex items-center gap-2 mb-3 text-blue-700 font-semibold border-b border-blue-100 pb-2">
                        <TrendingUp size={18} />
                        <span>Thưởng KPIs (Hiệu suất)</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs text-gray-500 mb-1">Mức KPI cơ bản (100%)</label>
                           <input 
                              type="text" 
                              value={formatNumberInput(bonusForm.kpiBase)}
                              onChange={(e) => handleRecalculateBonusForm('kpiBase', parseNumberInput(e.target.value))}
                              className={inputClass}
                           />
                        </div>
                        <div>
                           <label className="block text-xs text-gray-500 mb-1">Thực nhận (theo công)</label>
                           <div className="w-full p-2 bg-blue-50 border border-blue-200 rounded text-right font-bold text-blue-700">
                              {formatCurrency(bonusForm.kpiActual)}
                           </div>
                        </div>
                     </div>
                     <p className="text-[10px] text-gray-400 mt-2 italic">* Công thức: (Mức KPI / 26) * Số ngày công</p>
                  </div>

                  {/* Phụ cấp cố định */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 text-orange-700 font-semibold border-b border-orange-100 pb-2">
                        <Star size={18} />
                        <span>Phụ cấp cố định & Chuyên cần</span>
                     </div>
                     
                     {/* Chuyên cần */}
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                           <CalendarDays size={16} className="text-green-600"/> 
                           <span>Chuyên cần ({'>'} 21 công)</span>
                        </div>
                        <div className={`font-bold ${bonusForm.attendance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                           {formatCurrency(bonusForm.attendance)}
                        </div>
                     </div>

                     {/* Đi lại/Nhà ở */}
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                           <Home size={16} className="text-purple-600"/> 
                           <span>Đi lại / Nhà ở</span>
                        </div>
                        <div className="font-bold text-gray-700">
                           {formatCurrency(bonusForm.transport)}
                        </div>
                     </div>

                     {/* Điện thoại */}
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                           <Smartphone size={16} className="text-gray-600"/> 
                           <span>Điện thoại</span>
                        </div>
                        <div className="font-bold text-gray-700">
                           {formatCurrency(bonusForm.phone)}
                        </div>
                     </div>
                  </div>

                  {/* Hỗ trợ & Khác */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                     <div className="flex items-center gap-2 mb-3 text-green-700 font-semibold border-b border-green-100 pb-2">
                        <Briefcase size={18} />
                        <span>Hỗ trợ & Khác</span>
                     </div>
                     
                     {/* Con nhỏ */}
                     <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                           <label className="flex items-center gap-2 text-sm text-gray-700">
                              <Baby size={16} className="text-pink-500"/> Hỗ trợ con nhỏ (Mức/tháng)
                           </label>
                           <span className="text-xs text-gray-400">(Nhập 0 nếu không có)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <input 
                              type="text" 
                              value={formatNumberInput(bonusForm.childSupportBase)}
                              onChange={(e) => handleRecalculateBonusForm('childSupportBase', parseNumberInput(e.target.value))}
                              className={inputClass}
                              placeholder="0"
                           />
                           <div className="w-full p-2 bg-pink-50 border border-pink-200 rounded text-right font-bold text-pink-700">
                              {formatCurrency(bonusForm.childSupportActual)}
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        {/* Công tác phí */}
                        <div>
                           <label className="block text-xs text-gray-500 mb-1">Công tác phí</label>
                           <input 
                              type="text" 
                              value={formatNumberInput(bonusForm.perDiem)}
                              onChange={(e) => handleRecalculateBonusForm('perDiem', parseNumberInput(e.target.value))}
                              className={inputClass}
                           />
                        </div>
                        {/* Thưởng khác */}
                        <div>
                           <label className="block text-xs text-gray-500 mb-1">Khác (Tết, Lễ...)</label>
                           <input 
                              type="text" 
                              value={formatNumberInput(bonusForm.other)}
                              onChange={(e) => handleRecalculateBonusForm('other', parseNumberInput(e.target.value))}
                              className={inputClass}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Payment Status (NEW) */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center">
                          <label className="font-bold text-gray-700">Xác nhận thanh toán lương</label>
                          <div className="flex items-center gap-2">
                             <button
                                onClick={() => setBonusForm({...bonusForm, paymentStatus: 'UNPAID'})}
                                className={`px-3 py-1.5 text-xs font-bold rounded border ${bonusForm.paymentStatus !== 'PAID' ? 'bg-gray-200 text-gray-700 border-gray-300' : 'bg-white text-gray-400 border-gray-200'}`}
                             >
                                 Chưa thanh toán
                             </button>
                             <button
                                onClick={() => setBonusForm({...bonusForm, paymentStatus: 'PAID'})}
                                className={`px-3 py-1.5 text-xs font-bold rounded border ${bonusForm.paymentStatus === 'PAID' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-200'}`}
                             >
                                 Đã thanh toán
                             </button>
                          </div>
                      </div>
                  </div>

                  {/* Tổng cộng */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                     <span className="text-gray-600 font-bold uppercase text-sm">Tổng thưởng & PC:</span>
                     <span className="text-2xl font-bold text-indigo-600">{formatCurrency(getTotalBonusFromForm(bonusForm))}</span>
                  </div>
               </div>

               {/* Footer Modal */}
               <div className="p-4 border-t bg-white flex justify-end gap-3">
                  <button 
                     onClick={() => setSelectedEmpForBonus(null)}
                     className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 font-medium"
                  >
                     Hủy bỏ
                  </button>
                  <button 
                     onClick={handleSaveBonus}
                     className="px-6 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 font-bold shadow-md flex items-center gap-2"
                  >
                     <Save size={18} /> Lưu & Cập nhật
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* --- MODAL XEM TRƯỚC PHIẾU LƯƠNG (PAYSLIP PREVIEW) --- */}
      {previewPayslip && (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
               {/* Header Toolbar */}
               <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                  <h3 className="font-medium flex items-center gap-2">
                     <Eye size={18}/> Xem trước phiếu lương
                  </h3>
                  <div className="flex gap-2">
                     <button 
                        onClick={handlePrintPayslip}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2"
                     >
                        <Printer size={16}/> In Phiếu
                     </button>
                     <button onClick={() => setPreviewPayslip(null)} className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded">
                        <X size={18}/>
                     </button>
                  </div>
               </div>

               {/* Payslip Content Container */}
               <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-200">
                  <div className="bg-white w-full max-w-[700px] min-h-[800px] shadow-lg p-8 text-gray-800 font-serif relative">
                      {/* Logo & Header */}
                      <div className="flex justify-between items-start border-b-2 border-teal-700 pb-6 mb-6">
                          <div>
                              <div className="text-2xl font-bold text-orange-600 uppercase tracking-wide flex items-center gap-2">
                                 <Banknote size={28}/> {companyInfo.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">{companyInfo.address}</div>
                              <div className="text-sm text-gray-500">MST: {companyInfo.taxId}</div>
                          </div>
                          <div className="text-right">
                              <h1 className="text-3xl font-bold text-gray-800 uppercase mb-1">Phiếu Lương</h1>
                              <div className="text-teal-700 font-bold">Tháng {new Date(selectedMonth).toLocaleDateString('vi-VN', {month: '2-digit', year: 'numeric'})}</div>
                          </div>
                      </div>

                      {/* Employee Info */}
                      <div className="flex mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mr-6 flex-shrink-0">
                              <img src={previewPayslip.emp.avatar} className="w-full h-full object-cover"/>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                              <div><span className="font-bold text-gray-500 block text-xs uppercase">Họ và tên</span> <span className="text-lg font-bold">{previewPayslip.emp.name}</span></div>
                              <div><span className="font-bold text-gray-500 block text-xs uppercase">Mã nhân viên</span> <span className="font-mono">{previewPayslip.emp.id}</span></div>
                              <div><span className="font-bold text-gray-500 block text-xs uppercase">Chức vụ</span> {previewPayslip.emp.position}</div>
                              <div><span className="font-bold text-gray-500 block text-xs uppercase">Phòng ban</span> Technology Dept</div>
                              <div><span className="font-bold text-gray-500 block text-xs uppercase">Ngày công tính lương</span> {previewPayslip.workDays} / {STANDARD_WORK_DAYS}</div>
                          </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-8 mb-8">
                          {/* Income */}
                          <div>
                              <h3 className="font-bold text-teal-800 border-b border-teal-200 pb-2 mb-3 uppercase text-sm">Khoản Thu Nhập</h3>
                              <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">Lương cơ bản</span>
                                      <span className="font-medium">{formatCurrency(previewPayslip.baseSalary)}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                      <span className="text-gray-600">Lương theo công</span>
                                      <span className="font-medium">{formatCurrency(previewPayslip.actualSalary)}</span>
                                  </div>
                                  
                                  {/* Bonus Breakdown */}
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">Thưởng KPI</span>
                                      <span className="font-medium">{formatCurrency(previewPayslip.bonusDetails?.kpiActual || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">PC Chuyên cần</span>
                                      <span className="font-medium">{formatCurrency(previewPayslip.bonusDetails?.attendance || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">PC Đi lại/Nhà ở</span>
                                      <span className="font-medium">{formatCurrency(previewPayslip.bonusDetails?.transport || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">PC Điện thoại</span>
                                      <span className="font-medium">{formatCurrency(previewPayslip.bonusDetails?.phone || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">Hỗ trợ Con nhỏ</span>
                                      <span className="font-medium">{formatCurrency(previewPayslip.bonusDetails?.childSupportActual || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">Thưởng Khác</span>
                                      <span className="font-medium">{formatCurrency((previewPayslip.bonusDetails?.perDiem || 0) + (previewPayslip.bonusDetails?.other || 0))}</span>
                                  </div>
                                  
                                  <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-teal-700 mt-2">
                                      <span>TỔNG THU NHẬP</span>
                                      <span>{formatCurrency(previewPayslip.totalIncome)}</span>
                                  </div>
                              </div>
                          </div>

                          {/* Deductions */}
                          <div>
                              <h3 className="font-bold text-red-800 border-b border-red-200 pb-2 mb-3 uppercase text-sm">Khoản Khấu Trừ</h3>
                              <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">BHXH (8%)</span>
                                      <span className="font-medium">0 ₫</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">BHYT (1.5%)</span>
                                      <span className="font-medium">0 ₫</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-600">BHTN (1%)</span>
                                      <span className="font-medium">0 ₫</span>
                                  </div>
                                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                      <span className="text-gray-600">Thuế TNCN</span>
                                      <span className="font-medium">{formatCurrency(previewPayslip.tax)}</span>
                                  </div>

                                  <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-red-700 mt-auto">
                                      <span>TỔNG KHẤU TRỪ</span>
                                      <span>{formatCurrency(previewPayslip.tax)}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Net Salary Highlight */}
                      <div className="bg-teal-700 text-white p-6 rounded-lg text-center mb-10">
                          <div className="text-sm opacity-80 uppercase tracking-widest mb-1">Thực lĩnh (Net Salary)</div>
                          <div className="text-4xl font-bold tracking-tight">{formatCurrency(previewPayslip.netSalary)}</div>
                      </div>

                      {/* Signature */}
                      <div className="flex justify-between text-center text-sm">
                          <div>
                              <div className="font-bold text-gray-800 mb-16">NGƯỜI LẬP BIỂU</div>
                              <div className="font-bold text-gray-600 border-t border-gray-300 pt-1 inline-block min-w-[120px]">Ký tên</div>
                          </div>
                          <div>
                              <div className="font-bold text-gray-800 mb-16">GIÁM ĐỐC</div>
                              <div className="font-bold text-gray-600 border-t border-gray-300 pt-1 inline-block min-w-[120px]">Ký tên</div>
                          </div>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Payroll;