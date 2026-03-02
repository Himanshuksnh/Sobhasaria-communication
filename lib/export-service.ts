// Export Service - Export data to Excel/CSV
import * as XLSX from 'xlsx';
import { firebaseDB } from './firebase-db';

export class ExportService {
  // Export attendance data to Excel (Date-wise format like Records page)
  async exportAttendanceToExcel(groupId: string, groupName: string): Promise<void> {
    try {
      // Fetch all attendance records
      const records = await firebaseDB.getAllAttendance(groupId);

      if (records.length === 0) {
        alert('No attendance data to export');
        return;
      }

      // Get unique dates and sort them
      const dates = [...new Set(records.map(r => r.date))].sort();

      // Group records by student
      const studentMap: { [key: string]: any } = {};

      records.forEach((record) => {
        const key = record.rollNo;
        if (!studentMap[key]) {
          studentMap[key] = {
            rollNo: record.rollNo,
            name: record.name,
            branch: record.branch,
            dateWiseMarks: {},
            totalMarks: 0,
          };
        }
        studentMap[key].dateWiseMarks[record.date] = record.totalMarks || 0;
      });

      // Calculate total marks for each student
      Object.values(studentMap).forEach((student: any) => {
        student.totalMarks = Object.values(student.dateWiseMarks).reduce((sum: number, marks: any) => sum + marks, 0);
      });

      // Prepare data for Excel with dates as columns
      const excelData = Object.values(studentMap).map((student: any) => {
        const row: any = {
          'Roll No': student.rollNo,
          'Name': student.name,
          'Branch': student.branch,
        };

        // Add date columns
        dates.forEach(date => {
          const formattedDate = new Date(date).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short',
            year: 'numeric'
          });
          row[formattedDate] = student.dateWiseMarks[date] !== undefined ? student.dateWiseMarks[date] : '-';
        });

        // Add total column
        row['Total'] = student.totalMarks;

        return row;
      });

      // Sort by roll number
      excelData.sort((a, b) => a['Roll No'].localeCompare(b['Roll No']));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

      // Generate filename
      const filename = `${groupName}_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data');
    }
  }

  // Export attendance data to CSV (Date-wise format like Records page)
  async exportAttendanceToCSV(groupId: string, groupName: string): Promise<void> {
    try {
      // Fetch all attendance records
      const records = await firebaseDB.getAllAttendance(groupId);

      if (records.length === 0) {
        alert('No attendance data to export');
        return;
      }

      // Get unique dates and sort them
      const dates = [...new Set(records.map(r => r.date))].sort();

      // Group records by student
      const studentMap: { [key: string]: any } = {};

      records.forEach((record) => {
        const key = record.rollNo;
        if (!studentMap[key]) {
          studentMap[key] = {
            rollNo: record.rollNo,
            name: record.name,
            branch: record.branch,
            dateWiseMarks: {},
            totalMarks: 0,
          };
        }
        studentMap[key].dateWiseMarks[record.date] = record.totalMarks || 0;
      });

      // Calculate total marks for each student
      Object.values(studentMap).forEach((student: any) => {
        student.totalMarks = Object.values(student.dateWiseMarks).reduce((sum: number, marks: any) => sum + marks, 0);
      });

      // Prepare data for CSV with dates as columns
      const csvData = Object.values(studentMap).map((student: any) => {
        const row: any = {
          'Roll No': student.rollNo,
          'Name': student.name,
          'Branch': student.branch,
        };

        // Add date columns
        dates.forEach(date => {
          const formattedDate = new Date(date).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short',
            year: 'numeric'
          });
          row[formattedDate] = student.dateWiseMarks[date] !== undefined ? student.dateWiseMarks[date] : '-';
        });

        // Add total column
        row['Total'] = student.totalMarks;

        return row;
      });

      // Sort by roll number
      csvData.sort((a, b) => a['Roll No'].localeCompare(b['Roll No']));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(csvData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

      // Generate filename
      const filename = `${groupName}_Attendance_${new Date().toISOString().split('T')[0]}.csv`;

      // Download file as CSV
      XLSX.writeFile(wb, filename, { bookType: 'csv' });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export data');
    }
  }

  // Export students list to Excel
  async exportStudentsToExcel(groupId: string, groupName: string): Promise<void> {
    try {
      const students = await firebaseDB.getGroupStudents(groupId);

      if (students.length === 0) {
        alert('No students to export');
        return;
      }

      const excelData = students.map((student) => ({
        'Roll No': student.rollNo,
        'Name': student.name,
        'Branch': student.branch,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Students');

      const filename = `${groupName}_Students_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting students:', error);
      alert('Failed to export students');
    }
  }

  // Export summary report
  async exportSummaryReport(groupId: string, groupName: string): Promise<void> {
    try {
      const records = await firebaseDB.getAllAttendance(groupId);

      if (records.length === 0) {
        alert('No data to export');
        return;
      }

      // Calculate summary statistics per student
      const studentStats: { [key: string]: any } = {};

      records.forEach((record) => {
        const key = record.rollNo;
        if (!studentStats[key]) {
          studentStats[key] = {
            rollNo: record.rollNo,
            name: record.name,
            branch: record.branch,
            totalSessions: 0,
            present: 0,
            absent: 0,
            excused: 0,
            totalMarks: 0,
            avgMarks: 0,
          };
        }

        studentStats[key].totalSessions++;
        if (record.status === 'present') studentStats[key].present++;
        if (record.status === 'absent') studentStats[key].absent++;
        if (record.status === 'excused') studentStats[key].excused++;
        studentStats[key].totalMarks += record.totalMarks;
      });

      // Calculate averages
      const summaryData = Object.values(studentStats).map((stat: any) => ({
        'Roll No': stat.rollNo,
        'Name': stat.name,
        'Branch': stat.branch,
        'Total Sessions': stat.totalSessions,
        'Present': stat.present,
        'Absent': stat.absent,
        'Excused': stat.excused,
        'Attendance %': ((stat.present / stat.totalSessions) * 100).toFixed(1),
        'Total Marks': stat.totalMarks,
        'Average Marks': (stat.totalMarks / stat.totalSessions).toFixed(1),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws, 'Summary');

      const filename = `${groupName}_Summary_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting summary:', error);
      alert('Failed to export summary');
    }
  }
}

export const exportService = new ExportService();
