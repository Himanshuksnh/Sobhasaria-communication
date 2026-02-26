'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Download, Search } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase-db';

interface StudentRecordsProps {
  groupId: string;
}

interface StudentRecord {
  rollNo: string;
  name: string;
  branch: string;
  dateWiseMarks: { [date: string]: number };
  dateWiseStatus: { [date: string]: string };
  totalMarks: number;
}

export default function StudentRecords({ groupId }: StudentRecordsProps) {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [branches, setBranches] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllRecords();
  }, [groupId]);

  const loadAllRecords = async () => {
    setIsLoading(true);
    try {
      console.log('Loading records for group:', groupId);
      
      // Get all attendance records
      const allAttendance = await firebaseDB.getAllAttendance(groupId);
      console.log('All attendance records:', allAttendance.length, allAttendance);
      
      if (allAttendance.length === 0) {
        console.log('No attendance records found');
        setIsLoading(false);
        return;
      }

      // Extract unique dates and sort them
      const uniqueDates = [...new Set(allAttendance.map((a: any) => a.date))].sort();
      console.log('Unique dates:', uniqueDates);
      setDates(uniqueDates);

      // Extract unique branches
      const uniqueBranches = [...new Set(allAttendance.map((a: any) => a.branch))];
      console.log('Unique branches:', uniqueBranches);
      setBranches(uniqueBranches);

      // Group by student
      const studentMap = new Map<string, StudentRecord>();

      allAttendance.forEach((record: any) => {
        const key = record.rollNo;
        
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            rollNo: record.rollNo,
            name: record.name,
            branch: record.branch,
            dateWiseMarks: {},
            dateWiseStatus: {},
            totalMarks: 0,
          });
        }

        const student = studentMap.get(key)!;
        student.dateWiseMarks[record.date] = record.totalMarks || 0;
        student.dateWiseStatus[record.date] = record.status || 'Absent';
      });

      // Calculate totals
      const studentRecords = Array.from(studentMap.values()).map(student => {
        const total = Object.values(student.dateWiseMarks).reduce((sum, marks) => sum + marks, 0);
        return { ...student, totalMarks: total };
      });

      // Sort by roll number
      studentRecords.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

      console.log('Student records:', studentRecords);
      setRecords(studentRecords);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesBranch = selectedBranch === 'All' || r.branch === selectedBranch;
    const matchesSearch = searchQuery === '' ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading records...</span>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-foreground mb-2">No Records Yet</p>
          <p className="text-sm text-muted-foreground">
            Start marking attendance to see student records here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="flex-shrink-0 text-xs sm:text-sm"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Branch Filter */}
          {branches.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs sm:text-sm font-medium whitespace-nowrap">Branch:</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedBranch === 'All' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBranch('All')}
                  className="text-xs"
                >
                  All ({records.length})
                </Button>
                {branches.map(branch => (
                  <Button
                    key={branch}
                    variant={selectedBranch === branch ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedBranch(branch)}
                    className="text-xs"
                  >
                    {branch} ({records.filter(r => r.branch === branch).length})
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="text-xs text-muted-foreground">
            Showing {filteredRecords.length} of {records.length} students
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-semibold sticky left-0 bg-muted/50 z-10">Roll</th>
                <th className="text-left p-3 font-semibold sticky left-16 bg-muted/50 z-10">Name</th>
                <th className="text-left p-3 font-semibold">Branch</th>
                {dates.map(date => (
                  <th key={date} className="text-center p-3 font-semibold whitespace-nowrap">
                    {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </th>
                ))}
                <th className="text-center p-3 font-semibold bg-blue-50 dark:bg-blue-900/30">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((student) => (
                <tr key={student.rollNo} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 font-medium sticky left-0 bg-background">{student.rollNo}</td>
                  <td className="p-3 sticky left-16 bg-background">{student.name}</td>
                  <td className="p-3 text-muted-foreground">{student.branch}</td>
                  {dates.map(date => (
                    <td key={date} className="p-3 text-center">
                      {student.dateWiseMarks[date] !== undefined ? (
                        <span className={`inline-block px-2 py-1 rounded font-medium ${
                          student.dateWiseStatus[date]?.toLowerCase() === 'present' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {student.dateWiseMarks[date]}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  ))}
                  <td className="p-3 text-center bg-blue-50 dark:bg-blue-900/30">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{student.totalMarks}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredRecords.map((student) => (
          <Card key={student.rollNo} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground">{student.name}</p>
                <p className="text-sm text-muted-foreground">Roll: {student.rollNo} • {student.branch}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-blue-600">{student.totalMarks}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="border-t border-border pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Date-wise Marks:</p>
                <div className="grid grid-cols-3 gap-2">
                  {dates.map(date => (
                    <div key={date} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                      {student.dateWiseMarks[date] !== undefined ? (
                        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          student.dateWiseStatus[date]?.toLowerCase() === 'present' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {student.dateWiseMarks[date]}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
