# Leaders System Implementation - Remaining Tasks

## ✅ Completed:
1. `lib/permissions.ts` - Teacher check helpers
2. `lib/firebase-db.ts` - Leader CRUD functions (addLeader, getGroupLeaders, deleteLeader, saveLeaderAttendance, getLeaderAttendanceByDate)
3. Advanced Settings:
   - Teachers tab (master teacher only)
   - Student Leaders tab (teachers only)
   - Managers tab (renamed from Leaders)
4. Group page - Props passed to all components

## ⏳ Remaining Tasks:

### 1. Attendance Table - Add Leaders Tab
**File:** `components/group/attendance-table.tsx`

**Changes needed:**
```typescript
// Add props
interface AttendanceTableProps {
  groupId: string;
  date: string;
  group: any;
  userEmail: string;
}

// Add state
const [leaders, setLeaders] = useState<any[]>([]);
const [isTeacher, setIsTeacher] = useState(false);

// Check if teacher
useEffect(() => {
  const masterEmail = process.env.NEXT_PUBLIC_MASTER_TEACHER_EMAIL?.toLowerCase();
  const isMaster = userEmail.toLowerCase() === masterEmail;
  const isGroupTeacher = group?.teacherEmails?.some((e: string) => 
    e.toLowerCase() === userEmail.toLowerCase()
  );
  setIsTeacher(isMaster || isGroupTeacher);
}, [userEmail, group]);

// Load leaders
useEffect(() => {
  if (isTeacher) {
    loadLeaders();
  }
}, [groupId, isTeacher]);

const loadLeaders = async () => {
  const groupLeaders = await firebaseDB.getGroupLeaders(groupId);
  const leaderAttendance = await firebaseDB.getLeaderAttendanceByDate(groupId, date);
  
  // Merge leaders with attendance
  const leadersWithAttendance = groupLeaders.map(leader => {
    const attendance = leaderAttendance.find(a => a.email === leader.email);
    return {
      ...leader,
      status: attendance?.status || 'absent',
      attendanceMarks: attendance?.attendanceMarks || 0,
      judgeMarks: attendance?.judgeMarks || 0,
      totalMarks: attendance?.totalMarks || 0,
      remarks: attendance?.remarks || ''
    };
  });
  
  setLeaders(leadersWithAttendance);
};

// Save leader attendance
const handleSaveLeaderAttendance = async () => {
  const leaderRecords = leaders.map(leader => ({
    email: leader.email,
    rollNo: leader.rollNo,
    name: leader.name,
    branch: leader.branch,
    status: leader.status,
    attendanceMarks: leader.attendanceMarks,
    judgeMarks: leader.judgeMarks,
    totalMarks: leader.totalMarks,
    remarks: leader.remarks || ''
  }));
  
  await firebaseDB.saveLeaderAttendance(groupId, date, leaderRecords);
  alert('Leader attendance saved!');
};
```

**UI Changes:**
- Add Tabs with "Students" and "Leaders" tabs
- Leaders tab only visible if `isTeacher === true`
- Same table structure as students
- Same marks input (Attendance 0-5, Judge 0-5, Total 0-10)

### 2. Student Records - Add Leaders Section
**File:** `components/group/student-records.tsx`

**Changes needed:**
```typescript
// Add props
interface StudentRecordsProps {
  groupId: string;
  group: any;
  userEmail: string;
}

// Add state
const [leaderRecords, setLeaderRecords] = useState<any[]>([]);
const [isTeacher, setIsTeacher] = useState(false);

// Check if teacher (same as attendance)

// Load leader records
const loadLeaderRecords = async () => {
  const allAttendance = await firebaseDB.getAllAttendance(groupId);
  const leaderAttendance = allAttendance.filter(a => a.isLeader === true);
  
  // Process similar to student records
  // Group by email, calculate totals
};
```

**UI Changes:**
- Add "Leaders Records" section below students
- Only visible if `isTeacher === true`
- Same table/card structure
- Color coding based on status (Present=Green, Absent=Red)

### 3. Testing Checklist:
- [ ] Master teacher can see Teachers tab
- [ ] Master teacher can add/remove group teachers
- [ ] Teachers can see Leaders tab
- [ ] Teachers can add special student leaders
- [ ] Leaders tab shows in attendance (teachers only)
- [ ] Leader attendance can be saved
- [ ] Leaders section shows in records (teachers only)
- [ ] Normal leaders cannot see leader sections
- [ ] All data persists in Firebase

### 4. Firebase Collections Structure:
```
leaders/
  └── {groupId}_{email}
      ├── email
      ├── rollNo
      ├── name
      ├── branch
      └── groupId

attendance/
  ├── {groupId}_{date}_{rollNo} (students)
  └── {groupId}_{date}_leader_{email} (leaders)
      └── isLeader: true
```

## Quick Implementation Guide:

1. **Attendance Table:**
   - Copy student tab structure
   - Create leaders tab
   - Add conditional rendering: `{isTeacher && <TabsTrigger>Leaders</TabsTrigger>}`
   - Duplicate student logic for leaders

2. **Records Page:**
   - Add leaders section after students
   - Conditional rendering: `{isTeacher && <div>Leaders Records</div>}`
   - Filter attendance where `isLeader === true`

3. **Test Flow:**
   - Login as master teacher (himanshunokhval@gmail.com)
   - Go to Settings → Teachers → Add a group teacher
   - Go to Settings → Leaders → Add a student leader
   - Go to Attendance → Leaders tab → Mark attendance
   - Go to Records → See leader records

## Notes:
- All Firebase functions already exist in `lib/firebase-db.ts`
- Permission checks use `lib/permissions.ts`
- UI components follow existing patterns
- Mobile responsive already handled in base components
