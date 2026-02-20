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
