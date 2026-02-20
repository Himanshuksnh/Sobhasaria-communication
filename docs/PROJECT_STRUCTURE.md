# Project Structure 📁

## Clean & Organized Structure

```
Sobhasaria-communication/
│
├── 📁 app/                          # Next.js App Router
│   ├── login/                       # Login page
│   │   └── page.tsx                 # Email + Google Sign-In
│   ├── group/[id]/                  # Dynamic group pages
│   │   └── page.tsx                 # Group detail & attendance
│   ├── join/[code]/                 # Invite acceptance
│   │   └── page.tsx                 # Join via invite link
│   ├── page.tsx                     # Home page (groups list)
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
│
├── 📁 components/                   # React Components
│   ├── group/                       # Group-specific components
│   │   ├── attendance-table.tsx    # Attendance marking table
│   │   └── advanced-settings.tsx   # Group settings & invites
│   ├── ui/                          # UI Components (57 files)
│   │   ├── button.tsx              # Button component
│   │   ├── card.tsx                # Card component
│   │   ├── dialog.tsx              # Dialog component
│   │   ├── input.tsx               # Input component
│   │   └── ... (53 more)           # Other UI components
│   └── create-group-dialog.tsx     # Create group dialog
│
├── 📁 lib/                          # Services & Utilities
│   ├── firebase.ts                  # Firebase initialization
│   ├── firebase-auth.ts             # Authentication service
│   ├── firebase-db.ts               # Firestore database service
│   ├── export-service.ts            # Excel/CSV export
│   ├── types.ts                     # TypeScript types
│   └── utils.ts                     # Utility functions
│
├── 📁 hooks/                        # React Hooks
│   ├── use-mobile.ts                # Mobile detection
│   └── use-toast.ts                 # Toast notifications
│
├── 📁 docs/                         # Documentation
│   ├── START_HERE.md                # Quick start guide
│   ├── FINAL_SETUP_INSTRUCTIONS.md # Complete setup (Hindi)
│   ├── README_SIMPLE.md             # Simple Hindi guide
│   ├── QUICK_REFERENCE.md           # Quick commands
│   ├── FIREBASE_COMPLETE_SETUP.md   # Technical details
│   ├── GITHUB_DEPLOYED.md           # GitHub guide
│   ├── CLEANUP_SUMMARY.md           # Cleanup details
│   ├── MIGRATION_SUMMARY.md         # Migration info
│   ├── CHANGES_LOG.md               # Changes history
│   ├── FINAL_CHECKLIST.md           # Testing checklist
│   └── PROJECT_STRUCTURE.md         # This file
│
├── 📁 public/                       # Static Assets
│   ├── icon.svg                     # App icon
│   ├── apple-icon.png               # Apple icon
│   └── ... (other images)           # Placeholder images
│
├── 📁 styles/                       # Styles
│   └── globals.css                  # Global CSS
│
├── 📄 .env.local                    # Environment variables (not in git)
├── 📄 .env.example                  # Env template
├── 📄 .gitignore                    # Git ignore rules
├── 📄 README.md                     # Main documentation
├── 📄 package.json                  # Dependencies
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 next.config.mjs               # Next.js config
└── 📄 components.json               # shadcn/ui config
```

---

## 📂 Folder Details

### `/app` - Application Pages
Next.js App Router structure with all pages and routes.

**Key Files:**
- `page.tsx` - Home page with groups list
- `login/page.tsx` - Authentication page
- `group/[id]/page.tsx` - Group detail with attendance
- `join/[code]/page.tsx` - Invite acceptance

### `/components` - React Components
Reusable UI components and group-specific components.

**Key Folders:**
- `group/` - Group management components
- `ui/` - shadcn/ui components (57 files)

### `/lib` - Services & Utilities
Core business logic and Firebase integration.

**Key Files:**
- `firebase.ts` - Firebase app initialization
- `firebase-auth.ts` - Authentication (Email + Google)
- `firebase-db.ts` - Firestore CRUD operations
- `export-service.ts` - Data export (Excel/CSV)
- `types.ts` - TypeScript interfaces

### `/hooks` - React Hooks
Custom React hooks for common functionality.

### `/docs` - Documentation
All project documentation organized in one place.

### `/public` - Static Assets
Images, icons, and other static files.

---

## 🎯 Key Features by File

### Authentication
- `lib/firebase-auth.ts` - Email/Password + Google Sign-In
- `app/login/page.tsx` - Login UI

### Groups Management
- `app/page.tsx` - Groups list
- `components/create-group-dialog.tsx` - Create group
- `components/group/advanced-settings.tsx` - Settings & invites

### Attendance
- `components/group/attendance-table.tsx` - Mark attendance
- `lib/firebase-db.ts` - Save/load attendance

### Export
- `lib/export-service.ts` - Export to Excel/CSV
- `app/group/[id]/page.tsx` - Export UI

### Invites
- `lib/firebase-db.ts` - Generate/validate invites
- `app/join/[code]/page.tsx` - Accept invites

---

## 📊 File Count

| Category | Count |
|----------|-------|
| Pages | 4 |
| Components | 60+ |
| Services | 6 |
| Hooks | 2 |
| Documentation | 11 |
| Config Files | 6 |
| **Total** | **~90** |

---

## 🔧 Configuration Files

- `.env.local` - Environment variables (Firebase config)
- `.env.example` - Template for environment variables
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration
- `components.json` - shadcn/ui configuration
- `package.json` - Dependencies and scripts

---

## 📝 Important Notes

### Environment Variables
- `.env.local` is in `.gitignore` (not uploaded to GitHub)
- Use `.env.example` as template
- Required for Firebase connection

### Documentation
- All docs in `/docs` folder
- Start with `docs/START_HERE.md`
- Hindi guide: `docs/README_SIMPLE.md`

### Components
- UI components from shadcn/ui
- Custom components in `/components`
- Group components in `/components/group`

---

## 🚀 Quick Navigation

**Setup**: `docs/START_HERE.md`
**Code**: `app/`, `components/`, `lib/`
**Docs**: `docs/`
**Config**: `.env.example`, `package.json`

---

**Clean, organized, and production-ready!** ✨
