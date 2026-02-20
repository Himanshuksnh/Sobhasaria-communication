import { syncManager, SyncConfig } from './sync-manager';

export function initializeSyncManager() {
  if (typeof window === 'undefined') {
    console.log('[v0] SyncManager initialization skipped (server-side)');
    return;
  }

  const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT;
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;

  if (!appsScriptUrl || !spreadsheetId) {
    console.warn(
      '[v0] Missing environment variables for Google Sheets integration',
      { appsScriptUrl: !!appsScriptUrl, spreadsheetId: !!spreadsheetId }
    );
    return;
  }

  const config: SyncConfig = {
    appsScriptUrl,
    spreadsheetId,
  };

  syncManager.initialize(config);
  console.log('[v0] SyncManager initialized with Apps Script endpoint');

  // Validate connection on init
  syncManager
    .validateConnection()
    .then((isValid) => {
      if (isValid) {
        console.log('[v0] Successfully connected to Google Sheets');
      } else {
        console.warn('[v0] Failed to validate connection to Google Sheets');
      }
    })
    .catch((error) => {
      console.error('[v0] Error validating connection:', error);
    });
}

export { syncManager };
