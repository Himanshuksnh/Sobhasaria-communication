# 📚 Example Usage - Step by Step

## Scenario: 3 Different Labs Setup

Maan lo aap ek college mein 3 different labs manage kar rahe ho:
1. Communication Lab
2. Database Lab  
3. Network Lab

## Step-by-Step Example

### Step 1: Create First Group - "Communication Lab"

**App mein:**
```
1. Login karo: teacher@college.com
2. "Create Group" click karo
3. Fill karo:
   - Name: Communication Lab
   - Subject: Communication Systems
   - Branches: Section A, Section B
4. Create button click
```

**Google Sheet mein kya hoga:**
```
📁 Lab Management Spreadsheet
├── 📄 Groups
├── 📄 Invites
└── 📄 Communication Lab_group-1708512345  ← NEW SHEET!
```

**Communication Lab Sheet ka content:**
```
Row 1 (Headers):
| Lab Date | Lab Number | Branch | Student Roll No | Student Name | Status | Remarks |

Row 2 (Metadata):
| METADATA:: | Subject: | Communication Systems | Branches: | Section A, Section B |
```

---

### Step 2: Add Students & Mark Attendance (Communication Lab)

**App mein:**
```
1. "Communication Lab" group open karo
2. Date select karo: 2024-02-20
3. Students add karo:
   - Roll: 101, Name: Rahul Kumar
   - Roll: 102, Name: Priya Singh
   - Roll: 103, Name: Amit Sharma
4. Status mark karo:
   - Rahul: Present
   - Priya: Present
   - Amit: Absent
5. "Save Attendance" click karo
```

**Google Sheet mein "Communication Lab_group-1708512345" sheet:**
```
| Lab Date   | Lab Number | Branch    | Roll No | Name         | Status  | Remarks |
|------------|------------|-----------|---------|--------------|---------|---------|
| 2024-02-20 | 1          | Section A | 101     | Rahul Kumar  | Present |         |
| 2024-02-20 | 1          | Section A | 102     | Priya Singh  | Present |         |
| 2024-02-20 | 1          | Section A | 103     | Amit Sharma  | Absent  |         |
```

---

### Step 3: Create Second Group - "Database Lab"

**App mein:**
```
1. Home page par jao
2. "Create Group" click karo
3. Fill karo:
   - Name: Database Lab
   - Subject: DBMS
   - Branches: Section B, Section C
4. Create button click
```

**Google Sheet mein kya hoga:**
```
📁 Lab Management Spreadsheet
├── 📄 Groups
├── 📄 Invites
├── 📄 Communication Lab_group-1708512345
└── 📄 Database Lab_group-1708512999  ← NEW SHEET!
```

---

### Step 4: Add Students to Database Lab

**App mein:**
```
1. "Database Lab" group open karo
2. Date select karo: 2024-02-21
3. Students add karo:
   - Roll: 201, Name: Neha Gupta
   - Roll: 202, Name: Vikram Joshi
   - Roll: 203, Name: Anjali Verma
4. Status mark karo:
   - Neha: Present
   - Vikram: Excused (Medical leave)
   - Anjali: Present
5. "Save Attendance" click karo
```

**Google Sheet mein "Database Lab_group-1708512999" sheet:**
```
| Lab Date   | Lab Number | Branch    | Roll No | Name         | Status  | Remarks |
|------------|------------|-----------|---------|--------------|---------|---------|
| 2024-02-21 | 1          | Section B | 201     | Neha Gupta   | Present |         |
| 2024-02-21 | 1          | Section B | 202     | Vikram Joshi | Excused | Medical |
| 2024-02-21 | 1          | Section B | 203     | Anjali Verma | Present |         |
```

---

### Step 5: Create Third Group - "Network Lab"

**App mein:**
```
1. "Create Group" click karo
2. Fill karo:
   - Name: Network Lab
   - Subject: Computer Networks
   - Branches: Section A
4. Create button click
```

**Google Sheet mein final structure:**
```
📁 Lab Management Spreadsheet
├── 📄 Groups (Master list of all groups)
├── 📄 Invites (All invite codes)
├── 📄 Communication Lab_group-1708512345
├── 📄 Database Lab_group-1708512999
└── 📄 Network Lab_group-1708513555  ← NEW SHEET!
```

---

## Final Google Sheet Structure

### Tab 1: "Groups" Sheet
```
| Group ID           | Group Name         | Subject              | Branches  | Owners          | Leaders |
|--------------------|--------------------|----------------------|-----------|-----------------|---------|
| group-1708512345   | Communication Lab  | Communication Sys    | A, B      | teacher@...     | ...     |
| group-1708512999   | Database Lab       | DBMS                 | B, C      | teacher@...     | ...     |
| group-1708513555   | Network Lab        | Computer Networks    | A         | teacher@...     | ...     |
```

### Tab 2: "Invites" Sheet
```
| Invite Code | Group ID         | Created By    | Created Date | Expires Date | Used By | Used Date |
|-------------|------------------|---------------|--------------|--------------|---------|-----------|
| ABC12345    | group-1708512345 | teacher@...   | 2024-02-20   | 2024-02-27   |         |           |
```

### Tab 3: "Communication Lab_group-1708512345"
```
| Lab Date   | Lab Number | Branch    | Roll No | Name         | Status  | Remarks |
|------------|------------|-----------|---------|--------------|---------|---------|
| 2024-02-20 | 1          | Section A | 101     | Rahul Kumar  | Present |         |
| 2024-02-20 | 1          | Section A | 102     | Priya Singh  | Present |         |
| 2024-02-20 | 1          | Section A | 103     | Amit Sharma  | Absent  |         |
| 2024-02-27 | 2          | Section A | 101     | Rahul Kumar  | Present |         |
| 2024-02-27 | 2          | Section A | 102     | Priya Singh  | Absent  | Sick    |
```

### Tab 4: "Database Lab_group-1708512999"
```
| Lab Date   | Lab Number | Branch    | Roll No | Name         | Status  | Remarks |
|------------|------------|-----------|---------|--------------|---------|---------|
| 2024-02-21 | 1          | Section B | 201     | Neha Gupta   | Present |         |
| 2024-02-21 | 1          | Section B | 202     | Vikram Joshi | Excused | Medical |
| 2024-02-21 | 1          | Section B | 203     | Anjali Verma | Present |         |
```

### Tab 5: "Network Lab_group-1708513555"
```
| Lab Date   | Lab Number | Branch    | Roll No | Name          | Status  | Remarks |
|------------|------------|-----------|---------|---------------|---------|---------|
| 2024-02-22 | 1          | Section A | 301     | Sanjay Patel  | Present |         |
| 2024-02-22 | 1          | Section A | 302     | Kavita Reddy  | Present |         |
```

---

## Benefits Visualization

### ❌ Without Separate Sheets (Confusing!)
```
All Data in One Sheet:
| Group Name        | Lab Date   | Roll No | Name         | Status  |
|-------------------|------------|---------|--------------|---------|
| Communication Lab | 2024-02-20 | 101     | Rahul Kumar  | Present |
| Database Lab      | 2024-02-21 | 201     | Neha Gupta   | Present |
| Communication Lab | 2024-02-20 | 102     | Priya Singh  | Present |
| Network Lab       | 2024-02-22 | 301     | Sanjay Patel | Present |
| Database Lab      | 2024-02-21 | 202     | Vikram Joshi | Excused |
```
👎 Mixed data, hard to read, confusing!

### ✅ With Separate Sheets (Clear!)
```
Communication Lab Sheet:
| Lab Date   | Roll No | Name        | Status  |
|------------|---------|-------------|---------|
| 2024-02-20 | 101     | Rahul Kumar | Present |
| 2024-02-20 | 102     | Priya Singh | Present |

Database Lab Sheet:
| Lab Date   | Roll No | Name        | Status  |
|------------|---------|-------------|---------|
| 2024-02-21 | 201     | Neha Gupta  | Present |
| 2024-02-21 | 202     | Vikram Joshi| Excused |
```
👍 Clean, organized, easy to understand!

---

## Real-World Usage

### Teacher's Daily Workflow:

**Monday - Communication Lab:**
```
1. Open app → Communication Lab group
2. Mark attendance for Section A
3. Save → Data goes to "Communication Lab" sheet
```

**Tuesday - Database Lab:**
```
1. Open app → Database Lab group
2. Mark attendance for Section B
3. Save → Data goes to "Database Lab" sheet
```

**Wednesday - Network Lab:**
```
1. Open app → Network Lab group
2. Mark attendance for Section A
3. Save → Data goes to "Network Lab" sheet
```

### End of Month - Reports:

```
1. Open Google Sheet
2. Go to "Communication Lab" tab → Export as CSV
3. Go to "Database Lab" tab → Export as CSV
4. Go to "Network Lab" tab → Export as CSV
5. Each lab ka separate report ready!
```

---

## Summary

✅ **3 Groups = 3 Separate Sheets**  
✅ **Each sheet has its own data**  
✅ **No mixing of data**  
✅ **Easy to manage**  
✅ **Easy to export**  
✅ **Easy to understand**

Yeh system automatically kaam karta hai - aapko kuch extra karne ki zaroorat nahi! 🎉
