# 🔄 Google Apps Script Update Guide

## Kya Change Hua?

Maine marks columns add kar diye hain:

### Old Headers (6 columns):
```
Lab Date | Lab Number | Branch | Roll No | Name | Status | Remarks
```

### New Headers (12 columns):
```
Lab Date | Lab Number | Branch | Roll No | Name | Status | Attendance Marks | English Speaking | Active Participation | Creative Work | Total Marks | Remarks
```

---

## Update Kaise Karein (5 Minutes)

### Step 1: Google Sheet Kholo
```
https://docs.google.com/spreadsheets/d/1rw5MojjqKPZS5yTtZAJwnP3cgkPkuu-m3S8695qgDA0/edit
```

### Step 2: Apps Script Editor Kholo
```
Top menu → Extensions → Apps Script
```

### Step 3: Purana Code Delete Karo
```
Editor mein jo bhi code hai, sab select karo (Ctrl+A)
Delete karo
```

### Step 4: Naya Code Copy Karo
```
Project folder mein:
/public/google-apps-script.js

Yeh puri file copy karo (Ctrl+A, Ctrl+C)
```

### Step 5: Paste Karo
```
Apps Script editor mein paste karo (Ctrl+V)
Save karo (Ctrl+S)
```

### Step 6: Setup Function Run Karo
```
1. Function dropdown se "setupSpreadsheet" select karo
2. Run button (▶️) click karo
3. Permissions grant karo (agar puche)
4. Execution log check karo - "Success" dikhna chahiye
```

### Step 7: Deploy Karo (Agar Pehli Baar Hai)
```
Agar pehle se deployed hai:
  → Skip karo, purana deployment kaam karega

Agar naya deployment chahiye:
  1. Deploy → New deployment
  2. Type: Web app
  3. Execute as: Me
  4. Who has access: Anyone
  5. Deploy
  6. Copy deployment URL
  7. .env.local mein update karo
```

---

## Verification

### Test Karo:
```
1. Apps Script editor mein
2. Function dropdown → "test"
3. Run button click
4. Execution log check karo
5. "All tests completed!" dikhna chahiye
```

### Check Sheet Structure:
```
1. Google Sheet mein jao
2. "Groups" aur "Invites" sheets hone chahiye
3. Agar koi purana group sheet hai, delete kar do (fresh start ke liye)
```

---

## Changes Summary

### 1. Headers Updated (Line 91)
```javascript
// OLD:
sheet.appendRow(['Lab Date', 'Lab Number', 'Branch', 'Student Roll No', 'Student Name', 'Status', 'Remarks']);

// NEW:
sheet.appendRow(['Lab Date', 'Lab Number', 'Branch', 'Student Roll No', 'Student Name', 'Status', 'Attendance Marks', 'English Speaking', 'Active Participation', 'Creative Work', 'Total Marks', 'Remarks']);
```

### 2. Save Function Updated (Line 150-160)
```javascript
// Now saves 12 columns instead of 7
sheet.getRange(startRow, 7).setValue(student.attendanceMarks || 0);
sheet.getRange(startRow, 8).setValue(student.englishSpeaking || 0);
sheet.getRange(startRow, 9).setValue(student.activeParticipation || 0);
sheet.getRange(startRow, 10).setValue(student.creativeWork || 0);
sheet.getRange(startRow, 11).setValue(student.totalMarks || 0);
sheet.getRange(startRow, 12).setValue(student.remarks || '');
```

### 3. Read Function Updated (Line 350-360)
```javascript
// Now reads all 12 columns
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
```

---

## Important Notes

### ⚠️ Agar Pehle Se Data Hai:

**Option 1: Fresh Start (Recommended)**
```
1. Purane group sheets delete kar do
2. Naye groups create karo
3. Clean slate se start karo
```

**Option 2: Manual Migration**
```
1. Purane data ko backup lo (Download as CSV)
2. Purane sheets delete karo
3. Naye groups create karo
4. Data manually enter karo
```

### ✅ Agar Naya Setup Hai:
```
Koi tension nahi!
Seedha naya code paste karo aur use karo.
```

---

## Troubleshooting

### Error: "Sheet not found"
```
Solution: setupSpreadsheet() function run karo
```

### Error: "Permission denied"
```
Solution: 
1. Apps Script editor mein
2. Run → Review permissions
3. Allow access
```

### Data save nahi ho raha
```
Check:
1. Deployment URL correct hai? (.env.local)
2. Apps Script deployed hai?
3. Console mein errors?
```

### Purane columns show ho rahe hain
```
Solution:
1. Purane group sheets delete karo
2. Naya group create karo
3. Naye headers dikhenge
```

---

## Quick Checklist

Before using the app:

- [ ] Apps Script code updated
- [ ] setupSpreadsheet() run kiya
- [ ] "Groups" sheet exists
- [ ] "Invites" sheet exists
- [ ] Test function run kiya (optional)
- [ ] Deployment URL correct hai
- [ ] .env.local file mein URL set hai

---

## Final Result

Jab aap naya group create karoge:

```
Sheet Headers:
┌──────────┬──────┬────────┬─────────┬──────┬────────┬─────┬─────┬────────┬──────────┬───────┬─────────┐
│ Lab Date │ Lab# │ Branch │ Roll No │ Name │ Status │ Att │ Eng │ Active │ Creative │ Total │ Remarks │
└──────────┴──────┴────────┴─────────┴──────┴────────┴─────┴─────┴────────┴──────────┴───────┴─────────┘

Data Example:
┌────────────┬──────┬──────────────┬─────────┬─────────────┬─────────┬─────┬─────┬────────┬──────────┬───────┬─────────┐
│ 2024-02-22 │  1   │ Data Science │  2101   │ Rahul Kumar │ Present │ 10  │  9  │   8    │    7     │  34   │         │
└────────────┴──────┴──────────────┴─────────┴─────────────┴─────────┴─────┴─────┴────────┴──────────┴───────┴─────────┘
```

---

## Summary

✅ **Ek baar update karna hai** - `/public/google-apps-script.js` copy-paste karo  
✅ **setupSpreadsheet() run karo** - Fresh setup ke liye  
✅ **Bas! Ready hai** - Ab app use kar sakte ho  

**Total Time: 5 minutes** ⏱️

---

Need help? Console errors check karo ya mujhe batao! 😊
