import React from 'react';
import { 
  ClipboardList, 
  Search, 
  CalendarDays, 
  Banknote, 
  FileSignature, 
  Settings, 
  GraduationCap 
} from 'lucide-react';
import { Candidate, CandidateStatus, MenuItem } from './types';

// USER chỉ thấy Dashboard
// MANAGER/ADMIN thấy tất cả
export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Công việc', icon: <ClipboardList size={20} />, allowedRoles: ['USER', 'MANAGER', 'ADMIN'] },
  { id: 'recruitment', label: 'Tuyển dụng', icon: <Search size={20} />, allowedRoles: ['MANAGER', 'ADMIN'] },
  { id: 'timesheet', label: 'Bảng công tháng', icon: <CalendarDays size={20} />, allowedRoles: ['MANAGER', 'ADMIN'] },
  { id: 'payroll', label: 'Bảng lương tháng', icon: <Banknote size={20} />, allowedRoles: ['MANAGER', 'ADMIN'] },
  { id: 'contracts', label: 'Hợp đồng & Chi phí', icon: <FileSignature size={20} />, allowedRoles: ['MANAGER', 'ADMIN'] },
  { id: 'training', label: 'Đào tạo', icon: <GraduationCap size={20} />, allowedRoles: ['MANAGER', 'ADMIN'] },
  { id: 'settings', label: 'Cài đặt', icon: <Settings size={20} />, allowedRoles: ['USER', 'MANAGER', 'ADMIN'] }, // User có thể vào xem thông tin (read-only logic xử lý trong component) hoặc đổi role để test
];

export const VIETNAM_BANKS = [
  { code: 'VCB', name: 'Vietcombank', shortName: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank', shortName: 'Techcombank' },
  { code: 'MB', name: 'MBBank', shortName: 'MBBank' },
  { code: 'ACB', name: 'ACB', shortName: 'ACB' },
  { code: 'VPB', name: 'VPBank', shortName: 'VPBank' },
  { code: 'ICB', name: 'VietinBank', shortName: 'VietinBank' },
  { code: 'BIDV', name: 'BIDV', shortName: 'BIDV' },
  { code: 'TPB', name: 'TPBank', shortName: 'TPBank' },
  { code: 'MSB', name: 'MSB', shortName: 'MSB' },
  { code: 'STB', name: 'Sacombank', shortName: 'Sacombank' },
  { code: 'VIB', name: 'VIB', shortName: 'VIB' },
  { code: 'HDB', name: 'HDBank', shortName: 'HDBank' },
  { code: 'OCB', name: 'OCB', shortName: 'OCB' },
  { code: 'SHB', name: 'SHB', shortName: 'SHB' },
];

// Helper để tạo link PDF giả lập
const MOCK_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '99',
    name: 'Phạm Văn Mới',
    phone: '0901234567',
    email: 'phamvanmoi@gmail.com',
    avatar: 'https://picsum.photos/id/64/100/100',
    position: 'Intern',
    dateApplied: '25/10/2023',
    status: CandidateStatus.PROCESSING,
    dob: '2002-05-15',
    experience: 'Dưới 1 Năm',
    cvFile: 'CV_PhamVanMoi.pdf',
    cvFileUrl: MOCK_PDF_URL
  },
  {
    id: '7',
    name: 'Nguyễn Thị Hồng Hạnh',
    phone: '0980000006',
    email: 'hanh.nth@oos.com.vn',
    avatar: 'https://picsum.photos/id/338/100/100',
    position: 'HR',
    dateApplied: '23/09/2020',
    status: CandidateStatus.WAITING,
    dob: '1999-08-20',
    experience: 'Dưới 1 Năm',
    cvFile: 'CV_NguyenThiHongHanh.pdf',
    cvFileUrl: MOCK_PDF_URL,
    bankName: 'VCB',
    bankAccountNumber: '0011001234567'
  },
  {
    id: '2',
    name: 'Đỗ Thị Kim Ngân',
    phone: '0980000002',
    email: 'dokimngan@oos.com.vn',
    avatar: 'https://picsum.photos/id/1011/100/100',
    position: 'Tester',
    dateApplied: '23/09/2020',
    status: CandidateStatus.APPROVED,
    dob: '1996-02-14',
    experience: 'Dưới 1 Năm',
    cvFile: 'CV_DoThiKimNgan.docx',
    cvFileUrl: MOCK_PDF_URL
  },
  {
    id: '3',
    name: 'Dương Văn Anh',
    phone: '0980000007',
    email: 'duonganh@oos.com.vn',
    avatar: 'https://picsum.photos/id/1012/100/100',
    position: 'BA',
    dateApplied: '23/09/2020',
    status: CandidateStatus.APPROVED,
    dob: '1990-11-05',
    experience: 'Dưới 1 Năm',
    cvFile: 'Profile_DuongVanAnh.pdf',
    cvFileUrl: MOCK_PDF_URL
  },
  {
    id: '1',
    name: 'Trịnh Tuấn Linh',
    phone: '0984886683',
    email: 'linhtn301282@gmail.com',
    avatar: 'https://picsum.photos/id/1005/100/100',
    position: 'Developer',
    dateApplied: '09/10/2020',
    status: CandidateStatus.HIRED,
    dob: '1984-12-30',
    experience: '12 Năm',
    cvFile: 'CV_Senior_TrinhTuanLinh.pdf',
    cvFileUrl: MOCK_PDF_URL,
    bankName: 'MB',
    bankAccountNumber: '888899990000'
  },
  {
    id: '5',
    name: 'Hà Văn Quang',
    phone: '0980000004',
    email: 'haquang.th@oos.com.vn',
    avatar: 'https://picsum.photos/id/100/100/100',
    position: 'DevOps',
    dateApplied: '23/09/2020',
    status: CandidateStatus.REJECTED,
    dob: '1988-06-18',
    experience: 'Dưới 1 Năm'
  },
  {
    id: '6',
    name: 'Ngô Văn Việt',
    phone: '0980000008',
    email: 'viet.ngo@oos.com.vn',
    avatar: 'https://picsum.photos/id/200/100/100',
    position: 'Developer',
    dateApplied: '23/09/2020',
    status: CandidateStatus.APPROVED,
    dob: '1997-03-25',
    experience: 'Dưới 1 Năm',
    cvFile: 'CV_NgoVanViet_Java.pdf',
    cvFileUrl: MOCK_PDF_URL
  },
  {
    id: '8',
    name: 'Phạm Minh Giang',
    phone: '0980000010',
    email: 'sales.exe.hn6@tab100.com.vn',
    avatar: 'https://picsum.photos/id/400/100/100',
    position: 'Sales',
    dateApplied: '23/09/2020',
    status: CandidateStatus.APPROVED,
    dob: '1989-09-09',
    experience: 'Dưới 1 Năm'
  },
  {
    id: '9',
    name: 'Trần Trọng Thanh',
    phone: '0922222222',
    email: 'thanh@oos.com.vn',
    avatar: 'https://picsum.photos/id/500/100/100',
    position: 'Director',
    dateApplied: '21/09/2020',
    status: CandidateStatus.APPROVED,
    dob: '1990-01-01',
    experience: '6 Năm',
    bankName: 'TCB',
    bankAccountNumber: '190333444555'
  }
];