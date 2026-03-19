export interface Group {
  id: string;
  name: string;
  subject: string;
  sheetId: string;
  owners: string[];
  leaders: string[];
  createdAt: string;
  branches?: string[];
  currentBranch?: string;
  year?: string;
  teacherEmails?: string[]; // Group-specific teachers (in addition to master teacher)
}

export interface Leader {
  email: string;
  rollNo: string;
  name: string;
  branch: string;
  groupId: string;
}

// Daily Awards System
export interface DailyAwards {
  groupId: string;
  date: string;
  
  // Group Awards (team names)
  bestPerformerGroup?: string;
  runnerUpBestPerformerGroup?: string;
  bestImprovedGroup?: string;
  runnerUpBestImprovedGroup?: string;
  
  // Individual Awards (student names)
  bestPerformer?: string;
  bestPerformerRunnerUp?: string;
  bestImproved?: string;
  bestImprovedRunnerUp?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  date: string;
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'excused';
  timestamp: string;
  // Communication Lab specific fields
  attendanceMarks?: number;      // Attendance ke marks
  englishSpeaking?: number;      // English speaking marks
  activeParticipation?: number;  // Active participation marks
  creativeWork?: number;         // Creative work marks
  totalMarks?: number;           // Total marks for the day
  remarks?: string;              // Additional remarks
}

export interface GroupMember {
  email: string;
  role: 'owner' | 'leader';
  joinedAt: string;
}

export interface InviteLink {
  groupId: string;
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface LabSession {
  id: string;
  groupId: string;
  date: string;
  branch?: string;
  attendance: AttendanceRecord[];
  notes?: string;
}
