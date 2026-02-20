import { AttendanceRecord, Group } from './types';
import { LabManagerError, ErrorCode } from './error-handler';

export interface SyncConfig {
  spreadsheetId: string;
  appsScriptUrl: string;
}

export class SyncManager {
  private config: SyncConfig | null = null;
  private lastSyncTime: Record<string, number> = {};
  private syncInProgress: Record<string, boolean> = {};

  initialize(config: SyncConfig) {
    this.config = config;
  }

  private async callAppsScript<T>(action: string, payload: any): Promise<T> {
    if (!this.config) {
      throw new LabManagerError(
        ErrorCode.SHEETS_API_ERROR,
        'Sync not initialized'
      );
    }

    const response = await fetch(this.config.appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        spreadsheetId: this.config.spreadsheetId,
        ...payload,
      }),
    });

    if (!response.ok) {
      throw new LabManagerError(
        ErrorCode.SHEETS_API_ERROR,
        `Apps Script error: ${response.statusText}`
      );
    }

    const result = await response.json();
    if (result.error) {
      throw new LabManagerError(
        ErrorCode.SHEETS_API_ERROR,
        result.error
      );
    }

    return result;
  }

  async syncGroupData(groupId: string, groupName: string, labDate: string, labNumber: string, branch: string, students: any[]): Promise<boolean> {
    if (this.syncInProgress[groupId]) {
      console.log(`Sync already in progress for group ${groupId}`);
      return false;
    }

    this.syncInProgress[groupId] = true;

    try {
      await this.callAppsScript('saveAttendance', {
        groupId,
        groupName,
        labDate,
        labNumber,
        branch,
        students,
      });

      this.lastSyncTime[groupId] = Date.now();
      return true;
    } catch (error) {
      if (error instanceof LabManagerError) throw error;

      throw new LabManagerError(
        ErrorCode.NETWORK_ERROR,
        'Network error during sync',
        error
      );
    } finally {
      this.syncInProgress[groupId] = false;
    }
  }

  async fetchGroupData(groupId: string, groupName: string): Promise<any[]> {
    try {
      const result = await this.callAppsScript<{ success: boolean; records: any[] }>(
        'getAttendanceRecords',
        { groupId, groupName }
      );
      return result.records || [];
    } catch (error) {
      if (error instanceof LabManagerError) throw error;

      throw new LabManagerError(
        ErrorCode.NETWORK_ERROR,
        'Network error while fetching data',
        error
      );
    }
  }

  async fetchAllGroups(): Promise<any[]> {
    try {
      const result = await this.callAppsScript<{ success: boolean; groups: any[] }>(
        'getGroups',
        {}
      );
      return result.groups || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  async createGroupSheet(group: Group): Promise<string> {
    try {
      const result = await this.callAppsScript<{ success: boolean; message: string }>(
        'createGroup',
        {
          groupId: group.id,
          groupName: group.name,
          subject: group.subject,
          branches: group.branches || [],
        }
      );
      return group.id;
    } catch (error) {
      if (error instanceof LabManagerError) throw error;

      throw new LabManagerError(
        ErrorCode.NETWORK_ERROR,
        'Network error while creating sheet',
        error
      );
    }
  }

  async generateInvite(groupId: string, createdBy: string): Promise<string> {
    try {
      const result = await this.callAppsScript<{ success: boolean; code: string }>(
        'generateInvite',
        { groupId, createdBy, expiryDays: 7 }
      );
      return result.code;
    } catch (error) {
      if (error instanceof LabManagerError) throw error;
      throw new LabManagerError(
        ErrorCode.NETWORK_ERROR,
        'Network error while generating invite',
        error
      );
    }
  }

  async validateInvite(code: string, userEmail: string): Promise<{ valid: boolean; groupId?: string; error?: string }> {
    try {
      const result = await this.callAppsScript<{ valid: boolean; groupId?: string; error?: string }>(
        'validateInvite',
        { code, userEmail }
      );
      return result;
    } catch (error) {
      if (error instanceof LabManagerError) throw error;
      throw new LabManagerError(
        ErrorCode.NETWORK_ERROR,
        'Network error while validating invite',
        error
      );
    }
  }

  getLastSyncTime(groupId: string): Date | null {
    const time = this.lastSyncTime[groupId];
    return time ? new Date(time) : null;
  }

  isSyncInProgress(groupId: string): boolean {
    return this.syncInProgress[groupId] || false;
  }

  async validateConnection(): Promise<boolean> {
    if (!this.config) {
      return false;
    }

    try {
      await this.callAppsScript<{ success: boolean }>('validate', {});
      return true;
    } catch {
      return false;
    }
  }
}

export const syncManager = new SyncManager();
