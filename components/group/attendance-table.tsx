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
  attendanceMarks: number;      // Attendance marks (0-10)
  englishSpeaking: number;      // English speaking (0-10)
  activeParticipation: number;  // Active participation (0-10)
  creativeWork: number;         // Creative work (0-10)
  totalMarks: number;           // Auto-calculated total
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
          englishSpeaking: Number(r.englishSpeaking) || 0,
          activeParticipation: Number(r.activeParticipation) || 0,
          creativeWork: Number(r.creativeWork) || 0,
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
      englishSpeaking: 0,
      activeParticipation: 0,
      creativeWork: 0,
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
        // Auto-calculate total
        updated.totalMarks = 
          updated.attendanceMarks + 
          updated.englishSpeaking + 
          updated.activeParticipation + 
          updated.creativeWork;
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
        englishSpeaking: student.englishSpeaking,
        activeParticipation: student.activeParticipation,
        creativeWork: student.creativeWork,
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
          <p className="text-xs text-muted-foreground mt-1">out of 40</p>
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
                  <th className="text-center p-4 font-semibold text-foreground text-sm">Attendance<br/><span className="text-xs font-normal">(0-10)</span></th>
                  <th className="text-center p-4 font-semibold text-foreground text-sm">English<br/><span className="text-xs font-normal">(0-10)</span></th>
                  <th className="text-center p-4 font-semibold text-foreground text-sm">Active<br/><span className="text-xs font-normal">(0-10)</span></th>
                  <th className="text-center p-4 font-semibold text-foreground text-sm">Creative<br/><span className="text-xs font-normal">(0-10)</span></th>
                  <th className="text-center p-4 font-semibold text-foreground bg-blue-50 text-sm">Total<br/><span className="text-xs font-normal">(0-40)</span></th>
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
                        max="10"
                        value={student.attendanceMarks}
                        onChange={(e) => handleMarksChange(student.id, 'attendanceMarks', Number(e.target.value))}
                        className="w-16 text-center"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={student.englishSpeaking}
                        onChange={(e) => handleMarksChange(student.id, 'englishSpeaking', Number(e.target.value))}
                        className="w-16 text-center"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={student.activeParticipation}
                        onChange={(e) => handleMarksChange(student.id, 'activeParticipation', Number(e.target.value))}
                        className="w-16 text-center"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={student.creativeWork}
                        onChange={(e) => handleMarksChange(student.id, 'creativeWork', Number(e.target.value))}
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-foreground">{student.name}</p>
                <p className="text-sm text-muted-foreground">Roll: {student.rollNo} • {student.branch}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(student.id)}
                className="text-destructive hover:text-destructive -mt-2 -mr-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={student.status} onValueChange={(value) => handleStatusChange(student.id, value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="excused">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Attendance (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={student.attendanceMarks}
                    onChange={(e) => handleMarksChange(student.id, 'attendanceMarks', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">English (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={student.englishSpeaking}
                    onChange={(e) => handleMarksChange(student.id, 'englishSpeaking', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Active (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={student.activeParticipation}
                    onChange={(e) => handleMarksChange(student.id, 'activeParticipation', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Creative (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={student.creativeWork}
                    onChange={(e) => handleMarksChange(student.id, 'creativeWork', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Marks</p>
                <p className="text-2xl font-bold text-blue-600">{student.totalMarks}/40</p>
              </div>
            </div>
          </Card>
        ))}
        
        {filteredStudents.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {selectedBranch === 'All' 
                ? 'No students added yet' 
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
