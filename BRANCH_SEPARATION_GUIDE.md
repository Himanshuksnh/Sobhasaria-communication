# 🔀 Branch Separation Guide

## ✅ Ab Branches Ko Separate Kar Sakte Ho!

Ek hi group mein multiple branches ke students ko alag-alag manage karo.

---

## Example: C2 Batch

**Branches:**
- Data Science
- Electrical

**Students:**
- Data Science: Roll 2101-2110
- Electrical: Roll 2201-2210

---

## Features Added

### 1️⃣ Branch Field in Student
Har student ke saath branch name save hota hai:
```
Student:
- Roll No: 2101
- Name: Rahul Kumar
- Branch: Data Science  ← NEW!
- Status: Present
- Marks: ...
```

### 2️⃣ Branch Filter/Selector
Attendance page par branch filter:
```
┌─────────────────────────────────────────┐
│ Filter by Branch: [All Branches ▼]     │
│ Showing 10 of 20 students               │
└─────────────────────────────────────────┘
```

### 3️⃣ Branch Column in Table
Table mein branch column:
```
| Roll No | Name        | Branch        | Status  | Marks |
|---------|-------------|---------------|---------|-------|
| 2101    | Rahul Kumar | Data Science  | Present | 34    |
| 2102    | Priya Singh | Data Science  | Present | 35    |
| 2201    | Neha Gupta  | Electrical    | Present | 31    |
```

---

## How To Use

### Step 1: Create Group with Multiple Branches

```
Group Name:    C2 Batch - Communication Lab
Subject:       Communication Skills
Branches:      
  1. Type "Data Science" → Add
  2. Type "Electrical" → Add
  
Result: [Data Science] [Electrical]
```

### Step 2: Add Students with Branch

**Add Data Science Student:**
```
Click "Add Student"
┌─────────────────────────────────────────┐
│ Roll No:  2101                          │
│ Name:     Rahul Kumar                   │
│ Branch:   [Data Science ▼]             │
│           [Add] [Cancel]                │
└─────────────────────────────────────────┘
```

**Add Electrical Student:**
```
Click "Add Student"
┌─────────────────────────────────────────┐
│ Roll No:  2201                          │
│ Name:     Neha Gupta                    │
│ Branch:   [Electrical ▼]               │
│           [Add] [Cancel]                │
└─────────────────────────────────────────┘
```

### Step 3: Filter by Branch

**View All Students:**
```
Filter: [All Branches]
Shows: All 20 students (Data Science + Electrical)
```

**View Only Data Science:**
```
Filter: [Data Science]
Shows: Only 10 Data Science students
```

**View Only Electrical:**
```
Filter: [Electrical]
Shows: Only 10 Electrical students
```

---

## Workflow Example

### Thursday Lab - Data Science Turn

```
1. Open C2 Batch group
2. Select date: 2024-02-22
3. Filter: [Data Science]
4. Mark attendance for Data Science students only
5. Enter marks
6. Save
```

### Next Thursday - Electrical Turn

```
1. Open C2 Batch group
2. Select date: 2024-02-29
3. Filter: [Electrical]
4. Mark attendance for Electrical students only
5. Enter marks
6. Save
```

### View Combined Report

```
1. Filter: [All Branches]
2. See all students together
3. Summary shows combined statistics
```

---

## Google Sheet Structure

### Sheet: "C2 Batch - Communication Lab_group-xxxxx"

```
| Date       | Lab# | Branch       | Roll | Name        | Status  | Att | Eng | Act | Cre | Total |
|------------|------|--------------|------|-------------|---------|-----|-----|-----|-----|-------|
| 2024-02-22 | 1    | Data Science | 2101 | Rahul Kumar | Present | 10  | 9   | 8   | 7   | 34    |
| 2024-02-22 | 1    | Data Science | 2102 | Priya Singh | Present | 10  | 8   | 9   | 8   | 35    |
| 2024-02-22 | 1    | Electrical   | 2201 | Neha Gupta  | Present | 10  | 7   | 8   | 6   | 31    |
| 2024-02-22 | 1    | Electrical   | 2202 | Vikram Joshi| Present | 10  | 8   | 7   | 8   | 33    |
```

**Branch column** clearly separates students!

---

## Statistics by Branch

### All Branches Selected:
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Present  │ Absent   │ Total    │ Avg      │ Highest  │
│   18     │   2      │   20     │  32.5    │   35     │
└──────────┴──────────┴──────────┴──────────┴──────────┘
Combined statistics for all students
```

### Data Science Selected:
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Present  │ Absent   │ Total    │ Avg      │ Highest  │
│   9      │   1      │   10     │  33.2    │   35     │
└──────────┴──────────┴──────────┴──────────┴──────────┘
Only Data Science students
```

### Electrical Selected:
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Present  │ Absent   │ Total    │ Avg      │ Highest  │
│   9      │   1      │   10     │  31.8    │   33     │
└──────────┴──────────┴──────────┴──────────┴──────────┘
Only Electrical students
```

---

## Use Cases

### 1. Separate Lab Sessions
```
Week 1: Data Science students only
Week 2: Electrical students only
Week 3: Combined session (All Branches)
```

### 2. Branch-wise Reports
```
Export Data Science performance
Export Electrical performance
Compare branches
```

### 3. Targeted Marking
```
Focus on one branch at a time
No confusion
Clear separation
```

---

## Tips

### ✅ Best Practices:

**Consistent Branch Names:**
```
✅ Use: "Data Science" (always)
❌ Avoid: "DS", "Data Sci", "DataScience" (inconsistent)
```

**Clear Roll Number Ranges:**
```
Data Science: 2101-2110
Electrical:   2201-2210
Civil:        2301-2310
```

**Filter Before Marking:**
```
1. Select branch filter first
2. Then mark attendance
3. Saves time and confusion
```

### 🎯 Workflow:

**Daily Routine:**
```
1. Open group
2. Select today's date
3. Filter by today's branch
4. Mark attendance
5. Save
```

**Weekly Review:**
```
1. Filter: All Branches
2. Check combined statistics
3. Identify low performers
4. Plan improvements
```

---

## Advanced: Multiple Sections

Agar aapke paas multiple sections bhi hain:

### Example: C2 Batch with Sections

**Branches:**
```
- Data Science - Section A
- Data Science - Section B
- Electrical - Section A
- Electrical - Section B
```

**Usage:**
```
Filter: [Data Science - Section A]
Shows: Only DS Section A students
```

---

## Summary

### ✅ Features:
- Branch field in student data
- Branch filter/selector
- Branch column in table
- Branch-wise statistics
- Separate marking per branch
- Combined view option

### 🎯 Benefits:
- Clear separation
- No confusion
- Easy filtering
- Branch-wise reports
- Flexible workflow
- Better organization

---

**Ab aap easily multiple branches ko manage kar sakte ho! 🔀✅**
