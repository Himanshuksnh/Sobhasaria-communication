# Quick Reference Guide

## 🔗 Important Links

- **Firebase Console**: https://console.firebase.google.com/
- **Your Project**: yourwebprojectname-1c6c4
- **Local App**: http://localhost:3000
- **Login Page**: http://localhost:3000/login

## 🚀 Quick Start Commands

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel deploy
```

## 📱 App Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/login` | Login/Signup page | No |
| `/` | Home (groups list) | Yes |
| `/group/[id]` | Group detail & attendance | Yes |
| `/join/[code]` | Accept invite link | Yes |

## 🔐 Authentication

### Sign Up
1. Go to `/login`
2. Click "Don't have an account? Sign up"
3. Enter name, email, password
4. Click "Sign Up"

### Sign In (Email)
1. Go to `/login`
2. Enter email and password
3. Click "Sign In"

### Sign In (Google)
1. Go to `/login`
2. Click "Sign in with Google"
3. Select Google account

### Logout
1. Click "Logout" button in header

## 👥 Group Management

### Create Group
1. Home page → "Create Group"
2. Enter group name
3. Enter subject
4. Add branches (one by one)
5. Click "Create Group"

### Delete Group
1. Home page → Click trash icon on group card
2. Confirm deletion

### Invite Co-Leader
1. Open group → "Settings"
2. Go to "Invites" tab
3. Click "Generate New Invite"
4. Copy link and share

## 📝 Attendance

### Add Student
1. Open group
2. Click "Add Student"
3. Enter roll number, name
4. Select branch
5. Click "Add"

### Mark Attendance
1. Select date
2. For each student:
   - Set status (Present/Absent/Excused)
   - Enter Attendance marks (0-10)
   - Enter English marks (0-10)
   - Enter Active marks (0-10)
   - Enter Creative marks (0-10)
3. Click "Save Attendance"

### Filter by Branch
1. Use branch dropdown at top
2. Select branch or "All Branches"

## 📊 Export Data

### Export to Excel
1. Open group
2. Go to "Records" tab
3. Click "Export to Excel"

### Export to CSV
1. Open group
2. Go to "Records" tab
3. Click "Export to CSV"

### Export Summary
1. Open group
2. Go to "Records" tab
3. Click "Export Summary Report"

## 🔧 Firebase Console Tasks

### Enable Google Sign-In
1. Firebase Console → Authentication
2. Sign-in method → Google
3. Enable → Add support email → Save

### View Database
1. Firebase Console → Firestore Database
2. Browse collections: groups, attendance, students, invites

### View Users
1. Firebase Console → Authentication
2. Users tab → See all registered users

## 📋 Marks System

| Category | Range | Description |
|----------|-------|-------------|
| Attendance | 0-10 | Based on attendance |
| English Speaking | 0-10 | English communication |
| Active Participation | 0-10 | Class participation |
| Creative Work | 0-10 | Creative contributions |
| **Total** | **0-40** | Auto-calculated sum |

## 🎯 Your Setup (C2 Batch)

### Group Details
- **Name**: C2 - Communication Lab
- **Subject**: Communication Lab
- **Branches**: Data Science, Electrical
- **Leaders**: You + Your friend (via invite)
- **Lab Day**: Thursday (weekly)

### Weekly Workflow
1. Thursday morning → Open app
2. Select today's date
3. Mark attendance for all students
4. Enter marks for each category
5. Save attendance
6. Done! (takes 5-10 minutes)

### Monthly Export
1. End of month → Open group
2. Go to "Records" tab
3. Export summary report
4. Share with administration

## ⚠️ Important Notes

- Invite codes expire after 7 days
- Each invite code can only be used once
- Total marks are auto-calculated
- Data syncs in real-time
- Export data regularly for backup
- Only group leaders can access group data

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Check email/password, try Google sign-in |
| Google sign-in fails | Enable in Firebase Console |
| Can't save attendance | Check internet, verify logged in |
| Invite code invalid | Generate new code (old one expired) |
| Can't see groups | Login with correct email |
| Export not working | Check browser allows downloads |

## 📞 Need Help?

1. Check `FIREBASE_COMPLETE_SETUP.md` for detailed setup
2. Check `MIGRATION_SUMMARY.md` for what changed
3. Check `FINAL_CHECKLIST.md` for testing steps
4. Check browser console for error messages

## ✅ Daily Checklist

- [ ] Login to app
- [ ] Open your group
- [ ] Select today's date
- [ ] Mark attendance
- [ ] Enter marks
- [ ] Save
- [ ] Done!

## 🎉 That's It!

Your Communication Lab Management System is ready to use. Simple, fast, and reliable!
