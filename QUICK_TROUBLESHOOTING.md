# 🔍 Quick Troubleshooting - "Failed to sync with Google Sheets"

## Error Message:
```
"Group created locally, but failed to sync with Google Sheets"
```

## What This Means:
✅ App is working (group created in localStorage)  
❌ Google Apps Script not responding  
❌ Data not saving to Google Sheets  

---

## Quick Fix Checklist:

### ✅ Step 1: Check .env.local File

**Location:** Project root folder

**Should contain:**
```env
NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT=https://script.google.com/macros/s/AKfycbwj26p-258RZDxF9eIRJ_e5virDZBGtFKZegWTaQYgZAoSHnGnKGPbzFxFnNRjDfdaBBQ/exec
NEXT_PUBLIC_SPREADSHEET_ID=1rw5MojjqKPZS5yTtZAJwnP3cgkPkuu-m3S8695qgDA0
```

**Test:**
```bash
# Check if file exists
cat .env.local

# If not found, create it with above content
```

---

### ✅ Step 2: Verify Apps Script Deployment

**Go to:**
```
https://docs.google.com/spreadsheets/d/1rw5MojjqKPZS5yTtZAJwnP3cgkPkuu-m3S8695qgDA0/edit
```

**Check:**
1. Extensions → Apps Script
2. Is code pasted? (should be ~500 lines)
3. Is it saved? (no asterisk * in tab name)

**If empty:**
```
1. Copy /public/google-apps-script.js
2. Paste in Apps Script editor
3. Save (Ctrl+S)
```

---

### ✅ Step 3: Run Setup Function

**In Apps Script editor:**
```
1. Function dropdown → "setupSpreadsheet"
2. Click Run (▶️)
3. Grant permissions when asked
4. Check execution log
5. Should see: "Spreadsheet structure initialized successfully!"
```

**Verify:**
```
Go back to Google Sheet
Bottom tabs should show:
- Groups
- Invites
```

---

### ✅ Step 4: Test Deployment URL

**Open in browser:**
```
https://script.google.com/macros/s/AKfycbwj26p-258RZDxF9eIRJ_e5virDZBGtFKZegWTaQYgZAoSHnGnKGPbzFxFnNRjDfdaBBQ/exec
```

**Expected:**
- Should NOT show 404 error
- Might show blank page or error (that's OK)
- Important: Page should load (not 404)

**If 404:**
```
Apps Script not deployed!
Need to deploy:
1. Apps Script editor → Deploy → New deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Deploy
6. Copy new URL
7. Update .env.local
```

---

### ✅ Step 5: Check Browser Console

**Open DevTools:**
```
Press F12
Go to Console tab
Look for errors
```

**Common errors:**

**Error 1: CORS Error**
```
Solution: Apps Script needs to be deployed as "Anyone" access
```

**Error 2: 404 Not Found**
```
Solution: Deployment URL wrong or not deployed
```

**Error 3: 403 Forbidden**
```
Solution: Apps Script permissions not granted
```

---

### ✅ Step 6: Restart Dev Server

**After fixing above:**
```bash
# Stop server (Ctrl+C)
# Start again
pnpm dev
```

---

## Detailed Steps:

### If Apps Script is Empty:

**1. Copy Code:**
```
Open: /public/google-apps-script.js
Select all (Ctrl+A)
Copy (Ctrl+C)
```

**2. Paste in Apps Script:**
```
Go to: Extensions → Apps Script
Delete any existing code
Paste (Ctrl+V)
Save (Ctrl+S)
```

**3. Run Setup:**
```
Function: setupSpreadsheet
Click: Run (▶️)
Grant permissions
Wait for success message
```

**4. Verify Sheets:**
```
Go back to Google Sheet
Check bottom tabs:
✅ Groups sheet exists
✅ Invites sheet exists
```

---

### If Deployment URL is Wrong:

**1. Get Current Deployment:**
```
Apps Script editor
Deploy → Manage deployments
Copy the Web app URL
```

**2. Update .env.local:**
```
NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT=<your-new-url>
```

**3. Restart Server:**
```bash
pnpm dev
```

---

### If Permissions Not Granted:

**1. Re-run Setup:**
```
Apps Script editor
Function: setupSpreadsheet
Run
```

**2. Grant Permissions:**
```
Click: Review permissions
Select: Your Google account
Click: Advanced
Click: Go to [Project] (unsafe)
Click: Allow
```

---

## Test After Fix:

**1. Delete Test Group:**
```
Home page → Delete the failed group
```

**2. Create New Group:**
```
Create Group button
Name: Test Group 2
Subject: Testing
Branches: A
Create
```

**3. Check Result:**
```
✅ Should see: "Group created successfully in Google Sheets!"
❌ Should NOT see: "failed to sync"
```

**4. Verify in Sheet:**
```
Go to Google Sheet
Bottom tabs → Should see new tab:
"Test Group 2_group-xxxxx"
```

---

## Still Not Working?

### Check Network Tab:

**1. Open DevTools:**
```
F12 → Network tab
```

**2. Create Group:**
```
Watch for request to:
script.google.com/macros/...
```

**3. Check Response:**
```
Click on the request
Check Response tab
Look for error message
```

**Common responses:**

**Success:**
```json
{
  "success": true,
  "message": "Group created successfully"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Some error message"
}
```

---

## Summary:

### Most Common Issues:

1. **Apps Script not deployed** (90% of cases)
   - Solution: Deploy as web app

2. **Code not pasted** (5% of cases)
   - Solution: Copy-paste google-apps-script.js

3. **Setup not run** (3% of cases)
   - Solution: Run setupSpreadsheet()

4. **Wrong URL in .env.local** (2% of cases)
   - Solution: Update with correct deployment URL

---

## Quick Commands:

```bash
# Check .env.local exists
ls -la .env.local

# View .env.local content
cat .env.local

# Restart server
pnpm dev
```

---

## Expected Flow (After Fix):

```
1. Create group in app
   ↓
2. Alert: "Group created successfully in Google Sheets!"
   ↓
3. Check Google Sheet
   ↓
4. New tab appears: "GroupName_group-xxxxx"
   ↓
5. ✅ Success!
```

---

**Fix these steps and try again! 🔧**
