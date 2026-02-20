# Integration Testing Guide

Yeh file aapko step-by-step batayegi ki kaise test karein ki Google Sheets integration properly kaam kar raha hai.

## Pre-requisites Checklist

✅ Google Apps Script deployed hai as web app  
✅ `.env.local` file mein correct URLs hain  
✅ `pnpm install` run kar chuke ho  
✅ Development server running hai (`pnpm dev`)

## Test Steps

### Test 1: Connection Validation

```javascript
// Browser console mein yeh run karo:
const { syncManager } = await import('./lib/init-sync');
syncManager.initialize({
  spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
  appsScriptUrl: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT
});
const isValid = await syncManager.validateConnection();
console.log('Connection valid:', isValid);
```

**Expected Result**: `Connection valid: true`

### Test 2: Create Group

1. App kholo: http://localhost:3000
2. Email enter karo aur login karo
3. "Create Group" button click karo
4. Fill karo:
   - Name: "Test Lab 1"
   - Subject: "Physics"
   - Branches: "Section A, Section B"
5. Create button click karo

**Expected Result**: 
- Alert dikhega: "Group created successfully in Google Sheets!"
- Google Sheet mein ek naya sheet banega: "Test Lab 1_group-xxxxx"

### Test 3: Add Students & Mark Attendance

1. Newly created group ko open karo
2. "Add Student" button click karo
3. Student details enter karo:
   - Roll No: "001"
   - Name: "Test Student 1"
4. Add karo
5. 2-3 aur students add karo
6. Har student ke liye status select karo (Present/Absent)
7. "Save Attendance" button click karo

**Expected Result**:
- Alert dikhega: "Attendance saved successfully to Google Sheets!"
- Google Sheet mein data save ho jayega
- Sheet mein columns honge: Lab Date, Lab Number, Branch, Roll No, Name, Status, Remarks

### Test 4: Load Data from Sheet

1. Browser refresh karo (F5)
2. Same group page kholo
3. Same date select karo

**Expected Result**:
- Students list automatically load hoga
- Previously saved attendance status show hoga
- Summary cards mein correct counts dikhenge

### Test 5: Generate Invite

1. Group page mein "Settings" button click karo
2. "Invites" tab mein jao
3. "Generate New Invite" button click karo

**Expected Result**:
- Alert dikhega: "Invite code generated successfully!"
- Invite link show hoga
- Google Sheet ke "Invites" sheet mein entry add hogi

### Test 6: Use Invite Link

1. Invite link copy karo
2. New incognito window kholo
3. Invite link paste karo
4. Different email enter karo
5. "Join Group" click karo

**Expected Result**:
- Success message dikhega
- User automatically login ho jayega
- Group list mein wo group dikhega
- Google Sheet mein invite "Used By" column update hoga

## Debugging Tips

### Agar kuch kaam nahi kar raha:

1. **Browser Console Check Karo**
   ```
   F12 → Console tab
   Errors dekho (red text)
   ```

2. **Network Tab Check Karo**
   ```
   F12 → Network tab
   Filter: "script.google.com"
   Failed requests dekho
   ```

3. **Google Apps Script Logs**
   ```
   Apps Script editor kholo
   Executions → View execution logs
   Errors dekho
   ```

4. **Environment Variables Verify Karo**
   ```bash
   # Terminal mein run karo:
   cat .env.local
   ```

### Common Issues

**Issue**: "Sync not initialized"  
**Fix**: Page refresh karo, sync manager automatically initialize hoga

**Issue**: "Apps Script error: 403"  
**Fix**: Apps Script deployment settings check karo - "Anyone" access hona chahiye

**Issue**: "Sheet not found"  
**Fix**: Google Sheet mein `setupSpreadsheet()` function run karo

**Issue**: Data save ho raha hai but load nahi ho raha  
**Fix**: Group name aur ID check karo - sheet name match hona chahiye

## Manual Verification

### Google Sheet mein directly check karo:

1. **Groups Sheet**:
   - Har group ki entry honi chahiye
   - Group ID, Name, Subject columns filled hone chahiye

2. **Group Data Sheets**:
   - Har group ka apna sheet hona chahiye
   - Format: `{GroupName}_{GroupID}`
   - Headers: Lab Date, Lab Number, Branch, Roll No, Name, Status, Remarks
   - Attendance data rows mein hona chahiye

3. **Invites Sheet**:
   - Generated invite codes hone chahiye
   - Expiry date 7 days future mein honi chahiye
   - Used invites mein "Used By" filled hona chahiye

## Success Criteria

✅ Groups create ho rahe hain aur sheet mein save ho rahe hain  
✅ Attendance save ho raha hai aur sheet mein dikh raha hai  
✅ Attendance data load ho raha hai sheet se  
✅ Invite codes generate ho rahe hain  
✅ Invite links kaam kar rahe hain  
✅ Summary statistics correct show ho rahe hain

Agar sab ✅ hai, to integration fully working hai! 🎉

## Next Steps

- Production mein deploy karo (Vercel recommended)
- Environment variables production mein set karo
- Google Sheet ko proper permissions do
- Backup strategy plan karo

---

Happy Testing! 🚀
