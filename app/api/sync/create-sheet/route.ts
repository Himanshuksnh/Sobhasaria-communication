import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, groupName, spreadsheetId } = body;

    if (!groupId || !groupName || !spreadsheetId) {
      return NextResponse.json(
        { error: 'groupId, groupName, and spreadsheetId required' },
        { status: 400 }
      );
    }

    // TODO: Create new sheet in Google Sheets
    // This would use the @googleapis/sheets library to create a new sheet
    // and set up headers for attendance tracking

    const sheetId = `sheet-${groupId}`;
    const sheetTitle = `${groupName}-${groupId}`;

    console.log(`Creating sheet: ${sheetTitle}`);

    // Initialize headers
    const headers = [
      'Date',
      'Student ID',
      'Student Name',
      'Status',
      'Timestamp',
    ];

    return NextResponse.json({
      sheetId,
      sheetTitle,
      headers,
      message: 'Sheet created successfully',
    });
  } catch (error) {
    console.error('Error creating sheet:', error);
    return NextResponse.json(
      { error: 'Failed to create sheet in Google Sheets' },
      { status: 500 }
    );
  }
}
