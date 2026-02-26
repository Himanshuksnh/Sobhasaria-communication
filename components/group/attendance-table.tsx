'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2, Plus, Search } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase-db';
import ImportStudents from './import-students';

interface AttendanceTableProps {
  groupId: string;
  date: string;
}

interface Student {
  id: string;
  name: string;
  rollNo: string;
  branch: string;               // Branch name (Data Science, Electrical, etc.)
  status: 'present' | 'absent' | 'excused';
  attendanceMarks: number;      // Attendance marks (0-5)
  judgeMarks: number;           // Judge marks (0-5)
  totalMarks: number;           // Auto-calculated total (0-10)
  remarks?: string;
}

export default function AttendanceTable({ groupId, date }: AttendanceTableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentBranch, setNewStudentBranch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [autoLoadedFrom, setAutoLoadedFrom] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSummaryCards, setShowSummaryCards] = useState(true);

  // Load summary cards preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('showSummaryCards');
    if (saved !== null) {
      setShowSummaryCards(saved === 'true');
    }
  }, []);

  // Load attendance data from Firebase
  useEffect(() => {
    loadAttendanceData();
    loadGroupData();
  }, [groupId, date]);

  const loadGroupData = async () => {
    try {
      const group = await firebaseDB.getGroup(groupId);
      if (group && group.branches) {
        setAvailableBranches(group.branches);
        if (group.branches.length > 0) {
          setNewStudentBranch(group.branches[0]);
        }
      }
    } catch (error) {
      console.error('Error loading group:', error);
    }
  };

  const loadAttendanceData = async () => {
    setIsLoading(true);
    try {
      const records = await firebaseDB.getAttendanceByDate(groupId, date);
      
      if (records.length > 0) {
        // Data exists for this date
        const studentsFromFirebase = records.map((r: any) => ({
          id: r.rollNo,
          name: r.name,
          rollNo: r.rollNo,
          branch: r.branch,
          status: r.status.toLowerCase() as 'present' | 'absent' | 'excused',
          attendanceMarks: Number(r.attendanceMarks) || 0,
          judgeMarks: Number(r.judgeMarks) || 0,
          totalMarks: Number(r.totalMarks) || 0,
          remarks: r.remarks || ''
        }));
        setStudents(studentsFromFirebase);
      } else {
        // No data for this date - try to copy from previous date
        await loadFromPreviousDate();
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromPreviousDate = async () => {
    try {
      // First, try to load from permanent students list
      const permanentStudents = await firebaseDB.getGroupStudents(groupId);
      
      if (permanentStudents.length > 0) {
        // Use permanent students list
        const studentsFromMaster = permanentStudents.map((s: any) => ({
          id: s.rollNo,
          name: s.name,
          rollNo: s.rollNo,
          branch: s.branch,
          status: 'absent' as const,
          attendanceMarks: 0,
          judgeMarks: 0,
          totalMarks: 0,
          remarks: ''
        }));
        
        setStudents(studentsFromMaster);
        setAutoLoadedFrom('master list');
        return;
      }

      // Fallback: Get all attendance records for this group
      const allRecords = await firebaseDB.getAllAttendance(groupId);
      
      if (allRecords.length === 0) {
        // No previous data - start fresh
        setStudents([]);
        return;
      }

      // Find the most recent date (excluding current date)
      const dates = [...new Set(allRecords.map((r: any) => r.date))]
        .filter((d: string) => d !== date)
        .sort()
        .reverse();

      if (dates.length === 0) {
        // No previous data - start fresh
        setStudents([]);
        return;
      }

      const previousDate = dates[0];
      const previousRecords = await firebaseDB.getAttendanceByDate(groupId, previousDate);

      // Copy student list with reset marks
      const copiedStudents = previousRecords.map((r: any) => ({
        id: r.rollNo,
        name: r.name,
        rollNo: r.rollNo,
        branch: r.branch,
        status: 'absent' as const,
        attendanceMarks: 0,
        judgeMarks: 0,
        totalMarks: 0,
        remarks: ''
      }));

      setStudents(copiedStudents);
      setAutoLoadedFrom(previousDate);
    } catch (error) {
      console.error('Error loading from previous date:', error);
      setStudents([]);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !newStudentRoll.trim() || !newStudentBranch.trim()) return;

    const newStudent: Student = {
      id: `${Date.now()}`,
      name: newStudentName.trim(),
      rollNo: newStudentRoll.trim(),
      branch: newStudentBranch.trim(),
      status: 'absent',
      attendanceMarks: 0,
      judgeMarks: 0,
      totalMarks: 0,
      remarks: ''
    };

    try {
      // Save to Firebase students collection (permanent)
      await firebaseDB.addStudent(groupId, {
        rollNo: newStudent.rollNo,
        name: newStudent.name,
        branch: newStudent.branch
      });

      // Add to current list
      setStudents([...students, newStudent]);
      setNewStudentName('');
      setNewStudentRoll('');
      // Keep branch selected for next student
      setShowAddForm(false);
      
      // Show success message
      console.log(`Student ${newStudent.name} added permanently to group`);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Please try again.');
    }
  };

  const handleMarksChange = (studentId: string, field: string, value: number) => {
    // Clamp value between 0 and 5
    const clampedValue = Math.max(0, Math.min(5, value));
    
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, [field]: clampedValue };
        // Auto-calculate total (max 10)
        updated.totalMarks = updated.attendanceMarks + updated.judgeMarks;
        
        // Auto-mark as present if any marks are given
        if (updated.attendanceMarks > 0 || updated.judgeMarks > 0) {
          updated.status = 'present';
        }
        
        return updated;
      }
      return s;
    }));
  };

  const handleStatusChange = (studentId: string, newStatus: 'present' | 'absent' | 'excused') => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, status: newStatus } : s
      )
    );
  };

  const markAllPresent = () => {
    setStudents(students.map(s => ({ ...s, status: 'present' as const })));
  };

  const markAllAbsent = () => {
    setStudents(students.map(s => ({ ...s, status: 'absent' as const })));
  };

  const resetAllStatus = () => {
    setStudents(students.map(s => ({ ...s, status: 'present' as const })));
  };

  const handleDelete = (studentId: string) => {
    setStudents(students.filter((s) => s.id !== studentId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const studentsData = students.map((student) => ({
        rollNo: student.rollNo,
        name: student.name,
        branch: student.branch,
        status: student.status.charAt(0).toUpperCase() + student.status.slice(1),
        attendanceMarks: student.attendanceMarks,
        judgeMarks: student.judgeMarks,
        totalMarks: student.totalMarks,
        remarks: student.remarks || ''
      }));

      await firebaseDB.saveAttendance(groupId, date, studentsData);
      alert('Attendance saved successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save attendance';
      setSaveError(errorMessage);
      console.error('Failed to save attendance:', error);
      alert('Error: ' + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSaveError(null);
    // Reset to last saved state
    console.log('[v0] Attendance changes cancelled');
  };

  // Calculate statistics (filtered by branch and search)
  const filteredStudents = students.filter(s => {
    const matchesBranch = selectedBranch === 'All' || s.branch === selectedBranch;
    const matchesSearch = searchQuery === '' || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });
    
  const presentCount = filteredStudents.filter((s) => s.status === 'present').length;
  const absentCount = filteredStudents.filter((s) => s.status === 'absent').length;
  const totalCount = filteredStudents.length;
  
  // Calculate average marks
  const avgTotalMarks = totalCount > 0 
    ? (filteredStudents.reduce((sum, s) => sum + s.totalMarks, 0) / totalCount).toFixed(1)
    : '0';
  const maxTotalMarks = filteredStudents.length > 0 
    ? Math.max(...filteredStudents.map(s => s.totalMarks))
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm sm:text-base text-muted-foreground">Loading attendance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Branch Filter & Search */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Branch Filter */}
          {availableBranches.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">Filter by Branch:</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Branches</SelectItem>
                  {availableBranches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="flex-shrink-0"
              >
                Clear
              </Button>
            )}
          </div>
          
          {/* Results Count */}
          <div className="text-xs sm:text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      </Card>

      {/* Summary - Mobile Optimized with Toggle */}
      {showSummaryCards && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          <Card className="p-2 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-2">Present</p>
            <p className="text-lg sm:text-3xl font-bold text-green-600">{presentCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">{totalCount > 0 ? ((presentCount/totalCount)*100).toFixed(0) : 0}%</p>
          </Card>
          <Card className="p-2 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-2">Absent</p>
            <p className="text-lg sm:text-3xl font-bold text-red-600">{absentCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">{totalCount > 0 ? ((absentCount/totalCount)*100).toFixed(0) : 0}%</p>
          </Card>
          <Card className="p-2 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-2">Total</p>
            <p className="text-lg sm:text-3xl font-bold text-foreground">{totalCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Students</p>
          </Card>
          <Card className="p-2 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-2">Avg</p>
            <p className="text-lg sm:text-3xl font-bold text-blue-600">{avgTotalMarks}</p>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">/10</p>
          </Card>
          <Card className="p-2 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-2">High</p>
            <p className="text-lg sm:text-3xl font-bold text-purple-600">{maxTotalMarks}</p>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">marks</p>
          </Card>
        </div>
      )}

      {/* Mobile: Toggle Summary Cards */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newValue = !showSummaryCards;
            setShowSummaryCards(newValue);
            localStorage.setItem('showSummaryCards', String(newValue));
          }}
          className="w-full text-xs"
        >
          {showSummaryCards ? '📊 Hide Summary' : '📊 Show Summary'}
        </Button>
      </div>

      {/* Auto-load Info Message */}
      {autoLoadedFrom && students.length > 0 && (
        <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {autoLoadedFrom === 'master list' ? (
                  <>
                    <strong>Students loaded from group master list.</strong> All permanently added students are shown. 
                    Marks have been reset to 0.
                  </>
                ) : (
                  <>
                    <strong>Student list auto-loaded</strong> from {new Date(autoLoadedFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}. 
                    Marks have been reset to 0. You can add/remove students as needed.
                  </>
                )}
              </p>
            </div>
            <button 
              onClick={() => setAutoLoadedFrom(null)}
              className="text-blue-600 hover:text-blue-800 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Card>
      )}

      {/* Quick Mark All Buttons */}
      {students.length > 0 && (
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-sm font-medium text-foreground">Quick Actions:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllPresent}
                className="text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 border-green-200"
              >
                ✓ Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAbsent}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 border-red-200"
              >
                ✗ Mark All Absent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllStatus}
                className="text-muted-foreground hover:bg-muted"
              >
                ↺ Reset Status
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add Student Form - Mobile Optimized */}
      {showAddForm && (
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">Roll No</label>
              <Input
                placeholder="001"
                value={newStudentRoll}
                onChange={(e) => setNewStudentRoll(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">Name</label>
              <Input
                placeholder="Student Name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">Branch</label>
              <Select value={newStudentBranch} onValueChange={setNewStudentBranch}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {availableBranches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={handleAddStudent} className="flex-1 text-sm">Add</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 text-sm">Cancel</Button>
          </div>
        </Card>
      )}

      {/* Add Student Button */}
      {!showAddForm && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowAddForm(true)} variant="outline" className="flex-1 text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Student Manually
          </Button>
          <ImportStudents groupId={groupId} branches={availableBranches} onImportComplete={loadAttendanceData} />
        </div>
      )}

      {/* Table - Mobile: Card View, Desktop: Table View */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-foreground text-sm">Roll No</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">Name</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">Branch</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">Status</th>
                  <th className="text-center p-4 font-semibold text-foreground text-sm">Attendance<br/><span className="text-xs font-normal">(0-5)</span></th>
                  <th className="text-center p-4 font-semibold text-foreground text-sm">Judge<br/><span className="text-xs font-normal">(0-5)</span></th>
                  <th className="text-center p-4 font-semibold text-foreground bg-blue-50 dark:bg-blue-900/30 text-sm">Total<br/><span className="text-xs font-normal">(0-10)</span></th>
                  <th className="text-center p-4 font-semibold text-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4 text-sm text-foreground font-medium">{student.rollNo}</td>
                    <td className="p-4 text-sm text-foreground">{student.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{student.branch}</td>
                    <td className="p-4">
                      <Select value={student.status} onValueChange={(value) => handleStatusChange(student.id, value)}>
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-center">
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        value={student.attendanceMarks}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleMarksChange(student.id, 'attendanceMarks', Number(e.target.value))}
                        className="w-16 text-center"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        value={student.judgeMarks}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleMarksChange(student.id, 'judgeMarks', Number(e.target.value))}
                        className="w-16 text-center"
                      />
                    </td>
                    <td className="p-4 text-center bg-blue-50 dark:bg-blue-900/30">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{student.totalMarks}</span>
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(student.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                {selectedBranch === 'All' 
                  ? 'No students added yet' 
                  : `No students in ${selectedBranch} branch`}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Mobile Compact List View - Click to Expand */}
      <div className="md:hidden space-y-2">
        {filteredStudents.map((student) => (
          <Card 
            key={student.id} 
            className={`transition-all ${selectedStudentId === student.id ? 'ring-2 ring-blue-500' : ''}`}
          >
            {/* Compact Header - Always Visible */}
            <div 
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 active:bg-muted/50"
              onClick={() => setSelectedStudentId(selectedStudentId === student.id ? null : student.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                  {student.rollNo.slice(-3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{student.branch}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Status Badge */}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  student.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  student.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {student.status === 'present' ? 'P' : student.status === 'absent' ? 'A' : 'E'}
                </span>
                
                {/* Total Marks Badge */}
                <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                  {student.totalMarks}/10
                </span>
                
                {/* Expand Icon */}
                <svg 
                  className={`w-5 h-5 text-muted-foreground transition-transform ${selectedStudentId === student.id ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded Details - Show on Click */}
            {selectedStudentId === student.id && (
              <div className="px-3 pb-3 pt-2 border-t border-border space-y-3">
                {/* Status Selector */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Status</label>
                  <Select value={student.status} onValueChange={(value) => handleStatusChange(student.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">✓ Present</SelectItem>
                      <SelectItem value="absent">✗ Absent</SelectItem>
                      <SelectItem value="excused">⊘ Excused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Marks Grid - Only 2 Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Attendance (0-5)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={student.attendanceMarks}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleMarksChange(student.id, 'attendanceMarks', Number(e.target.value))}
                      className="text-center font-semibold text-base h-11"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Judge (0-5)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={student.judgeMarks}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleMarksChange(student.id, 'judgeMarks', Number(e.target.value))}
                      className="text-center font-semibold text-base h-11"
                    />
                  </div>
                </div>
                
                {/* Total Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Total Marks</span>
                    <span className="text-2xl font-bold text-blue-600">{student.totalMarks}/10</span>
                  </div>
                </div>
                
                {/* Delete Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(student.id);
                  }}
                  className="w-full text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Student
                </Button>
              </div>
            )}
          </Card>
        ))}
        
        {filteredStudents.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {selectedBranch === 'All' 
                ? 'No students added yet. Click "Add Student" to get started.' 
                : `No students in ${selectedBranch} branch`}
            </p>
          </Card>
        )}
      </div>

      {/* Error Message */}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{saveError}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>
    </div>
  );
}
