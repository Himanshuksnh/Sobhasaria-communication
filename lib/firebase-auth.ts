// Firebase Authentication Service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';

export class FirebaseAuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
  }

  // Sign up with email and password
  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, this.googleProvider);
    return result.user;
  }

  // Sign out
  async signOut(): Promise<void> {
    await signOut(auth);
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Get user email
  getUserEmail(): string | null {
    return auth.currentUser?.email || null;
  }

  // Get user ID
  getUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  // Get user display name
  getUserDisplayName(): string | null {
    return auth.currentUser?.displayName || null;
  }

  // Get user photo URL
  getUserPhotoURL(): string | null {
    return auth.currentUser?.photoURL || null;
  }
}

export const firebaseAuth = new FirebaseAuthService();
