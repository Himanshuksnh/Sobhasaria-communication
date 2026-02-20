# Google Sheets Integration Guide

Your Lab Management System is now fully integrated with Google Sheets. Here's how everything works:

## What's Connected

- **Google Sheets URL**: https://docs.google.com/spreadsheets/d/1rw5MojjqKPZS5yTtZAJwnP3cgkPkuu-m3S8695qgDA0/edit
- **Apps Script Endpoint**: https://script.google.com/macros/s/AKfycbwj26p-258RZDxF9eIRJ_e5virDZBGtFKZegWTaQYgZAoSHnGnKGPbzFxFnNRjDfdaBBQ/exec
- **Environment Variables**: Configured in `.env.local`

## Architecture Overview

```
┌─────────────────────┐
│  Lab Management     │
│     React App       │
│   (Client-side)     │
└──────────┬──────────┘
           │
           │ HTTP POST/GET
           │
┌──────────▼──────────┐
│  Google Apps Script │
│  (Deployment URL)   │
│  (Backend Logic)    │
└──────────┬──────────┘
           │
           │ Google Sheets API
           │
┌──────────▼──────────┐
│  Google Sheets DB   │
│  (Data Storage)     │
│  - Groups Sheet     │
│  - Attendance       │
│  - Invites          │
└─────────────────────┘
```

## How Data Flows

### 1. **On App Load**
```
User opens app
  ↓
initializeSyncManager() runs
  ↓
Connects to Apps Script endpoint
  ↓
Validates connection to Google Sheets
  ↓
Loads cached data from localStorage
```

### 2. **When Saving Attendance**
```
User marks attendance & clicks "Save"
  ↓
Data stored in localStorage (optimistic UI)
  ↓
syncManager.syncGroupData() calls Apps Script
  ↓
Apps Script writes to Google Sheets
  ↓
Success/Error response returned
```

### 3. **When Creating a Group**
```
Leader creates new group
  ↓
groupDataManager creates local entry
  ↓
App calls syncManager.createGroupSheet()
  ↓
Apps Script creates new sheet in Google Sheets
  ↓
Sheet ID returned and stored
```

## Key Features

### Optimistic UI Updates
- Data is immediately updated in localStorage for instant feedback
- Background sync to Google Sheets happens asynchronously
- If sync fails, error is shown and user can retry

### Error Handling
- Network errors are caught and displayed to user
- Failed syncs don't delete local data
- Users can always retry

### Data Isolation
- Each group has its own sheet in Google Sheets
- Leaders can only access their own groups
- Data is separated by group ID

## Important Files

- **`lib/sync-manager.ts`** - Handles all Google Sheets API calls
- **`lib/init-sync.ts`** - Initializes sync manager on app load
- **`components/group/attendance-table.tsx`** - Uses sync manager to save attendance
- **`.env.local`** - Contains Google Sheets endpoint and spreadsheet ID

## Testing the Integration

1. **Open the app** in preview
2. **Log in** with any email
3. **Create a group** - This creates a new sheet in Google Sheets
4. **Mark attendance** - Try marking some students as present/absent
5. **Click "Save Attendance"** - This syncs to Google Sheets
6. **Check your Google Sheet** - You should see the data there

## Troubleshooting

### Connection Not Validating
- Check that the Apps Script endpoint URL is correct
- Verify the Google Sheet is accessible
- Check browser console for error messages

### Data Not Syncing
- Check that `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT` is set correctly
- Ensure Google Sheets API is enabled in your Google Cloud project
- Look for error messages in the attendance table interface

### Slow Performance
- First load might be slower as it validates connection
- Subsequent saves should be faster
- Check network tab for Apps Script response times

## Next Steps

1. Test attendance tracking with multiple groups
2. Verify data appears correctly in Google Sheets
3. Test invite system for adding leaders
4. Configure branch/subject dropdowns in group settings

## Environment Variables

```env
NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT=https://script.google.com/macros/s/AKfycbwj26p-258RZDxF9eIRJ_e5virDZBGtFKZegWTaQYgZAoSHnGnKGPbzFxFnNRjDfdaBBQ/exec
NEXT_PUBLIC_SPREADSHEET_ID=1rw5MojjqKPZS5yTtZAJwnP3cgkPkuu-m3S8695qgDA0
```

These are already set in `.env.local` - no additional configuration needed!

## Data Schema (Google Sheets)

### Groups Sheet
- Group ID
- Group Name
- Owner Email
- Leaders (comma-separated)
- Subject/Branch
- Created Date

### Attendance Sheet (per group)
- Date
- Student Name
- Roll Number
- Status (Present/Absent/Excused)
- Timestamp

### Invites Sheet
- Invite Code
- Group ID
- Email
- Expiry Date (7 days)
- Status (Used/Unused)

## Security Notes

- Apps Script is deployed as "Execute as: Your Account"
- Only you can modify the script
- The public endpoint is read-only for your data
- Attendance data is stored in your Google Sheet (secure)
