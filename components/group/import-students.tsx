'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Loader2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase-db';
import * as XLSX from 'xlsx';

interface ImportStudentsProps {
  groupId: string;
  onImportComplete: () => void;
}

interface StudentRow {
  rollNo: string;
  name: string;
  branch: string;
  selected: boolean;
}

export default function ImportStudents({ groupId, onImportComplete }: ImportStudentsProps) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get all sheets
        const allStudents: StudentRow[] = [];
        
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          // Skip header row and process data
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length >= 2) {
              const rollNo = String(row[0] || '').trim();
              const name = String(row[1] || '').trim();
              const branch = String(row[2] || sheetName).trim(); // Use sheet name as branch if not provided
              
              if (rollNo && name) {
                allStudents.push({
                  rollNo,
                  name,
                  branch,
                  selected: true // Default: all selected
                });
              }
            }
          }
        });

        setStudents(allStudents);
        setImportComplete(false);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Failed to read Excel file. Please check the format.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const toggleStudent = (index: number) => {
    setStudents(students.map((s, i) => 
      i === index ? { ...s, selected: !s.selected } : s
    ));
  };

  const toggleAll = () => {
    const allSelected = students.every(s => s.selected);
    setStudents(students.map(s => ({ ...s, selected: !allSelected })));
  };

  const handleImport = async () => {
    const selectedStudents = students.filter(s => s.selected);
    
    if (selectedStudents.length === 0) {
      alert('Please select at least one student to import');
      return;
    }

    setIsImporting(true);
    try {
      // Import each selected student
      for (const student of selectedStudents) {
        await firebaseDB.addStudent(groupId, {
          rollNo: student.rollNo,
          name: student.name,
          branch: student.branch
        });
      }

      setImportComplete(true);
      setTimeout(() => {
        onImportComplete();
        setOpen(false);
        setStudents([]);
        setImportComplete(false);
      }, 2000);
    } catch (error) {
      console.error('Error importing students:', error);
      alert('Failed to import students. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = students.filter(s => s.selected).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Import from Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Students from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file with student data. Select which students to import.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* File Upload */}
          {students.length === 0 && !importComplete && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Upload Excel File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Excel format: Column A = Roll No, Column B = Name, Column C = Branch (optional)
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button type="button" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Excel File
                    </Button>
                  </label>
                </div>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg max-w-md">
                  <p className="font-semibold mb-1">Expected Format:</p>
                  <p>• First row: Headers (will be skipped)</p>
                  <p>• Column A: Roll Number (001, 002, etc.)</p>
                  <p>• Column B: Student Name</p>
                  <p>• Column C: Branch (optional, uses sheet name if empty)</p>
                  <p>• Multiple sheets supported</p>
                </div>
              </div>
            </div>
          )}

          {/* Preview & Selection */}
          {students.length > 0 && !importComplete && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={students.every(s => s.selected)}
                    onCheckedChange={toggleAll}
                  />
                  <span className="font-medium text-sm">
                    Select All ({selectedCount} of {students.length} selected)
                  </span>
                </div>
                <Button
                  onClick={handleImport}
                  disabled={isImporting || selectedCount === 0}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isImporting ? 'Importing...' : `Import ${selectedCount} Students`}
                </Button>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-3 w-12"></th>
                        <th className="text-left p-3">Roll No</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr 
                          key={index} 
                          className={`border-t border-border hover:bg-muted/50 cursor-pointer ${
                            student.selected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                          }`}
                          onClick={() => toggleStudent(index)}
                        >
                          <td className="p-3">
                            <Checkbox
                              checked={student.selected}
                              onCheckedChange={() => toggleStudent(index)}
                            />
                          </td>
                          <td className="p-3 font-medium">{student.rollNo}</td>
                          <td className="p-3">{student.name}</td>
                          <td className="p-3 text-muted-foreground">{student.branch}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {importComplete && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Import Successful!</h3>
              <p className="text-sm text-muted-foreground">
                {selectedCount} students have been added to the group.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
