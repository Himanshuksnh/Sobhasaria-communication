# 🚀 Quick Start Guide - Separate Sheets Feature

## TL;DR (Too Long; Didn't Read)

**Har group ki alag sheet automatically ban jati hai Google Sheets mein!**

```
Group 1: "Physics Lab"     →  Sheet: "Physics Lab_group-123"
Group 2: "Chemistry Lab"   →  Sheet: "Chemistry Lab_group-456"
Group 3: "Biology Lab"     →  Sheet: "Biology Lab_group-789"
```

---

## 5-Minute Setup & Test

### 1️⃣ Google Apps Script Deploy Karo (2 min)

```
1. Sheet kholo: https://docs.google.com/spreadsheets/d/1rw5MojjqKPZS5yTtZAJwnP3cgkPkuu-m3S8695qgDA0/edit
2. Extensions → Apps Script
3. /public/google-apps-script.js copy-paste karo
4. Run: setupSpreadsheet()
5. Deploy as Web App
```

### 2️⃣ App Start Karo (1 min)

```bash
pnpm install
pnpm dev
```

### 3️⃣ Test Karo (2 min)

```
1. http://localhost:3000 kholo
2. Email se login: test@example.com
3. Create Group:
   - Name: "Test Lab 1"
   - Subject: "Testing"
   - Branches: "Section A"
4. Create button click
```

### 4️⃣ Verify Karo

```
Google Sheet kholo
Bottom tabs dekho:
┌─────────┬──────────┬─────────────────────────┐
│ Groups  │ Invites  │ Test Lab 1_group-xxxxx │ ← NEW!
└─────────┴──────────┴─────────────────────────┘
```

---

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR WEB APP                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Physics Lab  │  │ Chemistry Lab│  │ Biology Lab  │     │
│  │   Group 1    │  │   Group 2    │  │   Group 3    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          │ Save             │ Save             │ Save
          │ Attendance       │ Attendance       │ Attendance
          ↓                  ↓                  ↓
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE SHEETS (One Spreadsheet)                │
│                                                             │
│  Tab 1: Groups (Master List)                               │
│  Tab 2: Invites (Invite Codes)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tab 3: Physics Lab_group-123                        │   │
│  │ ┌─────────┬─────────┬──────────┬────────┐          │   │
│  │ │ Date    │ Roll No │ Name     │ Status │          │   │
│  │ ├─────────┼─────────┼──────────┼────────┤          │   │
│  │ │ 02-20   │ 101     │ Student1 │ Present│          │   │
│  │ │ 02-20   │ 102     │ Student2 │ Absent │          │   │
│  │ └─────────┴─────────┴──────────┴────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tab 4: Chemistry Lab_group-456                      │   │
│  │ ┌─────────┬─────────┬──────────┬────────┐          │   │
│  │ │ Date    │ Roll No │ Name     │ Status │          │   │
│  │ ├─────────┼─────────┼──────────┼────────┤          │   │
│  │ │ 02-21   │ 201     │ Student3 │ Present│          │   │
│  │ │ 02-21   │ 202     │ Student4 │ Present│          │   │
│  │ └─────────┴─────────┴──────────┴────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tab 5: Biology Lab_group-789                        │   │
│  │ ┌─────────┬─────────┬──────────┬────────┐          │   │
│  │ │ Date    │ Roll No │ Name     │ Status │          │   │
│  │ ├─────────┼─────────┼──────────┼────────┤          │   │
│  │ │ 02-22   │ 301     │ Student5 │ Excused│          │   │
│  │ │ 02-22   │ 302     │ Student6 │ Present│          │   │
│  │ └─────────┴─────────┴──────────┴────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Points

### ✅ Automatic Creation
```javascript
// Jab aap group create karte ho:
createGroup("Physics Lab", "Physics", ["Section A"])

// Automatically yeh hota hai:
→ New sheet banta hai: "Physics Lab_group-1234567890"
→ Headers setup hote hain
→ Ready for data!
```

### ✅ Data Isolation
```
Physics Lab Sheet:
  → Sirf Physics ka data
  → Sirf Physics ke students
  → Sirf Physics ki attendance

Chemistry Lab Sheet:
  → Sirf Chemistry ka data
  → Sirf Chemistry ke students
  → Sirf Chemistry ki attendance
```

### ✅ Easy Management
```
Want Physics data?
  → Go to "Physics Lab" tab
  → All data in one place
  → Export as CSV

Want Chemistry data?
  → Go to "Chemistry Lab" tab
  → Separate data
  → Export separately
```

---

## Code Behind the Scenes

### When You Click "Create Group":

```javascript
// Frontend (app/page.tsx)
handleCreateGroup({
  name: "Physics Lab",
  subject: "Physics",
  branches: ["Section A"]
})
  ↓
// Sync Manager (lib/sync-manager.ts)
syncManager.createGroupSheet(newGroup)
  ↓
// Google Apps Script (public/google-apps-script.js)
function createGroupSheet(groupId, groupName, subject, branches) {
  // Sheet name banao
  const sheetName = `${groupName}_${groupId}`;
  
  // Naya sheet banao
  ss.insertSheet(sheetName);
  
  // Headers add karo
  sheet.appendRow(['Lab Date', 'Lab Number', 'Branch', ...]);
}
  ↓
// Result: New sheet created! ✅
```

---

## FAQ

**Q: Kitne groups bana sakte hain?**  
A: Unlimited! Har group ki alag sheet banegi.

**Q: Sheet name kaise decide hota hai?**  
A: `{GroupName}_{GroupID}` format mein. Example: `Physics Lab_group-1234567890`

**Q: Agar same name ke 2 groups hain?**  
A: Group ID different hogi, so sheet names different honge:
- `Physics Lab_group-1234567890`
- `Physics Lab_group-9876543210`

**Q: Sheet manually delete kar sakte hain?**  
A: Haan, but recommended nahi hai. App se delete karo.

**Q: Data kaise load hota hai?**  
A: Sheet name se. App group ID use karke correct sheet se data fetch karta hai.

---

## Troubleshooting

### Sheet nahi ban raha?
```
✓ Check: Apps Script deployed hai?
✓ Check: setupSpreadsheet() run kiya?
✓ Check: Console mein errors?
```

### Wrong sheet mein data ja raha?
```
✓ Check: Group ID correct hai?
✓ Check: Sheet name match kar raha hai?
✓ Check: Apps Script logs dekho
```

### Multiple sheets same name ke?
```
✓ Normal hai! Group ID different hogi
✓ Full name: "GroupName_GroupID"
✓ Unique identification ke liye
```

---

## Next Steps

1. ✅ Setup complete karo (5 min)
2. ✅ 2-3 test groups banao
3. ✅ Google Sheet mein verify karo
4. ✅ Attendance mark karo
5. ✅ Data save aur load test karo

**Detailed guides:**
- 📖 `GOOGLE_SHEETS_STRUCTURE.md` - Complete structure
- 📚 `EXAMPLE_USAGE.md` - Real examples
- 🧪 `TEST_INTEGRATION.md` - Testing steps

---

## Summary

```
✅ Har group = Alag sheet
✅ Automatic creation
✅ Proper naming
✅ Data isolation
✅ Easy management
✅ Already implemented!
```

**Bas setup karo aur use karo - baaki sab automatic hai! 🎉**
