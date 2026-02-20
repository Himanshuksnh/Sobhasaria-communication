// Export Service - Export data to Excel/CSV
import * as XLSX from 'xlsx';
import { firebaseDB } from './firebase-db';

export class ExportService {
  // Export attendance data to Excel
  async exportAttendanceToExcel(groupId: string, groupName: string): Promise<void> {
    try {
      // Fetch all attendance records
      const records = await firebaseDB.getAllAttendance(groupId);

      if (records.length === 0) {
        alert('No attendance data to export');
        return;
      }

      // Prepare data for Excel
      const excelData = records.map((record) => ({
        'Date': record.date,
        'Roll No': record.rollNo,
        'Name': record.name,
        'Branch': record.branch,
        'Status': record.status,
        'Attendance Marks': record.attendanceMarks,
        'English Speaking': record.englishSpeaking,
        'Active Participation': record.activeParticipation,
        'Creative Work': record.creativeWork,
        'Total Marks': record.totalMarks,
        'Remarks': record.remarks || '',
      }));

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

  // Export attendance data to CSV
  async exportAttendanceToCSV(groupId: string, groupName: string): Promise<void> {
    try {
      // Fetch all attendance records
      const records = await firebaseDB.getAllAttendance(groupId);

      if (records.length === 0) {
        alert('No attendance data to export');
        return;
      }

      // Prepare data for CSV
      const csvData = records.map((record) => ({
        'Date': record.date,
        'Roll No': record.rollNo,
        'Name': record.name,
        'Branch': record.branch,
        'Status': record.status,
        'Attendance Marks': record.attendanceMarks,
        'English Speaking': record.englishSpeaking,
        'Active Participation': record.activeParticipation,
        'Creative Work': record.creativeWork,
        'Total Marks': record.totalMarks,
        'Remarks': record.remarks || '',
      }));

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
