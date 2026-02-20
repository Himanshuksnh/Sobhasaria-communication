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

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, status: newStatus as any } : s
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
  const excusedCount = filteredStudents.filter((s) => s.status === 'excused').length;
  const totalCount = filteredStudents.length;
  const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0';
  
  // Calculate average marks
  const avgTotalMarks = totalCount > 0 
    ? (filteredStudents.reduce((sum, s) => sum + s.totalMarks, 0) / totalCount).toFixed(1)
    : '0';
  const maxTotalMarks = filteredStudents.length > 0 
    ? Math.max(...filteredStudents.map(s => s.totalMarks))
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading attendance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Branch Filter */}
      {availableBranches.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground">Filter by Branch:</label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-48">
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
            <span className="text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
            </span>
          </div>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Present</p>
          <p className="text-3xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalCount > 0 ? ((presentCount/totalCount)*100).toFixed(0) : 0}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Absent</p>
          <p className="text-3xl font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalCount > 0 ? ((absentCount/totalCount)*100).toFixed(0) : 0}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Students</p>
          <p className="text-3xl font-bold text-foreground">{totalCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Avg Marks</p>
          <p className="text-3xl font-bold text-blue-600">{avgTotalMarks}</p>
          <p className="text-xs text-muted-foreground mt-1">out of 40</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Highest</p>
          <p className="text-3xl font-bold text-purple-600">{maxTotalMarks}</p>
          <p className="text-xs text-muted-foreground mt-1">marks</p>
        </Card>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <Card className="p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-1 block">Roll No</label>
              <Input
                placeholder="001"
                value={newStudentRoll}
                onChange={(e) => setNewStudentRoll(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
              <Input
                placeholder="Student Name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-1 block">Branch</label>
              <Select value={newStudentBranch} onValueChange={setNewStudentBranch}>
                <SelectTrigger>
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
            <Button onClick={handleAddStudent}>Add</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Add Student Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground">Roll No</th>
                <th className="text-left p-4 font-semibold text-foreground">Name</th>
                <th className="text-left p-4 font-semibold text-foreground">Branch</th>
                <th className="text-left p-4 font-semibold text-foreground">Status</th>
                <th className="text-center p-4 font-semibold text-foreground">Attendance<br/><span className="text-xs font-normal">(0-10)</span></th>
                <th className="text-center p-4 font-semibold text-foreground">English<br/><span className="text-xs font-normal">(0-10)</span></th>
                <th className="text-center p-4 font-semibold text-foreground">Active<br/><span className="text-xs font-normal">(0-10)</span></th>
                <th className="text-center p-4 font-semibold text-foreground">Creative<br/><span className="text-xs font-normal">(0-10)</span></th>
                <th className="text-center p-4 font-semibold text-foreground bg-blue-50">Total<br/><span className="text-xs font-normal">(0-40)</span></th>
                <th className="text-center p-4 font-semibold text-foreground">Actions</th>
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
