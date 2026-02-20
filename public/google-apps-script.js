// ============================================================================
// SOBHASARIA COMMUNICATION LAB - GOOGLE APPS SCRIPT
// Lab Management System Integration
// ============================================================================
// Paste this entire code into your Google Sheet's Apps Script editor
// (Extensions > Apps Script)
// ============================================================================

const SPREADSHEET_ID = '1rw5MojjqKPZS5yTtZAJwnP3cgkPkuu-m3S8695qgDA0';
const MAIN_SHEET_NAME = 'Main';
const GROUPS_SHEET_NAME = 'Groups';
const INVITES_SHEET_NAME = 'Invites';

// ============================================================================
// 1. INITIALIZE SPREADSHEET STRUCTURE
// ============================================================================

/**
 * Run this function once to set up the spreadsheet structure
 * Go to Run > Run function > setupSpreadsheet
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create Groups sheet
  createSheetIfNotExists(ss, GROUPS_SHEET_NAME);
  const groupsSheet = ss.getSheetByName(GROUPS_SHEET_NAME);
  if (groupsSheet.getLastRow() === 0) {
    groupsSheet.appendRow([
      'Group ID',
      'Group Name',
      'Subject',
      'Branches',
      'Owners',
      'Leaders',
      'Current Lab Date',
      'Next Lab Date',
      'Created Date',
      'Sheet ID'
    ]);
  }
  
  // Create Invites sheet
  createSheetIfNotExists(ss, INVITES_SHEET_NAME);
  const invitesSheet = ss.getSheetByName(INVITES_SHEET_NAME);
  if (invitesSheet.getLastRow() === 0) {
    invitesSheet.appendRow([
      'Invite Code',
      'Group ID',
      'Created By',
      'Created Date',
      'Expires Date',
      'Used By',
      'Used Date'
    ]);
  }
  
  Logger.log('Spreadsheet structure initialized successfully!');
}

/**
 * Helper function to create sheet if it doesn't exist
 */
function createSheetIfNotExists(ss, sheetName) {
  if (!ss.getSheetByName(sheetName)) {
    ss.insertSheet(sheetName);
  }
}

// ============================================================================
// 2. GROUP MANAGEMENT
// ============================================================================

/**
 * Create a new group sheet with proper structure
 */
function createGroupSheet(groupId, groupName, subject, branches) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetName = `${groupName}_${groupId}`.substring(0, 31); // Sheet name limit
  
  createSheetIfNotExists(ss, sheetName);
  const sheet = ss.getSheetByName(sheetName);
  
  // Clear existing content
  if (sheet.getLastRow() > 0) {
    sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();
  }
  
  // Setup headers
  sheet.appendRow(['Lab Date', 'Lab Number', 'Branch', 'Student Roll No', 'Student Name', 'Status', 'Attendance Marks', 'English Speaking', 'Active Participation', 'Creative Work', 'Total Marks', 'Remarks']);
  
  // Format header row (12 columns now)
  const headerRange = sheet.getRange(1, 1, 1, 12);
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Add metadata
  sheet.appendRow(['METADATA::', 'Subject:', subject, 'Branches:', branches.join(', ')]);
  sheet.getRange(2, 1).setFontStyle('italic');
  
  // Update Groups sheet
  updateGroupRecord(groupId, groupName, subject, branches, sheetName);
  
  Logger.log(`Group sheet created: ${sheetName}`);
  return sheetName;
}

/**
 * Update group record in Groups sheet
 */
function updateGroupRecord(groupId, groupName, subject, branches, sheetId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const groupsSheet = ss.getSheetByName(GROUPS_SHEET_NAME);
  
  const values = groupsSheet.getDataRange().getValues();
  let rowIndex = -1;
  
  // Check if group exists
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === groupId) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const now = new Date().toISOString();
  const nextDate = addDays(new Date(), 7).toISOString();
  
  if (rowIndex === -1) {
    // New group
    groupsSheet.appendRow([
      groupId,
      groupName,
      subject,
      branches.join(', '),
      '', // Owners (to be filled)
      '', // Leaders (to be filled)
      now,
      nextDate,
      now,
      sheetId
    ]);
  } else {
    // Update existing
    groupsSheet.getRange(rowIndex, 7).setValue(now);
    groupsSheet.getRange(rowIndex, 8).setValue(nextDate);
  }
}

/**
 * Add days to a date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================================================
// 3. ATTENDANCE MANAGEMENT
// ============================================================================

/**
 * Save attendance record to group sheet
 */
function saveAttendanceRecord(groupId, groupName, labDate, labNumber, branch, students) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetName = `${groupName}_${groupId}`.substring(0, 31);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return { success: false, error: `Sheet not found for group: ${groupName}` };
  }
  
  try {
    // Add attendance records (skip metadata row if present)
    let startRow = 2;
    if (sheet.getRange(2, 1).getValue() === 'METADATA::') {
      startRow = 3;
    }
    
    students.forEach(student => {
      sheet.insertRow(startRow);
      sheet.getRange(startRow, 1).setValue(labDate);
      sheet.getRange(startRow, 2).setValue(labNumber);
      sheet.getRange(startRow, 3).setValue(branch);
      sheet.getRange(startRow, 4).setValue(student.rollNo || '');
      sheet.getRange(startRow, 5).setValue(student.name || '');
      sheet.getRange(startRow, 6).setValue(student.status || 'Absent');
      sheet.getRange(startRow, 7).setValue(student.attendanceMarks || 0);
      sheet.getRange(startRow, 8).setValue(student.englishSpeaking || 0);
      sheet.getRange(startRow, 9).setValue(student.activeParticipation || 0);
      sheet.getRange(startRow, 10).setValue(student.creativeWork || 0);
      sheet.getRange(startRow, 11).setValue(student.totalMarks || 0);
      sheet.getRange(startRow, 12).setValue(student.remarks || '');
      startRow++;
    });
    
    // Update next lab date in Groups sheet
    updateNextLabDate(groupId);
    
    return { success: true, message: 'Attendance saved successfully' };
  } catch (error) {
    Logger.log('Error saving attendance: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Update next lab date
 */
function updateNextLabDate(groupId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const groupsSheet = ss.getSheetByName(GROUPS_SHEET_NAME);
  const values = groupsSheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === groupId) {
      const nextDate = addDays(new Date(), 7).toISOString();
      groupsSheet.getRange(i + 1, 8).setValue(nextDate);
      break;
    }
  }
}

/**
 * Get attendance summary for a group
 */
function getAttendanceSummary(groupId, groupName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetName = `${groupName}_${groupId}`.substring(0, 31);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return { error: `Sheet not found for group: ${groupName}` };
  }
  
  const data = sheet.getDataRange().getValues();
  const summary = {
    total: 0,
    present: 0,
    absent: 0,
    excused: 0,
    labs: {}
  };
  
  // Skip header and metadata
  let startIndex = 2;
  if (data[1] && data[1][0] === 'METADATA::') {
    startIndex = 3;
  }
  
  for (let i = startIndex; i < data.length; i++) {
    const row = data[i];
    const status = (row[5] || '').toLowerCase();
    
    if (status && (status === 'present' || status === 'absent' || status === 'excused')) {
      summary.total++;
      
      if (status === 'present') summary.present++;
      else if (status === 'absent') summary.absent++;
      else if (status === 'excused') summary.excused++;
    }
  }
  
  return summary;
}

// ============================================================================
// 4. INVITE MANAGEMENT
// ============================================================================

/**
 * Generate an invite code
 */
function generateInviteCode(groupId, createdBy, expiryDays = 7) {
  const code = Utilities.getUuid().substring(0, 8).toUpperCase();
  const invitesSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(INVITES_SHEET_NAME);
  
  const now = new Date();
  const expiryDate = addDays(now, expiryDays);
  
  invitesSheet.appendRow([
    code,
    groupId,
    createdBy,
    now.toISOString(),
    expiryDate.toISOString(),
    '', // Used By
    ''  // Used Date
  ]);
  
  return code;
}

/**
 * Validate and use an invite code
 */
function validateInviteCode(code, userEmail) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const invitesSheet = ss.getSheetByName(INVITES_SHEET_NAME);
  const values = invitesSheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0] === code) {
      const expiryDate = new Date(row[4]);
      const now = new Date();
      
      if (now > expiryDate) {
        return { valid: false, error: 'Invite code has expired' };
      }
      
      if (row[5]) {
        return { valid: false, error: 'Invite code has already been used' };
      }
      
      // Mark as used
      invitesSheet.getRange(i + 1, 6).setValue(userEmail);
      invitesSheet.getRange(i + 1, 7).setValue(now.toISOString());
      
      return {
        valid: true,
        groupId: row[1],
        message: 'Invite code is valid'
      };
    }
  }
  
  return { valid: false, error: 'Invite code not found' };
}

// ============================================================================
// 5. DATA RETRIEVAL (for API integration)
// ============================================================================

/**
 * Get all groups
 */
function getAllGroups() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const groupsSheet = ss.getSheetByName(GROUPS_SHEET_NAME);
  const values = groupsSheet.getDataRange().getValues();
  
  const groups = [];
  for (let i = 1; i < values.length; i++) {
    groups.push({
      groupId: values[i][0],
      groupName: values[i][1],
      subject: values[i][2],
      branches: values[i][3].split(',').map(b => b.trim()),
      owners: values[i][4].split(',').map(o => o.trim()).filter(o => o),
      leaders: values[i][5].split(',').map(l => l.trim()).filter(l => l),
      currentLabDate: values[i][6],
      nextLabDate: values[i][7],
      sheetId: values[i][9]
    });
  }
  
  return groups;
}

/**
 * Get group data by ID
 */
function getGroupData(groupId) {
  const groups = getAllGroups();
  return groups.find(g => g.groupId === groupId) || null;
}

/**
 * Get attendance records for a group
 */
function getAttendanceRecords(groupId, groupName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetName = `${groupName}_${groupId}`.substring(0, 31);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  const records = [];
  
  // Skip header and metadata
  let startIndex = 2;
  if (data[1] && data[1][0] === 'METADATA::') {
    startIndex = 3;
  }
  
  for (let i = startIndex; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      records.push({
        labDate: row[0],
        labNumber: row[1],
        branch: row[2],
        rollNo: row[3],
        studentName: row[4],
        status: row[5],
        attendanceMarks: row[6] || 0,
        englishSpeaking: row[7] || 0,
        activeParticipation: row[8] || 0,
        creativeWork: row[9] || 0,
        totalMarks: row[10] || 0,
        remarks: row[11] || ''
      });
    }
  }
  
  return records;
}

// ============================================================================
// 6. DOPOST HANDLER (for API calls from your web app)
// ============================================================================

/**
 * Main API endpoint handler
 * This receives POST requests from your web app
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    let response;
    
    switch (action) {
      case 'createGroup':
        response = handleCreateGroup(payload);
        break;
      
      case 'saveAttendance':
        response = handleSaveAttendance(payload);
        break;
      
      case 'generateInvite':
        response = handleGenerateInvite(payload);
        break;
      
      case 'validateInvite':
        response = handleValidateInvite(payload);
        break;
      
      case 'getGroups':
        response = handleGetGroups(payload);
        break;
      
      case 'getGroupData':
        response = handleGetGroupData(payload);
        break;
      
      case 'getAttendanceSummary':
        response = handleGetAttendanceSummary(payload);
        break;
      
      case 'getAttendanceRecords':
        response = handleGetAttendanceRecords(payload);
        break;
      
      default:
        response = { success: false, error: 'Unknown action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle create group request
 */
function handleCreateGroup(payload) {
  try {
    const { groupId, groupName, subject, branches } = payload;
    createGroupSheet(groupId, groupName, subject, branches);
    return { success: true, message: 'Group created successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle save attendance request
 */
function handleSaveAttendance(payload) {
  try {
    const { groupId, groupName, labDate, labNumber, branch, students } = payload;
    return saveAttendanceRecord(groupId, groupName, labDate, labNumber, branch, students);
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle generate invite request
 */
function handleGenerateInvite(payload) {
  try {
    const { groupId, createdBy, expiryDays = 7 } = payload;
    const code = generateInviteCode(groupId, createdBy, expiryDays);
    return { success: true, code: code };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle validate invite request
 */
function handleValidateInvite(payload) {
  try {
    const { code, userEmail } = payload;
    return validateInviteCode(code, userEmail);
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle get groups request
 */
function handleGetGroups(payload) {
  try {
    const groups = getAllGroups();
    return { success: true, groups: groups };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle get group data request
 */
function handleGetGroupData(payload) {
  try {
    const { groupId } = payload;
    const group = getGroupData(groupId);
    return { success: true, group: group };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle get attendance summary request
 */
function handleGetAttendanceSummary(payload) {
  try {
    const { groupId, groupName } = payload;
    const summary = getAttendanceSummary(groupId, groupName);
    return { success: true, summary: summary };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle get attendance records request
 */
function handleGetAttendanceRecords(payload) {
  try {
    const { groupId, groupName } = payload;
    const records = getAttendanceRecords(groupId, groupName);
    return { success: true, records: records };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ============================================================================
// 7. UTILITIES
// ============================================================================

/**
 * Test function - run this to verify setup
 */
function test() {
  Logger.log('Testing setup...');
  setupSpreadsheet();
  Logger.log('Testing create group...');
  createGroupSheet('group-001', 'Lab-A', 'Communication', ['Section A', 'Section B']);
  Logger.log('Testing generate invite...');
  const code = generateInviteCode('group-001', 'admin@lab.com');
  Logger.log('Invite code: ' + code);
  Logger.log('All tests completed!');
}
