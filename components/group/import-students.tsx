'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, FileSpreadsheet, CheckCircle2, BookOpen } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase-db';
import * as XLSX from 'xlsx';

interface ImportStudentsProps {
  groupId: string;
  branches: string[]; // Branches from group
  onImportComplete: () => void;
}

interface StudentRow {
  rollNo: string;
  name: string;
  branch: string;
  selected: boolean;
  sheetName: string;
}

interface SheetData {
  sheetName: string;
  branch: string;
  students: StudentRow[];
  selected: boolean;
}

export default function ImportStudents({ groupId, branches, onImportComplete }: ImportStudentsProps) {
  const [open, setOpen] = useState(false);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name);

    const reader = new FileReader();
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      alert('Error reading file. Please try again.');
    };

    reader.onload = (e) => {
      try {
        console.log('File loaded, processing...');
        const data = e.target?.result;
        
        if (!data) {
          console.error('No data in file');
          alert('File is empty or corrupted');
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        console.log('Workbook loaded, sheets:', workbook.SheetNames);
        
        // Process each sheet separately
        const allSheets: SheetData[] = [];
        
        workbook.SheetNames.forEach((sheetName) => {
          console.log('Processing sheet:', sheetName);
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          console.log('Sheet data rows:', jsonData.length);
          
          // Extract branch from sheet name (e.g., "CSE(Sec.B)" from sheet name)
          const branch = sheetName.trim();
          
          // Find header row (skip title rows)
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && row.length >= 2) {
              const rowText = row.map(cell => String(cell || '').toLowerCase()).join(' ');
              // Check if this looks like a header row
              if (rowText.includes('roll') && (rowText.includes('name') || rowText.includes('candidate'))) {
                headerRowIndex = i;
                console.log('Found header at row:', i, ':', row);
                break;
              }
            }
          }
          
          if (headerRowIndex === -1) {
            console.log('No header found, assuming data starts at row 0');
            headerRowIndex = -1; // Will start from row 0
          }
          
          const sheetStudents: StudentRow[] = [];
          
          // Process data rows (skip header and title rows)
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length < 2) continue;
            
            let rollNo = '';
            let name = '';
            
            // Format: Class Roll No | Univ Roll No | Name
            if (row.length >= 3) {
              const classRollNo = String(row[0] || '').trim();
              const univRollNo = String(row[1] || '').trim();
              const studentName = String(row[2] || '').trim();
              
              // Skip if this looks like a header row
              if (classRollNo.toLowerCase().includes('roll') || 
                  studentName.toLowerCase().includes('name') ||
                  studentName.toLowerCase().includes('candidate')) {
                continue;
              }
              
              // Use University Roll No as primary, fallback to Class Roll No
              rollNo = univRollNo || classRollNo;
              name = studentName;
            }
            // Format: Roll No | Name
            else if (row.length >= 2) {
              rollNo = String(row[0] || '').trim();
              name = String(row[1] || '').trim();
            }
            
            // Clean up name (remove MS., MR., etc.)
            name = name.replace(/^(MS\.|MR\.|MISS\s+|MRS\.\s*)/i, '').trim();
            
            // Validate data
            if (rollNo && name && 
                !rollNo.toLowerCase().includes('roll') && 
                !name.toLowerCase().includes('name') &&
                rollNo.length > 0 && name.length > 1) {
              sheetStudents.push({
                rollNo,
                name,
                branch,
                sheetName,
                selected: true
              });
            }
          }
          
          if (sheetStudents.length > 0) {
            allSheets.push({
              sheetName,
              branch,
              students: sheetStudents,
              selected: true
            });
          }
        });

        console.log('Total sheets found:', allSheets.length);
        
        if (allSheets.length === 0) {
          alert('No valid student data found in Excel file.\n\nSupported formats:\n• Class Roll No | Univ Roll No | Name\n• Roll No | Name | Branch\n\nPlease check your file and try again.');
          return;
        }

        setSheets(allSheets);
        setImportComplete(false);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Failed to read Excel file. Error: ' + (error as Error).message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const toggleSheet = (sheetIndex: number) => {
    setSheets(sheets.map((sheet, i) => 
      i === sheetIndex ? { ...sheet, selected: !sheet.selected } : sheet
    ));
  };

  const toggleStudent = (sheetIndex: number, studentIndex: number) => {
    setSheets(sheets.map((sheet, i) => {
      if (i === sheetIndex) {
        return {
          ...sheet,
          students: sheet.students.map((s, j) => 
            j === studentIndex ? { ...s, selected: !s.selected } : s
          )
        };
      }
      return sheet;
    }));
  };

  const toggleAllInSheet = (sheetIndex: number) => {
    setSheets(sheets.map((sheet, i) => {
      if (i === sheetIndex) {
        const allSelected = sheet.students.every(s => s.selected);
        return {
          ...sheet,
          students: sheet.students.map(s => ({ ...s, selected: !allSelected }))
        };
      }
      return sheet;
    }));
  };

  const updateBranch = (sheetIndex: number, newBranch: string) => {
    setSheets(sheets.map((sheet, i) => {
      if (i === sheetIndex) {
        return {
          ...sheet,
          branch: newBranch,
          students: sheet.students.map(s => ({ ...s, branch: newBranch }))
        };
      }
      return sheet;
    }));
  };

  const addNewBranch = (sheetIndex: number, newBranch: string) => {
    if (!newBranch.trim()) return;
    
    // Add to branches list if not already there
    if (!branches.includes(newBranch.trim())) {
      branches.push(newBranch.trim());
    }
    
    // Update the sheet's branch
    updateBranch(sheetIndex, newBranch.trim());
  };

  const handleImport = async () => {
    const selectedSheets = sheets.filter(s => s.selected);
    
    if (selectedSheets.length === 0) {
      alert('Please select at least one sheet to import');
      return;
    }

    const allSelectedStudents = selectedSheets.flatMap(sheet => 
      sheet.students.filter(s => s.selected)
    );

    if (allSelectedStudents.length === 0) {
      alert('Please select at least one student to import');
      return;
    }

    setIsImporting(true);
    try {
      // Import each selected student
      for (const student of allSelectedStudents) {
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
        setSheets([]);
        setImportComplete(false);
      }, 2000);
    } catch (error) {
      console.error('Error importing students:', error);
      alert('Failed to import students. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const totalSelectedStudents = sheets
    .filter(s => s.selected)
    .reduce((sum, sheet) => sum + sheet.students.filter(s => s.selected).length, 0);

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
          {sheets.length === 0 && !importComplete && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Upload Excel File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Excel format: Class Roll No | Univ Roll No | Name of Candidate
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Excel File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="mt-2"
                  >
                    {showInstructions ? '📖 Hide Instructions' : '📖 Show Instructions'}
                  </Button>
                </div>
                {showInstructions && (
                  <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg max-w-md">
                    <p className="font-semibold mb-2">📋 Expected Format:</p>
                    <div className="space-y-1 mb-3">
                      <p>• <strong>Title rows:</strong> Will be automatically skipped</p>
                      <p>• <strong>Column A:</strong> Class Roll No (1, 2, 3...)</p>
                      <p>• <strong>Column B:</strong> University Roll No (25ESGCS064...)</p>
                      <p>• <strong>Column C:</strong> Name of Candidate</p>
                      <p>• <strong>Sheet name:</strong> Used as Branch (e.g., CSE(Sec.B))</p>
                      <p>• <strong>Multiple sheets:</strong> Each sheet imported separately</p>
                    </div>
                    <div className="bg-background p-2 rounded text-xs font-mono">
                      <div className="grid grid-cols-3 gap-2 mb-1 font-bold">
                        <div>Class Roll</div>
                        <div>Univ Roll</div>
                        <div>Name</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 opacity-70">
                        <div>1</div>
                        <div>25ESGCS064</div>
                        <div>NAVEEN SAINI</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 opacity-70">
                        <div>2</div>
                        <div>25ESGCS065</div>
                        <div>NAVEEN SONI</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview & Selection - Sheet by Sheet */}
          {sheets.length > 0 && !importComplete && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">
                    {sheets.filter(s => s.selected).length} of {sheets.length} sheets selected
                  </span>
                  <span className="text-muted-foreground ml-2">
                    ({totalSelectedStudents} students)
                  </span>
                </div>
                <Button
                  onClick={handleImport}
                  disabled={isImporting || totalSelectedStudents === 0}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isImporting ? 'Importing...' : `Import ${totalSelectedStudents} Students`}
                </Button>
              </div>

              {/* Each Sheet */}
              {sheets.map((sheet, sheetIndex) => {
                const selectedInSheet = sheet.students.filter(s => s.selected).length;
                return (
                  <div key={sheetIndex} className="border border-border rounded-lg overflow-hidden">
                    {/* Sheet Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-b border-border">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={sheet.selected}
                          onCheckedChange={() => toggleSheet(sheetIndex)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-foreground">
                              Sheet: {sheet.sheetName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({selectedInSheet}/{sheet.students.length} students)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Branch:</span>
                            <Select
                              value={sheet.branch}
                              onValueChange={(value) => updateBranch(sheetIndex, value)}
                            >
                              <SelectTrigger className="h-7 text-sm max-w-xs">
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.map((branch) => (
                                  <SelectItem key={branch} value={branch}>
                                    {branch}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllInSheet(sheetIndex)}
                        >
                          {sheet.students.every(s => s.selected) ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                    </div>

                    {/* Students in Sheet */}
                    {sheet.selected && (
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              <th className="text-left p-3 w-12"></th>
                              <th className="text-left p-3">Roll No</th>
                              <th className="text-left p-3">Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sheet.students.map((student, studentIndex) => (
                              <tr 
                                key={studentIndex} 
                                className={`border-t border-border hover:bg-muted/50 cursor-pointer ${
                                  student.selected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                }`}
                                onClick={() => toggleStudent(sheetIndex, studentIndex)}
                              >
                                <td className="p-3">
                                  <Checkbox
                                    checked={student.selected}
                                    onCheckedChange={() => toggleStudent(sheetIndex, studentIndex)}
                                  />
                                </td>
                                <td className="p-3 font-medium">{student.rollNo}</td>
                                <td className="p-3">{student.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
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
                {totalSelectedStudents} students have been added to the group.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
