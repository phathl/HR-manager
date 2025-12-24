import React from 'react';

export enum CandidateStatus {
  PROCESSING = 'Chờ xử lý',
  WAITING = 'Chờ duyệt',
  APPROVED = 'Đã duyệt',
  HIRED = 'Đã tuyển dụng',
  REJECTED = 'Không trúng tuyển',
}

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  position: string;
  dateApplied: string;
  status: CandidateStatus;
  dob: string; // Thay đổi từ age sang dob (Date of Birth)
  experience: string;
  cvFile?: string; // Tên file hiển thị
  cvFileUrl?: string; // Đường dẫn thực tế để mở file
  bankName?: string; // Tên ngân hàng
  bankAccountNumber?: string; // Số tài khoản
}

// Xóa 'evaluation' và 'employees', thêm 'settings'
export type ViewState = 'dashboard' | 'recruitment' | 'timesheet' | 'payroll' | 'contracts' | 'training' | 'settings';

// --- Roles ---
export type UserRole = 'USER' | 'MANAGER' | 'ADMIN';

export interface MenuItem {
  id: ViewState;
  label: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[]; // Phân quyền
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  type: 'user' | 'group';
  members?: string[];
  isOnline: boolean;
  lastMessage?: string;
  isAi?: boolean;
  role?: string;
}

// --- Timesheet Types ---
export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export type LeaveType = 'KHONG_PHEP' | 'CO_PHEP' | 'OM' | 'PHEP_NAM' | 'THAI_SAN' | 'NONE';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  leaveType: LeaveType;
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  note?: string;
}

// --- Payroll Types ---
export interface BonusDetails {
  kpiBase: number;       // Mức KPI cơ bản (có thể điều chỉnh)
  kpiActual: number;     // KPI thực nhận (Base / 26 * công)
  attendance: number;    // Chuyên cần (600k nếu > 21 công)
  transport: number;     // Đi lại/Nhà ở (500k)
  phone: number;         // Điện thoại (200k)
  childSupportBase: number; // Mức hỗ trợ con nhỏ (200k)
  childSupportActual: number; // Con nhỏ thực nhận (Base / 26 * công)
  perDiem: number;       // Công tác phí (Nhập tay)
  other: number;         // Thưởng khác (Tết, lễ...)
  paymentStatus?: 'PAID' | 'UNPAID'; // Trạng thái thanh toán lương
  note?: string;
}

// Map key: employeeId_YYYY-MM -> BonusDetails
export type BonusRecordMap = Record<string, BonusDetails>;

// --- Contract & Invoice Types ---
export type ContractType = 'PROBATION' | '1_YEAR' | '3_YEAR' | 'INDEFINITE';

export interface ContractRecord {
  id: string;
  employeeId: string;
  type: ContractType;
  startDate: string;
  endDate?: string; // Có thể null nếu là không thời hạn
  salary: number;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  signedDate: string;
}

export interface InvoiceRecord {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string; // "Thiết bị", "Thưởng nóng", "Team Building", ...
  status: 'PENDING' | 'PAID';
  notes?: string;
  employeeId?: string; // Nếu chi cho nhân viên cụ thể
}

// --- Company Settings Type ---
export interface CompanySettings {
  name: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  representativeName: string; // Người đại diện
  representativePosition: string; // Chức vụ
}

// --- Task & KPI Types (NEW) ---
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  status: TaskStatus;
  kpiPoints: number; // Điểm KPI cho công việc này
  reportFile?: string; // File báo cáo kết quả
  reportNote?: string; // Ghi chú báo cáo
  reportDate?: string;
}