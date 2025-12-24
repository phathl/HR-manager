import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CandidateTable from './components/CandidateTable';
import Timesheet from './components/Timesheet';
import Payroll from './components/Payroll';
import Contracts from './components/Contracts';
import Settings from './components/Settings';
import ChatWidget from './components/ChatWidget';
import Dashboard from './components/Dashboard';
import { ViewState, Candidate, AttendanceRecord, BonusRecordMap, ContractRecord, InvoiceRecord, UserRole, CompanySettings } from './types';
import { MOCK_CANDIDATES } from './constants';

// Di chuyển Mock Attendance ra ngoài hoặc vào constants (ở đây giữ tạm để khởi tạo)
const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: '1', employeeId: '1', date: new Date().toISOString().split('T')[0], status: 'PRESENT', leaveType: 'NONE', checkIn: '08:00', checkOut: '17:30' },
  { id: '2', employeeId: '8', date: new Date().toISOString().split('T')[0], status: 'ABSENT', leaveType: 'PHEP_NAM', note: 'Nghỉ mát' },
  { id: '3', employeeId: '1', date: '2023-10-01', status: 'PRESENT', leaveType: 'NONE', checkIn: '08:00', checkOut: '17:30' },
  { id: '4', employeeId: '1', date: '2023-10-02', status: 'PRESENT', leaveType: 'NONE', checkIn: '08:15', checkOut: '17:30' },
  { id: '5', employeeId: '1', date: '2023-10-03', status: 'ABSENT', leaveType: 'OM', note: 'Ốm' },
];

const DEFAULT_COMPANY_INFO: CompanySettings = {
  name: 'Công ty Cổ phần CoffeeHR',
  taxId: '0101234567',
  address: 'Tầng 8, Tòa nhà Coffee Building, Hà Nội',
  phone: '0909 999 888',
  email: 'contact@coffeehr.com.vn',
  logo: 'https://img.icons8.com/fluency/96/coffee.png',
  representativeName: 'Trần Trọng Thanh',
  representativePosition: 'Giám Đốc'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State phân quyền (Mặc định là Admin để thấy hết)
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');

  // State thông tin công ty
  const [companyInfo, setCompanyInfo] = useState<CompanySettings>(DEFAULT_COMPANY_INFO);
  
  // State chia sẻ dữ liệu
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [bonusRecords, setBonusRecords] = useState<BonusRecordMap>({});
  
  // State cho Contracts và Invoices
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  // Tự động chuyển về dashboard nếu user bị mất quyền truy cập vào trang hiện tại
  useEffect(() => {
    if (userRole === 'USER' && currentView !== 'dashboard' && currentView !== 'settings') {
      setCurrentView('dashboard');
    }
  }, [userRole, currentView]);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
             candidates={candidates}
             attendanceData={attendanceData}
             contracts={contracts}
             userRole={userRole}
          />
        );
      case 'recruitment':
        return userRole !== 'USER' ? (
          <CandidateTable 
            candidates={candidates} 
            onUpdateCandidates={setCandidates}
            searchTerm={searchTerm} 
            companyInfo={companyInfo}
          />
        ) : <AccessDenied />;
      case 'timesheet':
        return userRole !== 'USER' ? (
          <Timesheet 
            candidates={candidates} 
            searchTerm={searchTerm} 
            attendanceData={attendanceData}
            onUpdateAttendance={setAttendanceData}
          />
        ) : <AccessDenied />;
      case 'payroll':
        return userRole !== 'USER' ? (
          <Payroll
            candidates={candidates}
            attendanceData={attendanceData}
            bonusRecords={bonusRecords}
            onUpdateBonusRecords={setBonusRecords}
            searchTerm={searchTerm}
            companyInfo={companyInfo}
          />
        ) : <AccessDenied />;
      case 'contracts':
        return userRole !== 'USER' ? (
          <Contracts
            candidates={candidates}
            contracts={contracts}
            invoices={invoices}
            onUpdateContracts={setContracts}
            onUpdateInvoices={setInvoices}
            attendanceData={attendanceData}
            bonusRecords={bonusRecords}
            onUpdateBonusRecords={setBonusRecords}
            companyInfo={companyInfo}
          />
        ) : <AccessDenied />;
      case 'settings':
        return (
          <Settings 
             userRole={userRole}
             onUpdateRole={setUserRole}
             companyInfo={companyInfo}
             onUpdateCompanyInfo={setCompanyInfo}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4 opacity-20">🚧</div>
            <h2 className="text-xl font-medium">Chức năng đang phát triển</h2>
            <p className="mt-2">Vui lòng quay lại Dashboard.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        userRole={userRole}
        companyInfo={companyInfo}
      />
      
      {/* Header width adjustment */}
      <Header onSearch={setSearchTerm} />
      
      <div className="pl-64 pt-14 h-screen">
        <main className="p-6 h-full overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
     <div className="bg-red-50 p-6 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
     </div>
     <h2 className="text-2xl font-bold text-gray-800">Quyền truy cập bị từ chối</h2>
     <p className="mt-2">Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên.</p>
  </div>
);

export default App;