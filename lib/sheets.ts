import { google } from '@googleapis/sheets';

interface GoogleSheetsConfig {
  serviceAccountEmail: string;
  serviceAccountKey: string;
  spreadsheetId: string;
}

let sheetsClient: any = null;

export async function initGoogleSheets(config: GoogleSheetsConfig) {
  const { serviceAccountEmail, serviceAccountKey, spreadsheetId } = config;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: 'lab-manager',
      private_key_id: 'key-id',
      private_key: serviceAccountKey.replace(/\\n/g, '\n'),
      client_email: serviceAccountEmail,
      client_id: '123456789',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export async function createGroupSheet(spreadsheetId: string, groupId: string, groupName: string) {
  if (!sheetsClient) throw new Error('Google Sheets not initialized');

  const request = {
    spreadsheetId,
    resource: {
      requests: [
        {
          addSheet: {
            properties: {
              title: `${groupName}-${groupId}`,
              index: 0,
            },
          },
        },
      ],
    },
  };

  const response = await sheetsClient.spreadsheets.batchUpdate(request);
  return response.data.replies[0].addSheet.properties;
}

export async function writeAttendanceData(
  spreadsheetId: string,
  sheetName: string,
  data: any[][]
) {
  if (!sheetsClient) throw new Error('Google Sheets not initialized');

  const request = {
    spreadsheetId,
    range: `'${sheetName}'!A1`,
    valueInputOption: 'RAW',
    resource: {
      values: data,
    },
  };

  await sheetsClient.spreadsheets.values.update(request);
}

export async function readAttendanceData(
  spreadsheetId: string,
  sheetName: string
) {
  if (!sheetsClient) throw new Error('Google Sheets not initialized');

  const request = {
    spreadsheetId,
    range: `'${sheetName}'!A1:Z1000`,
  };

  const response = await sheetsClient.spreadsheets.values.get(request);
  return response.data.values || [];
}

export async function getGroupSheets(spreadsheetId: string) {
  if (!sheetsClient) throw new Error('Google Sheets not initialized');

  const response = await sheetsClient.spreadsheets.get({
    spreadsheetId,
  });

  return response.data.sheets || [];
}
