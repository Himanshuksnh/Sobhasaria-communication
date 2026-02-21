'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2, Plus } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase-db';

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
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim() || !newStudentRoll.trim() || !newStudentBranch.trim()) return;

    const newStudent: Student = {
      id: `${Date.now()}`,
      name: newStudentName.trim(),
      rollNo: newStudentRoll.trim(),
      branch: newStudentBranch.trim(),
      status: 'present',
      attendanceMarks: 0,
      judgeMarks: 0,
      totalMarks: 0,
      remarks: ''
    };

    setStudents([...students, newStudent]);
    setNewStudentName('');
    setNewStudentRoll('');
    // Keep branch selected for next student
    setShowAddForm(false);
  };

  const handleMarksChange = (studentId: string, field: string, value: number) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, [field]: value };
        // Auto-calculate total (max 10)
        updated.totalMarks = updated.attendanceMarks + updated.judgeMarks;
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

  // Calculate statistics (filtered by branch)
  const filteredStudents = selectedBranch === 'All' 
    ? students 
    : students.filter(s => s.branch === selectedBranch);
    
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
      {/* Branch Filter */}
      {availableBranches.length > 0 && (
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <label className="text-sm font-medium text-foreground">Filter by Branch:</label>
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
            <span className="text-xs sm:text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
            </span>
          </div>
        </Card>
      )}

      {/* Summary - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Present</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalCount > 0 ? ((presentCount/totalCount)*100).toFixed(0) : 0}%</p>
        </Card>
        <Card className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Absent</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalCount > 0 ? ((absentCount/totalCount)*100).toFixed(0) : 0}%</p>
        </Card>
        <Card className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Total</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Students</p>
        </Card>
        <Card className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Avg Marks</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{avgTotalMarks}</p>
          <p className="text-xs text-muted-foreground mt-1">out of 10</p>
        </Card>
        <Card className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Highest</p>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600">{maxTotalMarks}</p>
          <p className="text-xs text-muted-foreground mt-1">marks</p>
        </Card>
      </div>

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
        <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
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
                  <th className="text-center p-4 font-semibold text-foreground bg-blue-50 text-sm">Total<br/><span className="text-xs font-normal">(0-10)</span></th>
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
                        onChange={(e) => handleMarksChange(student.id, 'judgeMarks', Number(e.target.value))}
                        className="w-16 text-center"
                      />
                    </td>
                    <td className="p-4 text-center bg-blue-50">
                      <span className="text-lg font-bold text-blue-600">{student.totalMarks}</span>
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
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                  {student.rollNo}
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
                  {student.totalMarks}/40
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
                
                {/* Marks Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Attendance (0-10)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={student.attendanceMarks}
                      onChange={(e) => handleMarksChange(student.id, 'attendanceMarks', Number(e.target.value))}
                      className="text-center font-semibold text-base h-11"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      English (0-10)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={student.englishSpeaking}
                      onChange={(e) => handleMarksChange(student.id, 'englishSpeaking', Number(e.target.value))}
                      className="text-center font-semibold text-base h-11"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Active (0-10)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={student.activeParticipation}
                      onChange={(e) => handleMarksChange(student.id, 'activeParticipation', Number(e.target.value))}
                      className="text-center font-semibold text-base h-11"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Creative (0-10)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={student.creativeWork}
                      onChange={(e) => handleMarksChange(student.id, 'creativeWork', Number(e.target.value))}
                      className="text-center font-semibold text-base h-11"
                    />
                  </div>
                </div>
                
                {/* Total Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Total Marks</span>
                    <span className="text-2xl font-bold text-blue-600">{student.totalMarks}/40</span>
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
