# Google Sheets Integration Setup Guide

## Step 1: Copy the Apps Script Code

1. Go to your Google Sheet: https://docs.google.com/spreadsheets/d/1rw5MojjqKPZS5yTtZAJwnP3cgkPkuu-m3S8695qgDA0/edit

2. Click **Extensions** → **Apps Script** (opens in new tab)

3. Delete any default code in the editor

4. Copy the entire code from `/public/google-apps-script.js` in this project

5. Paste it into the Apps Script editor

6. Save the script (Ctrl+S or Cmd+S)

## Step 2: Initialize the Spreadsheet

1. In the Apps Script editor, select the function `setupSpreadsheet` from the dropdown
2. Click the **Run** button
3. Grant necessary permissions when prompted
4. Check the execution log to confirm success

This creates:
- **Groups** sheet: Tracks all lab groups
- **Invites** sheet: Manages invite codes

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Select type: **Web app**
3. Configure:
   - Execute as: Your Google account
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the deployment URL (looks like: `https://script.google.com/macros/d/.../usercontent`)

## Step 4: Add Deployment URL to Your Web App

Add these environment variables to your Vercel project (in the Vars section of v0 sidebar):

```
NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT=<your-deployment-url>
GOOGLE_SPREADSHEET_ID=1rw5MojjqKPZS5yTtZAJwnP3cgkPkuu-m3S8695qgDA0
```

## Step 5: Test the Integration

Run the test function in Apps Script:
1. Select `test` from the dropdown
2. Click **Run**
3. Check the execution log for success messages

## API Reference

Your web app can now call the following actions:

### Create Group
```javascript
const response = await fetch(deploymentUrl, {
  method: 'POST',
  payload: JSON.stringify({
    action: 'createGroup',
    groupId: 'group-001',
    groupName: 'Lab A',
    subject: 'Communication',
    branches: ['Section A', 'Section B']
  })
});
```

### Save Attendance
```javascript
{
  action: 'saveAttendance',
  groupId: 'group-001',
  groupName: 'Lab A',
  labDate: '2024-02-20',
  labNumber: '1',
  branch: 'Section A',
  students: [
    { rollNo: '001', name: 'John Doe', status: 'Present', remarks: '' },
    { rollNo: '002', name: 'Jane Smith', status: 'Absent', remarks: 'Sick' }
  ]
}
```

### Generate Invite Code
```javascript
{
  action: 'generateInvite',
  groupId: 'group-001',
  createdBy: 'admin@lab.com',
  expiryDays: 7
}
```

### Validate Invite Code
```javascript
{
  action: 'validateInvite',
  code: 'ABC12345',
  userEmail: 'user@example.com'
}
```

### Get All Groups
```javascript
{
  action: 'getGroups'
}
```

### Get Group Data
```javascript
{
  action: 'getGroupData',
  groupId: 'group-001'
}
```

### Get Attendance Summary
```javascript
{
  action: 'getAttendanceSummary',
  groupId: 'group-001',
  groupName: 'Lab A'
}
```

### Get Attendance Records
```javascript
{
  action: 'getAttendanceRecords',
  groupId: 'group-001',
  groupName: 'Lab A'
}
```

## Troubleshooting

### "Authorization required" error
- Re-run the setup and grant permissions
- Make sure the Apps Script is deployed as "Anyone has access"

### Sheet not found
- Run `setupSpreadsheet()` again
- Check that the sheet names match in the constants at the top

### API calls returning null
- Verify the deployment URL is correct
- Check that the Spreadsheet ID matches your sheet
- Review execution logs in Apps Script for errors

## Sheet Structure

### Groups Sheet
| Column | Purpose |
|--------|---------|
| A | Group ID |
| B | Group Name |
| C | Subject |
| D | Branches (comma-separated) |
| E | Owners (email list) |
| F | Leaders (email list) |
| G | Current Lab Date |
| H | Next Lab Date |
| I | Created Date |
| J | Sheet ID |

### Invites Sheet
| Column | Purpose |
|--------|---------|
| A | Invite Code |
| B | Group ID |
| C | Created By (email) |
| D | Created Date |
| E | Expires Date |
| F | Used By (email) |
| G | Used Date |

### Group Data Sheets (auto-created)
Each group gets its own sheet named `{GroupName}_{GroupID}` with:
| Column | Purpose |
|--------|---------|
| A | Lab Date |
| B | Lab Number |
| C | Branch |
| D | Student Roll No |
| E | Student Name |
| F | Status (Present/Absent/Excused) |
| G | Remarks |
