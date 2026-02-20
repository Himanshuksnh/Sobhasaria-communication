# Communication Lab Management System

## Kya Hai Ye?

Ye ek web application hai jo Communication Lab ke attendance aur marks manage karne ke liye hai.

## Kya Kya Features Hain?

### 1. Login System
- Email aur password se login
- Google account se bhi login ho sakta hai
- Secure aur safe

### 2. Groups
- Apna group bana sakte ho (jaise C2 Batch)
- Multiple branches add kar sakte ho (Data Science, Electrical, etc.)
- Dusre leader ko invite kar sakte ho

### 3. Students
- Students add karo roll number ke saath
- Branch assign karo
- Filter kar sakte ho branch ke basis pe

### 4. Attendance
- Har din ka attendance mark karo
- 4 tarah ke marks do:
  - Attendance (0-10)
  - English Speaking (0-10)
  - Active Participation (0-10)
  - Creative Work (0-10)
- Total automatically calculate hota hai (0-40)

### 5. Export
- Excel file download karo
- CSV file download karo
- Summary report download karo

## Setup Kaise Kare?

### Step 1: Google Sign-In Enable Karo (Sirf Ek Baar)

1. Ye link kholo: https://console.firebase.google.com/
2. Apna project select karo: **yourwebprojectname-1c6c4**
3. Left side me **Authentication** pe click karo
4. **Sign-in method** tab pe jao
5. **Google** pe click karo
6. **Enable** button ON karo
7. Apna email daalo
8. **Save** karo

### Step 2: App Chalao

```bash
npm run dev
```

Browser me kholo: http://localhost:3000

## Kaise Use Kare?

### Pehli Baar (First Time)

1. `/login` page pe jao
2. Email aur password se sign up karo
   - Ya Google se sign in karo
3. Home page pe pahunchoge

### Group Banana

1. **Create Group** button pe click karo
2. Group ka naam daalo (jaise "C2 - Communication Lab")
3. Subject daalo (jaise "Communication Lab")
4. Branches add karo:
   - "Data Science" type karo → Add
   - "Electrical" type karo → Add
5. **Create Group** pe click karo

### Students Add Karna

1. Group kholo
2. **Add Student** pe click karo
3. Roll number daalo
4. Name daalo
5. Branch select karo
6. **Add** pe click karo

### Attendance Mark Karna

1. Date select karo (default aaj ka date hoga)
2. Har student ke liye:
   - Status set karo (Present/Absent/Excused)
   - Attendance marks daalo (0-10)
   - English marks daalo (0-10)
   - Active marks daalo (0-10)
   - Creative marks daalo (0-10)
3. **Save Attendance** pe click karo

### Dusre Leader Ko Add Karna

1. Group kholo
2. **Settings** button pe click karo
3. **Invites** tab pe jao
4. **Generate New Invite** pe click karo
5. Link copy karo
6. Apne friend ko bhejo
7. Wo link pe click karke login karega
8. Automatically leader ban jayega

### Data Export Karna

1. Group kholo
2. **Records** tab pe jao
3. Choose karo:
   - **Export to Excel** - Excel file download hogi
   - **Export to CSV** - CSV file download hogi
   - **Export Summary Report** - Summary download hogi

## Tumhara Use Case (C2 Batch)

### Setup
1. Login karo
2. Group banao: "C2 - Communication Lab"
3. Branches add karo: "Data Science", "Electrical"
4. Sabhi students add karo
5. Invite link generate karo
6. Apne friend ko bhejo
7. Done!

### Har Thursday (Weekly Lab)
1. App kholo
2. Apna group kholo
3. Aaj ka date select karo
4. Sabhi students ka attendance mark karo
5. Marks daalo
6. Save karo
7. Done! (5-10 minute me ho jayega)

### Mahine Ke End Me
1. Group kholo
2. Records tab pe jao
3. Summary report download karo
4. Administration ko bhejo

## Important Points

- ✅ Internet chahiye (data Firebase me save hota hai)
- ✅ Invite codes 7 din me expire ho jate hain
- ✅ Har invite code sirf ek baar use ho sakta hai
- ✅ Total marks automatically calculate hote hain
- ✅ Data real-time sync hota hai
- ✅ Sirf group leaders hi group ka data dekh sakte hain

## Agar Problem Aaye?

### "Google Sign-In kaam nahi kar raha"
→ Firebase Console me Google provider enable karo

### "Attendance save nahi ho raha"
→ Internet check karo, login check karo

### "Invite code invalid hai"
→ Naya code generate karo (purana expire ho gaya)

### "Groups nahi dikh rahe"
→ Sahi email se login karo

## Files Aur Folders

```
app/
├── login/          → Login page
├── page.tsx        → Home page (groups list)
├── group/[id]/     → Group detail page
└── join/[code]/    → Invite accept page

lib/
├── firebase.ts         → Firebase setup
├── firebase-auth.ts    → Login/logout
├── firebase-db.ts      → Database operations
└── export-service.ts   → Excel/CSV export
```

## Marks System

| Category | Marks | Kya Hai |
|----------|-------|---------|
| Attendance | 0-10 | Attendance ke basis pe |
| English Speaking | 0-10 | English me baat karne ke basis pe |
| Active Participation | 0-10 | Class me participate karne ke basis pe |
| Creative Work | 0-10 | Creative kaam ke basis pe |
| **Total** | **0-40** | Sabka total (automatic) |

## Benefits

1. **No Google Sheets Problems**: Ab koi "Sync not initialized" error nahi
2. **Real-time**: Changes turant sync hote hain
3. **Secure**: Firebase ka enterprise security
4. **Fast**: Bahut fast hai
5. **Export**: Kabhi bhi data download karo
6. **Anywhere**: Kahi se bhi access karo

## Ready! 🚀

Ab tumhara Communication Lab Management System ready hai!

**Next Step**: Firebase Console me Google Sign-In enable karo (2 minute)

Phir: `npm run dev` chalao aur use karo! 🎉

---

**Questions?** Check karo:
- `FIREBASE_COMPLETE_SETUP.md` - Detailed setup
- `QUICK_REFERENCE.md` - Quick commands
- `FINAL_CHECKLIST.md` - Testing checklist
