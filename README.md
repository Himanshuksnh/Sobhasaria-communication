# Communication Lab Management System

A modern web application for managing Communication Lab attendance and marks with real-time Firebase integration.

## 🎯 Features

- **Authentication**: Email/Password and Google Sign-In
- **Groups Management**: Create and manage lab groups with multiple branches
- **Student Management**: Add students with roll numbers and branch assignments
- **Attendance Tracking**: Mark attendance with 4 categories of marks (0-40 total)
  - Attendance Marks (0-10)
  - English Speaking (0-10)
  - Active Participation (0-10)
  - Creative Work (0-10)
- **Branch Filtering**: Filter students by branch
- **Invite System**: Generate invite links for co-leaders (7-day validity)
- **Data Export**: Export to Excel, CSV, or Summary Reports
- **Real-time Sync**: All data syncs instantly across devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase account
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Himanshuksnh/Sobhasaria-communication.git
cd Sobhasaria-communication
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Add your Firebase configuration to `.env.local`:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > General
   - Copy your Firebase config values
   - Paste them in `.env.local`

5. Setup Firebase:
   - Enable **Authentication** (Email/Password + Google)
   - Create **Firestore Database**
   - Set security rules (see `FINAL_SETUP_INSTRUCTIONS.md`)

6. Run development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[START_HERE.md](START_HERE.md)** - Quick start guide
- **[FINAL_SETUP_INSTRUCTIONS.md](FINAL_SETUP_INSTRUCTIONS.md)** - Complete setup instructions
- **[README_SIMPLE.md](README_SIMPLE.md)** - Simple Hindi/Hinglish guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference commands
- **[FIREBASE_COMPLETE_SETUP.md](FIREBASE_COMPLETE_SETUP.md)** - Technical details

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Export**: XLSX library

## 📱 Usage

### Creating a Group
1. Login to the app
2. Click "Create Group"
3. Enter group name, subject, and branches
4. Click "Create Group"

### Adding Students
1. Open a group
2. Click "Add Student"
3. Enter roll number, name, and select branch
4. Click "Add"

### Marking Attendance
1. Select date
2. For each student, set status and enter marks
3. Click "Save Attendance"

### Inviting Co-Leaders
1. Open group settings
2. Go to "Invites" tab
3. Generate invite link
4. Share with co-leader

### Exporting Data
1. Open group
2. Go to "Records" tab
3. Choose export format (Excel/CSV/Summary)

## 🔐 Security

- Firebase Authentication for user management
- Firestore security rules for data protection
- Environment variables for sensitive data
- HTTPS encryption for all data transfer

## 📊 Marks System

| Category | Range | Description |
|----------|-------|-------------|
| Attendance | 0-10 | Based on attendance |
| English Speaking | 0-10 | English communication skills |
| Active Participation | 0-10 | Class participation |
| Creative Work | 0-10 | Creative contributions |
| **Total** | **0-40** | Auto-calculated sum |

## 🚢 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👥 Authors

- Himanshu Kumar Singh

## 🙏 Acknowledgments

- Built for Communication Lab management at Sobhasaria Group of Institutions
- Designed for C2 Batch and other lab groups

## 📞 Support

For issues and questions:
- Check documentation files
- Open an issue on GitHub
- Contact the development team

---

**Made with ❤️ for Communication Lab**
