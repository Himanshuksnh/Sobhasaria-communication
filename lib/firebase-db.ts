// Firebase Firestore Database Service
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Group, AttendanceRecord, InviteLink } from './types';

export class FirebaseDBService {
  // Collections
  private groupsCollection = 'groups';
  private attendanceCollection = 'attendance';
  private invitesCollection = 'invites';
  private studentsCollection = 'students';

  private checkDB() {
    if (!db) {
      throw new Error('Firebase Firestore not initialized');
    }
  }

  // ==================== GROUPS ====================

  async createGroup(group: Group): Promise<void> {
    this.checkDB();
    const groupRef = doc(db, this.groupsCollection, group.id);
    await setDoc(groupRef, {
      ...group,
      createdAt: Timestamp.now(),
    });
  }

  async getGroup(groupId: string): Promise<Group | null> {
    this.checkDB();
    const groupRef = doc(db, this.groupsCollection, groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (groupSnap.exists()) {
      return groupSnap.data() as Group;
    }
    return null;
  }

  async getUserGroups(userEmail: string): Promise<Group[]> {
    this.checkDB();
    const groupsRef = collection(db, this.groupsCollection);
    const q = query(
      groupsRef,
      where('leaders', 'array-contains', userEmail)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Group);
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
    this.checkDB();
    const groupRef = doc(db, this.groupsCollection, groupId);
    await updateDoc(groupRef, updates);
  }

  async deleteGroup(groupId: string): Promise<void> {
    this.checkDB();
    const groupRef = doc(db, this.groupsCollection, groupId);
    await deleteDoc(groupRef);
  }

  async addLeaderToGroup(groupId: string, email: string): Promise<void> {
    this.checkDB();
    const group = await this.getGroup(groupId);
    if (group && !group.leaders.includes(email)) {
      group.leaders.push(email);
      await this.updateGroup(groupId, { leaders: group.leaders });
    }
  }

  // ==================== STUDENTS ====================

  async addStudent(groupId: string, student: {
    rollNo: string;
    name: string;
    branch: string;
  }): Promise<void> {
    this.checkDB();
    const studentRef = doc(db, this.studentsCollection, `${groupId}_${student.rollNo}`);
    await setDoc(studentRef, {
      groupId,
      ...student,
      createdAt: Timestamp.now(),
    });
  }

  async getGroupStudents(groupId: string): Promise<any[]> {
    this.checkDB();
    const studentsRef = collection(db, this.studentsCollection);
    const q = query(studentsRef, where('groupId', '==', groupId));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }

  async deleteStudent(groupId: string, rollNo: string): Promise<void> {
    this.checkDB();
    const studentRef = doc(db, this.studentsCollection, `${groupId}_${rollNo}`);
    await deleteDoc(studentRef);
  }

  // ==================== ATTENDANCE ====================

  async saveAttendance(
    groupId: string,
    date: string,
    records: Array<{
      rollNo: string;
      name: string;
      branch: string;
      status: string;
      attendanceMarks: number;
      englishSpeaking: number;
      activeParticipation: number;
      creativeWork: number;
      totalMarks: number;
      remarks?: string;
    }>
  ): Promise<void> {
    this.checkDB();
    const batch = writeBatch(db);

    records.forEach((record) => {
      const attendanceRef = doc(
        db,
        this.attendanceCollection,
        `${groupId}_${date}_${record.rollNo}`
      );
      
      batch.set(attendanceRef, {
        groupId,
        date,
        ...record,
        timestamp: Timestamp.now(),
      });
    });

    await batch.commit();
  }

  async getAttendanceByDate(groupId: string, date: string): Promise<any[]> {
    this.checkDB();
    const attendanceRef = collection(db, this.attendanceCollection);
    const q = query(
      attendanceRef,
      where('groupId', '==', groupId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }

  async getAllAttendance(groupId: string): Promise<any[]> {
    this.checkDB();
    const attendanceRef = collection(db, this.attendanceCollection);
    const q = query(
      attendanceRef,
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }

  // ==================== INVITES ====================

  async generateInvite(groupId: string, createdBy: string): Promise<string> {
    this.checkDB();
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const inviteRef = doc(db, this.invitesCollection, code);
    await setDoc(inviteRef, {
      code,
      groupId,
      createdBy,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
      used: false,
      usedBy: null,
      usedAt: null,
    });

    return code;
  }

  async validateInvite(code: string, userEmail: string): Promise<{
    valid: boolean;
    groupId?: string;
    error?: string;
  }> {
    this.checkDB();
    const inviteRef = doc(db, this.invitesCollection, code);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      return { valid: false, error: 'Invite code not found' };
    }

    const invite = inviteSnap.data();

    if (invite.used) {
      return { valid: false, error: 'Invite code already used' };
    }

    const now = Timestamp.now();
    if (invite.expiresAt.toMillis() < now.toMillis()) {
      return { valid: false, error: 'Invite code expired' };
    }

    // Mark as used
    await updateDoc(inviteRef, {
      used: true,
      usedBy: userEmail,
      usedAt: Timestamp.now(),
    });

    return { valid: true, groupId: invite.groupId };
  }

  async getGroupInvites(groupId: string): Promise<any[]> {
    this.checkDB();
    const invitesRef = collection(db, this.invitesCollection);
    const q = query(
      invitesRef,
      where('groupId', '==', groupId),
      where('used', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }
}

export const firebaseDB = new FirebaseDBService();
