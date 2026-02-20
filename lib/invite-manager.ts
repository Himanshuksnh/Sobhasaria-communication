import { InviteLink } from './types';
import crypto from 'crypto';

export class InviteManager {
  private storageKey = 'lab-manager-invites';

  getInvites(): InviteLink[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  saveInvites(invites: InviteLink[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(invites));
  }

  generateInvite(groupId: string, createdBy: string): InviteLink {
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    const invite: InviteLink = {
      groupId,
      code,
      createdBy,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const invites = this.getInvites();
    invites.push(invite);
    this.saveInvites(invites);

    return invite;
  }

  verifyInvite(code: string): InviteLink | null {
    const invites = this.getInvites();
    const invite = invites.find((i) => i.code === code);

    if (!invite) return null;

    // Check if expired
    const expiresAt = new Date(invite.expiresAt);
    const now = new Date();

    if (now > expiresAt) {
      // Remove expired invite
      this.saveInvites(invites.filter((i) => i.code !== code));
      return null;
    }

    return invite;
  }

  getInvitesByGroup(groupId: string): InviteLink[] {
    const invites = this.getInvites();
    return invites.filter(
      (i) =>
        i.groupId === groupId &&
        new Date(i.expiresAt) > new Date()
    );
  }

  revokeInvite(code: string) {
    const invites = this.getInvites();
    this.saveInvites(invites.filter((i) => i.code !== code));
  }

  cleanupExpiredInvites() {
    const invites = this.getInvites();
    const now = new Date();

    const valid = invites.filter((i) => new Date(i.expiresAt) > now);
    this.saveInvites(valid);
  }
}

export const inviteManager = new InviteManager();
