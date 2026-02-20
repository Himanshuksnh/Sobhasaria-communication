import { Group, AttendanceRecord } from './types';

export class GroupDataManager {
  private storageKey = 'lab-manager-groups';

  getGroups(): Group[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  saveGroups(groups: Group[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(groups));
  }

  createGroup(group: Omit<Group, 'createdAt'>): Group {
    const newGroup: Group = {
      ...group,
      createdAt: new Date().toISOString(),
    };

    const groups = this.getGroups();
    groups.push(newGroup);
    this.saveGroups(groups);

    return newGroup;
  }

  updateGroup(groupId: string, updates: Partial<Group>) {
    const groups = this.getGroups();
    const group = groups.find((g) => g.id === groupId);

    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    Object.assign(group, updates);
    this.saveGroups(groups);
    return group;
  }

  deleteGroup(groupId: string) {
    const groups = this.getGroups();
    const filtered = groups.filter((g) => g.id !== groupId);
    this.saveGroups(filtered);
  }

  getGroup(groupId: string): Group | null {
    const groups = this.getGroups();
    return groups.find((g) => g.id === groupId) || null;
  }

  addLeader(groupId: string, email: string) {
    const group = this.getGroup(groupId);
    if (!group) throw new Error(`Group ${groupId} not found`);

    if (!group.leaders.includes(email)) {
      group.leaders.push(email);
      this.updateGroup(groupId, group);
    }

    return group;
  }

  removeLeader(groupId: string, email: string) {
    const group = this.getGroup(groupId);
    if (!group) throw new Error(`Group ${groupId} not found`);

    group.leaders = group.leaders.filter((l) => l !== email);
    this.updateGroup(groupId, group);

    return group;
  }

  // Sheet data methods
  getAttendanceRecordsKey = (groupId: string) => `attendance-${groupId}`;

  getAttendanceRecords(groupId: string): AttendanceRecord[] {
    if (typeof window === 'undefined') return [];
    const key = this.getAttendanceRecordsKey(groupId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  saveAttendanceRecords(groupId: string, records: AttendanceRecord[]) {
    if (typeof window === 'undefined') return;
    const key = this.getAttendanceRecordsKey(groupId);
    localStorage.setItem(key, JSON.stringify(records));
  }

  addAttendanceRecord(groupId: string, record: AttendanceRecord) {
    const records = this.getAttendanceRecords(groupId);
    records.push({
      ...record,
      timestamp: new Date().toISOString(),
    });
    this.saveAttendanceRecords(groupId, records);
    return records;
  }

  getAttendanceByDate(groupId: string, date: string): AttendanceRecord[] {
    const records = this.getAttendanceRecords(groupId);
    return records.filter((r) => r.date === date);
  }
}

export const groupDataManager = new GroupDataManager();
