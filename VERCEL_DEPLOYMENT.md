# Vercel Deployment Guide

## Environment Variables Setup

When deploying to Vercel, you MUST add these environment variables in your Vercel project settings:

### Required Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCWw4G5xXls_AbelbB_m0TPfQhU54r-Se4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sobhasaria-communcation.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sobhasaria-communcation
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sobhasaria-communcation.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=731309106924
NEXT_PUBLIC_FIREBASE_APP_ID=1:731309106924:web:a9366cb55cc746deeb27c9
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-EZZFCLM25Q
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `Himanshuksnh/Sobhasaria-communication`
4. Add all environment variables listed above
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables (one by one)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

# Redeploy with environment variables
vercel --prod
```

## Firebase Configuration

Make sure your Firebase project has:

1. **Authentication enabled**:
   - Email/Password provider
   - Google Sign-In provider

2. **Firestore Database created**:
   - Start in production mode or test mode
   - Set up security rules (see below)

3. **Authorized domains** (in Firebase Console → Authentication → Settings):
   - Add your Vercel domain: `sobhasaria-communication.vercel.app`
   - Add any custom domains

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Groups - only leaders can read/write
    match /groups/{groupId} {
      allow read: if request.auth != null && 
                     request.auth.token.email in resource.data.leaders;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               request.auth.token.email in resource.data.leaders;
    }
    
    // Attendance - only group leaders can access
    match /attendance/{attendanceId} {
      allow read, write: if request.auth != null;
    }
    
    // Students - only group leaders can access
    match /students/{studentId} {
      allow read, write: if request.auth != null;
    }
    
    // Invites - authenticated users can read/write
    match /invites/{inviteId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Error: "Application error: a client-side exception has occurred"

**Solution**: Make sure all environment variables are added to Vercel and redeploy.

### Error: "Firebase Auth not initialized"

**Solution**: 
1. Check that all `NEXT_PUBLIC_*` environment variables are set in Vercel
2. Redeploy the application
3. Clear browser cache and try again

### Error: "Missing Firebase configuration"

**Solution**: Verify that environment variables are correctly named with `NEXT_PUBLIC_` prefix.

### Google Sign-In not working

**Solution**: 
1. Go to Firebase Console → Authentication → Sign-in method → Google
2. Add your Vercel domain to authorized domains
3. Make sure Web SDK configuration is correct

## Post-Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Firebase Authentication enabled (Email/Password + Google)
- [ ] Firestore Database created
- [ ] Firestore security rules configured
- [ ] Vercel domain added to Firebase authorized domains
- [ ] Test login functionality
- [ ] Test group creation
- [ ] Test attendance marking
- [ ] Test mobile responsiveness
- [ ] Test invite link generation

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify Firebase configuration
4. Ensure all environment variables are set correctly

---

**Current Deployment**: sobhasaria-communication.vercel.app
**Firebase Project**: sobhasaria-communcation
**Status**: ✅ Ready for deployment
